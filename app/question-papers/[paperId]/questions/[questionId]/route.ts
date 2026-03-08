import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";
import { getTeacherContextFromRequest } from "@/proxy";

type RouteContext = { params: Promise<{ paperId: string; questionId: string }> };

async function ensurePaperAndQuestion(
    paperId: string,
    questionId: string,
    teacherId: string
) {
    const paper = await prisma.questionPaper.findFirst({
        where: { id: paperId, teacherId },
        select: { id: true },
    });
    if (!paper) return null;

    const question = await prisma.question.findFirst({
        where: { id: questionId, questionPaperId: paperId },
    });
    if (!question) return null;

    return question;
}

export async function GET(request: Request, context: RouteContext) {
    const ctx = getTeacherContextFromRequest(request);
    if (!ctx.ok) return ctx.response;

    const { paperId, questionId } = await context.params;
    if (!paperId || !questionId) {
        return NextResponse.json(
            { message: "paperId and questionId are required" },
            { status: 400 }
        );
    }

    try {
        const question = await ensurePaperAndQuestion(
            paperId,
            questionId,
            ctx.teacherId
        );
        if (!question) {
            return NextResponse.json({ message: "Question not found" }, { status: 404 });
        }
        return NextResponse.json(question, { status: 200 });
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

    const { paperId, questionId } = await context.params;
    if (!paperId || !questionId) {
        return NextResponse.json(
            { message: "paperId and questionId are required" },
            { status: 400 }
        );
    }

    try {
        const existing = await ensurePaperAndQuestion(
            paperId,
            questionId,
            ctx.teacherId
        );
        if (!existing) {
            return NextResponse.json({ message: "Question not found" }, { status: 404 });
        }

        const body = await request.json();
        const {
            question: questionText,
            options,
            answer,
            points,
            sortOrder,
        } = body as {
            question?: string;
            options?: unknown;
            answer?: string;
            points?: number;
            sortOrder?: number;
        };

        const data: Prisma.QuestionUpdateInput = {};
        if (questionText !== undefined) {
            const trimmed = typeof questionText === "string" ? questionText.trim() : "";
            data.question = trimmed || existing.question;
        }
        if (options !== undefined) data.options = options as Prisma.InputJsonValue;
        if (answer !== undefined) data.answer = answer == null ? null : String(answer).trim() || null;
        if (points !== undefined && typeof points === "number" && points >= 0) data.points = points;
        if (sortOrder !== undefined && typeof sortOrder === "number" && sortOrder >= 0) data.sortOrder = sortOrder;

        const question = await prisma.question.update({
            where: { id: questionId },
            data,
        });
        return NextResponse.json(question, { status: 200 });
    } catch {
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, context: RouteContext) {
    const ctx = getTeacherContextFromRequest(request);
    if (!ctx.ok) return ctx.response;

    const { paperId, questionId } = await context.params;
    if (!paperId || !questionId) {
        return NextResponse.json(
            { message: "paperId and questionId are required" },
            { status: 400 }
        );
    }

    try {
        const question = await ensurePaperAndQuestion(
            paperId,
            questionId,
            ctx.teacherId
        );
        if (!question) {
            return NextResponse.json({ message: "Question not found" }, { status: 404 });
        }

        await prisma.question.delete({ where: { id: questionId } });
        return NextResponse.json({ message: "Deleted" }, { status: 200 });
    } catch {
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
