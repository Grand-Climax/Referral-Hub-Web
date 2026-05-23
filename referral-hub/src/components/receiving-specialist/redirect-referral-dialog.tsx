"use client";

import { useEffect, useState } from "react";
import { Share2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { RedirectHospitalOption } from "@/types/specialist";

interface RedirectReferralDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hospitals: RedirectHospitalOption[];
  isLoadingHospitals?: boolean;
  onConfirm: (values: {
    hospitalId: string;
    reason: string;
  }) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function RedirectReferralDialog({
  open,
  onOpenChange,
  hospitals,
  isLoadingHospitals = false,
  onConfirm,
  isSubmitting = false,
}: RedirectReferralDialogProps) {
  const [hospitalId, setHospitalId] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open && !isSubmitting) {
      setHospitalId("");
      setReason("");
    }
  }, [open, isSubmitting]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-blue-600" />
            Redirect referral
          </DialogTitle>
          <DialogDescription>
            Choose another hospital from the network and explain the reason
            for redirection.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="redirect-hospital">Redirect to hospital</Label>
            <Select
              value={hospitalId}
              onValueChange={setHospitalId}
              disabled={isLoadingHospitals || isSubmitting}
            >
              <SelectTrigger id="redirect-hospital" className="bg-background">
                <SelectValue
                  placeholder={
                    isLoadingHospitals
                      ? "Loading hospitals..."
                      : "Select hospital"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {hospitals.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No redirect hospitals available
                  </div>
                ) : (
                  hospitals.map((hospital) => (
                    <SelectItem key={hospital.id} value={hospital.id}>
                      {hospital.name}
                      {hospital.region ? ` - ${hospital.region}` : ""}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="redirect-reason">Redirect reason</Label>
            <Textarea
              id="redirect-reason"
              placeholder="Explain why this referral should be redirected..."
              className="resize-none h-28 bg-background"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </div>
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
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            onClick={() => {
              void onConfirm({ hospitalId, reason: reason.trim() });
            }}
            disabled={isSubmitting || !hospitalId || !reason.trim()}
          >
            {isSubmitting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            Redirect referral
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
