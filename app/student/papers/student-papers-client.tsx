"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, FileText, ArrowRight, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
      <div className="container pt-24 sm:pt-40 grid-bg min-h-screen">
        <div className="max-w-2xl border-l-4 border-foreground pl-6">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-2">Error / System Access Denied</p>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic mb-6">Access Blocked</h1>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground leading-relaxed">
            {error === "No teacher linked"
              ? "Session not associated with instructor registry. Verification required."
              : error}
          </p>
        </div>
      </div>
    );
  }

  if (papers === null) {
    return (
      <div className="container flex min-h-screen flex-col items-center justify-start pt-24 sm:pt-40 grid-bg">
        <div className="flex flex-col items-center gap-4">
           <Loader2 className="size-8 animate-spin text-foreground" />
           <span className="text-[10px] font-black uppercase tracking-[0.4em]">Syncing Registry...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container pt-24 pb-12 sm:pt-40 sm:pb-20 animate-slide-up grid-bg min-h-screen">
      <div className="mb-16 border-l-4 border-foreground pl-6">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-2">
          Assessment Portal / Student Interface
        </p>
        <h1 className="text-5xl font-black tracking-tighter text-foreground uppercase italic">
          Question Papers
        </h1>
        <p className="mt-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground max-w-xl leading-relaxed">
          Select a pending assessment unit to initialize evaluation. AI grading will be executed upon submission.
        </p>
      </div>

      {papers.length === 0 ? (
        <div className="border border-dashed border-foreground/20 p-16 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
            No active assessment units assigned.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {papers.map((paper, i) => (
            <div
              key={paper.id}
              className={cn(
                "group relative flex flex-col border p-8 transition-all h-full",
                paper.submissionId 
                  ? "border-foreground/10 bg-background/50" 
                  : "border-foreground/20 bg-background hover:border-foreground"
              )}
            >
              <div className="flex justify-between items-start mb-6">
                 <div className="h-10 w-10 border border-foreground/10 flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors">
                    <FileText className="size-5" />
                 </div>
                 {paper.submissionId && (
                   <span className="text-[8px] font-black uppercase tracking-widest bg-foreground text-background px-2 py-0.5">Evaluated</span>
                 )}
              </div>
              
              <h3 className="text-lg font-black uppercase tracking-tighter italic text-foreground mb-2 line-clamp-1">
                {paper.name}
              </h3>
              {paper.description && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground line-clamp-2 leading-relaxed mb-6">
                  {paper.description}
                </p>
              )}
              
              <div className="mt-auto pt-6 border-t border-foreground/5">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-4">
                  Capacity: {paper._count.questions} Units
                </p>
                <div className="flex gap-2">
                  {paper.submissionId ? (
                    <Button variant="outline" size="sm" className="w-full h-10" asChild>
                      <Link href={`/student/report/${paper.submissionId}`}>
                        Analyze Report
                        <ClipboardCheck className="ml-2 size-3" />
                      </Link>
                    </Button>
                  ) : (
                    <Button size="sm" className="w-full h-10" asChild>
                      <Link href={`/student/papers/${paper.id}`}>
                        Initialize Attempt
                        <ArrowRight className="ml-2 size-3" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

