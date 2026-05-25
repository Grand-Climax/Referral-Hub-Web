"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetReferralByIdQuery } from "@/features/referral/referralApi";
import { useGetMeQuery } from "@/features/users/usersApi";
import {
  useGrantConsultAccessMutation,
  useRevokeConsultAccessMutation,
  useMarkDeceasedMutation,
} from "@/features/doctor/doctorReferralApi";
import { useRecordOutcomeMutation } from "@/features/clinical/clinicalApi";
import { getApiErrorMessage } from "@/lib/apiError";
import ReferralDetail from "@/components/referral/ReferralDetail";
import { ClinicalUpdatesPanel } from "./ClinicalUpdatesPanel";
import { RecordOutcomeDialog } from "./RecordOutcomeDialog";
import { MarkDeceasedFlow } from "./MarkDeceasedFlow";
import { GrantConsultantDialog } from "./GrantConsultantDialog";
function patientNameFromReferral(referral: {
  patient?: {
    first_name?: string;
    middle_name?: string | null;
    last_name?: string;
  };
}): string {
  const p = referral.patient;
  if (!p) return "Patient";
  return [p.first_name, p.middle_name, p.last_name].filter(Boolean).join(" ");
}

interface DoctorReferralWorkspaceProps {
  referralId: string;
  /** Hat when opened from assigned list. */
  accessHat?: "treating" | "consulting";
}

