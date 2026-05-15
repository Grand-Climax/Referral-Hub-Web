"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Referral } from "@/types/referral";
import {
  Check,
  MessageSquare,
  Building,
  CalendarDays,
  User,
  Stethoscope,
  CheckSquare,
  CheckCircle2,
  Undo2,
  XCircle,
  History,
  PlusCircle,
  Activity,
  ArrowLeft,
  Stethoscope as DoctorIcon,
  Clock,
  Loader2,
  AlertTriangle,
  BrainCircuit,
  Download,
  Paperclip,
  ShieldCheck,
} from "lucide-react";
import { useGetHospitalByIdQuery } from "@/features/hospitals/hospitalsApi";
import { useGetUserByIdQuery } from "@/features/auth/authApi";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DoctorProfileCard } from "./DoctorProfileCard";
import { HospitalProfileCard } from "./HospitalProfileCard";
import { ReferralActionPanel } from "./ReferralActionPanel";
import { ReasonActionSheet } from "./ReasonActionSheet";
import {
  useGetReferralByIdQuery,
  useReadReferralMutation,
  useForwardReferralMutation,
  useRejectReferralMutation,
  useReviseReferralMutation,
  useGetReviewChecklistQuery,
  useUpdateReviewChecklistMutation,
} from "@/features/liaison/liaisonApi";
import type { LiaisonReviewChecklist } from "@/types/liaison";
import { toast } from "sonner";

interface ReferralDetailViewProps {
  referral_id: string;
}

function humanize(value: string | null | undefined) {
  if (!value) return "Not recorded";
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not recorded";
  return date.toLocaleString();
}

