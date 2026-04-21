"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

type ReasonAction = "reject" | "return" | null;

interface ReasonActionSheetProps {
  reasonAction: ReasonAction;
  reasonText: string;
  isRejecting: boolean;
  isRevising: boolean;
  isSubmitDisabled: boolean;
  onReasonChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function ReasonActionSheet({
  reasonAction,
  reasonText,
  isRejecting,
  isRevising,
  isSubmitDisabled,
  onReasonChange,
  onClose,
  onSubmit,
}: ReasonActionSheetProps) {
  return (
    <Sheet
      open={reasonAction !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent side="bottom" className="mx-auto max-w-2xl rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>
            {reasonAction === "reject"
              ? "Reject Referral"
              : "Return Referral to Doctor"}
          </SheetTitle>
          <SheetDescription>
            Enter the reason for this action. This will be submitted with the
            referral ID.
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-2">
          <Textarea
            value={reasonText}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Type reason here..."
            className="min-h-28"
          />
        </div>

        <SheetFooter>
          <div className="flex w-full justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isRejecting || isRevising}
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              disabled={isSubmitDisabled}
              className={
                reasonAction === "reject"
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-amber-600 hover:bg-amber-700"
              }
            >
              {isRejecting || isRevising ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Submit Reason
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
