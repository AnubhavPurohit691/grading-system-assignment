import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTeacherIdFromCookies } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { QuestionPapersClient } from "./question-papers-client";

export const metadata: Metadata = {
  title: "Question papers",
  description: "Create and manage your question papers.",
};

export default async function QuestionPapersPage() {
  const teacherId = await getTeacherIdFromCookies();
  if (!teacherId) redirect("/auth/login");

  const rows = await prisma.questionPaper.findMany({
    where: { teacherId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { questions: true, submissions: true },
      },
    },
  });

  const initialPapers = rows.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    createdAt: p.createdAt.toISOString(),
    _count: p._count,
  }));

  return <QuestionPapersClient initialPapers={initialPapers} />;
}
