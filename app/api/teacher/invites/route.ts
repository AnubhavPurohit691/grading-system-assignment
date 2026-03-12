import { prisma } from "@/lib/db";
import { getTeacherContextFromRequest } from "@/proxy";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";

const INVITE_EXPIRY_DAYS = 7;

export async function POST(request: Request) {
  const ctx = getTeacherContextFromRequest(request);
  if (!ctx.ok) return ctx.response;

  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const sendEmail = Boolean(body?.sendEmail);
    if (!email) {
      return NextResponse.json(
        { message: "email is required" },
        { status: 400 }
      );
    }

    const token = crypto.randomBytes(24).toString("base64url");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);

    const invite = await prisma.studentInvite.create({
      data: {
        token,
        email,
        teacherId: ctx.teacherId,
        expiresAt,
      },
      select: {
        id: true,
        token: true,
        email: true,
        expiresAt: true,
      },
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
      (() => {
        try {
          const u = new URL(request.url);
          return `${u.protocol}//${u.host}`;
        } catch {
          return "";
        }
      })();
    const inviteLink = `${baseUrl}/invite/${invite.token}`;

    let emailSent = false;
    const resendKey = process.env.RESEND_API_KEY;
    if (sendEmail && resendKey) {
      const resend = new Resend(resendKey);
      const from = process.env.RESEND_FROM ?? "Grading <onboarding@resend.dev>";
      const { error } = await resend.emails.send({
        from,
        to: [email],
        subject: "You're invited to join a class",
        html: `
          <p>You've been invited to join a class.</p>
          <p><a href="${inviteLink}">Accept invite and sign up</a></p>
          <p>This link expires in ${INVITE_EXPIRY_DAYS} days. If you didn't expect this, you can ignore this email.</p>
        `,
      });
      emailSent = !error;
    }

    return NextResponse.json(
      { invite: { ...invite, inviteLink }, emailSent },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const ctx = getTeacherContextFromRequest(request);
  if (!ctx.ok) return ctx.response;

  try {
    const invites = await prisma.studentInvite.findMany({
      where: { teacherId: ctx.teacherId, usedAt: null },
      select: {
        id: true,
        email: true,
        expiresAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ invites }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
