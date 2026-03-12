import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { getAuthFromRequest } from "@/proxy";
import { getTeacherContextFromRequest } from "@/proxy";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ submissionId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const auth = getAuthFromRequest(request);
  if (!auth) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const { submissionId } = await context.params;
  if (!submissionId) {
    return NextResponse.json(
      { message: "submissionId is required" },
      { status: 400 }
    );
  }

  try {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        questionPaper: { select: { id: true, name: true, description: true, teacherId: true } },
        student: { select: { id: true, user: { select: { username: true, email: true } } } },
        studentAnswers: {
          include: {
            question: { select: { id: true, question: true, options: true, points: true, sortOrder: true } },
          },
          orderBy: { question: { sortOrder: "asc" } },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ message: "Submission not found" }, { status: 404 });
    }

    if (auth.role === "STUDENT") {
      if (submission.studentId !== auth.studentId) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
      return NextResponse.json({ submission }, { status: 200 });
    }

    if (auth.role === "TEACHER" && auth.teacherId) {
      if (submission.questionPaper.teacherId !== auth.teacherId) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
      return NextResponse.json({ submission }, { status: 200 });
    }

    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const ctx = getTeacherContextFromRequest(request);
  if (!ctx.ok) return ctx.response;

  const { submissionId } = await context.params;
  if (!submissionId) {
    return NextResponse.json(
      { message: "submissionId is required" },
      { status: 400 }
    );
  }

  try {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        questionPaper: { select: { teacherId: true } },
      },
    });

    if (!submission) {
      return NextResponse.json({ message: "Submission not found" }, { status: 404 });
    }
    if (submission.questionPaper.teacherId !== ctx.teacherId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      score,
      letterGrade,
      plagiarismScore,
      isFlagged,
      checkedAt,
    } = body as {
      score?: number | null;
      letterGrade?: string | null;
      plagiarismScore?: number | null;
      isFlagged?: boolean;
      checkedAt?: string | null;
    };

    const data: Prisma.SubmissionUpdateInput = {};
    if (score !== undefined) data.score = score == null ? null : Number(score);
    if (letterGrade !== undefined) {
      const validGrades = ["E", "A_PLUS", "A", "B_PLUS", "B", "C_PLUS", "C", "D_PLUS", "D", "F"] as const;
      data.letterGrade = letterGrade == null || letterGrade === ""
        ? null
        : validGrades.includes(letterGrade as typeof validGrades[number])
          ? (letterGrade as typeof validGrades[number])
          : undefined;
    }
    if (plagiarismScore !== undefined) data.plagiarismScore = plagiarismScore == null ? null : Number(plagiarismScore);
    if (isFlagged !== undefined) data.isFlagged = Boolean(isFlagged);
    if (checkedAt !== undefined) {
      data.checkedAt = checkedAt == null || checkedAt === "" ? null : new Date(checkedAt);
    }

    const updated = await prisma.submission.update({
      where: { id: submissionId },
      data,
    });
    return NextResponse.json({ submission: updated }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
