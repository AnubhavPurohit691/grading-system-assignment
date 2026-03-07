import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
    try {
        const { email, password, role ,username} = await request.json();
        console.log(email, password, role, username);
        if (!email || !password || !role || !username) {
            return NextResponse.json(
                { message: "Email, password, username and role are required" },
                { status: 400 }
            );
        }
        const validRoles = ["TEACHER", "STUDENT"] as const;
        if (!validRoles.includes(role)) {
            return NextResponse.json({ message: "Invalid role" }, { status: 400 });
        }
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json(
                { message: "User already exists" },
                { status: 409 }
            );
        }
        const jwtSecret = process.env.JWT_SECRET;
        console.log("jwtSecret", jwtSecret);
        if (!jwtSecret) {
            return NextResponse.json(
                { message: "Server misconfiguration" },
                { status: 500 }
            );
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; 
        console.log("till cookie max age");
        const user = await prisma.$transaction(async (tx) => {
            const u = await tx.user.create({
                data: { email, password: hashedPassword, role, username },
                select: { id: true, username: true, email: true, role: true, createdAt: true },
            });
            const profileData = { userId: u.id };
            if (role === "TEACHER") await tx.teacher.create({ data: profileData });
            else if (role === "STUDENT") await tx.student.create({ data: profileData });
            return u;
        });
        console.log("till user created");
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            jwtSecret,
            { expiresIn: "30d" }
        );
        const response = NextResponse.json(
            { message: "User created successfully", user },
            { status: 201 }
        );
        console.log("till response");
        response.cookies.set("gradingtoken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: COOKIE_MAX_AGE,
        });
        return response;
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
