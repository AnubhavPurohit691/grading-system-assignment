import { prisma } from "@/lib/db";
import { runGradingGraph } from "./graph";
import type { GradingItem } from "./types";

export async function runAutoGrade(submissionId: string): Promise<void> {
  if (!process.env.GOOGLE_API_KEY?.trim()) {
    throw new Error("GOOGLE_API_KEY is not set. Add it to .env for AI grading.");
  }

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      studentAnswers: {
        include: {
          question: true,
        },
        orderBy: { question: { sortOrder: "asc" } },
      },
    },
  });

  if (!submission || submission.studentAnswers.length === 0) {
    return;
  }

  const items: GradingItem[] = submission.studentAnswers.map((sa) => ({
    questionId: sa.questionId,
    questionText: sa.question.question,
    teacherAnswer: sa.question.answer ?? null,
    studentAnswer: sa.answer,
    maxPoints: sa.question.points,
  }));

  const totalMaxPoints = items.reduce((sum, i) => sum + i.maxPoints, 0);
  if (totalMaxPoints === 0) {
    throw new Error("No points configured for this paper.");
  }

  const { results, totalEarned, letterGrade } = await runGradingGraph({
    submissionId,
    items,
    totalMaxPoints,
  });

  const percentage =
    totalMaxPoints > 0 ? (totalEarned / totalMaxPoints) * 100 : 0;
  const score = totalEarned;
  const aiScore = percentage;

  await prisma.$transaction([
    prisma.submission.update({
      where: { id: submissionId },
      data: {
        score,
        aiScore,
        letterGrade: letterGrade
          ? (letterGrade as "E" | "A_PLUS" | "A" | "B_PLUS" | "B" | "C_PLUS" | "C" | "D_PLUS" | "D" | "F")
          : null,
        checkedAt: new Date(),
      },
    }),
    ...results.map((r) =>
      prisma.studentAnswer.updateMany({
        where: {
          submissionId,
          questionId: r.questionId,
        },
        data: {
          pointsEarned: r.pointsEarned,
          isCorrect: r.isCorrect,
        },
      })
    ),
  ]);

}
