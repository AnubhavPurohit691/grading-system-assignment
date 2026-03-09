"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileQuestion, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CreatePaperDialog } from "@/components/create-paper-dialog";
import { toast } from "sonner";

type QuestionPaper = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  _count: { questions: number; submissions: number };
};

export default function QuestionPapersPage() {
  const router = useRouter();
  const [papers, setPapers] = useState<QuestionPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/question-papers", { credentials: "include" })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          router.push("/auth/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!cancelled && data?.questionPapers) setPapers(data.questionPapers);
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load papers");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  function onCreated() {
    setCreateOpen(false);
    fetch("/api/question-papers", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => data.questionPapers && setPapers(data.questionPapers))
      .catch(() => {});
  }

  if (loading) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-[75%]" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

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

      {papers.length === 0 ? (
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
          {papers.map((paper) => (
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
        onCreated={onCreated}
      />
    </div>
  );
}
