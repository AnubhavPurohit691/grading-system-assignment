"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTeacherIdFromCookies } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";

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

  const questionText = (formData.get("question") as string)?.trim();
  if (!questionText) return { error: "Question is required" };
  const points = Math.max(0, Number(formData.get("points")) || 0);
  const type = (formData.get("type") as string) || "long";

  let options: string[] | undefined;
  let answer: string | undefined;

  if (type === "mcq") {
    const o1 = (formData.get("option1") as string)?.trim() ?? "";
    const o2 = (formData.get("option2") as string)?.trim() ?? "";
    const o3 = (formData.get("option3") as string)?.trim() ?? "";
    const o4 = (formData.get("option4") as string)?.trim() ?? "";
    options = [o1, o2, o3, o4].filter(Boolean);
    if (options.length < 2) return { error: "MCQ needs at least 2 options" };
    const correctIndex = Math.max(0, Math.min(3, Number(formData.get("correctIndex")) || 0));
    answer = options[correctIndex] ?? options[0];
  } else {
    answer = (formData.get("answer") as string)?.trim() || undefined;
  }

  await prisma.question.create({
    data: { questionPaperId: paperId, question: questionText, answer: answer || undefined, points, options: options?.length ? options : undefined },
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

  const questionText = (formData.get("question") as string)?.trim();
  if (!questionText) return { error: "Question is required" };
  const points = Math.max(0, Number(formData.get("points")) || 0);
  const type = (formData.get("type") as string) || "long";

  let options: string[] | undefined;
  let answer: string | null;

  if (type === "mcq") {
    const o1 = (formData.get("option1") as string)?.trim() ?? "";
    const o2 = (formData.get("option2") as string)?.trim() ?? "";
    const o3 = (formData.get("option3") as string)?.trim() ?? "";
    const o4 = (formData.get("option4") as string)?.trim() ?? "";
    options = [o1, o2, o3, o4].filter(Boolean);
    if (options.length < 2) return { error: "MCQ needs at least 2 options" };
    const correctIndex = Math.max(0, Math.min(3, Number(formData.get("correctIndex")) || 0));
    answer = options[correctIndex] ?? options[0];
  } else {
    answer = (formData.get("answer") as string)?.trim() || null;
    options = undefined;
  }

  await prisma.question.update({
    where: { id: questionId },
    data: { question: questionText, answer, points, options: options ?? Prisma.JsonNull },
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
