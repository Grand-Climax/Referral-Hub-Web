"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  useAddClinicalUpdateMutation,
  useGetClinicalHistoryQuery,
} from "@/features/clinical/clinicalApi";
import type { ClinicalUpdateReason } from "@/types/clinical";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/apiError";
import { Loader2 } from "lucide-react";

const REASONS: { value: ClinicalUpdateReason; label: string }[] = [
  { value: "SPECIALIST_NOTE", label: "Clinical note" },
  { value: "CONDITION_CHANGE", label: "Condition change" },
  {
    value: "MISSED_APPOINTMENT_RE_EVALUATION",
    label: "Missed appointment re-evaluation",
  },
];

interface ClinicalUpdatesPanelProps {
  referralId: string;
  canAdd: boolean;
}

export function ClinicalUpdatesPanel({
  referralId,
  canAdd,
}: ClinicalUpdatesPanelProps) {
  const { data: history = [], isLoading } = useGetClinicalHistoryQuery(referralId);
  const [addUpdate, { isLoading: isAdding }] = useAddClinicalUpdateMutation();
  const [reason, setReason] = useState<ClinicalUpdateReason>("SPECIALIST_NOTE");
  const [notes, setNotes] = useState("");

  const handleAdd = async () => {
    if (!notes.trim()) {
      toast.error("Enter clinical notes.");
      return;
    }
    try {
      await addUpdate({
        referralId,
        body: { update_reason: reason, clinical_notes: notes.trim() },
      }).unwrap();
      toast.success("Clinical update recorded.");
      setNotes("");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to add clinical update."));
    }
  };

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-semibold">Clinical updates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {canAdd && (
          <div className="space-y-3 rounded-lg border p-3 bg-muted/30">
            <div className="space-y-2">
              <Label>Reason</Label>
              <Select
                value={reason}
                onValueChange={(v) => setReason(v as ClinicalUpdateReason)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
            <Button
              size="sm"
              disabled={isAdding}
              onClick={() => void handleAdd()}
            >
              {isAdding ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Add update
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : history.length === 0 ? (
          <p className="text-sm text-muted-foreground">No clinical updates yet.</p>
        ) : (
          <ul className="space-y-3">
            {history.map((entry) => (
              <li
                key={entry.id}
                className="rounded-md border px-3 py-2 text-sm space-y-1"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-xs uppercase text-muted-foreground">
                    {entry.update_reason?.replace(/_/g, " ")}
                  </span>
                  {entry.requires_review && (
                    <Badge variant="outline" className="text-[10px]">
                      Needs review
                    </Badge>
                  )}
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    {entry.created_at
                      ? new Date(entry.created_at).toLocaleString()
                      : ""}
                  </span>
                </div>
                <p className="text-foreground">{entry.clinical_notes}</p>
                {entry.author_name && (
                  <p className="text-xs text-muted-foreground">
                    {entry.author_name}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
