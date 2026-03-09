"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ListOrdered,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreateQuestionDialog } from "@/components/create-question-dialog";
import { EditQuestionDialog } from "@/components/edit-question-dialog";
import { toast } from "sonner";

type Question = {
  id: string;
  question: string;
  options: unknown;
  answer: string | null;
  points: number;
  sortOrder: number;
};

type Paper = {
  id: string;
  name: string;
  description: string | null;
  questions: Question[];
};

export default function PaperDetailPage() {
  const params = useParams();
  const router = useRouter();
  const paperId = params.paperId as string;
  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [createQuestionOpen, setCreateQuestionOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  function fetchPaper() {
    fetch(`/api/question-papers/${paperId}`, { credentials: "include" })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          router.push("/auth/login");
          return null;
        }
        if (res.status === 404) {
          router.push("/question-papers");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          const p = data.questionPaper ?? data;
          setPaper(p);
          setEditName(p.name ?? "");
          setEditDesc(p.description ?? "");
        }
      })
      .catch(() => toast.error("Failed to load paper"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!paperId) return;
    fetchPaper();
  }, [paperId]);

  function handleUpdatePaper(e: React.FormEvent) {
    e.preventDefault();
    setEditSaving(true);
    fetch(`/api/question-papers/${paperId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: editName.trim(),
        description: editDesc.trim() || null,
      }),
    })
      .then((res) => {
        if (!res.ok) return res.json().then((d) => Promise.reject(d));
        setEditOpen(false);
        setPaper((prev) =>
          prev
            ? {
                ...prev,
                name: editName.trim(),
                description: editDesc.trim() || null,
              }
            : null
        );
        toast.success("Paper updated");
      })
      .catch((d) => toast.error(d?.message ?? "Update failed"))
      .finally(() => setEditSaving(false));
  }

  function handleDeletePaper() {
    setDeleteLoading(true);
    fetch(`/api/question-papers/${paperId}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) return res.json().then((d) => Promise.reject(d));
        toast.success("Paper deleted");
        router.push("/question-papers");
      })
      .catch((d) => toast.error(d?.message ?? "Delete failed"))
      .finally(() => {
        setDeleteLoading(false);
        setDeleteConfirmOpen(false);
      });
  }

  if (loading || !paper) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-wrap items-center gap-4">
          <Skeleton className="size-9 shrink-0" />
          <div className="min-w-0 space-y-2">
            <Skeleton className="h-7 w-48 sm:h-8 sm:w-64" />
            <Skeleton className="h-4 w-36 sm:w-48" />
          </div>
        </div>
        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const questions = paper.questions ?? [];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-wrap items-start gap-3 sm:items-center sm:gap-4">
        <Button variant="ghost" size="icon" className="shrink-0" asChild>
          <Link href="/question-papers">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="break-words text-xl font-bold tracking-tight sm:text-2xl">
            {paper.name}
          </h1>
          {paper.description && (
            <p className="mt-1 break-words text-sm text-muted-foreground sm:text-base">
              {paper.description}
            </p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0">
              <Pencil className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              Edit paper
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setDeleteConfirmOpen(true)}
            >
              Delete paper
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2">
              <ListOrdered className="size-5 shrink-0" />
              Questions
            </CardTitle>
            <CardDescription>
              {questions.length} question{questions.length !== 1 ? "s" : ""} in
              this paper.
            </CardDescription>
          </div>
          <Button
            onClick={() => setCreateQuestionOpen(true)}
            className="w-full shrink-0 gap-2 sm:w-auto"
          >
            <Plus className="size-4" />
            Add question
          </Button>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground sm:text-base">
              No questions yet. Add one to get started.
            </p>
          ) : (
            <ul className="space-y-3">
              {questions.map((q, i) => (
                <li
                  key={q.id}
                  className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:p-4"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      Q{i + 1}.
                    </span>
                    <p className="mt-1 break-words text-sm sm:text-base">
                      {q.question}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                      {q.points} pt{q.points !== 1 ? "s" : ""}
                      {q.answer && ` · Answer: ${q.answer}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2 sm:flex-row">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingQuestion(q)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={async () => {
                        if (!confirm("Delete this question?")) return;
                        const res = await fetch(
                          `/api/question-papers/${paperId}/questions/${q.id}`,
                          { method: "DELETE", credentials: "include" }
                        );
                        if (!res.ok) {
                          toast.error("Failed to delete");
                          return;
                        }
                        toast.success("Question deleted");
                        fetchPaper();
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit paper</DialogTitle>
            <DialogDescription>
              Change name and description.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdatePaper}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-desc">Description (optional)</Label>
                <Input
                  id="edit-desc"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={editSaving}>
                {editSaving ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete paper</DialogTitle>
            <DialogDescription>
              This will permanently delete &quot;{paper.name}&quot; and all its
              questions. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePaper}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreateQuestionDialog
        paperId={paperId}
        open={createQuestionOpen}
        onOpenChange={setCreateQuestionOpen}
        onCreated={() => {
          setCreateQuestionOpen(false);
          fetchPaper();
        }}
      />

      {editingQuestion && (
        <EditQuestionDialog
          paperId={paperId}
          question={editingQuestion}
          open={!!editingQuestion}
          onOpenChange={(open) => !open && setEditingQuestion(null)}
          onSaved={() => {
            setEditingQuestion(null);
            fetchPaper();
          }}
        />
      )}
    </div>
  );
}
