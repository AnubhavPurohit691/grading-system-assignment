"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, FileText, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

const MODULES = [
  { label: "Question Papers", href: "/question-papers", icon: FileText },
  { label: "Grading", href: "/dashboard", icon: ClipboardCheck },
] as const;

export function QuestionPapersClient({
  initialPapers,
}: {
  initialPapers: QuestionPaper[];
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex gap-8 min-h-[calc(100vh-8rem)]">
      {/* Left sidebar - MODULES */}
      <aside className="w-52 shrink-0 flex flex-col">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Modules
        </p>
        <nav className="flex flex-col gap-0.5">
          {MODULES.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <item.icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Question Papers
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create and manage your assessments.
            </p>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            size="default"
            className="shrink-0 gap-2 bg-foreground text-background hover:bg-foreground/90"
          >
            <Plus className="size-4" />
            New Paper
          </Button>
        </div>

        {initialPapers.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground mb-4">
              <FileText className="size-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No papers yet</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
              Create your first question paper to get started.
            </p>
            <Button
              onClick={() => setCreateOpen(true)}
              className="mt-6 gap-2"
              variant="outline"
            >
              <Plus className="size-4" />
              New Paper
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {initialPapers.map((paper) => {
              const isReady = paper._count.questions > 0;
              const statusLabel = isReady ? "Ready" : "Draft";
              return (
                <Link
                  key={paper.id}
                  href={`/question-papers/${paper.id}`}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/30"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <FileText className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground truncate">
                      {paper.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {paper._count.questions} question{paper._count.questions !== 1 ? "s" : ""}
                      {paper._count.submissions > 0 &&
                        ` · ${paper._count.submissions} submission${paper._count.submissions !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5">
                    {isReady ? (
                      <>
                        <span className="size-2 rounded-full bg-emerald-500" aria-hidden />
                        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          {statusLabel}
                        </span>
                      </>
                    ) : (
                      <span className="rounded-md border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        {statusLabel}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <CreatePaperDialog open={createOpen} onOpenChange={setCreateOpen} />
      </main>
    </div>
  );
}
