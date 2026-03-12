"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Award, Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Question = {
  id: string;
  question: string;
  points: number;
  sortOrder: number;
};

type StudentAnswer = {
  id: string;
  questionId: string;
  answer: string;
  pointsEarned: number | null;
  isCorrect: boolean;
  question: Question;
};

type Submission = {
  id: string;
  score: number | null;
  aiScore: number | null;
  letterGrade: string | null;
  checkedAt: string | null;
  questionPaper: { id: string; name: string };
  studentAnswers: StudentAnswer[];
};

type BackLink = { href: string; label: string };

export function ReportCardClient({
  submissionId,
  backLink = { href: "/student/papers", label: "Back to papers" },
}: {
  submissionId: string;
  backLink?: BackLink;
}) {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/submissions/${submissionId}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load report");
        return res.json();
      })
      .then((data: { submission: Submission }) => {
        if (!cancelled) setSubmission(data.submission);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load report");
      });
    return () => { cancelled = true; };
  }, [submissionId]);

  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild className="gap-2 -ml-2 text-violet hover:text-violet hover:bg-violet-muted">
          <Link href={backLink.href}>
            <ArrowLeft className="size-4" />
            {backLink.label}
          </Link>
        </Button>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {error}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalMax = submission.studentAnswers.reduce(
    (sum, a) => sum + (a.question?.points ?? 0),
    0
  );
  const totalEarned = submission.studentAnswers.reduce(
    (sum, a) => sum + (a.pointsEarned ?? 0),
    0
  );
  const percentage =
    totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" asChild className="gap-2 -ml-2 text-violet hover:text-violet hover:bg-violet-muted opacity-0 animate-fade-in-up">
        <Link href={backLink.href}>
          <ArrowLeft className="size-4" />
          {backLink.label}
        </Link>
      </Button>

      <Card className="overflow-hidden print:shadow-none border-l-4 border-l-violet opacity-0 animate-fade-in-up animate-delay-1">
        <CardHeader className="border-b border-border bg-violet-muted/50 print:bg-transparent">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center bg-violet text-white">
              <Award className="size-6" />
            </div>
            <div>
              <CardTitle className="text-xl text-foreground">Report card</CardTitle>
              <CardDescription>{submission.questionPaper.name}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-3 sm:gap-4">
            <div className="border border-border bg-teal-muted p-4 text-center border-t-4 border-t-teal">
              <p className="text-2xl font-bold text-teal">{totalEarned} / {totalMax}</p>
              <p className="text-xs text-muted-foreground">Score</p>
            </div>
            <div className="border border-border bg-violet-muted p-4 text-center border-t-4 border-t-violet">
              <p className="text-2xl font-bold text-violet">{percentage}%</p>
              <p className="text-xs text-muted-foreground">Percentage</p>
            </div>
            <div className="border border-border bg-amber-muted p-4 text-center border-t-4 border-t-amber">
              <p className="text-2xl font-bold text-amber">
                {submission.letterGrade?.replace("_", " ") ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">Grade</p>
            </div>
          </div>

          <h3 className="mt-8 text-sm font-semibold text-foreground">Question breakdown</h3>
          <ul className="mt-3 space-y-3">
            {submission.studentAnswers
              .slice()
              .sort(
                (a, b) =>
                  (a.question?.sortOrder ?? 0) - (b.question?.sortOrder ?? 0)
              )
              .map((sa) => (
                <li
                  key={sa.id}
                  className={`flex items-start gap-3 border p-3 border-l-4 ${sa.isCorrect ? "border-l-teal bg-teal-muted/30" : "border-l-rose bg-rose-muted/20"}`}
                >
                  <span className="mt-0.5 shrink-0">
                    {sa.isCorrect ? (
                      <Check className="size-5 text-teal" />
                    ) : (
                      <X className="size-5 text-rose" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium line-clamp-2 text-foreground">
                      {sa.question?.question}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Your answer: {sa.answer || "(blank)"}
                    </p>
                    <p className="mt-1 text-xs">
                      <span className="font-medium">
                        {sa.pointsEarned ?? 0} / {sa.question?.points ?? 0}
                      </span>{" "}
                      points
                    </p>
                  </div>
                </li>
              ))}
          </ul>

          {submission.checkedAt && (
            <p className="mt-6 text-right text-xs text-muted-foreground">
              Graded on {new Date(submission.checkedAt).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3 print:hidden">
        <Button asChild className="bg-violet hover:bg-violet/90 text-white border-0">
          <Link href={backLink.href}>{backLink.label}</Link>
        </Button>
        <Button variant="outline" onClick={() => window.print()} className="border-teal text-teal hover:bg-teal-muted">
          Print report
        </Button>
      </div>
    </div>
  );
}
