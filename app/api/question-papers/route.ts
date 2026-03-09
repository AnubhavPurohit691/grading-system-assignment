import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getTeacherContextFromRequest } from "@/proxy";

export async function GET(request: Request) {
  const ctx = getTeacherContextFromRequest(request);
  if (!ctx.ok) return ctx.response;

  try {
    const questionPapers = await prisma.questionPaper.findMany({
      where: { teacherId: ctx.teacherId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { questions: true, submissions: true },
        },
      },
    });
    return NextResponse.json({ questionPapers }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const ctx = getTeacherContextFromRequest(request);
  if (!ctx.ok) return ctx.response;

  try {
    const body = await request.json();
    const { name, description } = body as { name?: string; description?: string };
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { message: "name is required" },
        { status: 400 }
      );
    }

    const questionPaper = await prisma.questionPaper.create({
      data: {
        name: name.trim(),
        description: description != null ? String(description).trim() || undefined : undefined,
        teacherId: ctx.teacherId,
      },
    });
    return NextResponse.json({ questionPaper }, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
