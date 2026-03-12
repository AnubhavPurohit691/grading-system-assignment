"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Loader2, FileCheck, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Submission = {
  id: string;
  score: number | null;
  letterGrade: string | null;
  submittedAt: string;
  student: { id: string; user: { username: string; email: string } };
};

function formatLetterGrade(grade: string | null): string {
  if (!grade) return "";
  return grade.replace("_PLUS", "+").replace("_", " ");
}

function formatRelativeTime(iso: string): string {
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  } catch {
    return "";
  }
}

function getGradeColor(letterGrade: string | null): string {
  if (!letterGrade) return "bg-muted text-muted-foreground";
  const g = letterGrade.replace("_PLUS", "+").toUpperCase();
  if (g.startsWith("A")) return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
  if (g.startsWith("B")) return "bg-blue-500/15 text-blue-700 dark:text-blue-400";
  if (g.startsWith("C")) return "bg-amber-500/15 text-amber-700 dark:text-amber-400";
  if (g.startsWith("D")) return "bg-orange-500/15 text-orange-700 dark:text-orange-400";
  return "bg-red-500/15 text-red-700 dark:text-red-400";
}

export function PaperStudentSection({ paperId }: { paperId: string }) {
  const [submissions, setSubmissions] = useState<Submission[] | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    setError(false);
    fetch(`/api/submissions?questionPaperId=${encodeURIComponent(paperId)}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data: { submissions: Submission[] }) => {
        if (!cancelled) setSubmissions(data.submissions ?? []);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => { cancelled = true; };
  }, [paperId]);

  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Users className="size-5 shrink-0" />
          Students
          {submissions != null && submissions.length > 0 && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {submissions.length} attempted
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Students who attempted this paper. Open a report card to view score and feedback.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <p className="rounded-lg border border-border bg-muted/30 px-3 py-3 text-sm text-muted-foreground">
            Could not load. Refresh the page to try again.
          </p>
        )}

        {submissions === null && !error && (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-4 py-6">
            <Loader2 className="size-5 shrink-0 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading…</span>
          </div>
        )}

        {submissions?.length === 0 && !error && (
          <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-10 text-center">
            <FileCheck className="mx-auto size-10 text-muted-foreground/60" />
            <p className="mt-3 text-sm font-medium text-foreground">No attempts yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Report cards will appear here once students submit.
            </p>
          </div>
        )}

        {submissions && submissions.length > 0 && (
          <ul className="space-y-2">
            {submissions.map((sub) => {
              const hasScore = sub.score != null;
              const gradeStr = formatLetterGrade(sub.letterGrade);
              return (
                <li key={sub.id}>
                  <Link
                    href={`/question-papers/${paperId}/submissions/${sub.id}`}
                    className={cn(
                      "group flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3",
                      "transition-colors hover:border-primary/30 hover:bg-muted/40"
                    )}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-foreground">
                      {sub.student.user.username.charAt(0).toUpperCase() || "?"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{sub.student.user.username}</p>
                      <p className="text-xs text-muted-foreground truncate">{sub.student.user.email}</p>
                      <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                        {hasScore ? (
                          <>
                            <span className="text-sm text-muted-foreground">Score: {sub.score}</span>
                            {gradeStr && (
                              <span
                                className={cn(
                                  "rounded px-2 py-0.5 text-xs font-medium",
                                  getGradeColor(sub.letterGrade)
                                )}
                              >
                                {gradeStr}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground">Grading…</span>
                        )}
                        {sub.submittedAt && (
                          <span className="text-xs text-muted-foreground">
                            · {formatRelativeTime(sub.submittedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
