import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db";

export type CurrentUser = {
  id: string;
  username: string;
  email: string;
  role: string;
};

/** Returns teacherId if the request has a valid teacher session, else null. */
export async function getTeacherIdFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("gradingtoken")?.value;
  if (!token) return null;
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  try {
    const payload = jwt.verify(token, secret) as {
      role?: string;
      teacherId?: string;
    };
    if (payload.role === "TEACHER" && payload.teacherId) return payload.teacherId;
    return null;
  } catch {
    return null;
  }
}

/** Returns studentId if the request has a valid student session, else null. */
export async function getStudentIdFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("gradingtoken")?.value;
  if (!token) return null;
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  try {
    const payload = jwt.verify(token, secret) as {
      role?: string;
      studentId?: string;
    };
    if (payload.role === "STUDENT" && payload.studentId) return payload.studentId;
    return null;
  } catch {
    return null;
  }
}

/** For student: get their teacher (if any) for display on landing. */
export async function getStudentTeacher(): Promise<{
  id: string;
  user: { id: string; username: string; email: string };
} | null> {
  const studentId = await getStudentIdFromCookies();
  if (!studentId) return null;
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      teacher: {
        select: {
          id: true,
          user: { select: { id: true, username: true, email: true } },
        },
      },
    },
  });
  return student?.teacher ?? null;
}

/** Returns current user if authenticated, else null. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("gradingtoken")?.value;
  if (!token) return null;
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  try {
    const payload = jwt.verify(token, secret) as { userId?: string };
    if (!payload.userId) return null;
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, username: true, email: true, role: true },
    });
    return user;
  } catch {
    return null;
  }
}
