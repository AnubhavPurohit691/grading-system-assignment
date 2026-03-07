import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const gradingtoken = cookieStore.get("gradingtoken")?.value;
        if (!gradingtoken) {
            return NextResponse.json(
                { message: "Not authenticated" },
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
        const payload = jwt.verify(gradingtoken, jwtSecret) as {
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
    } catch (error) {
        return NextResponse.json(
            { message: "Not authenticated" },
            { status: 401 }
        );
    }
}
