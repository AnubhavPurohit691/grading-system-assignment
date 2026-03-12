import { prisma } from "@/lib/db";
import { getTeacherContextFromRequest } from "@/proxy";
import { NextResponse } from "next/server";

/** GET /api/teacher/students – list students associated with this teacher */
export async function GET(request: Request) {
  const ctx = getTeacherContextFromRequest(request);
  if (!ctx.ok) return ctx.response;

  try {
    const students = await prisma.student.findMany({
      where: { teacherId: ctx.teacherId },
      select: {
        id: true,
        createdAt: true,
        user: { select: { id: true, username: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ students }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

/** POST /api/teacher/students – add a student by email (links them to this teacher) */
export async function POST(request: Request) {
  const ctx = getTeacherContextFromRequest(request);
  if (!ctx.ok) return ctx.response;

  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    if (!email) {
      return NextResponse.json(
        { message: "email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email, role: "STUDENT" },
      include: { student: true },
    });
    if (!user) {
      return NextResponse.json(
        { message: "No student account found with this email" },
        { status: 404 }
      );
    }
    if (!user.student) {
      return NextResponse.json(
        { message: "User is not a student" },
        { status: 400 }
      );
    }

    const student = await prisma.student.update({
      where: { id: user.student.id },
      data: { teacherId: ctx.teacherId },
      select: {
        id: true,
        teacherId: true,
        user: { select: { id: true, username: true, email: true } },
      },
    });
    return NextResponse.json({ student }, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