function formatBytes(bytes: number | null | undefined) {
  if (!bytes || bytes <= 0) return "Unknown size";
  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** unitIndex;
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function ReferralDetailView({ referral_id }: ReferralDetailViewProps) {
  type ReasonAction = "reject" | "return" | null;

  const router = useRouter();
  const {
    data: referral,
    isLoading,
    isError,
    error,
  } = useGetReferralByIdQuery(referral_id);

  const [readReferral] = useReadReferralMutation();
  const [forwardReferral, { isLoading: isForwarding }] =
    useForwardReferralMutation();
  const [rejectReferral, { isLoading: isRejecting }] =
    useRejectReferralMutation();
  const [reviseReferral, { isLoading: isRevising }] =
    useReviseReferralMutation();
  const [statusOverride, setStatusOverride] = useState<string | null>(null);
  const [reasonAction, setReasonAction] = useState<ReasonAction>(null);
  const [reasonText, setReasonText] = useState("");

  const {
    data: serverChecklist,
    isLoading: checklistLoading,
  } = useGetReviewChecklistQuery(referral_id);
  const [updateReviewChecklist, { isLoading: isSavingChecklist }] =
    useUpdateReviewChecklistMutation();
  const [checklistDraft, setChecklistDraft] =
    useState<LiaisonReviewChecklist | null>(null);

  useEffect(() => {
    if (serverChecklist) {
      setChecklistDraft(serverChecklist);
    }
  }, [serverChecklist]);

  const handleChecklistToggle = async (
    field: keyof LiaisonReviewChecklist,
    checked: boolean,
  ) => {
    const base: LiaisonReviewChecklist = checklistDraft ??
      serverChecklist ?? {
        attachments_included: false,
        clinical_history_attached: false,
        patient_identity_verified: false,
        vitals_included: false,
      };
    const next: LiaisonReviewChecklist = { ...base, [field]: checked };
    setChecklistDraft(next);
    try {
      await updateReviewChecklist({ id: referral_id, body: next }).unwrap();
    } catch (err) {
      console.error("Failed to save checklist", err);
      toast.error("Could not save review checklist.");
      setChecklistDraft(base);
    }
  };

  const hasReadRef = useRef(false);

  useEffect(() => {
    if (referral && !hasReadRef.current) {
      hasReadRef.current = true;
      readReferral(referral_id).catch((err) =>
        console.error("Failed to mark as read", err),
      );
    }
  }, [referral, referral_id, readReferral]);

  const { data: doctor } = useGetUserByIdQuery(
    referral?.referring_doctor_id || "",
  );
  const { data: hospital } = useGetHospitalByIdQuery(
    referral?.sender_hospital_id || "",
  );
  const { data: targetHospital } = useGetHospitalByIdQuery(
    referral?.target_hospital_id || "",
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">
          Fetching referral details...
        </p>
      </div>
    );
  }

  if (isError || !referral) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 p-4 text-center">
        <XCircle className="h-12 w-12 text-destructive mb-2" />
        <h2 className="text-xl font-bold text-foreground">
          Failed to Load Referral
        </h2>
        <p className="text-muted-foreground max-w-md">
          {error && "message" in error
            ? String(error.message)
            : "The referral case could not be retrieved. It may have been deleted or you may not have permission to view it."}
        </p>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  const hospitalLabel = hospital?.name ?? referral.sender_hospital_id;
  const targetHospitalLabel =
    targetHospital?.name ?? referral.target_hospital_id;
  const doctorLabel = doctor
    ? `Dr. ${doctor.first_name} ${doctor.last_name}`
    : referral.referring_doctor_id;
  const effectiveStatus = statusOverride ?? referral.status;
  const canTakeAction = effectiveStatus === "UNDER_LIAISON_REVIEW";
  const latestVitals = referral.vitals?.[0];
  const attachments = referral.attachments ?? [];

  const downloadAttachment = async (attachment: NonNullable<Referral["attachments"]>[number]) => {
    try {
      const response = await fetch(attachment.storage_path);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = attachment.file_name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      const link = document.createElement("a");
      link.href = attachment.storage_path;
      link.download = attachment.file_name;
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  const handleApprove = async () => {
    try {
      const updated = await forwardReferral({ id: referral_id }).unwrap();
      const nextStatus =
        updated && typeof updated === "object" && "status" in updated
          ? String(updated.status)
          : "ACCEPTED";
      setStatusOverride(nextStatus);
    } catch (err) {
      console.error("Failed to approve referral", err);
    }
  };

  const handleReject = async () => {
    try {
      const updated = await rejectReferral({
        id: referral_id,
        reason: reasonText.trim(),
      }).unwrap();
      const nextStatus =
        updated && typeof updated === "object" && "status" in updated
          ? String(updated.status)
          : "REJECTED_BY_LIAISON";
      setStatusOverride(nextStatus);
      setReasonAction(null);
      setReasonText("");
    } catch (err) {
      console.error("Failed to reject referral", err);
    }
  };

  const handleReturnToDoctor = async () => {
    try {
      const updated = await reviseReferral({
        id: referral_id,
        reason: reasonText.trim(),
      }).unwrap();
      const nextStatus =
        updated && typeof updated === "object" && "status" in updated
          ? String(updated.status)
          : "REJECTED_BY_SPECIALIST";
      setStatusOverride(nextStatus);
      setReasonAction(null);
      setReasonText("");
    } catch (err) {
      console.error("Failed to return referral", err);
    }
  };

  const isReasonSubmitDisabled =
    !reasonText.trim() || isRejecting || isRevising || isForwarding;

  const submitReason = async () => {
    if (!reasonText.trim() || !reasonAction) return;

    if (reasonAction === "reject") {
      await handleReject();
      return;
    }

    await handleReturnToDoctor();
  };

  const steps = [
    { label: "Created", icon: Check, active: true, completed: true },
    {
      label: "Liaison Review",
      icon: MessageSquare,
      active: true,
      completed: false,
    },
    {
      label: "Receiver Acceptance",
      icon: Building,
      active: false,
      completed: false,
    },
    { label: "Scheduled", icon: CalendarDays, active: false, completed: false },
  ];

  return (
    <div className="p-4 mx-auto space-y-6 bg-background min-h-screen">
      {/* ── BACK BUTTON ── */}
      <Button
        variant="ghost"
        className="mb-2 -ml-3 text-muted-foreground hover:text-foreground flex items-center gap-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className="text-primary border-primary/20 bg-primary/10 font-semibold uppercase"
            >
              Liaison Officer Review
            </Badge>
            <Badge
              variant="outline"
              className="uppercase font-semibold text-xs border-border"
            >
              Priority:{" "}
              {referral.severity
                ? Number(referral.severity) > 70
                  ? "Critical"
                  : "Standard"
                : "N/A"}
            </Badge>
            {referral.status === "ACCEPTED" && (
              <Badge className="bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 uppercase font-semibold text-xs">
                Accepted
              </Badge>
            )}
            {referral.status === "REJECTED" && (
              <Badge
                variant="destructive"
                className="uppercase font-semibold text-xs"
              >
                Rejected
              </Badge>
            )}
            {(referral.status === "PENDING" ||
              referral.status === "SUBMITTED") && (
              <Badge
                variant="secondary"
                className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 hover:bg-amber-200 uppercase font-semibold text-xs"
              >
                {referral.status}
              </Badge>
            )}
            {referral.status === "COMPLETED" && (
              <Badge className="bg-primary hover:bg-primary/90 uppercase font-semibold text-xs">
                Completed
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Referral Case: #{referral.id}
          </h1>
          <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5">
            <DoctorIcon className="h-4 w-4" />
            Submitted by:
            <Popover>
              <PopoverTrigger asChild>
                <span className="font-semibold text-foreground underline decoration-dotted underline-offset-4 cursor-pointer hover:text-primary transition-colors">
                  {doctorLabel}
                </span>
              </PopoverTrigger>
              <PopoverContent
                className="w-80 shadow-xl border-border bg-popover/95 backdrop-blur-sm"
                align="start"
              >
                <DoctorProfileCard userId={referral.referring_doctor_id} />
              </PopoverContent>
            </Popover>
            (Hospital:
            <Popover>
              <PopoverTrigger asChild>
                <span className="font-semibold text-foreground underline decoration-dotted underline-offset-4 cursor-pointer hover:text-primary transition-colors">
                  {hospitalLabel}
                </span>
              </PopoverTrigger>
              <PopoverContent
                className="w-80 shadow-xl border-border bg-popover/95 backdrop-blur-sm"
                align="start"
              >
                <HospitalProfileCard hospitalId={referral.sender_hospital_id} />
              </PopoverContent>
            </Popover>
            )
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="font-semibold">
            Save Draft
          </Button>
          <Button className="font-semibold bg-primary hover:bg-primary/90 text-primary-foreground">
            Submit Review
          </Button>
        </div>
      </div>

      {/* ── CASE METADATA ── */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <BrainCircuit className="h-5 w-5 text-primary" />
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">
                Triage / ML
              </p>
              <p className="text-sm font-semibold">
                {humanize(referral.triage_status)} · {humanize(referral.ml_status)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Retry {referral.ml_retry_count ?? 0}, Weight {referral.waiting_hours_weight ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <Building className="h-5 w-5 text-primary" />
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">
                Receiving Hospital
              </p>
              <p className="text-sm font-semibold">{targetHospitalLabel}</p>
              <p className="text-[11px] text-muted-foreground">
                Dept: {referral.target_dept_id}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">
                Last Updated
              </p>
              <p className="text-sm font-semibold">{formatDateTime(referral.updated_at)}</p>
              <p className="text-[11px] text-muted-foreground">
                Created {formatDateTime(referral.created_at)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">
                Record State
              </p>
              <p className="text-sm font-semibold">
                {referral.is_archived ? "Archived" : "Active"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Attachments: {attachments.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── STEPPER ── */}
      <div className="w-full py-6 px-4 bg-card rounded-lg border shadow-sm">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-[10%] right-[10%] top-6 h-0.5 bg-muted -z-10" />
          <div className="absolute left-[10%] right-[50%] top-6 h-0.5 bg-primary -z-10" />
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="flex flex-col items-center gap-2 bg-card px-2"
              >
                <div
                  className={`h-12 w-12 rounded-full flex items-center justify-center border-2 ${
                    step.completed
                      ? "bg-primary border-primary text-primary-foreground"
                      : step.active
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-muted border-muted-foreground/30 text-muted-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={`text-xs font-semibold ${
                    step.active || step.completed
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Details */}
          <Card className="shadow-sm border">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Patient Details</CardTitle>
              </div>
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary hover:bg-primary/20 rounded-sm font-mono"
              >
                {referral.patient_id}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    Full Name
                  </p>
                  <p className="font-semibold text-foreground text-sm leading-snug">
                    {referral.patient?.first_name} {referral.patient?.last_name}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    DOB / Sex
                  </p>
                  <p className="font-semibold text-foreground text-sm leading-snug">
                    {referral.patient?.date_of_birth
                      ? new Date(
                          referral.patient.date_of_birth,
                        ).toLocaleDateString()
                      : "N/A"}{" "}
                    • {referral.patient?.sex}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    Contact
                  </p>
                  <p className="font-semibold text-primary text-sm leading-snug hover:underline cursor-pointer">
                    {referral.patient?.phone_number}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    SMS Consent
                  </p>
                  <p className="font-semibold text-foreground text-sm leading-snug">
                    {referral.patient?.allow_sms ? "Allowed" : "Not allowed"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    National ID
                  </p>
                  <p className="font-semibold text-foreground text-sm leading-snug">
                    {referral.patient?.national_id || referral.patient?.national_id_enc || "N/A"}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="h-4 w-4 text-destructive" />
                  <p className="text-sm font-bold text-foreground">
                    Latest Vitals
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-7 gap-4">
                  <div className="bg-muted/30 p-3 rounded-md border text-center">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                      BP
                    </p>
                    <p className="font-semibold text-sm">
                      {latestVitals?.systolic_bp}/{latestVitals?.diastolic_bp}
                    </p>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-md border text-center">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                      HR
                    </p>
                    <p className="font-semibold text-sm">
                      {latestVitals?.heart_rate} bpm
                    </p>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-md border text-center">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                      Temp
                    </p>
                    <p className="font-semibold text-sm">
                      {latestVitals?.temperature}°C
                    </p>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-md border text-center">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                      Resp
                    </p>
                    <p className="font-semibold text-sm">
                      {latestVitals?.respiratory_rate} /min
                    </p>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-md border text-center">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                      SpO2
                    </p>
                    <p className="font-semibold text-sm">
                      {latestVitals?.sp_o2}%
                    </p>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-md border text-center">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                      GCS
                    </p>
                    <p className="font-semibold text-sm">
                      {latestVitals?.gcs_score ?? "N/A"}/15
                    </p>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-md border text-center">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                      Recorded
                    </p>
                    <p className="font-semibold text-xs">
                      {formatDateTime(latestVitals?.recorded_at)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clinical Notes */}
          <Card className="shadow-sm border">
            <CardHeader className="flex flex-row items-center gap-2 pb-4">
              <Stethoscope className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">
                Referral Reason & Clinical Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-primary/5 rounded-md p-4 border border-primary/10">
                <p className="text-[10px] uppercase font-bold text-primary tracking-wider mb-1">
                  Primary Diagnosis
                </p>
                <p className="font-bold text-foreground text-sm mb-4">
                  {referral.diagnoses?.find((d) => d.is_primary)?.code_info.description ||
                    referral.diagnoses?.[0]?.code_info.description ||
                    "N/A"}
                </p>

                <p className="text-[10px] uppercase font-bold text-primary tracking-wider mb-1">
                  Reason for Referral
                </p>
                <p className="font-semibold text-foreground text-sm leading-relaxed">
                  {referral.referral_form?.reason_of_referral ||
                    "No reason specified"}
                </p>
              </div>

              {referral.emergency_detail?.emergency_justification && (
                <div className="rounded-md border border-destructive/20 bg-destructive/5 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <p className="text-sm font-bold text-destructive">
                      Emergency Justification
                    </p>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {referral.emergency_detail.emergency_justification}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-bold text-foreground mb-2">
                  Clinical Summary
                </p>
                <div className="bg-muted/20 p-4 rounded-md border border-border/50">
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {referral.referral_form?.clinical_summary ||
                      "No clinical summary available"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-foreground mb-2">
                  Patient History
                </p>
                <div className="bg-muted/20 p-4 rounded-md border border-border/50">
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {referral.referral_form?.patient_history ||
                      "No patient history recorded"}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-bold text-foreground mb-2">
                    Physical Examination Findings
                  </p>
                  <div className="bg-muted/20 p-4 rounded-md border border-border/50">
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {referral.referral_form?.physical_examination_findings ||
                        "No physical examination findings recorded"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground mb-2">
                    Investigation Results
                  </p>
                  <div className="bg-muted/20 p-4 rounded-md border border-border/50">
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {referral.referral_form?.investigation_results ||
                        "No investigation results recorded"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground mb-2">
                    Treatment Before Referral
                  </p>
                  <div className="bg-muted/20 p-4 rounded-md border border-border/50">
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {referral.referral_form?.treatment_given_before_referral ||
                        "No treatment recorded"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground mb-2">
                    Medication On Transfer
                  </p>
                  <div className="bg-muted/20 p-4 rounded-md border border-border/50">
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {referral.referral_form?.medication_on_transfer ||
                        "No medication recorded"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                {[
                  ["Category", humanize(referral.referral_form?.reason_for_referral_category)],
                  ["Condition", humanize(referral.referral_form?.condition_at_referral)],
                  ["Transport", humanize(referral.referral_form?.mode_of_transport)],
                  [
                    "Accompanying",
                    referral.referral_form?.accompanying_person_name
                      ? `${referral.referral_form.accompanying_person_name} (${referral.referral_form.accompanying_person_phone || "No phone"})`
                      : "Not recorded",
                  ],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-md border bg-muted/20 p-3">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                      {label}
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-sm font-bold text-foreground mb-3">
                  Diagnoses
                </p>
                <div className="space-y-3">
                  {referral.diagnoses?.length ? (
                    referral.diagnoses.map((diagnosis) => (
                      <div
                        key={diagnosis.id}
                        className="rounded-md border bg-muted/20 p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {diagnosis.code_info?.description || diagnosis.icd_code}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {diagnosis.code_info?.category || "No category"} · ICD {diagnosis.icd_code}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {diagnosis.is_primary && (
                              <Badge className="bg-primary text-primary-foreground">
                                Primary
                              </Badge>
                            )}
                            <Badge variant="outline">
                              {humanize(diagnosis.diagnosis_certainty)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No diagnoses recorded.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attached Documentation */}
          <Card className="shadow-sm border">
            <CardHeader className="flex flex-row items-center gap-2 pb-4">
              <Paperclip className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Attached Documentation</CardTitle>
            </CardHeader>
            <CardContent>
              {attachments.length === 0 ? (
                <div className="rounded-md border border-dashed bg-muted/20 p-6 text-center">
                  <Paperclip className="mx-auto h-6 w-6 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium text-foreground">
                    No attachments uploaded
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Uploaded clinical documents will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between gap-3 rounded-md border bg-background p-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="shrink-0 rounded-md bg-primary/10 p-2 text-primary">
                          <Paperclip className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {attachment.file_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatBytes(attachment.file_size)} · {humanize(attachment.category)}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {humanize(attachment.verification)} · Uploaded {formatDateTime(attachment.uploaded_at)}
                            {attachment.metadata?.width && attachment.metadata?.height
                              ? ` · ${attachment.metadata.width}x${attachment.metadata.height}`
                              : ""}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() => downloadAttachment(attachment)}
                        aria-label={`Download ${attachment.file_name}`}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Origin Details */}
          <Card className="shadow-sm border bg-primary/5 overflow-hidden">
            <div className="h-1 bg-primary w-full" />
            <CardContent className="pt-5 pb-5">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" /> Assigned From
              </p>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground w-16">
                      Hospital
                    </p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <span className="text-sm font-bold text-foreground cursor-pointer hover:text-primary transition-colors underline decoration-primary/20 underline-offset-4">
                          {hospitalLabel}
                        </span>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-80 shadow-xl border-border bg-popover"
                        align="end"
                      >
                        <HospitalProfileCard
                          hospitalId={referral?.sender_hospital_id}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground w-16">
                      Doctor
                    </p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <span className="text-xs font-semibold text-muted-foreground cursor-pointer hover:text-primary transition-colors">
                          {doctorLabel}
                        </span>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-80 shadow-xl border-border bg-popover"
                        align="end"
                      >
                        <DoctorProfileCard
                          userId={referral.referring_doctor_id}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground border-t pt-2.5 border-primary/20 flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Submitted on {new Date(referral.created_at).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Review Checklist */}
          <Card className="shadow-sm border">
            <CardHeader className="flex flex-row items-center gap-2 pb-3">
              <CheckSquare className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Review Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="identity"
                  checked={checklistDraft?.patient_identity_verified ?? false}
                  disabled={checklistLoading || isSavingChecklist}
                  onCheckedChange={(checked) =>
                    handleChecklistToggle(
                      "patient_identity_verified",
                      checked === true,
                    )
                  }
                  className="scale-50 data-[state=checked]:bg-primary"
                />
                <label
                  htmlFor="identity"
                  className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Patient Identity Verified
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="history"
                  checked={checklistDraft?.clinical_history_attached ?? false}
                  disabled={checklistLoading || isSavingChecklist}
                  onCheckedChange={(checked) =>
                    handleChecklistToggle(
                      "clinical_history_attached",
                      checked === true,
                    )
                  }
                  className="scale-50 data-[state=checked]:bg-primary"
                />
                <label
                  htmlFor="history"
                  className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Clinical History Attached
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="labs"
                  checked={checklistDraft?.vitals_included ?? false}
                  disabled={checklistLoading || isSavingChecklist}
                  onCheckedChange={(checked) =>
                    handleChecklistToggle("vitals_included", checked === true)
                  }
                  className="scale-50 data-[state=checked]:bg-primary"
                />
                <label
                  htmlFor="labs"
                  className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Vitals Included
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="insurance"
                  checked={checklistDraft?.attachments_included ?? false}
                  disabled={checklistLoading || isSavingChecklist}
                  onCheckedChange={(checked) =>
                    handleChecklistToggle(
                      "attachments_included",
                      checked === true,
                    )
                  }
                  className="scale-50 data-[state=checked]:bg-primary"
                />
                <label
                  htmlFor="insurance"
                  className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Attachments Included
                </label>
              </div>
            </CardContent>
          </Card>

          <ReferralActionPanel
            canTakeAction={canTakeAction}
            effectiveStatus={effectiveStatus}
            isForwarding={isForwarding}
            isRejecting={isRejecting}
            isRevising={isRevising}
            onApprove={handleApprove}
            onOpenReason={(action) => setReasonAction(action)}
          />

          <ReasonActionSheet
            reasonAction={reasonAction}
            reasonText={reasonText}
            isRejecting={isRejecting}
            isRevising={isRevising}
            isSubmitDisabled={isReasonSubmitDisabled}
            onReasonChange={setReasonText}
            onClose={() => {
              setReasonAction(null);
              setReasonText("");
            }}
            onSubmit={submitReason}
          />

          {/* Audit History */}
          <Card className="shadow-sm border">
            <CardHeader className="flex flex-row items-center gap-2 pb-4">
              <History className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Audit History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-l-2 border-muted border-dashed ml-3 space-y-6 pb-2">
                <div className="relative pl-6">
                  <div className="absolute -left-3.25 top-1 h-6 w-6 rounded-full flex items-center justify-center border-4 border-card bg-primary/10">
                    <PlusCircle className="h-3 w-3 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-semibold">
                      {new Date(referral.created_at || "").toLocaleString()}
                    </p>
                    <p className="font-semibold text-sm text-foreground mt-0.5">
                      Referral Created
                    </p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <p className="text-xs text-primary hover:underline cursor-pointer mt-0.5 font-medium">
                          By{" "}
                          {doctor
                            ? `Dr. ${doctor.first_name} ${doctor.last_name}`
                            : referral.referring_doctor_id}
                        </p>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-80 shadow-xl border-border bg-popover"
                        align="start"
                      >
                        <DoctorProfileCard
                          userId={referral.referring_doctor_id}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                {referral.comments &&
                  referral.comments.length > 0 &&
                  referral.comments.map((comment: any, index: number) => (
                    <div key={index} className="relative pl-6">
                      <div className="absolute -left-3.25 top-1 h-6 w-6 rounded-full flex items-center justify-center border-4 border-card bg-amber-100 dark:bg-amber-900/30">
                        <MessageSquare className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-semibold">
                          {new Date(comment.created_at).toLocaleString()}
                        </p>
                        <p className="font-semibold text-sm text-foreground mt-0.5">
                          Note Added
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {comment.author}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
