"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Link from "next/link";
import { FileQuestion, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Question papers
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Create and manage your question papers.
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="w-full shrink-0 gap-2 sm:w-auto"
        >
          <Plus className="size-4" />
          New paper
        </Button>
      </div>

      {initialPapers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
            <FileQuestion className="size-12 text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground sm:text-base">
              No papers yet.
            </p>
            <Button onClick={() => setCreateOpen(true)} className="mt-4">
              Create your first paper
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {initialPapers.map((paper) => (
            <Link
              key={paper.id}
              href={`/question-papers/${paper.id}`}
              className="block min-w-0"
            >
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader className="pb-2">
                  <CardTitle className="line-clamp-1">{paper.name}</CardTitle>
                  {paper.description && (
                    <CardDescription className="line-clamp-2">
                      {paper.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span>{paper._count.questions} questions</span>
                    <span>{paper._count.submissions} submissions</span>
                  </div>
                </CardContent>
              </Card>
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
