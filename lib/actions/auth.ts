"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Role } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type AuthActionResult = { error?: string };

export async function loginAction(
  _prev: AuthActionResult,
  formData: FormData
): Promise<AuthActionResult> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) return { error: "Server misconfiguration" };

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      username: true,
      email: true,
      password: true,
      role: true,
    },
  });
  if (!user) return { error: "Invalid email or password" };

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return { error: "Invalid email or password" };

  let teacherId: string | undefined;
  let studentId: string | undefined;
  if (user.role === "TEACHER") {
    const t = await prisma.teacher.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    teacherId = t?.id;
  } else if (user.role === "STUDENT") {
    const s = await prisma.student.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    studentId = s?.id;
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role, teacherId, studentId },
    secret,
    { expiresIn: "30d" }
  );

  const cookieStore = await cookies();
  cookieStore.set("gradingtoken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  redirect("/");
}

export async function signupAction(
  _prev: AuthActionResult,
  formData: FormData
): Promise<AuthActionResult> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const username = (formData.get("username") as string)?.trim();
  const role = formData.get("role") as string;

  if (!email || !password || !username || !role) {
    return { error: "Email, password, username and role are required" };
  }
  const validRoles: Role[] = ["TEACHER", "STUDENT"];
  if (!validRoles.includes(role as Role)) {
    return { error: "Invalid role" };
  }
  const roleValue: Role = role as Role;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "User already exists" };

  const secret = process.env.JWT_SECRET;
  if (!secret) return { error: "Server misconfiguration" };

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await prisma.$transaction(async (tx) => {
    const u = await tx.user.create({
      data: { email, password: hashedPassword, role: roleValue, username },
      select: { id: true, username: true, email: true, role: true },
    });
    if (roleValue === "TEACHER") {
      const t = await tx.teacher.create({ data: { userId: u.id } });
      return { user: u, teacherId: t.id, studentId: undefined };
    } else {
      const s = await tx.student.create({ data: { userId: u.id } });
      return { user: u, teacherId: undefined, studentId: s.id };
    }
  });

  const token = jwt.sign(
    {
      userId: result.user.id,
      role: result.user.role,
      teacherId: result.teacherId,
      studentId: result.studentId,
    },
    secret,
    { expiresIn: "30d" }
  );

  const cookieStore = await cookies();
  cookieStore.set("gradingtoken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  redirect("/");
}
