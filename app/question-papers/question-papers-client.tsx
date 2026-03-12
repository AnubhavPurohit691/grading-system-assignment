"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Link from "next/link";
import { Plus, LayoutDashboard, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const CreatePaperDialog = dynamic(
  () =>
    import("@/components/create-paper-dialog").then((m) => ({
      default: m.CreatePaperDialog,
    })),
  { ssr: false }
);

type QuestionPaper = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  _count: { questions: number; submissions: number };
};

export function QuestionPapersClient({
  initialPapers,
}: {
  initialPapers: QuestionPaper[];
}) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between opacity-0 animate-fade-in-up mt-8">
        <div className="min-w-0 max-w-2xl">
          <div className="inline-flex items-center border border-border bg-muted/50 px-3 py-1 text-xs font-semibold text-foreground mb-4 rounded-none">
            <LayoutDashboard className="mr-2 size-3" /> Question papers
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            Question Papers
          </h1>
          <p className="mt-2 text-base text-muted-foreground sm:text-lg">
            Create, manage and distribute your intelligent assessments.
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          size="lg"
          className="w-full shrink-0 gap-2 sm:w-auto rounded-none bg-foreground text-background hover:bg-foreground/90 transition-all shadow-none"
        >
          <Plus className="size-5" />
          Create New Paper
        </Button>
      </div>

      {initialPapers.length === 0 ? (
        <div className="group relative overflow-hidden rounded-none border border-border bg-card p-1 text-center opacity-0 animate-fade-in-up animate-delay-1 hover:shadow-xl transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-blue-500/10 animate-gradient-xy opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 bg-background p-11 border border-background">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-none bg-muted text-foreground mb-6 transition-colors group-hover:bg-cyan-500/10 group-hover:text-cyan-500">
              <FileText className="size-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground">No papers active</h3>
            <p className="mt-2 text-muted-foreground max-w-sm mx-auto">
              You haven't created any assessments yet. Get started by creating your first intelligent question paper.
            </p>
            <div className="relative group/btn inline-flex mt-8 w-full sm:w-auto">
              <div className="absolute -inset-[2px] bg-gradient-to-r from-cyan-500 via-purple-500 to-fuchsia-500 animate-gradient-xy opacity-70 group-hover/btn:opacity-100 transition-opacity blur-sm" />
              <Button onClick={() => setCreateOpen(true)} className="relative w-full rounded-none px-8 gap-2 bg-background text-foreground hover:bg-background transition-transform group-hover/btn:scale-[1.02] shadow-none border border-border/50">
                <Plus className="size-4 text-cyan-500" /> 
                <span className="bg-gradient-to-r from-cyan-600 to-fuchsia-600 dark:from-cyan-400 dark:to-fuchsia-400 bg-clip-text text-transparent animate-gradient-text font-bold">Initialize First Paper</span>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {initialPapers.map((paper, i) => (
             <Link
              key={paper.id}
              href={`/question-papers/${paper.id}`}
              className="block min-w-0 opacity-0 animate-fade-in-up outline-none group"
              style={{ animationDelay: `${0.1 + i * 0.05}s` }}
            >
              <div className="relative h-full overflow-hidden rounded-none border border-border bg-card p-1 transition-all duration-300 hover:shadow-xl flex flex-col justify-between">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-blue-500/20 animate-gradient-xy opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex flex-col justify-between h-full bg-background p-5 border border-background">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-none bg-muted text-cyan-500/80 group-hover:bg-cyan-500/10 group-hover:text-cyan-500 transition-colors">
                        <FileText className="size-5" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-foreground line-clamp-1 mb-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{paper.name}</h3>
                    {paper.description ? (
                      <p className="text-sm text-muted-foreground line-clamp-2">{paper.description}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground/50 italic">No description provided</p>
                    )}
                  </div>

                  <div className="relative z-10 mt-6 flex items-center justify-between border-t border-border pt-4">
                    <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <span className="flex h-5 items-center justify-center bg-muted px-1.5 font-mono text-[10px] text-foreground border border-border rounded-none">
                          {paper._count.questions}
                        </span>
                        Q's
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="flex h-5 items-center justify-center bg-muted px-1.5 font-mono text-[10px] text-foreground border border-border rounded-none">
                          {paper._count.submissions}
                        </span>
                        Submissions
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <CreatePaperDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  );
}
