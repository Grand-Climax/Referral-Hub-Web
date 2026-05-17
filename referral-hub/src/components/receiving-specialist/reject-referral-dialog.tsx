"use client";

import { useEffect, useState } from "react";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface RejectReferralDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function RejectReferralDialog({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting = false,
}: RejectReferralDialogProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open && !isSubmitting) setReason("");
  }, [open, isSubmitting]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-rose-600" />
            Reject referral
          </DialogTitle>
          <DialogDescription>
            Provide a clinical justification. The referring team will see this
            reason.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="rejection-reason">Reason for rejection</Label>
          <Textarea
            id="rejection-reason"
            placeholder="Provide clinical justification..."
            className="resize-none h-28 bg-background"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
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
            variant="destructive"
            className="gap-2"
            onClick={() => {
              void onConfirm(reason.trim());
            }}
            disabled={isSubmitting || !reason.trim()}
          >
            {isSubmitting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            Reject referral
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
