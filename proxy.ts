import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export const AUTH_HEADERS = {
    userId: "x-user-id",
    role: "x-user-role",
    teacherId: "x-teacher-id",
    studentId: "x-student-id",
} as const;

export type AuthContext = {
    userId: string;
    role: string;
    teacherId?: string;
    studentId?: string;
};

export function proxy(request: NextRequest) {
    const token = request.cookies.get("gradingtoken")?.value;
    if (!token) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return NextResponse.json({ message: "Server misconfiguration" }, { status: 500 });
    }

    try {
        const payload = jwt.verify(token, secret) as {
            userId: string;
            role: string;
            teacherId?: string;
            studentId?: string;
        };

        const requestHeaders = new Headers(request.headers);
        requestHeaders.set(AUTH_HEADERS.userId, payload.userId);
        requestHeaders.set(AUTH_HEADERS.role, payload.role);
        requestHeaders.set(AUTH_HEADERS.teacherId, payload.teacherId ?? "");
        requestHeaders.set(AUTH_HEADERS.studentId, payload.studentId ?? "");

        return NextResponse.next({
            request: { headers: requestHeaders },
        });
    } catch {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }
}

export const config = {
  matcher: [
    "/api/question-papers/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/submissions/:path*",
  ],
};

export function getAuthFromRequest(request: Request): AuthContext | null {
    const userId = request.headers.get(AUTH_HEADERS.userId);
    const role = request.headers.get(AUTH_HEADERS.role);
    if (!userId || !role) return null;
    const teacherId = request.headers.get(AUTH_HEADERS.teacherId) || undefined;
    const studentId = request.headers.get(AUTH_HEADERS.studentId) || undefined;
    return { userId, role, teacherId, studentId };
}

export function getTeacherContextFromRequest(request: Request): 
    | { ok: true; userId: string; role: string; teacherId: string }
    | { ok: false; response: Response } {
    const ctx = getAuthFromRequest(request);
    if (!ctx) {
        return {
            ok: false,
            response: new Response(JSON.stringify({ message: "Not authenticated" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            }),
        };
    }
    if (ctx.role !== "TEACHER" || !ctx.teacherId) {
        return {
            ok: false,
            response: new Response(JSON.stringify({ message: "Forbidden" }), {
                status: 403,
                headers: { "Content-Type": "application/json" },
            }),
        };
    }
    return { ok: true, userId: ctx.userId, role: ctx.role, teacherId: ctx.teacherId };
}

export function getStudentContextFromRequest(request: Request):
    | { ok: true; userId: string; role: string; studentId: string }
    | { ok: false; response: Response } {
    const ctx = getAuthFromRequest(request);
    if (!ctx) {
        return {
            ok: false,
            response: new Response(JSON.stringify({ message: "Not authenticated" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            }),
        };
    }
    if (ctx.role !== "STUDENT" || !ctx.studentId) {
        return {
            ok: false,
            response: new Response(JSON.stringify({ message: "Forbidden" }), {
                status: 403,
                headers: { "Content-Type": "application/json" },
            }),
        };
    }
    return { ok: true, userId: ctx.userId, role: ctx.role, studentId: ctx.studentId };
}
