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
import { ListOrdered, CircleDot } from "lucide-react";

type QType = "mcq" | "long";

type Question = {
  id: string;
  question: string;
  options: unknown;
  answer: string | null;
  points: number;
  sortOrder: number;
};

function getOptionsArray(opts: unknown): string[] {
  if (!Array.isArray(opts)) return ["", "", "", ""];
  const arr = opts.filter((o): o is string => typeof o === "string").slice(0, 4);
  while (arr.length < 4) arr.push("");
  return arr;
}

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
  const onSavedRef = useRef(onSaved);
  onSavedRef.current = onSaved;
  const router = useRouter();
  const opts = getOptionsArray(question.options);
  const isMcq = opts.some(Boolean);
  const [type, setType] = useState<QType>(isMcq ? "mcq" : "long");
  const [questionText, setQuestionText] = useState(question.question);
  const [answer, setAnswer] = useState(question.answer ?? "");
  const [points, setPoints] = useState(question.points);
  const [options, setOptions] = useState<string[]>(opts);
  const [correctIndex, setCorrectIndex] = useState(() => {
    const a = question.answer ?? "";
    const i = opts.findIndex((o) => o === a);
    return i >= 0 ? i : 0;
  });
  const submittedRef = useRef(false);

  const [state, formAction, isPending] = useActionState(
    updateQuestionAction.bind(null, paperId, question.id),
    {}
  );

  useEffect(() => {
    const opts = getOptionsArray(question.options);
    setQuestionText(question.question);
    setAnswer(question.answer ?? "");
    setPoints(question.points);
    setOptions(opts);
    const i = opts.findIndex((o) => o === (question.answer ?? ""));
    setCorrectIndex(i >= 0 ? i : 0);
    setType(opts.some(Boolean) ? "mcq" : "long");
  }, [question]);

  useEffect(() => {
    if (!isPending && submittedRef.current) {
      submittedRef.current = false;
      if (state?.error) toast.error(state.error);
      else {
        toast.success("Question updated");
        onOpenChange(false);
        router.refresh();
        onSavedRef.current?.();
      }
    }
  }, [isPending, state, onOpenChange, router]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit question</DialogTitle>
          <DialogDescription>Change type, text, options (MCQ), or answer and points.</DialogDescription>
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
              <Label htmlFor="eq-text">Question</Label>
              <Input
                id="eq-text"
                name="question"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
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
                <Label htmlFor="eq-answer">Answer (optional)</Label>
                <Input
                  id="eq-answer"
                  name="answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />
              </div>
            )}

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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
