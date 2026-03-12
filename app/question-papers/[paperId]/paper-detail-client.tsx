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
  Sparkles,
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
import { PaperSubmissionsList } from "@/components/paper-submissions-list";

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
  const [generateOpen, setGenerateOpen] = useState(false);
  const [generateTopic, setGenerateTopic] = useState("");
  const [generateMcqCount, setGenerateMcqCount] = useState(2);
  const [generateLongCount, setGenerateLongCount] = useState(2);
  const [generateLoading, setGenerateLoading] = useState(false);
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

  async function handleGenerateQuestions() {
    const topic = generateTopic.trim();
    if (!topic) {
      toast.error("Enter a topic");
      return;
    }
    const mcqCount = Math.max(0, Math.min(20, generateMcqCount));
    const longCount = Math.max(0, Math.min(20, generateLongCount));
    if (mcqCount + longCount < 1) {
      toast.error("Add at least 1 MCQ or 1 long question");
      return;
    }
    setGenerateLoading(true);
    try {
      const res = await fetch(`/api/question-papers/${paperId}/generate-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ topic, mcqCount, longCount }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message ?? "Generation failed");
        return;
      }
      toast.success(`Added ${data.count ?? 0} questions`);
      setGenerateOpen(false);
      setGenerateTopic("");
      setGenerateMcqCount(2);
      setGenerateLongCount(2);
      router.refresh();
    } catch {
      toast.error("Request failed");
    } finally {
      setGenerateLoading(false);
    }
  }

  const questions = paper.questions ?? [];

  return (
    <div className="space-y-6 sm:space-y-8 relative">
      <div className="flex flex-wrap items-start gap-3 sm:items-center sm:gap-4">
        <Button variant="ghost" size="icon" className="shrink-0" asChild>
          <Link href="/question-papers">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="break-words text-xl font-bold tracking-tight sm:text-2xl bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
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
            <Button variant="outline" size="icon" className="shrink-0 rounded-none border-border">
              <Pencil className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-none border-border">
            <DropdownMenuItem onClick={() => setEditOpen(true)} className="rounded-none">
              Edit paper
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive rounded-none"
              onClick={() => setDeleteConfirmOpen(true)}
            >
              Delete paper
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card className="rounded-none border border-border shadow-sm group">
        <CardHeader className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="min-w-0 flex-1">
            <CardTitle className="flex items-center gap-2 text-foreground group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
              <ListOrdered className="size-5 shrink-0" />
              Questions
            </CardTitle>
            <CardDescription className="mt-1">
              {questions.length} question{questions.length !== 1 ? "s" : ""} in
              this paper.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setGenerateOpen(true)}
              className="gap-2 rounded-none border-border"
            >
              <Sparkles className="size-4" />
              Generate with AI
            </Button>
            <div className="relative group/btn w-full sm:w-auto">
              <div className="absolute -inset-[2px] bg-gradient-to-r from-cyan-500 via-purple-500 to-fuchsia-500 animate-gradient-xy opacity-70 group-hover/btn:opacity-100 transition-opacity blur-sm" />
              <Button
                onClick={() => setCreateQuestionOpen(true)}
                className="relative w-full shrink-0 gap-2 sm:w-auto bg-background text-foreground hover:bg-background transition-transform group-hover/btn:scale-[1.02] rounded-none shadow-none border border-border/50"
              >
                <Plus className="size-4 text-cyan-500" />
                <span className="bg-gradient-to-r from-cyan-600 to-fuchsia-600 dark:from-cyan-400 dark:to-fuchsia-400 bg-clip-text text-transparent animate-gradient-text font-bold">Add question</span>
              </Button>
            </div>
          </div>
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
                  className="flex flex-col gap-3 rounded-none border border-border bg-card p-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:p-4"
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
                      {Array.isArray(q.options) && (q.options as string[]).length >= 2 && " · MCQ"}
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

      <PaperSubmissionsList paperId={paperId} />

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

      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="rounded-none border-border">
          <DialogHeader>
            <DialogTitle>Generate questions with AI</DialogTitle>
            <DialogDescription>Topic + how many MCQs and long questions you want.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="generate-topic">Topic</Label>
              <Input
                id="generate-topic"
                placeholder="e.g. Photosynthesis, Quadratic equations"
                value={generateTopic}
                onChange={(e) => setGenerateTopic(e.target.value)}
                disabled={generateLoading}
                className="rounded-none border-border"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="generate-mcq">MCQs</Label>
                <Input
                  id="generate-mcq"
                  type="number"
                  min={0}
                  max={20}
                  value={generateMcqCount}
                  onChange={(e) => setGenerateMcqCount(Number(e.target.value) || 0)}
                  disabled={generateLoading}
                  className="rounded-none border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="generate-long">Long</Label>
                <Input
                  id="generate-long"
                  type="number"
                  min={0}
                  max={20}
                  value={generateLongCount}
                  onChange={(e) => setGenerateLongCount(Number(e.target.value) || 0)}
                  disabled={generateLoading}
                  className="rounded-none border-border"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateOpen(false)} disabled={generateLoading} className="rounded-none">
              Cancel
            </Button>
            <Button
              onClick={handleGenerateQuestions}
              disabled={generateLoading || generateMcqCount + generateLongCount < 1}
              className="rounded-none"
            >
              {generateLoading ? "Generating…" : "Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
