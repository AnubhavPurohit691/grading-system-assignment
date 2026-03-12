"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Award, Check, Loader2, X, Printer, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  backLink = { href: "/student/papers", label: "Return to Assessment Portal" },
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
      <div className="container pt-24 sm:pt-40 grid-bg min-h-screen">
        <div className="max-w-2xl border-l-4 border-foreground pl-6">
           <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-2">Error / Retrieval Failure</p>
           <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic mb-6">Report Not Found</h1>
           <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{error}</p>
           <Button variant="outline" asChild className="mt-10">
              <Link href={backLink.href}>{backLink.label}</Link>
           </Button>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="container flex min-h-screen flex-col items-center justify-start pt-24 sm:pt-40 grid-bg">
        <div className="flex flex-col items-center gap-4">
           <Loader2 className="size-8 animate-spin text-foreground" />
           <span className="text-[10px] font-black uppercase tracking-[0.4em]">Generating Evaluation...</span>
        </div>
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
    <div className="container pt-24 pb-12 sm:pt-40 sm:pb-20 animate-slide-up grid-bg min-h-screen">
      <div className="mx-auto max-w-4xl space-y-16">
        <Link href={backLink.href} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-3" />
          {backLink.label}
        </Link>

        {/* Header Unit */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-l-4 border-foreground pl-6">
          <div className="flex flex-col gap-4">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-2">Evaluation Report / Record ID: {submission.id.slice(0,8)}</p>
            <h1 className="text-5xl font-black tracking-tighter text-foreground uppercase italic leading-none">{submission.questionPaper.name}</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Processing Date: {submission.checkedAt ? new Date(submission.checkedAt).toLocaleString().toUpperCase() : "PENDING"}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2 h-10 px-6">
            <Printer className="size-4" />
            Export Record
          </Button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-foreground/10 border border-foreground/10">
          <div className="bg-background p-10 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-4">Final Score</p>
            <p className="text-4xl font-black text-foreground">{totalEarned} / {totalMax}</p>
          </div>
          <div className="bg-background p-10 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-4">Precision</p>
            <p className="text-4xl font-black text-foreground">{percentage}%</p>
          </div>
          <div className="bg-background p-10 text-center border-t sm:border-t-0 sm:border-l border-foreground/10">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-4">Grade Tier</p>
            <p className="text-4xl font-black text-foreground italic">{submission.letterGrade?.replace("_", " ") ?? "—"}</p>
          </div>
        </div>

        {/* Question Breakdown */}
        <div className="space-y-10">
          <div className="flex items-center gap-4">
             <div className="h-10 w-1 border-l-4 border-foreground" />
             <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter italic text-foreground">Performance Breakdown</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Unit-by-Unit Analysis</p>
             </div>
          </div>

          <div className="grid gap-4">
            {submission.studentAnswers
              .slice()
              .sort(
                (a, b) =>
                  (a.question?.sortOrder ?? 0) - (b.question?.sortOrder ?? 0)
              )
              .map((sa, idx) => (
                <div
                  key={sa.id}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-start justify-between gap-6 border p-8 transition-all",
                    sa.isCorrect ? "border-foreground/10 bg-background" : "border-destructive/20 bg-destructive/[0.02]"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[10px] font-black uppercase tracking-tighter bg-foreground text-background px-2 py-0.5">
                        Unit {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest",
                        sa.isCorrect ? "text-muted-foreground" : "text-destructive"
                      )}>
                        Result: {sa.isCorrect ? "PASSED" : "FAILED"} / Earned: {sa.pointsEarned ?? 0} PTS
                      </span>
                    </div>
                    <p className="text-sm font-bold uppercase tracking-wide text-foreground leading-relaxed mb-6">
                      {sa.question?.question}
                    </p>
                    <div className="space-y-3">
                       <div className="flex items-start gap-2">
                          <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mt-0.5">Input Data:</span>
                          <p className="text-[10px] font-medium uppercase text-foreground italic">{sa.answer || "NULL_DATA"}</p>
                       </div>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center justify-center h-10 w-10 border border-foreground/10">
                     {sa.isCorrect ? <Check className="size-5" /> : <X className="size-5 text-destructive" />}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

