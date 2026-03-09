import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";
import { getTeacherContextFromRequest } from "@/proxy";

type RouteContext = { params: Promise<{ paperId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const ctx = getTeacherContextFromRequest(request);
  if (!ctx.ok) return ctx.response;

  const { paperId } = await context.params;
  if (!paperId) {
    return NextResponse.json({ message: "paperId is required" }, { status: 400 });
  }

  try {
    const paper = await prisma.questionPaper.findFirst({
      where: { id: paperId, teacherId: ctx.teacherId },
      select: { id: true },
    });
    if (!paper) {
      return NextResponse.json({ message: "Question paper not found" }, { status: 404 });
    }

    const questions = await prisma.question.findMany({
      where: { questionPaperId: paperId },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ questions }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  const ctx = getTeacherContextFromRequest(request);
  if (!ctx.ok) return ctx.response;

  const { paperId } = await context.params;
  if (!paperId) {
    return NextResponse.json({ message: "paperId is required" }, { status: 400 });
  }

  try {
    const paper = await prisma.questionPaper.findFirst({
      where: { id: paperId, teacherId: ctx.teacherId },
      select: { id: true },
    });
    if (!paper) {
      return NextResponse.json({ message: "Question paper not found" }, { status: 404 });
    }

    const body = await request.json();

    if (Array.isArray(body.questions)) {
      if (body.questions.length === 0) {
        return NextResponse.json({ message: "questions array is empty" }, { status: 400 });
      }
      type Q = { question?: string; options?: unknown; answer?: string; points?: number; sortOrder?: number };
      const data: Prisma.QuestionCreateManyInput[] = body.questions.map((q: Q, i: number) => ({
        questionPaperId: paperId,
        question: q.question != null ? String(q.question).trim() : "",
        options: q.options != null ? (q.options as Prisma.InputJsonValue) : undefined,
        answer: q.answer != null ? String(q.answer).trim() || null : null,
        points: typeof q.points === "number" && q.points >= 0 ? q.points : 0,
        sortOrder: typeof q.sortOrder === "number" && q.sortOrder >= 0 ? q.sortOrder : i,
      }));
      const invalidIndex = data.findIndex((d) => d.question === "");
      if (invalidIndex !== -1) {
        return NextResponse.json(
          { message: `questions[${invalidIndex}]: question is required` },
          { status: 400 }
        );
      }
      const result = await prisma.question.createMany({ data });
      return NextResponse.json({ count: result.count }, { status: 201 });
    }

    const { question: questionText, options, answer, points, sortOrder } = body;
    if (!questionText || typeof questionText !== "string" || questionText.trim() === "") {
      return NextResponse.json({ message: "question is required" }, { status: 400 });
    }
    const question = await prisma.question.create({
      data: {
        questionPaperId: paperId,
        question: questionText.trim(),
        options: options != null ? options : undefined,
        answer: answer != null ? String(answer).trim() || undefined : undefined,
        points: typeof points === "number" && points >= 0 ? points : 0,
        sortOrder: typeof sortOrder === "number" && sortOrder >= 0 ? sortOrder : 0,
      },
    });
    return NextResponse.json({ question }, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
