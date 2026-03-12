"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Submission = {
  id: string;
  score: number | null;
  letterGrade: string | null;
  submittedAt: string;
  student: { id: string; user: { username: string; email: string } };
};

export function PaperSubmissionsList({ paperId }: { paperId: string }) {
  const [submissions, setSubmissions] = useState<Submission[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/submissions?questionPaperId=${encodeURIComponent(paperId)}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load submissions");
        return res.json();
      })
      .then((data: { submissions: Submission[] }) => {
        if (!cancelled) setSubmissions(data.submissions ?? []);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load submissions");
      });
    return () => { cancelled = true; };
  }, [paperId]);

  if (error) {
    return (
      <Card className="border-l-4 border-l-amber">
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          {error}
        </CardContent>
      </Card>
    );
  }

  if (submissions === null) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-violet">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="size-4" />
          Attempted students
        </CardTitle>
        <CardDescription>
          {submissions.length} student{submissions.length !== 1 ? "s" : ""} attempted this paper. View their report cards below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {submissions.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No attempts yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {submissions.map((sub) => (
              <li
                key={sub.id}
                className="flex flex-wrap items-center justify-between gap-2 border border-border py-2 px-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">{sub.student.user.username}</p>
                  <p className="text-xs text-muted-foreground truncate">{sub.student.user.email}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {sub.score != null && (
                    <span className="text-sm text-muted-foreground">
                      Score: {sub.score}
                      {sub.letterGrade != null && (
                        <span className="ml-1">· {sub.letterGrade.replace("_", " ")}</span>
                      )}
                    </span>
                  )}
                  <Button size="sm" variant="secondary" className="gap-1" asChild>
                    <Link href={`/question-papers/${paperId}/submissions/${sub.id}`}>
                      <Award className="size-3.5" />
                      View report
                    </Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
