"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Paper = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  _count: { questions: number };
  submissionId: string | null;
  score: number | null;
  letterGrade: string | null;
};

export function StudentPapersClient() {
  const [papers, setPapers] = useState<Paper[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/student/question-papers", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 403 ? "No teacher linked" : "Failed to load");
        return res.json();
      })
      .then((data: { questionPapers: Paper[] }) => {
        if (!cancelled) setPapers(data.questionPapers ?? []);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message ?? "Failed to load papers");
      });
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl text-foreground">My papers</h1>
        <Card className="border-l-4 border-l-amber border-border">
          <CardContent className="py-8 text-center text-muted-foreground">
            {error === "No teacher linked"
              ? "You are not associated with a teacher. Ask your teacher to add you by email."
              : error}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (papers === null) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-violet" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="opacity-0 animate-fade-in-up">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl text-foreground">Question papers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Click a paper to attempt it. You will get AI grading and a report card.
        </p>
      </div>

      {papers.length === 0 ? (
        <Card className="border-l-4 border-l-teal border-border opacity-0 animate-fade-in-up animate-delay-1">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">No papers from your teacher yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {papers.map((paper, i) => (
            <Card
              key={paper.id}
              className={`h-full transition-all duration-200 border-l-4 opacity-0 animate-fade-in-up ${paper.submissionId ? "border-l-teal" : "border-l-violet hover:bg-muted/50 hover:translate-y-[-2px]"}`}
              style={{ animationDelay: `${0.1 + i * 0.05}s` }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="line-clamp-1 text-base text-foreground">{paper.name}</CardTitle>
                {paper.description && (
                  <CardDescription className="line-clamp-2 text-xs">
                    {paper.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {paper._count.questions} question{paper._count.questions !== 1 ? "s" : ""}
                  {paper.submissionId != null && (
                    <span className="ml-1">· Attempted</span>
                  )}
                </p>
                <div className="mt-3 flex gap-2">
                  {paper.submissionId ? (
                    <Button size="sm" className="flex-1 bg-teal hover:bg-teal/90 text-white border-0" asChild>
                      <Link href={`/student/report/${paper.submissionId}`}>View report</Link>
                    </Button>
                  ) : (
                    <Button size="sm" className="w-full bg-violet hover:bg-violet/90 text-white border-0" asChild>
                      <Link href={`/student/papers/${paper.id}`}>Attempt</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
