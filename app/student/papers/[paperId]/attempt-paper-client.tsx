"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Question = {
  id: string;
  question: string;
  options: unknown;
  points: number;
  sortOrder: number;
};

type Paper = {
  id: string;
  name: string;
  description: string | null;
  questions: Question[];
};

export function AttemptPaperClient({ paperId }: { paperId: string }) {
  const router = useRouter();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/student/question-papers/${paperId}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load paper");
        return res.json();
      })
      .then((data: { paper: Paper; submissionId: string | null }) => {
        if (cancelled) return;
        if (data.submissionId) {
          router.replace(`/student/report/${data.submissionId}`);
          return;
        }
        setPaper(data.paper);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load paper");
      });
    return () => { cancelled = true; };
  }, [paperId, router]);

  function handleAnswerChange(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!paper || paper.questions.length === 0) return;
    const studentAnswers = paper.questions.map((q) => ({
      questionId: q.id,
      answer: answers[q.id]?.trim() ?? "",
    }));
    setSubmitting(true);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          paperId: paper.id,
          studentAnswers,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409 && data.submissionId) {
          toast.error("You have already attempted this paper.");
          router.replace(`/student/report/${data.submissionId}`);
          return;
        }
        toast.error(data.message ?? "Submission failed");
        return;
      }
      toast.success("Submitted! Generating your report card…");
      const submissionId = data.submission?.id;
      if (submissionId) router.push(`/student/report/${submissionId}`);
      else router.push("/student/papers");
    } catch {
      toast.error("Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild className="gap-2 -ml-2 text-violet hover:text-violet hover:bg-violet-muted">
          <Link href="/student/papers">
            <ArrowLeft className="size-4" />
            Back to papers
          </Link>
        </Button>
        <Card className="border-l-4 border-l-rose">
          <CardContent className="py-8 text-center text-muted-foreground">
            {error}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-violet" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" asChild className="gap-2 -ml-2 text-violet hover:text-violet hover:bg-violet-muted opacity-0 animate-fade-in-up">
        <Link href="/student/papers">
          <ArrowLeft className="size-4" />
          Back to papers
        </Link>
      </Button>

      <Card className="border-l-4 border-l-indigo opacity-0 animate-fade-in-up animate-delay-1">
        <CardHeader>
          <CardTitle className="text-foreground">{paper.name}</CardTitle>
          {paper.description && (
            <CardDescription>{paper.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {paper.questions.map((q, idx) => {
              const options = Array.isArray(q.options)
                ? (q.options as string[]).filter((o) => typeof o === "string")
                : null;
              const isMcq = options && options.length >= 2;
              return (
                <div key={q.id} className="space-y-2 border-b border-border pb-6 last:border-0 last:pb-0">
                  <Label className="text-base text-foreground">
                    Question {idx + 1} <span className="text-teal font-normal">({q.points} pt{q.points !== 1 ? "s" : ""})</span>
                    {isMcq && <span className="ml-1 text-xs text-muted-foreground">(MCQ)</span>}
                  </Label>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{q.question}</p>
                  {isMcq ? (
                    <div className="mt-2 space-y-2">
                      {options!.map((opt, i) => (
                        <label
                          key={i}
                          className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                            answers[q.id] === opt
                              ? "border-violet bg-violet/10"
                              : "border-border hover:border-violet/50"
                          }`}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            value={opt}
                            checked={answers[q.id] === opt}
                            onChange={() => handleAnswerChange(q.id, opt)}
                            disabled={submitting}
                            className="size-4 border-violet text-violet focus:ring-violet"
                          />
                          <span className="text-foreground">{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <Input
                      placeholder="Your answer"
                      value={answers[q.id] ?? ""}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      disabled={submitting}
                      className="mt-2 border-violet/30 focus-visible:ring-violet"
                    />
                  )}
                </div>
              );
            })}
            <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
              <Button type="submit" disabled={submitting} className="gap-2 bg-violet hover:bg-violet/90 text-white border-0">
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    Submit for grading
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
