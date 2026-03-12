import { prisma } from "@/lib/db";
import { getTeacherContextFromRequest } from "@/proxy";
import { NextResponse } from "next/server";
import { generateQuestions } from "@/lib/grading/generate-questions";

type Ctx = { params: Promise<{ paperId: string }> };

export async function POST(request: Request, context: Ctx) {
  const ctx = getTeacherContextFromRequest(request);
  if (!ctx.ok) return ctx.response;

  const { paperId } = await context.params;
  if (!paperId) {
    return NextResponse.json({ message: "paperId is required" }, { status: 400 });
  }

  const paper = await prisma.questionPaper.findFirst({
    where: { id: paperId, teacherId: ctx.teacherId },
    select: { id: true, name: true, description: true },
  });
  if (!paper) {
    return NextResponse.json({ message: "Question paper not found" }, { status: 404 });
  }

  let body: { topic?: string; mcqCount?: number; longCount?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }
  const topic = typeof body?.topic === "string" ? body.topic.trim() : "";
  if (!topic) return NextResponse.json({ message: "topic is required" }, { status: 400 });
  const mcqCount = Math.min(20, Math.max(0, typeof body?.mcqCount === "number" ? Math.floor(body.mcqCount) : 2));
  const longCount = Math.min(20, Math.max(0, typeof body?.longCount === "number" ? Math.floor(body.longCount) : 2));
  if (mcqCount + longCount < 1) return NextResponse.json({ message: "Need at least 1 MCQ or 1 long question" }, { status: 400 });
  if (!process.env.GOOGLE_API_KEY?.trim()) return NextResponse.json({ message: "GOOGLE_API_KEY not set" }, { status: 503 });

  let generated;
  try {
    generated = await generateQuestions(topic, {
      mcqCount,
      longCount,
      context: { paperName: paper.name ?? undefined, paperDescription: paper.description ?? undefined },
    });
  } catch (e) {
    return NextResponse.json({ message: e instanceof Error ? e.message : "Generation failed" }, { status: 500 });
  }

  const { _max } = await prisma.question.aggregate({
    where: { questionPaperId: paperId },
    _max: { sortOrder: true },
  });
  const nextOrder = (_max?.sortOrder ?? -1) + 1;
  const data = generated.map((q, i) => ({
    questionPaperId: paperId,
    question: q.question,
    options: q.options?.length ? q.options : undefined,
    answer: q.answer || null,
    points: q.points,
    sortOrder: nextOrder + i,
  }));

  const result = await prisma.question.createMany({ data });
  return NextResponse.json({ count: result.count, questions: data.length }, { status: 201 });
}
