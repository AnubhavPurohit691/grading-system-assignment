import { prisma } from "@/lib/db";
import { getStudentContextFromRequest } from "@/proxy";
import { NextResponse } from "next/server";

/** GET /api/student/teacher – get the teacher this student is associated with */
export async function GET(request: Request) {
  const ctx = getStudentContextFromRequest(request);
  if (!ctx.ok) return ctx.response;

  try {
    const student = await prisma.student.findUnique({
      where: { id: ctx.studentId },
      select: {
        teacherId: true,
        teacher: {
          select: {
            id: true,
            user: { select: { id: true, username: true, email: true } },
          },
        },
      },
    });
    if (!student?.teacherId || !student.teacher) {
      return NextResponse.json(
        { message: "You are not associated with any teacher" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { teacher: student.teacher },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
