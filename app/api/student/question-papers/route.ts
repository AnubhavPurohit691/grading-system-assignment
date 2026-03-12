import { prisma } from "@/lib/db";
import { getStudentContextFromRequest } from "@/proxy";
import { NextResponse } from "next/server";

/** GET /api/student/question-papers – list question papers from the teacher this student is associated with */
export async function GET(request: Request) {
  const ctx = getStudentContextFromRequest(request);
  if (!ctx.ok) return ctx.response;

  try {
    const student = await prisma.student.findUnique({
      where: { id: ctx.studentId },
      select: { teacherId: true },
    });
    if (!student?.teacherId) {
      return NextResponse.json(
        { message: "You are not associated with any teacher. Ask your teacher to add you." },
        { status: 403 }
      );
    }

    const questionPapers = await prisma.questionPaper.findMany({
      where: { teacherId: student.teacherId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        _count: { select: { questions: true } },
      },
    });

    const paperIds = questionPapers.map((p) => p.id);
    const mySubmissions = await prisma.submission.findMany({
      where: { studentId: ctx.studentId, questionPaperId: { in: paperIds } },
      select: { id: true, questionPaperId: true, score: true, letterGrade: true },
    });
    const submissionByPaper = new Map(mySubmissions.map((s) => [s.questionPaperId, s]));

    const questionPapersWithAttempt = questionPapers.map((p) => {
      const sub = submissionByPaper.get(p.id);
      return {
        ...p,
        submissionId: sub?.id ?? null,
        score: sub?.score ?? null,
        letterGrade: sub?.letterGrade ?? null,
      };
    });

    return NextResponse.json({ questionPapers: questionPapersWithAttempt }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
