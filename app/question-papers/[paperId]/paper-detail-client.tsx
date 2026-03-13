"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ListOrdered,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  Users,
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

const EditPaperDialog = dynamic(
  () =>
    import("@/components/edit-paper-dialog").then((m) => ({
      default: m.EditPaperDialog,
    })),
  { ssr: false }
);

import type { PaperDetailDTO } from "@/lib/types/papers";
import {
  deletePaperAction,
  deleteQuestionAction,
} from "@/lib/actions/papers";
import { PaperStudentSection } from "@/components/paper-student-section";
import { cn } from "@/lib/utils";

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
  const [activeTab, setActiveTab] = useState<"questions" | "students">("questions");

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
    <div className="container pt-24 pb-12 sm:pt-40 sm:pb-20 animate-slide-up grid-bg min-h-screen">
      <div className="flex flex-col gap-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-l-4 border-foreground pl-6">
          <div className="flex flex-col gap-4">
            <Link href="/question-papers" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="size-3" />
              Return to Registry
            </Link>
            <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic leading-none">
              {paper.name}
            </h1>
            {paper.description && (
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground max-w-2xl leading-relaxed">
                {paper.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
             <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="gap-2">
                <Pencil className="size-3" />
                Edit Unit
             </Button>
             <Button variant="outline" size="sm" onClick={() => setDeleteConfirmOpen(true)} className="text-destructive border-destructive/20 hover:bg-destructive hover:text-white">
                <Trash2 className="size-3" />
                Purge
             </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-foreground/10 pb-px">
          <button
            type="button"
            onClick={() => setActiveTab("questions")}
            className={cn(
              "px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 -mb-px",
              activeTab === "questions"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Questions List / {questions.length} Units
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("students")}
            className={cn(
              "px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 -mb-px",
              activeTab === "students"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Student Submissions / Evaluation
          </button>
        </div>

        {activeTab === "students" && (
           <div className="animate-reveal">
             <PaperStudentSection paperId={paperId} />
           </div>
        )}

        {activeTab === "questions" && (
          <div className="animate-reveal flex flex-col gap-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-1 border-l-4 border-foreground" />
                <div>
                   <h2 className="text-2xl font-black tracking-tighter italic text-foreground">Question Set</h2>
                   <p className="text-[10px] font-bold tracking-widest text-muted-foreground">Unit Management / Sequence</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => setGenerateOpen(true)}
                  className="gap-2 h-11"
                >
                  <Sparkles className="size-4" />
                  AI Synthesis
                </Button>
                <Button
                  onClick={() => setCreateQuestionOpen(true)}
                  className="gap-2 h-11"
                >
                  <Plus className="size-4" />
                  Manual Entry
                </Button>
              </div>
            </div>

            {questions.length === 0 ? (
              <div className="border border-dashed border-foreground/20 p-20 text-center">
                <p className="text-[10px] font-bold tracking-[0.3em] text-muted-foreground">
                  Data Structure Empty / Awaiting Input
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {questions.map((q, i) => (
                  <div
                    key={q.id}
                    className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border border-foreground/10 bg-background p-8 group hover:border-foreground transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-[10px] font-black tracking-tighter bg-foreground text-background px-2 py-0.5">
                          U-{String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="text-[9px] font-black tracking-widest text-muted-foreground">
                          Value: {q.points} PTS / {Array.isArray(q.options) && (q.options as string[]).length >= 2 ? "TYPE: SELECT" : "TYPE: OPEN"}
                        </span>
                      </div>
                      <p className="text-sm font-bold tracking-wide text-foreground leading-relaxed mb-4">
                        {q.question}
                      </p>
                      {q.answer && (
                        <div className="flex items-start gap-2">
                           <span className="text-[8px] font-black tracking-widest text-muted-foreground mt-0.5">Reference Answer:</span>
                           <p className="text-[10px] font-medium text-foreground italic">{q.answer}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingQuestion(q)}
                        className="h-9 px-4"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 w-9 p-0 text-destructive border-destructive/20 hover:bg-destructive hover:text-white"
                        onClick={() => handleDeleteQuestion(q.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

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
            <DialogTitle>PURGE DATA UNIT</DialogTitle>
            <DialogDescription>
              Confirm total deletion of &quot;{paper.name}&quot; registry. This action is final.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
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
              {deleteLoading ? "Purging…" : "Confirm Purge"}
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
        <DialogContent className="border-foreground">
          <DialogHeader>
            <DialogTitle>AI SYNTHESIS MODULE</DialogTitle>
            <DialogDescription>Enter thematic domain for question generation.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="generate-topic">DOMAIN TOPIC</Label>
              <Input
                id="generate-topic"
                placeholder="INPUT TOPIC..."
                value={generateTopic}
                onChange={(e) => setGenerateTopic(e.target.value)}
                disabled={generateLoading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="generate-mcq">SELECT UNITS (MCQ)</Label>
                <Input
                  id="generate-mcq"
                  type="number"
                  min={0}
                  max={20}
                  value={generateMcqCount}
                  onChange={(e) => setGenerateMcqCount(Number(e.target.value) || 0)}
                  disabled={generateLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="generate-long">OPEN UNITS (LONG)</Label>
                <Input
                  id="generate-long"
                  type="number"
                  min={0}
                  max={20}
                  value={generateLongCount}
                  onChange={(e) => setGenerateLongCount(Number(e.target.value) || 0)}
                  disabled={generateLoading}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setGenerateOpen(false)} disabled={generateLoading}>
              ABORT
            </Button>
            <Button
              onClick={handleGenerateQuestions}
              disabled={generateLoading || generateMcqCount + generateLongCount < 1}
            >
              {generateLoading ? "SYNTHESIZING…" : "START SYNTHESIS"}
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

