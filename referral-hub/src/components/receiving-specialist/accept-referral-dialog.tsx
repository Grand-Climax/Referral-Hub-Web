"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AcceptReferralDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
  onConfirm: () => void | Promise<void>;
  isSubmitting?: boolean;
}

export function AcceptReferralDialog({
  open,
  onOpenChange,
  patientName,
  onConfirm,
  isSubmitting = false,
}: AcceptReferralDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            Accept referral
          </DialogTitle>
          <DialogDescription>
            Confirm that you are accepting this referral for {patientName}. The
            referring team will be notified.
          </DialogDescription>
        </DialogHeader>
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
            className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2"
            onClick={() => {
              void onConfirm();
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Accept referral
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
