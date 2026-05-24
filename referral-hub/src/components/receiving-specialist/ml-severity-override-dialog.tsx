"use client";

import { useEffect, useState } from "react";
import { Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface MlSeverityOverrideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payload: { score: number; justification: string }) => void | Promise<void>;
  isSubmitting?: boolean;
  currentScore?: number | null;
}

export function MlSeverityOverrideDialog({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting = false,
  currentScore,
}: MlSeverityOverrideDialogProps) {
  const [score, setScore] = useState("");
  const [justification, setJustification] = useState("");

  useEffect(() => {
    if (!open && !isSubmitting) {
      setScore("");
      setJustification("");
      return;
    }
    if (open && currentScore != null && !score) {
      setScore(String(currentScore));
    }
  }, [open, isSubmitting, currentScore, score]);

  const handleSubmit = () => {
    const parsed = Number.parseFloat(score);
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
      return;
    }
    const trimmed = justification.trim();
    if (!trimmed) {
      return;
    }
    void onConfirm({ score: parsed, justification: trimmed });
  };

  const parsedScore = Number.parseFloat(score);
  const scoreInvalid =
    score.trim() === "" ||
    Number.isNaN(parsedScore) ||
    parsedScore < 0 ||
    parsedScore > 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-amber-600" />
            Manual severity override
          </DialogTitle>
          <DialogDescription>
            Set a clinical severity score (0–100). This replaces automated ML
            scoring for this referral and removes AI prediction details.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="override-score">Severity score (0–100)</Label>
            <Input
              id="override-score"
              type="number"
              min={0}
              max={100}
              step={0.1}
              placeholder="e.g. 85.5"
              value={score}
              onChange={(event) => setScore(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="override-justification">Clinical justification</Label>
            <Textarea
              id="override-justification"
              placeholder="Explain why the automated score does not reflect clinical risk…"
              className="resize-none h-28 bg-background"
              value={justification}
              onChange={(event) => setJustification(event.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-amber-600 hover:bg-amber-700 text-white"
            onClick={handleSubmit}
            disabled={isSubmitting || scoreInvalid || !justification.trim()}
          >
            {isSubmitting ? "Saving…" : "Apply override"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
