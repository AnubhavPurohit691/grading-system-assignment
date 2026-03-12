import { prisma } from "@/lib/db";
import { getStudentContextFromRequest } from "@/proxy";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const ctx = getStudentContextFromRequest(request);
  if (!ctx.ok) return ctx.response;

  const { token } = await params;
  if (!token) {
    return NextResponse.json({ message: "Invalid invite" }, { status: 400 });
  }

  try {
    const invite = await prisma.studentInvite.findUnique({
      where: { token },
      include: { teacher: true },
    });

    if (!invite) {
      return NextResponse.json({ message: "Invite not found" }, { status: 404 });
    }
    if (invite.usedAt) {
      return NextResponse.json(
        { message: "Invite already used" },
        { status: 410 }
      );
    }
    if (new Date() > invite.expiresAt) {
      return NextResponse.json(
        { message: "Invite expired" },
        { status: 410 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: ctx.userId },
      select: { email: true },
    });
    if (!user || user.email.toLowerCase() !== invite.email.toLowerCase()) {
      return NextResponse.json(
        { message: "This invite is for a different email address" },
        { status: 403 }
      );
    }

    await prisma.$transaction([
      prisma.student.update({
        where: { id: ctx.studentId },
        data: { teacherId: invite.teacherId },
      }),
      prisma.studentInvite.update({
        where: { id: invite.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json(
      { message: "You have been added to the class", teacherId: invite.teacherId },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
