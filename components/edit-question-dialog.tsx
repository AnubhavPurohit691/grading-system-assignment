"use client";

import { useState, useEffect } from "react";
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

type Question = {
  id: string;
  question: string;
  answer: string | null;
  points: number;
  sortOrder: number;
};

export function EditQuestionDialog({
  paperId,
  question,
  open,
  onOpenChange,
  onSaved,
}: {
  paperId: string;
  question: Question;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [questionText, setQuestionText] = useState(question.question);
  const [answer, setAnswer] = useState(question.answer ?? "");
  const [points, setPoints] = useState(question.points);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQuestionText(question.question);
    setAnswer(question.answer ?? "");
    setPoints(question.points);
  }, [question]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!questionText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/question-papers/${paperId}/questions/${question.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            question: questionText.trim(),
            answer: answer.trim() || null,
            points: Math.max(0, points),
          }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message ?? "Failed to update");
        return;
      }
      toast.success("Question updated");
      onSaved();
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
          <DialogTitle>Edit question</DialogTitle>
          <DialogDescription>
            Update the question text, answer, and points.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-2 sm:py-4">
            <div className="space-y-2">
              <Label htmlFor="eq-text">Question</Label>
              <Input
                id="eq-text"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eq-answer">Answer (optional)</Label>
              <Input
                id="eq-answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eq-points">Points</Label>
              <Input
                id="eq-points"
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
              {loading ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
