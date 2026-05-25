"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCancelReferralMutation,
  useRejectAfterSendMutation,
  useMarkDeceasedMutation,
} from "@/features/doctor/doctorReferralApi";
import { getApiErrorMessage } from "@/lib/apiError";
import { MarkDeceasedFlow } from "@/components/referral/doctor/MarkDeceasedFlow";
import type { Referral } from "@/types/referral";

interface SenderReferralActionsProps {
  referral: Referral;
  patientName: string;
  isSender: boolean;
}

export function SenderReferralActions({
  referral,
  patientName,
  isSender,
}: SenderReferralActionsProps) {
  const router = useRouter();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [deceasedOpen, setDeceasedOpen] = useState(false);

  const [cancelReferral, { isLoading: cancelling }] = useCancelReferralMutation();
  const [rejectAfterSend, { isLoading: rejecting }] =
    useRejectAfterSendMutation();
  const [markDeceased, { isLoading: markingDeceased }] = useMarkDeceasedMutation();

  if (!isSender) return null;

  const status = referral.status?.toUpperCase() ?? "";
  const canCancel = ["DRAFT", "SUBMITTED", "PENDING"].some((s) =>
    status.includes(s),
  );
  const canRejectAfterSend = [
    "FORWARDED",
    "UNDER_LIAISON_REVIEW",
    "ACCEPTED",
    "SCHEDULED",
  ].some((s) => status.includes(s));
  const terminal = ["COMPLETED", "DECEASED", "CANCELLED"].includes(status);

  const handleCancel = async () => {
    try {
      await cancelReferral(referral.id).unwrap();
      toast.success("Referral cancelled.");
      router.push("/referring-doctor/myReferral");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to cancel referral."));
    }
  };

  const handleReject = async () => {
    try {
      await rejectAfterSend(referral.id).unwrap();
      toast.success("Referral pulled back.");
      router.push("/referring-doctor/myReferral");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to reject referral."));
    }
  };

  const handleDeceased = async (reason: string) => {
    try {
      await markDeceased({ id: referral.id, body: { reason } }).unwrap();
      toast.success("Patient marked as deceased.");
      router.push("/referring-doctor/myReferral");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to mark deceased."));
    }
  };

  if (terminal) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-4 border-t">
      {canCancel && (
        <Button variant="outline" size="sm" onClick={() => setCancelOpen(true)}>
          Cancel referral
        </Button>
      )}
      {canRejectAfterSend && (
        <Button variant="outline" size="sm" onClick={() => setRejectOpen(true)}>
          Pull back after send
        </Button>
      )}
      <button
        type="button"
        className="text-xs text-destructive/80 hover:text-destructive hover:underline ml-auto"
        onClick={() => setDeceasedOpen(true)}
      >
        Mark patient as deceased
      </button>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this referral?</DialogTitle>
            <DialogDescription>
              This can only be done before the liaison forwards the referral.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              Keep referral
            </Button>
            <Button
              variant="destructive"
              disabled={cancelling}
              onClick={() => void handleCancel()}
            >
              Cancel referral
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pull back referral?</DialogTitle>
            <DialogDescription>
              Reject this referral after it was sent to the receiving hospital.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Keep referral
            </Button>
            <Button
              variant="destructive"
              disabled={rejecting}
              onClick={() => void handleReject()}
            >
              Pull back
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MarkDeceasedFlow
        patientName={patientName}
        open={deceasedOpen}
        onOpenChange={setDeceasedOpen}
        isLoading={markingDeceased}
        onConfirm={handleDeceased}
      />
    </div>
  );
}
