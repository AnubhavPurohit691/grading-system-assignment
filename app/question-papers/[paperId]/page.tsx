import { cache } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTeacherIdFromCookies } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import type { PaperDetailDTO } from "@/lib/types/papers";
import { PaperDetailClient } from "./paper-detail-client";

/** Cached fetcher so generateMetadata and the page share one request (deduplication). */
const getPaper = cache(async (paperId: string, teacherId: string | null) => {
  if (!teacherId) return null;
  return prisma.questionPaper.findFirst({
    where: { id: paperId, teacherId },
    include: { questions: { orderBy: { sortOrder: "asc" } } },
  });
});

type Props = { params: Promise<{ paperId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { paperId } = await params;
  const teacherId = await getTeacherIdFromCookies();
  const paper = await getPaper(paperId, teacherId);
  if (!paper)
    return { title: "Question paper" };
  return {
    title: paper.name,
    description: paper.description ?? `Question paper: ${paper.name}`,
  };
}

export default async function PaperDetailPage({ params }: Props) {
  const { paperId } = await params;
  const teacherId = await getTeacherIdFromCookies();
  if (!teacherId) redirect("/auth/login");

  const questionPaper = await getPaper(paperId, teacherId);
  if (!questionPaper) redirect("/question-papers");

  const initialPaper: PaperDetailDTO = {
    id: questionPaper.id,
    name: questionPaper.name,
    description: questionPaper.description,
    questions: questionPaper.questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      answer: q.answer,
      points: q.points,
      sortOrder: q.sortOrder,
    })),
  };

  return (
    <PaperDetailClient
      paperId={paperId}
      initialPaper={initialPaper}
    />
  );
}