export function DoctorReferralWorkspace({
  referralId,
  accessHat,
}: DoctorReferralWorkspaceProps) {
  const router = useRouter();
  const { data: me } = useGetMeQuery();
  const { data: referral, isLoading, error } = useGetReferralByIdQuery(referralId);
  const [outcomeOpen, setOutcomeOpen] = useState(false);
  const [deceasedOpen, setDeceasedOpen] = useState(false);
  const [grantOpen, setGrantOpen] = useState(false);

  const [recordOutcome, { isLoading: recordingOutcome }] =
    useRecordOutcomeMutation();
  const [markDeceased, { isLoading: markingDeceased }] = useMarkDeceasedMutation();
  const [grantConsult, { isLoading: granting }] = useGrantConsultAccessMutation();
  const [revokeConsult, { isLoading: revoking }] = useRevokeConsultAccessMutation();

  const relationship = useMemo(() => {
    if (!referral || !me) return null;
    const isSender = referral.referring_doctor_id === me.id;
    const assignedId =
      referral.triage_queue?.assigned_doctor_id ??
      (referral.treating_doctor as { user_id?: string } | undefined)?.user_id;
    const isTreating =
      assignedId === me.id ||
      referral.my_access_type === "TREATING_DOCTOR" ||
      accessHat === "treating";
    const isConsulting =
      referral.my_access_type === "CONSULTED_DOCTOR" || accessHat === "consulting";
    return { isSender, isTreating, isConsulting, assignedId };
  }, [referral, me, accessHat]);

  const activeConsultants = useMemo(() => {
    const list = referral?.consulting_doctors ?? [];
    return list.filter((c) => !c.revoked_at);
  }, [referral?.consulting_doctors]);

  const patientName = referral ? patientNameFromReferral(referral) : "Patient";

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!referral || error) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground">
          {error
            ? "You may no longer have access to this referral (e.g. after outcome was recorded)."
            : "Referral not found."}
        </p>
        <Button variant="outline" onClick={() => router.push("/referring-doctor/assigned")}>
          Back to assigned
        </Button>
      </div>
    );
  }

  const canAddClinical =
    relationship?.isTreating ||
    relationship?.isConsulting ||
    relationship?.isSender;
  const canGrantConsult = relationship?.isTreating === true;
  const canRecordOutcome = relationship?.isTreating === true;
  const canMarkDeceased =
    relationship?.isSender || relationship?.isTreating;

  const handleRecordOutcome = async (body: Parameters<
    typeof recordOutcome
  >[0]["body"]) => {
    try {
      await recordOutcome({ referralId, body }).unwrap();
      toast.success("Outcome recorded.");
      router.push("/referring-doctor/assigned");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to record outcome."));
    }
  };

  const handleDeceased = async (reason: string) => {
    try {
      await markDeceased({ id: referralId, body: { reason } }).unwrap();
      toast.success("Patient marked as deceased.");
      router.push("/referring-doctor/assigned");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to mark deceased."));
    }
  };

  const handleGrant = async (doctorId: string) => {
    try {
      await grantConsult({ referralId, doctor_id: doctorId }).unwrap();
      toast.success("Consulting access granted.");
      setGrantOpen(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to grant access."));
    }
  };

  const handleRevoke = async (doctorId: string, name: string) => {
    try {
      await revokeConsult({
        referralId,
        doctor_id: doctorId,
        reason: "Revoked by treating doctor",
      }).unwrap();
      toast.success(`Revoked access for ${name}.`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to revoke access."));
    }
  };

  return (
    <div className="min-w-0 space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <Button variant="ghost" size="sm" className="shrink-0" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        {accessHat && (
          <Badge variant="outline" className="capitalize">
            {accessHat} access
          </Badge>
        )}
        {relationship?.isTreating && (
          <Badge className="bg-blue-100 text-blue-800">Treating doctor</Badge>
        )}
        {relationship?.isConsulting && !relationship?.isTreating && (
          <Badge variant="secondary">Consulting</Badge>
        )}
      </div>

      <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2 order-2 lg:order-1">
          <div className="min-w-0 overflow-x-hidden">
            <ReferralDetail id={referralId} embedded />
          </div>
        </div>
        <div className="min-w-0 space-y-4 order-1 lg:order-2">
          <ClinicalUpdatesPanel
            referralId={referralId}
            canAdd={!!canAddClinical}
          />

          {canGrantConsult && (
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Consulting doctors</h3>
                <Button size="sm" variant="outline" onClick={() => setGrantOpen(true)}>
                  <UserPlus className="h-3.5 w-3.5 mr-1" />
                  Add
                </Button>
              </div>
              {activeConsultants.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No consultants invited yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {activeConsultants.map((c) => (
                    <li
                      key={c.user_id}
                      className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{c.full_name ?? "—"}</p>
                        {c.granted_at && (
                          <p className="text-[10px] text-muted-foreground">
                            Since {new Date(c.granted_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive h-8 w-full sm:w-auto shrink-0"
                        disabled={revoking}
                        onClick={() =>
                          void handleRevoke(
                            c.user_id ?? "",
                            c.full_name ?? "consultant",
                          )
                        }
                      >
                        Revoke
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {canRecordOutcome && (
            <Button className="w-full" onClick={() => setOutcomeOpen(true)}>
              Record outcome
            </Button>
          )}

          {canMarkDeceased && (
            <button
              type="button"
              className="w-full text-center text-xs text-destructive/80 hover:text-destructive hover:underline py-2"
              onClick={() => setDeceasedOpen(true)}
            >
              Mark patient as deceased
            </button>
          )}

          {relationship?.isConsulting && !canRecordOutcome && (
            <p className="text-xs text-muted-foreground text-center">
              Only the assigned treating doctor can record an outcome.
            </p>
          )}
        </div>
      </div>

      <RecordOutcomeDialog
        patientName={patientName}
        open={outcomeOpen}
        onOpenChange={setOutcomeOpen}
        isLoading={recordingOutcome}
        onSubmit={handleRecordOutcome}
      />
      <MarkDeceasedFlow
        patientName={patientName}
        open={deceasedOpen}
        onOpenChange={setDeceasedOpen}
        isLoading={markingDeceased}
        onConfirm={handleDeceased}
      />
      <GrantConsultantDialog
        open={grantOpen}
        onOpenChange={setGrantOpen}
        isLoading={granting}
        onGrant={handleGrant}
        excludeIds={activeConsultants
          .map((c) => c.user_id)
          .filter((id): id is string => Boolean(id))}
      />
    </div>
  );
}
