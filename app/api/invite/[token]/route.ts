import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  if (!token) {
    return NextResponse.json({ message: "Invalid invite" }, { status: 400 });
  }

  try {
    const invite = await prisma.studentInvite.findUnique({
      where: { token },
      select: {
        id: true,
        email: true,
        expiresAt: true,
        usedAt: true,
        teacher: {
          select: {
            user: { select: { username: true } },
          },
        },
      },
    });

    if (!invite) {
      return NextResponse.json({ message: "Invite not found" }, { status: 404 });
    }
    if (invite.usedAt) {
      return NextResponse.json(
        { message: "Invite already used", used: true },
        { status: 410 }
      );
    }
    if (new Date() > invite.expiresAt) {
      return NextResponse.json(
        { message: "Invite expired", expired: true },
        { status: 410 }
      );
    }

    return NextResponse.json({
      email: invite.email,
      teacherName: invite.teacher.user.username,
    });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
