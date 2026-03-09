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
import { createQuestionAction } from "@/lib/actions/papers";

export function CreateQuestionDialog({
  paperId,
  open,
  onOpenChange,
}: {
  paperId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}) {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [points, setPoints] = useState(1);
  const submittedRef = useRef(false);

  const [state, formAction, isPending] = useActionState(
    createQuestionAction.bind(null, paperId),
    {}
  );

  useEffect(() => {
    if (!isPending && submittedRef.current) {
      submittedRef.current = false;
      if (state?.error) {
        toast.error(state.error);
      } else {
        toast.success("Question added");
        setQuestion("");
        setAnswer("");
        setPoints(1);
        onOpenChange(false);
        router.refresh();
      }
    }
  }, [isPending, state, onOpenChange, router]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add question</DialogTitle>
          <DialogDescription>
            Enter the question text and optional answer and points.
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
              <Label htmlFor="q-text">Question</Label>
              <Input
                id="q-text"
                name="question"
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
                name="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Expected answer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="q-points">Points</Label>
              <Input
                id="q-points"
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
              {isPending ? "Adding…" : "Add question"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
