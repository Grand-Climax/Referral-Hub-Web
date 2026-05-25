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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ReceptionistMissReason } from "@/types/receptionist";

const MISS_REASONS: { value: ReceptionistMissReason; label: string }[] = [
  { value: "PATIENT_NO_SHOW", label: "Patient no-show" },
  {
    value: "PATIENT_CONTACTED_RESCHEDULE",
    label: "Patient contacted — reschedule",
  },
  { value: "HOSPITAL_CANCELLED", label: "Hospital cancelled" },
  {
    value: "HOSPITAL_CAPACITY_ISSUE",
    label: "Hospital capacity issue",
  },
];

interface MarkMissedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName?: string;
  onConfirm: (reason: ReceptionistMissReason) => void | Promise<void>;
  isLoading?: boolean;
}

export function MarkMissedDialog({
  open,
  onOpenChange,
  patientName,
  onConfirm,
  isLoading,
}: MarkMissedDialogProps) {
  const [reason, setReason] =
    useState<ReceptionistMissReason>("PATIENT_NO_SHOW");

  const handleConfirm = async () => {
    await onConfirm(reason);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark as missed</DialogTitle>
          <DialogDescription>
            {patientName
              ? `Record why ${patientName} did not arrive for their appointment.`
              : "Record why the patient did not arrive."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label>Miss reason</Label>
          <Select
            value={reason}
            onValueChange={(v) => setReason(v as ReceptionistMissReason)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MISS_REASONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isLoading}
            onClick={() => void handleConfirm()}
          >
            Confirm missed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
