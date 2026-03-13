"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
      <div className="container pt-24 sm:pt-40 grid-bg min-h-screen">
        <div className="max-w-2xl border-l-4 border-foreground pl-6">
           <p className="text-[10px] font-black text-muted-foreground tracking-[0.3em] mb-2">Error / Request Failure</p>
           <h1 className="text-4xl font-black tracking-tighter text-foreground italic mb-6">Unit Load Error</h1>
           <p className="text-xs font-bold tracking-widest text-muted-foreground">{error}</p>
           <Button variant="outline" asChild className="mt-10">
              <Link href="/student/papers">Return to Index</Link>
           </Button>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="container flex min-h-screen flex-col items-center justify-start pt-24 sm:pt-40 grid-bg">
        <div className="flex flex-col items-center gap-4">
           <Loader2 className="size-8 animate-spin text-foreground" />
           <span className="text-[10px] font-black tracking-[0.4em]">Initializing Unit...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container pt-24 pb-12 sm:pt-40 sm:pb-20 animate-slide-up grid-bg min-h-screen">
      <div className="mx-auto max-w-3xl space-y-16">
        <Link href="/student/papers" className="inline-flex items-center gap-2 text-[10px] font-black tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-3" />
          Abort Session / Return
        </Link>

        <div className="border-l-4 border-foreground pl-6">
          <p className="text-[10px] font-black text-muted-foreground tracking-[0.3em] mb-2">Active Assessment / Session ID: {paper.id.slice(0,8)}</p>
          <h1 className="text-4xl font-black tracking-tighter text-foreground italic mb-2">{paper.name}</h1>
          {paper.description && (
            <p className="text-[11px] font-bold tracking-widest text-muted-foreground leading-relaxed max-w-xl">{paper.description}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-12 pb-20">
          {paper.questions.map((q, idx) => {
            const options = Array.isArray(q.options)
              ? (q.options as string[]).filter((o) => typeof o === "string")
              : null;
            const isMcq = options && options.length >= 2;
            return (
              <div key={q.id} className="group border border-foreground/10 bg-background p-8 hover:border-foreground/30 transition-all">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <span className="text-[10px] font-black tracking-tighter bg-foreground text-background px-2 py-0.5">
                    Unit {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] font-black tracking-widest text-muted-foreground">
                    Value: {q.points} PTS / {isMcq ? "TYPE: SELECT" : "TYPE: OPEN"}
                  </span>
                </div>
                
                <p className="text-sm font-bold tracking-wide text-foreground leading-relaxed mb-8">{q.question}</p>
                
                {isMcq ? (
                  <div className="grid grid-cols-1 gap-3">
                    {options!.map((opt, i) => (
                      <label
                        key={i}
                        className={cn(
                          "flex cursor-pointer items-center gap-4 border p-4 text-[11px] font-bold tracking-widest transition-all",
                          answers[q.id] === opt
                            ? "border-foreground bg-foreground text-background"
                            : "border-foreground/10 hover:border-foreground/30 text-foreground"
                        )}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={opt}
                          checked={answers[q.id] === opt}
                          onChange={() => handleAnswerChange(q.id, opt)}
                          disabled={submitting}
                          className="hidden"
                        />
                        <span className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center border",
                          answers[q.id] === opt ? "border-background" : "border-foreground/20"
                        )}>
                           {answers[q.id] === opt && <div className="h-2 w-2 bg-background" />}
                        </span>
                        {opt}
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor={`q-${q.id}`}>Input Answer</Label>
                    <Input
                      id={`q-${q.id}`}
                      placeholder="ENTER TEXT..."
                      value={answers[q.id] ?? ""}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      disabled={submitting}
                      className="h-14"
                    />
                  </div>
                )}
              </div>
            );
          })}
          
          <div className="flex justify-end pt-8 border-t border-foreground/10">
            <Button type="submit" disabled={submitting} size="lg" className="h-16 px-12 gap-4">
              {submitting ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Processing Submission…
                </>
              ) : (
                <>
                  <Send className="size-5" />
                  Terminate / Submit for Evaluation
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

