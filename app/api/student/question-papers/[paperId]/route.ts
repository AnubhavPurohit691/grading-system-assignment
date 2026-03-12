import { prisma } from "@/lib/db";
import { getStudentContextFromRequest } from "@/proxy";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ paperId: string }> };

/** GET /api/student/question-papers/[paperId] – get one paper with questions (for attempt); only if paper belongs to student's teacher */
export async function GET(request: Request, context: RouteContext) {
  const ctx = getStudentContextFromRequest(request);
  if (!ctx.ok) return ctx.response;

  const { paperId } = await context.params;
  if (!paperId) {
    return NextResponse.json(
      { message: "paperId is required" },
      { status: 400 }
    );
  }

  try {
    const student = await prisma.student.findUnique({
      where: { id: ctx.studentId },
      select: { teacherId: true },
    });
    if (!student?.teacherId) {
      return NextResponse.json(
        { message: "You are not associated with any teacher" },
        { status: 403 }
      );
    }

    const paper = await prisma.questionPaper.findFirst({
      where: { id: paperId, teacherId: student.teacherId },
      include: {
        questions: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            question: true,
            options: true,
            points: true,
            sortOrder: true,
          },
        },
      },
    });
    if (!paper) {
      return NextResponse.json(
        { message: "Question paper not found" },
        { status: 404 }
      );
    }

    const existingSubmission = await prisma.submission.findFirst({
      where: { studentId: ctx.studentId, questionPaperId: paperId },
      select: { id: true },
    });

    return NextResponse.json({
      paper: {
        id: paper.id,
        name: paper.name,
        description: paper.description,
        questions: paper.questions,
      },
      submissionId: existingSubmission?.id ?? null,
    });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
