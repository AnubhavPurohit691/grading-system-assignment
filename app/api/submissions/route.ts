import { prisma } from "@/lib/db";
import { runAutoGrade } from "@/lib/grading/run";
import { getAuthFromRequest, getStudentContextFromRequest } from "@/proxy";
import { NextResponse } from "next/server";
import { AUTH_MESSAGE_NOT_AUTHENTICATED } from "@/lib/constants";

export async function POST(request: Request) {
  const ctx = getStudentContextFromRequest(request);
  if (!ctx.ok) return ctx.response;

  try {
    const body = await request.json();
    const { paperId, studentAnswers } = body as {
      paperId?: string;
      studentAnswers?: Array<{ questionId: string; answer: string }>;
    };

    if (!paperId || typeof paperId !== "string" || !paperId.trim()) {
      return NextResponse.json(
        { message: "paperId is required" },
        { status: 400 }
      );
    }
    if (!Array.isArray(studentAnswers) || studentAnswers.length === 0) {
      return NextResponse.json(
        { message: "studentAnswers must be a non-empty array" },
        { status: 400 }
      );
    }

    const paper = await prisma.questionPaper.findUnique({
      where: { id: paperId.trim() },
      select: { id: true, teacherId: true },
    });
    if (!paper) {
      return NextResponse.json(
        { message: "Question paper not found" },
        { status: 404 }
      );
    }

    const studentRecord = await prisma.student.findUnique({
      where: { id: ctx.studentId },
      select: { teacherId: true },
    });
    if (!studentRecord?.teacherId || studentRecord.teacherId !== paper.teacherId) {
      return NextResponse.json(
        { message: "You do not have access to this question paper. Ask your teacher to add you." },
        { status: 403 }
      );
    }

    const questionIds = await prisma.question.findMany({
      where: { questionPaperId: paper.id },
      select: { id: true },
    });
    const validQuestionIds = new Set(questionIds.map((q) => q.id));
    const requestedIds = studentAnswers.map((a) =>
      typeof a.questionId === "string" ? a.questionId.trim() : ""
    );
    const invalid = requestedIds.filter((id) => !id || !validQuestionIds.has(id));
    if (invalid.length > 0) {
      return NextResponse.json(
        { message: "Every questionId must belong to the paper" },
        { status: 400 }
      );
    }

    const uniqueQuestionIds = new Set(requestedIds);
    if (uniqueQuestionIds.size !== requestedIds.length) {
      return NextResponse.json(
        { message: "Duplicate questionId in studentAnswers" },
        { status: 400 }
      );
    }

    const existing = await prisma.submission.findFirst({
      where: { studentId: ctx.studentId, questionPaperId: paper.id },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        {
          message: "You have already attempted this paper. View your report card.",
          submissionId: existing.id,
        },
        { status: 409 }
      );
    }

    const submission = await prisma.submission.create({
      data: {
        studentId: ctx.studentId,
        questionPaperId: paper.id,
        studentAnswers: {
          create: studentAnswers.map((a: { questionId: string; answer: string }) => ({
            questionId: a.questionId.trim(),
            answer: typeof a.answer === "string" ? a.answer : String(a.answer ?? ""),
          })),
        },
      },
      include: {
        studentAnswers: { include: { question: { select: { id: true, points: true, sortOrder: true } } } },
      },
    });

    let gradingError: string | null = null;
    try {
      await runAutoGrade(submission.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Auto-grading failed";
      if (process.env.NODE_ENV === "development") {
        console.error("[runAutoGrade]", message, err);
      }
      gradingError = message;
    }

    const graded = await prisma.submission.findUnique({
      where: { id: submission.id },
      include: { studentAnswers: true },
    });
    const payload: { submission: typeof graded; gradingError?: string } = {
      submission: graded ?? submission,
    };
    if (gradingError) payload.gradingError = gradingError;
    return NextResponse.json(payload, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const auth = getAuthFromRequest(request);
  if (!auth) {
    return NextResponse.json({ message: AUTH_MESSAGE_NOT_AUTHENTICATED }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const questionPaperId = searchParams.get("questionPaperId")?.trim() || undefined;
    const studentIdParam = searchParams.get("studentId")?.trim() || undefined;

    if (auth.role === "STUDENT") {
      if (!auth.studentId) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
      const submissions = await prisma.submission.findMany({
        where: { studentId: auth.studentId },
        orderBy: { submittedAt: "desc" },
        include: {
          questionPaper: { select: { id: true, name: true } },
          _count: { select: { studentAnswers: true } },
        },
      });
      return NextResponse.json({ submissions }, { status: 200 });
    }

    if (auth.role === "TEACHER" && auth.teacherId) {
      const where: {
        questionPaper: { teacherId: string };
        studentId?: string;
        questionPaperId?: string;
      } = {
        questionPaper: { teacherId: auth.teacherId },
      };
      if (questionPaperId) where.questionPaperId = questionPaperId;
      if (studentIdParam) where.studentId = studentIdParam;

      const submissions = await prisma.submission.findMany({
        where,
        orderBy: { submittedAt: "desc" },
        include: {
          questionPaper: { select: { id: true, name: true } },
          student: { select: { id: true, user: { select: { username: true, email: true } } } },
          _count: { select: { studentAnswers: true } },
        },
      });
      return NextResponse.json({ submissions }, { status: 200 });
    }

    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
