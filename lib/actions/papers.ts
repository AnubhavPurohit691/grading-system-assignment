"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTeacherIdFromCookies } from "@/lib/auth-server";
import { prisma } from "@/lib/db";

export type PaperActionResult = { error?: string };

export async function createPaperAction(
  _prev: PaperActionResult,
  formData: FormData
): Promise<PaperActionResult> {
  const teacherId = await getTeacherIdFromCookies();
  if (!teacherId) redirect("/auth/login");

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Name is required" };

  const description = (formData.get("description") as string)?.trim() || undefined;

  await prisma.questionPaper.create({
    data: { name, description, teacherId },
  });
  revalidatePath("/question-papers");
  return {};
}

export async function updatePaperAction(
  paperId: string,
  _prev: PaperActionResult,
  formData: FormData
): Promise<PaperActionResult> {
  const teacherId = await getTeacherIdFromCookies();
  if (!teacherId) redirect("/auth/login");

  const existing = await prisma.questionPaper.findFirst({
    where: { id: paperId, teacherId },
  });
  if (!existing) return { error: "Not found" };

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Name is required" };
  const description = (formData.get("description") as string)?.trim() || null;

  await prisma.questionPaper.update({
    where: { id: paperId },
    data: { name, description },
  });
  revalidatePath("/question-papers");
  revalidatePath(`/question-papers/${paperId}`);
  return {};
}

export async function deletePaperAction(paperId: string): Promise<void> {
  const teacherId = await getTeacherIdFromCookies();
  if (!teacherId) redirect("/auth/login");

  const existing = await prisma.questionPaper.findFirst({
    where: { id: paperId, teacherId },
  });
  if (!existing) return;

  await prisma.questionPaper.delete({ where: { id: paperId } });
  revalidatePath("/question-papers");
  redirect("/question-papers");
}

export type QuestionActionResult = { error?: string };

export async function createQuestionAction(
  paperId: string,
  _prev: QuestionActionResult,
  formData: FormData
): Promise<QuestionActionResult> {
  const teacherId = await getTeacherIdFromCookies();
  if (!teacherId) redirect("/auth/login");

  const paper = await prisma.questionPaper.findFirst({
    where: { id: paperId, teacherId },
  });
  if (!paper) return { error: "Paper not found" };

  const question = (formData.get("question") as string)?.trim();
  if (!question) return { error: "Question is required" };
  const answer = (formData.get("answer") as string)?.trim() || undefined;
  const points = Math.max(0, Number(formData.get("points")) || 0);

  await prisma.question.create({
    data: { questionPaperId: paperId, question, answer, points },
  });
  revalidatePath(`/question-papers/${paperId}`);
  return {};
}

export async function updateQuestionAction(
  paperId: string,
  questionId: string,
  _prev: QuestionActionResult,
  formData: FormData
): Promise<QuestionActionResult> {
  const teacherId = await getTeacherIdFromCookies();
  if (!teacherId) redirect("/auth/login");

  const paper = await prisma.questionPaper.findFirst({
    where: { id: paperId, teacherId },
  });
  if (!paper) return { error: "Paper not found" };

  const existing = await prisma.question.findFirst({
    where: { id: questionId, questionPaperId: paperId },
  });
  if (!existing) return { error: "Question not found" };

  const question = (formData.get("question") as string)?.trim();
  if (!question) return { error: "Question is required" };
  const answer = (formData.get("answer") as string)?.trim() || null;
  const points = Math.max(0, Number(formData.get("points")) || 0);

  await prisma.question.update({
    where: { id: questionId },
    data: { question, answer, points },
  });
  revalidatePath(`/question-papers/${paperId}`);
  return {};
}

export async function deleteQuestionAction(
  paperId: string,
  questionId: string
): Promise<void> {
  const teacherId = await getTeacherIdFromCookies();
  if (!teacherId) redirect("/auth/login");

  const paper = await prisma.questionPaper.findFirst({
    where: { id: paperId, teacherId },
  });
  if (!paper) return;

  const existing = await prisma.question.findFirst({
    where: { id: questionId, questionPaperId: paperId },
  });
  if (!existing) return;

  await prisma.question.delete({ where: { id: questionId } });
  revalidatePath(`/question-papers/${paperId}`);
}
