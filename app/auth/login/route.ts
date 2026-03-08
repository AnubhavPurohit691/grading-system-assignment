import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();
        if (!email || !password) {
            return NextResponse.json(
                { message: "Email and password are required" },
                { status: 400 }
            );
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return NextResponse.json(
                { message: "Server misconfiguration" },
                { status: 500 }
            );
        }
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                username: true,
                email: true,
                password: true,
                role: true,
                createdAt: true,
            },
        });
        if (!user) {
            return NextResponse.json(
                { message: "Invalid email or password" },
                { status: 401 }
            );
        }
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return NextResponse.json(
                { message: "Invalid email or password" },
                { status: 401 }
            );
        }
        let teacherId: string | undefined;
        let studentId: string | undefined;
        if (user.role === "TEACHER") {
            const t = await prisma.teacher.findUnique({
                where: { userId: user.id },
                select: { id: true },
            });
            teacherId = t?.id;
        } else if (user.role === "STUDENT") {
            const s = await prisma.student.findUnique({
                where: { userId: user.id },
                select: { id: true },
            });
            studentId = s?.id;
        }
        const token = jwt.sign(
            { userId: user.id, role: user.role, teacherId, studentId },
            jwtSecret,
            { expiresIn: "30d" }
        );
        const { password: _, ...safeUser } = user;
        const response = NextResponse.json(
            { message: "Login successful", user: safeUser },
            { status: 200 }
        );
        response.cookies.set("gradingtoken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: COOKIE_MAX_AGE,
        });
        return response;
    } catch (error) {
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
