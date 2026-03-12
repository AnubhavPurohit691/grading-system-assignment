import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { AUTH_COOKIE_NAME, AUTH_MESSAGE_NOT_AUTHENTICATED } from "@/lib/constants";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json(
        { message: AUTH_MESSAGE_NOT_AUTHENTICATED },
        { status: 401 }
      );
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return NextResponse.json(
        { message: "Server misconfiguration" },
        { status: 500 }
      );
    }
    const payload = jwt.verify(token, jwtSecret) as {
      userId: string;
      role: string;
    };
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, username: true, email: true, role: true, createdAt: true },
    });
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 401 }
      );
    }
    return NextResponse.json({ user }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: AUTH_MESSAGE_NOT_AUTHENTICATED },
      { status: 401 }
    );
  }
}
