'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface OffDutyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  specialistName: string;
  date: string; // YYYY-MM-DD format
  onConfirm: (reason: string) => void;
}

export function OffDutyDialog({
  open,
  onOpenChange,
  specialistName,
  date,
  onConfirm,
}: OffDutyDialogProps) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason.trim());
      setReason('');
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setReason('');
    onOpenChange(false);
  };

  const formattedDate = format(new Date(date), 'EEEE, MMMM dd, yyyy');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Mark Specialist as Off Duty
          </DialogTitle>
          <DialogDescription>
            You are about to mark <span className="font-semibold text-foreground">{specialistName}</span> as off duty
            for <span className="font-semibold text-foreground">{formattedDate}</span>.
            Please provide a reason for this change.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date Display */}
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs font-semibold text-foreground">Scheduled Date</p>
              <p className="text-xs text-muted-foreground">{formattedDate}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Off Duty Status *</Label>
            <Textarea
              id="reason"
              placeholder="e.g., Medical leave, Emergency, Training, Conference, etc."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              This reason will be visible on the Specialist Availability page.
            </p>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-900/20">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              <strong>Note:</strong> Marking specialists as off duty will reduce department capacity for this date.
              Consider adjusting capacity limits on the Capacity Management page.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!reason.trim()}
            className="bg-amber-600 hover:bg-amber-700"
          >
            Confirm Off Duty
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
