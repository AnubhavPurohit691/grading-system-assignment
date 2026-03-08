import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getTeacherContextFromRequest } from "@/proxy";

export async function GET(request: Request, { params }: { params: Promise<{ paperId: string }> }) {
    const ctx = getTeacherContextFromRequest(request);
    if (!ctx.ok) return ctx.response;

    const { paperId } = await params;
    const questionPaper = await prisma.questionPaper.findFirst({
        where: { id: paperId, teacherId: ctx.teacherId },
        include: { questions: { orderBy: { sortOrder: "asc" } } },
    });
    if (!questionPaper) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json({ questionPaper });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ paperId: string }> }) {
    const ctx = getTeacherContextFromRequest(request);
    if (!ctx.ok) return ctx.response;

    const { paperId } = await params;
    const paper = await prisma.questionPaper.findFirst({
        where: { id: paperId, teacherId: ctx.teacherId },
    });
    if (!paper) return NextResponse.json({ message: "Not found" }, { status: 404 });

    const body = await request.json();
    const { name, description } = body;
    const data: { name?: string; description?: string | null } = {};
    if (name != null) data.name = String(name).trim();
    if (description != null) data.description = String(description).trim() || null;
    const questionPaper = await prisma.questionPaper.update({
        where: { id: paperId },
        data,
    });
    return NextResponse.json({ questionPaper });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ paperId: string }> }) {
    const ctx = getTeacherContextFromRequest(request);
    if (!ctx.ok) return ctx.response;

    const { paperId } = await params;
    const paper = await prisma.questionPaper.findFirst({
        where: { id: paperId, teacherId: ctx.teacherId },
    });
    if (!paper) return NextResponse.json({ message: "Not found" }, { status: 404 });

    await prisma.questionPaper.delete({ where: { id: paperId } });
    return NextResponse.json({ message: "Deleted" });
}
