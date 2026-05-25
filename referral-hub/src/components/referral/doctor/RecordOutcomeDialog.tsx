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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ReferralOutcome } from "@/types/clinical";

const OUTCOMES: { value: ReferralOutcome; label: string }[] = [
  { value: "improved", label: "Improved" },
  { value: "deteriorated", label: "Deteriorated" },
  { value: "discharged", label: "Discharged" },
  { value: "transferred", label: "Transferred" },
];

interface RecordOutcomeDialogProps {
  patientName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    outcome: ReferralOutcome;
    length_of_stay_days?: number;
    was_referral_appropriate?: boolean | null;
    outcome_notes?: string;
  }) => void | Promise<void>;
  isLoading?: boolean;
}

export function RecordOutcomeDialog({
  patientName,
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: RecordOutcomeDialogProps) {
  const [outcome, setOutcome] = useState<ReferralOutcome>("discharged");
  const [los, setLos] = useState("");
  const [appropriate, setAppropriate] = useState<string>("yes");
  const [notes, setNotes] = useState("");

  const handleSubmit = async () => {
    await onSubmit({
      outcome,
      length_of_stay_days: los ? Number(los) : undefined,
      was_referral_appropriate:
        appropriate === "yes"
          ? true
          : appropriate === "no"
            ? false
            : null,
      outcome_notes: notes.trim() || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Record outcome — {patientName}</DialogTitle>
          <DialogDescription>
            Completing this case will mark the referral finished and revoke
            consulting access.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Outcome</Label>
            <Select
              value={outcome}
              onValueChange={(v) => setOutcome(v as ReferralOutcome)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OUTCOMES.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Length of stay (days)</Label>
            <Input
              type="number"
              min={0}
              value={los}
              onChange={(e) => setLos(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Was the referral appropriate?</Label>
            <Select value={appropriate} onValueChange={setAppropriate}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="na">N/A</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Outcome notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={isLoading} onClick={() => void handleSubmit()}>
            Record outcome
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
