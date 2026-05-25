'use client';

import { useEffect, useState } from 'react';
import { Loader2, Undo2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useReturnToTriageMutation } from '@/features/specialist/specialistApi';
import { getApiErrorMessage } from '@/lib/apiError';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referralId: string;
  patientName: string;
}

/**
 * Return-to-triage is the "send a MISSED row back to the active queue"
 * action (§3 of the override guide). Backend only allows it when the row's
 * `available_actions.return_to_triage` is true; we still validate locally
 * to keep the call clean.
 */
export function ReturnToTriageDialog({
  open,
  onOpenChange,
  referralId,
  patientName,
}: Props) {
  const [reason, setReason] = useState('');
  const [submit, { isLoading }] = useReturnToTriageMutation();

  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  const handleSubmit = async () => {
    const trimmed = reason.trim();
    if (trimmed.length < 5) {
      toast.error('Please give a short reason (≥ 5 characters).');
      return;
    }
    try {
      await submit({ referralId, body: { reason: trimmed } }).unwrap();
      toast.success('Patient returned to triage queue.');
      onOpenChange(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to return patient to triage.'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !isLoading && onOpenChange(v)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Undo2 className="h-4 w-4 text-sky-700" />
            Return to triage
          </DialogTitle>
          <DialogDescription className="text-xs">
            {patientName} will go back to the active queue without an
            appointment. Use this when you want the patient re-triaged before
            scheduling.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="rtt_reason" className="text-xs">
            Reason *
          </Label>
          <Textarea
            id="rtt_reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="e.g. needs new vitals before booking"
            className="text-sm resize-none"
          />
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isLoading}
            className="gap-1.5"
          >
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Return to triage
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
