"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
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
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const CreateQuestionDialog = dynamic(
  () =>
    import("@/components/create-question-dialog").then((m) => ({
      default: m.CreateQuestionDialog,
    })),
  { ssr: false }
);

const EditQuestionDialog = dynamic(
  () =>
    import("@/components/edit-question-dialog").then((m) => ({
      default: m.EditQuestionDialog,
    })),
  { ssr: false }
);
import type { PaperDetailDTO } from "@/lib/types/papers";
import {
  updatePaperAction,
  deletePaperAction,
  deleteQuestionAction,
} from "@/lib/actions/papers";

export function PaperDetailClient({
  paperId,
  initialPaper,
}: {
  paperId: string;
  initialPaper: PaperDetailDTO;
}) {
  const router = useRouter();
  const paper = initialPaper;
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [createQuestionOpen, setCreateQuestionOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<PaperDetailDTO["questions"][number] | null>(null);

  async function handleDeletePaper() {
    setDeleteLoading(true);
    try {
      await deletePaperAction(paperId);
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleteLoading(false);
      setDeleteConfirmOpen(false);
    }
  }

  async function handleDeleteQuestion(questionId: string) {
    if (!confirm("Delete this question?")) return;
    try {
      await deleteQuestionAction(paperId, questionId);
      toast.success("Question deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete");
    }
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
                      onClick={() => handleDeleteQuestion(q.id)}
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

      <EditPaperDialog
        paperId={paperId}
        open={editOpen}
        onOpenChange={setEditOpen}
        initialName={paper.name}
        initialDesc={paper.description ?? ""}
      />

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
        onOpenChange={(open) => {
          setCreateQuestionOpen(open);
          if (!open) router.refresh();
        }}
      />

      {editingQuestion && (
        <EditQuestionDialog
          paperId={paperId}
          question={editingQuestion}
          open={!!editingQuestion}
          onOpenChange={(open) => {
            if (!open) {
              setEditingQuestion(null);
              router.refresh();
            }
          }}
        />
      )}
    </div>
  );
}

function EditPaperDialog({
  paperId,
  open,
  onOpenChange,
  initialName,
  initialDesc,
}: {
  paperId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialName: string;
  initialDesc: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDesc);
  const submittedRef = useRef(false);
  const [state, formAction, isPending] = useActionState(
    updatePaperAction.bind(null, paperId),
    {}
  );

  useEffect(() => {
    setName(initialName);
    setDescription(initialDesc);
  }, [initialName, initialDesc]);

  useEffect(() => {
    if (!isPending && submittedRef.current) {
      submittedRef.current = false;
      if (state?.error) {
        toast.error(state.error);
      } else {
        toast.success("Paper updated");
        onOpenChange(false);
        router.refresh();
      }
    }
  }, [isPending, state, onOpenChange, router]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit paper</DialogTitle>
          <DialogDescription>
            Change name and description.
          </DialogDescription>
        </DialogHeader>
        <form
          action={formAction}
          onSubmit={() => {
            submittedRef.current = true;
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Description (optional)</Label>
              <Input
                id="edit-desc"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
