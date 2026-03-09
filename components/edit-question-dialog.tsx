"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
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
import { updateQuestionAction } from "@/lib/actions/papers";

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
}: {
  paperId: string;
  question: Question;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [questionText, setQuestionText] = useState(question.question);
  const [answer, setAnswer] = useState(question.answer ?? "");
  const [points, setPoints] = useState(question.points);
  const submittedRef = useRef(false);

  const [state, formAction, isPending] = useActionState(
    updateQuestionAction.bind(null, paperId, question.id),
    {}
  );

  useEffect(() => {
    setQuestionText(question.question);
    setAnswer(question.answer ?? "");
    setPoints(question.points);
  }, [question]);

  useEffect(() => {
    if (!isPending && submittedRef.current) {
      submittedRef.current = false;
      if (state?.error) {
        toast.error(state.error);
      } else {
        toast.success("Question updated");
        onOpenChange(false);
        router.refresh();
      }
    }
  }, [isPending, state, onOpenChange, router]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit question</DialogTitle>
          <DialogDescription>
            Update the question text, answer, and points.
          </DialogDescription>
        </DialogHeader>
        <form
          action={formAction}
          onSubmit={() => {
            submittedRef.current = true;
          }}
        >
          <div className="grid gap-4 py-2 sm:py-4">
            <div className="space-y-2">
              <Label htmlFor="eq-text">Question</Label>
              <Input
                id="eq-text"
                name="question"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eq-answer">Answer (optional)</Label>
              <Input
                id="eq-answer"
                name="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eq-points">Points</Label>
              <Input
                id="eq-points"
                name="points"
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
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
