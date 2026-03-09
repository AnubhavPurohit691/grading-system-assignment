import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export async function POST(request: Request) {
  try {
    const { email, password, role, username } = await request.json();
    if (!email || !password || !role || !username) {
      return NextResponse.json(
        { message: "Email, password, username and role are required" },
        { status: 400 }
      );
    }
    const validRoles = ["TEACHER", "STUDENT"] as const;
    if (!validRoles.includes(role)) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return NextResponse.json(
        { message: "Server misconfiguration" },
        { status: 500 }
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: { email, password: hashedPassword, role, username },
        select: { id: true, username: true, email: true, role: true, createdAt: true },
      });
      if (role === "TEACHER") {
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
      jwtSecret,
      { expiresIn: "30d" }
    );
    const response = NextResponse.json(
      { message: "User created successfully", user: result.user },
      { status: 201 }
    );
    response.cookies.set("gradingtoken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });
    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
