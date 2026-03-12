import { prisma } from "@/lib/db";
import { getTeacherContextFromRequest } from "@/proxy";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ studentId: string }> };

/** DELETE /api/teacher/students/[studentId] – remove student from this teacher (set teacherId = null) */
export async function DELETE(request: Request, context: RouteContext) {
  const ctx = getTeacherContextFromRequest(request);
  if (!ctx.ok) return ctx.response;

  const { studentId } = await context.params;
  if (!studentId) {
    return NextResponse.json(
      { message: "studentId is required" },
      { status: 400 }
    );
  }

  try {
    const student = await prisma.student.findFirst({
      where: { id: studentId, teacherId: ctx.teacherId },
      select: { id: true },
    });
    if (!student) {
      return NextResponse.json(
        { message: "Student not found or not associated with you" },
        { status: 404 }
      );
    }

    await prisma.student.update({
      where: { id: studentId },
      data: { teacherId: null },
    });
    return NextResponse.json({ message: "Removed" }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
