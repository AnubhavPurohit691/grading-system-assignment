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
import { ListOrdered, CircleDot } from "lucide-react";

type QType = "mcq" | "long";

const DEFAULT_OPTIONS = ["", "", "", ""];

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
  const [type, setType] = useState<QType>("long");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [points, setPoints] = useState(1);
  const [options, setOptions] = useState<string[]>(DEFAULT_OPTIONS);
  const [correctIndex, setCorrectIndex] = useState(0);
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
        setOptions(DEFAULT_OPTIONS);
        setCorrectIndex(0);
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
          <DialogDescription>Choose MCQ or long question. For MCQ add options and mark the correct one.</DialogDescription>
        </DialogHeader>
        <form
          action={formAction}
          onSubmit={() => { submittedRef.current = true; }}
        >
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="correctIndex" value={correctIndex} />
          <div className="grid gap-4 py-2 sm:py-4">
            <div className="flex gap-1 rounded-lg bg-muted/60 p-1">
              <button
                type="button"
                onClick={() => setType("long")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${type === "long" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <ListOrdered className="size-4" />
                Long question
              </button>
              <button
                type="button"
                onClick={() => setType("mcq")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${type === "mcq" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <CircleDot className="size-4" />
                MCQ
              </button>
            </div>

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

            {type === "mcq" ? (
              <div className="space-y-3">
                <Label>Options (pick correct one)</Label>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={correctIndex === i}
                      onChange={() => setCorrectIndex(i)}
                      className="size-4"
                    />
                    <Input
                      name={`option${i + 1}`}
                      placeholder={`Option ${i + 1}`}
                      value={options[i] ?? ""}
                      onChange={(e) => {
                        const next = [...options];
                        next[i] = e.target.value;
                        setOptions(next);
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
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
            )}

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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
