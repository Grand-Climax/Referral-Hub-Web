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

interface MarkDeceasedFlowProps {
  patientName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void | Promise<void>;
  isLoading?: boolean;
}

export function MarkDeceasedFlow({
  patientName,
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: MarkDeceasedFlowProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmName, setConfirmName] = useState("");
  const [reason, setReason] = useState("");

  const reset = () => {
    setStep(1);
    setConfirmName("");
    setReason("");
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const nameMatches =
    confirmName.trim().toLowerCase() === patientName.trim().toLowerCase();
  const reasonValid = reason.trim().length >= 10;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {step === 1 ? (
          <>
            <DialogHeader>
              <DialogTitle>Mark patient as deceased?</DialogTitle>
              <DialogDescription>
                Are you sure you want to mark <strong>{patientName}</strong> as
                deceased? This action is irreversible and will close the
                referral immediately.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => setStep(2)}>
                Continue
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Confirm patient is deceased</DialogTitle>
              <DialogDescription>
                Type the patient&apos;s full name exactly and provide a reason
                (at least 10 characters).
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Patient full name</Label>
                <Input
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  placeholder={patientName}
                />
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  placeholder="Patient pronounced deceased at …"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                variant="destructive"
                disabled={!nameMatches || !reasonValid || isLoading}
                onClick={() => void onConfirm(reason.trim())}
              >
                I confirm — patient is deceased
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
