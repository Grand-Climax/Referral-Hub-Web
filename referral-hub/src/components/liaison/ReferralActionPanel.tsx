"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Loader2, Undo2, XCircle } from "lucide-react";

type ReasonAction = "reject" | "return";

interface ReferralActionPanelProps {
  canTakeAction: boolean;
  effectiveStatus: string;
  isForwarding: boolean;
  isRejecting: boolean;
  isRevising: boolean;
  onApprove: () => void;
  onOpenReason: (action: ReasonAction) => void;
}

export function ReferralActionPanel({
  canTakeAction,
  effectiveStatus,
  isForwarding,
  isRejecting,
  isRevising,
  onApprove,
  onOpenReason,
}: ReferralActionPanelProps) {
  return (
    <Card className="border-none bg-muted/30">
      <CardContent className="p-4 space-y-3">
        {canTakeAction ? (
          <>
            <Button
              size="lg"
              onClick={onApprove}
              disabled={isForwarding || isRejecting || isRevising}
              className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800 shadow-lg shadow-emerald-600/20 py-6 text-base"
            >
              {isForwarding ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-5 w-5" />
              )}
              Approve Referral
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="ghost"
                onClick={() => onOpenReason("return")}
                disabled={isForwarding || isRejecting || isRevising}
                className="text-xs text-muted-foreground hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20"
              >
                {isRevising ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <Undo2 className="mr-1 h-3 w-3" />
                )}
                Return to Doctor
              </Button>
              <Button
                variant="ghost"
                onClick={() => onOpenReason("reject")}
                disabled={isForwarding || isRejecting || isRevising}
                className="text-xs text-muted-foreground hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-destructive/20"
              >
                {isRejecting ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <XCircle className="mr-1 h-3 w-3" />
                )}
                Reject Case
              </Button>
            </div>
          </>
        ) : (
          <div className="rounded-lg border bg-card p-4 text-center space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Referral Status
            </p>
            <Badge
              variant={
                effectiveStatus === "REJECTED" ? "destructive" : "secondary"
              }
              className="uppercase font-semibold"
            >
              {effectiveStatus === "RETURNED"
                ? "Returned to Doctor"
                : effectiveStatus}
            </Badge>
            <p className="text-xs text-muted-foreground">
              This case has already been reviewed. Actions are disabled.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
