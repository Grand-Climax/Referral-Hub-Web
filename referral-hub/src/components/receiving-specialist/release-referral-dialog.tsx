"use client";

import { useEffect, useState } from "react";
import { CornerUpRight } from "lucide-react";
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

interface ReleaseReferralDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function ReleaseReferralDialog({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting = false,
}: ReleaseReferralDialogProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open && !isSubmitting) setReason("");
  }, [open, isSubmitting]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CornerUpRight className="h-5 w-5 text-blue-600" />
            Release referral
          </DialogTitle>
          <DialogDescription>
            Unassign yourself from this referral. Another specialist will be
            able to pick it up.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="release-reason">Reason for release</Label>
          <Textarea
            id="release-reason"
            placeholder="Explain why you are releasing this referral..."
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
            className="gap-2"
            onClick={() => {
              void onConfirm(reason.trim());
            }}
            disabled={isSubmitting || !reason.trim()}
          >
            {isSubmitting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <CornerUpRight className="h-4 w-4" />
            )}
            Release referral
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
