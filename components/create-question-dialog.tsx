"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function CreateQuestionDialog({
  paperId,
  open,
  onOpenChange,
  onCreated,
}: {
  paperId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [points, setPoints] = useState(1);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/question-papers/${paperId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          question: question.trim(),
          answer: answer.trim() || undefined,
          points: Math.max(0, points),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message ?? "Failed to add question");
        return;
      }
      toast.success("Question added");
      setQuestion("");
      setAnswer("");
      setPoints(1);
      onCreated();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add question</DialogTitle>
          <DialogDescription>
            Enter the question text and optional answer and points.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-2 sm:py-4">
            <div className="space-y-2">
              <Label htmlFor="q-text">Question</Label>
              <Input
                id="q-text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Question text"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="q-answer">Answer (optional)</Label>
              <Input
                id="q-answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Expected answer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="q-points">Points</Label>
              <Input
                id="q-points"
                type="number"
                min={0}
                value={points}
                onChange={(e) => setPoints(Number(e.target.value) || 0)}
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
            <Button type="submit" disabled={loading}>
              {loading ? "Adding…" : "Add question"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
