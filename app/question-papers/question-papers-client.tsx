"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, FileText, ClipboardCheck, LayoutGrid } from "lucide-react";
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
  { label: "Overview", href: "/dashboard", icon: LayoutGrid },
  { label: "Papers Archive", href: "/question-papers", icon: FileText },
] as const;

export function QuestionPapersClient({
  initialPapers,
}: {
  initialPapers: QuestionPaper[];
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="container pt-24 pb-12 sm:pt-40 sm:pb-20 animate-slide-up grid-bg min-h-screen">
      <div className="flex flex-col md:flex-row gap-16">
        {/* Left sidebar - MODULES */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-8 border-b border-foreground/10 pb-2">
            System Modules
          </p>
          <nav className="flex flex-col gap-2">
            {MODULES.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-4 px-4 py-4 text-[10px] font-black uppercase tracking-widest transition-all border",
                    isActive
                      ? "bg-foreground text-background border-foreground"
                      : "text-muted-foreground border-transparent hover:border-foreground/20 hover:text-foreground"
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
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8 mb-16 border-l-4 border-foreground pl-6">
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-2">Archive / Central Registry</p>
              <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic">
                Question Papers
              </h1>
            </div>
            <Button
              onClick={() => setCreateOpen(true)}
              size="lg"
              className="shrink-0 gap-3"
            >
              <Plus className="size-4" />
              New Paper Unit
            </Button>
          </div>

          {initialPapers.length === 0 ? (
            <div className="border border-dashed border-foreground/20 bg-background p-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center border border-foreground/10 text-muted-foreground mb-6">
                <FileText className="size-8" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tighter italic text-foreground">Registry Empty</h3>
              <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Initialize your first question paper unit to begin the assessment cycle.
              </p>
              <Button
                onClick={() => setCreateOpen(true)}
                className="mt-10 gap-3"
                variant="outline"
              >
                <Plus className="size-4" />
                Initialize Unit
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {initialPapers.map((paper) => {
                const isReady = paper._count.questions > 0;
                const statusLabel = isReady ? "Operational" : "Draft Mode";
                return (
                  <Link
                    key={paper.id}
                    href={`/question-papers/${paper.id}`}
                    className="flex flex-col sm:flex-row sm:items-center gap-6 border border-foreground/10 bg-background p-6 transition-all hover:border-foreground group"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-foreground/10 text-muted-foreground group-hover:bg-foreground group-hover:text-background transition-colors">
                      <FileText className="size-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-black uppercase tracking-tighter italic text-foreground truncate mb-1">
                        {paper.name}
                      </h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {paper._count.questions} questions
                        {paper._count.submissions > 0 &&
                          ` / ${paper._count.submissions} submissions`}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-3">
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 border",
                        isReady 
                          ? "border-foreground text-foreground" 
                          : "border-muted-foreground/30 text-muted-foreground"
                      )}>
                        {statusLabel}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <CreatePaperDialog open={createOpen} onOpenChange={setCreateOpen} />
        </main>
      </div>
    </div>
  );
}

