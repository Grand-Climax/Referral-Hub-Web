'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  Download,
  FileText,
  HeartPulse,
  ImageIcon,
  Phone,
  ShieldCheck,
  Stethoscope,
  Truck,
  User,
  ClipboardList,
  Paperclip,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ReferralAttachment, ROLE_LABELS, SeverityLevel } from "@/types/referral";
import { StatusBadge } from "../StatusBadge";
import { PriorityIndicator } from "../PriorityIndicator";
import { useRouter } from "next/navigation";
import { useGetReferralByIdQuery } from "@/features/referral/referralApi";
import {
  useGetDepartmentsQuery,
  useGetHospitalByIdQuery,
} from "@/features/hospitals/hospitalsApi";
import { useGetUserByIdQuery } from "@/features/users/usersApi";
import ReferralPdfExportButton from "./ReferralPdfExportButton";

function formatName(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(" ");
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

function formatDate(value: string | null | undefined) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not recorded";
  return date.toLocaleDateString();
}

function formatBytes(bytes: number | null | undefined) {
  if (!bytes || bytes <= 0) return "Unknown size";
  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** unitIndex;
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function getAttachmentIcon(attachment: ReferralAttachment) {
  return attachment.file_type?.startsWith("image/") ? ImageIcon : FileText;
}

const ReferralDetail = ({id}: {id: string}) => {
  const router = useRouter();
  const { data: referral, isLoading, error } = useGetReferralByIdQuery(id);
  const senderHospitalId = referral?.sender_hospital_id ?? "";
  const targetHospitalId = referral?.target_hospital_id ?? "";
  const referringDoctorId = referral?.referring_doctor_id ?? "";
  const { data: senderHospital } = useGetHospitalByIdQuery(senderHospitalId, {
    skip: !senderHospitalId,
  });
  const { data: targetHospital } = useGetHospitalByIdQuery(targetHospitalId, {
    skip: !targetHospitalId,
  });
  const { data: departments = [] } = useGetDepartmentsQuery(targetHospitalId, {
    skip: !targetHospitalId,
  });
  const { data: referringDoctor } = useGetUserByIdQuery(referringDoctorId, {
    skip: !referringDoctorId,
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
        </div>
      </div>
    );
  }

  if (!referral || error) {
    return (
      <div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Referral not found or an error occurred.</p>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>Go back</Button>
        </div>
      </div>
    );
  }

  // Safe extract helpers
  const severityStr = (referral.severity || referral.referral_form?.condition_at_referral || "medium").toLowerCase();
  const severity = (["critical", "high", "medium", "low"].includes(severityStr) ? severityStr : "medium") as SeverityLevel;
  
  const vital = referral.vitals?.[0];
  const primaryDiagnosis = referral.diagnoses?.find(d => d.is_primary)?.code_info?.description || referral.diagnoses?.[0]?.code_info?.description || "Not recorded";
  const diagnoses = referral.diagnoses ?? [];
  const attachments = referral.attachments ?? [];
  const isEmergency = referral.referral_form?.reason_for_referral_category === "EMERGENCY";
  const targetDepartment = departments.find(
    (department) => department.id === referral.target_dept_id,
  );
  const targetDepartmentName = targetDepartment?.name ?? "Not recorded";
  const senderHospitalName = senderHospital?.name ?? "Not recorded";
  const targetHospitalName = targetHospital?.name ?? "Not recorded";
  const referringDoctorName = referringDoctor
    ? formatName([
        referringDoctor.first_name,
        referringDoctor.middle_name,
        referringDoctor.last_name,
      ])
    : "Not recorded";
  const patientName = referral.patient
    ? formatName([
        referral.patient.first_name,
        referral.patient.middle_name,
        referral.patient.last_name,
      ])
    : "Unknown Patient";

  const calculateAge = (dobString: string, asOfString: string) => {
    if (!dobString || !asOfString) return "N/A";
    const dob = new Date(dobString);
    const asOf = new Date(asOfString);
    if (isNaN(dob.getTime()) || isNaN(asOf.getTime())) return "N/A";
    const ageDifMs = asOf.getTime() - dob.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const downloadAttachment = async (attachment: ReferralAttachment) => {
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
    } catch (error) {
      const link = document.createElement("a");
      link.href = attachment.storage_path;
      link.download = attachment.file_name;
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  return (
    <div className="mx-auto space-y-6 py-4 lg:py-6">
      {/* Top bar */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Button
              variant="ghost"
              size="icon"
              className="mr-1"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium">Dashboard</span>
            <span>›</span>
            <span className="font-medium">Referrals</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Referral Form Details
                </h1>
                <StatusBadge status={referral.status} />
                <PriorityIndicator
                  severity={severity}
                />
                {isEmergency && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-rose-700 ring-1 ring-rose-100">
                    <AlertTriangle className="h-3 w-3" />
                    Emergency
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Submitted on {formatDateTime(referral.created_at)} · Referral #{referral.id.slice(0, 8)}
              </p>
            </div>

            <ReferralPdfExportButton
              referral={referral}
              patientName={patientName}
              senderHospitalName={senderHospitalName}
              targetHospitalName={targetHospitalName}
              targetDepartmentName={targetDepartmentName}
              referringDoctorName={referringDoctorName}
            />
          </div>
        </div>
      </div>

      {/* Status banner */}
      <Card className="border-0 bg-amber-50 text-amber-900 shadow-none ring-1 ring-amber-100">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em]">
                Status: {humanize(referral.status)}
              </p>
              <p className="text-xs text-amber-800">
                This referral is currently being assessed by the receiving
                clinical team at {targetHospitalName}.
              </p>
            </div>
          </div>
          <div className="grid gap-2 text-[11px] font-medium text-amber-800 sm:grid-cols-3">
            <span className="rounded-full bg-white/60 px-3 py-1 ring-1 ring-amber-100">
              Triage: {humanize(referral.triage_status)}
            </span>
            <span className="rounded-full bg-white/60 px-3 py-1 ring-1 ring-amber-100">
              ML: {humanize(referral.ml_status)}
            </span>
            <span className="rounded-full bg-white/60 px-3 py-1 ring-1 ring-amber-100">
              Wait weight: {referral.waiting_hours_weight ?? 0}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-4">
        <Card className="border-0 shadow-sm ring-1 ring-border/60">
          <CardContent className="flex items-center gap-3 p-4">
            <Activity className="h-5 w-5 text-primary" />
            <div>
              <p className="text-[11px] font-semibold uppercase text-muted-foreground">Triage Status</p>
              <p className="text-sm font-semibold">{humanize(referral.triage_status)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm ring-1 ring-border/60">
          <CardContent className="flex items-center gap-3 p-4">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <div>
              <p className="text-[11px] font-semibold uppercase text-muted-foreground">ML Status</p>
              <p className="text-sm font-semibold">{humanize(referral.ml_status)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm ring-1 ring-border/60">
          <CardContent className="flex items-center gap-3 p-4">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="text-[11px] font-semibold uppercase text-muted-foreground">Last Updated</p>
              <p className="text-sm font-semibold">{formatDate(referral.updated_at)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm ring-1 ring-border/60">
          <CardContent className="flex items-center gap-3 p-4">
            <Paperclip className="h-5 w-5 text-primary" />
            <div>
              <p className="text-[11px] font-semibold uppercase text-muted-foreground">Attachments</p>
              <p className="text-sm font-semibold">{attachments.length} file(s)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Clinical Overview */}
          <Card className="border-0 shadow-sm ring-1 ring-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                    Clinical Overview
                  </p>
                  <CardTitle className="mt-1 text-sm font-semibold text-muted-foreground">
                    Clinical Summary
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 border-t border-dashed border-border/60 pt-4 text-sm">
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Clinical Summary
                </p>
                <p className="leading-relaxed text-muted-foreground">
                  {referral.referral_form?.clinical_summary || primaryDiagnosis}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Patient History
                  </p>
                  <p className="leading-relaxed text-muted-foreground">
                    {referral.referral_form?.patient_history || referral.referral_form?.reason_of_referral || "Not provided."}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Physical Examination Findings
                  </p>
                  <p className="leading-relaxed text-muted-foreground">
                    {referral.referral_form?.physical_examination_findings || "No examination findings recorded."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {referral.emergency_detail?.emergency_justification && (
            <Card className="border-0 bg-rose-50 shadow-sm ring-1 ring-rose-100">
              <CardHeader className="flex flex-row items-center gap-3 pb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-700">
                    Emergency Justification
                  </p>
                  <CardTitle className="mt-1 text-sm text-rose-950">
                    Immediate care required
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="border-t border-dashed border-rose-200 pt-4 text-sm text-rose-950">
                {referral.emergency_detail.emergency_justification}
              </CardContent>
            </Card>
          )}

          {/* Diagnoses */}
          <Card className="border-0 shadow-sm ring-1 ring-border/60">
            <CardHeader className="flex flex-row items-center gap-3 pb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Stethoscope className="h-4 w-4" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                Diagnoses
              </p>
            </CardHeader>
            <CardContent className="space-y-3 border-t border-dashed border-border/60 pt-4">
              {diagnoses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No diagnoses recorded.</p>
              ) : (
                diagnoses.map((diagnosis) => (
                  <div
                    key={diagnosis.id}
                    className="rounded-xl border border-border/60 bg-muted/20 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">
                          {diagnosis.code_info?.description || diagnosis.icd_code}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {diagnosis.code_info?.category || "No category"} · ICD {diagnosis.icd_code}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {diagnosis.is_primary && (
                          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                            Primary
                          </span>
                        )}
                        <span className="rounded-full bg-background px-2.5 py-1 text-[11px] font-semibold text-muted-foreground ring-1 ring-border/60">
                          {humanize(diagnosis.diagnosis_certainty)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Vitals */}
          <Card className="border-0 shadow-sm ring-1 ring-border/60">
            <CardHeader className="flex flex-row items-center gap-3 pb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                <HeartPulse className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                  Vitals
                </p>
                <p className="text-xs text-muted-foreground">
                  Recorded {formatDateTime(vital?.recorded_at)}
                </p>
              </div>
            </CardHeader>
            <CardContent className="border-t border-dashed border-border/60 pt-4">
              {!vital ? (
                <p className="text-sm text-muted-foreground">No vitals recorded.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    ["Blood Pressure", `${vital.systolic_bp}/${vital.diastolic_bp}`, "mmHg"],
                    ["Heart Rate", vital.heart_rate, "bpm"],
                    ["SpO2", vital.sp_o2, "%"],
                    ["Temperature", vital.temperature, "°C"],
                    ["Respiratory Rate", vital.respiratory_rate, "/min"],
                    ["GCS Score", vital.gcs_score ?? "N/A", "/15"],
                  ].map(([label, value, unit]) => (
                    <div key={label} className="rounded-xl bg-muted/30 p-3 ring-1 ring-border/50">
                      <p className="text-[11px] font-semibold uppercase text-muted-foreground">
                        {label}
                      </p>
                      <p className="mt-1 text-lg font-bold text-foreground">
                        {value} <span className="text-xs font-medium text-muted-foreground">{unit}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Investigations & Treatments */}
          <Card className="border-0 shadow-sm ring-1 ring-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <FileText className="h-4 w-4" />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                  Investigations & Treatments
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 border-t border-dashed border-border/60 pt-4 text-sm">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Investigation Results
                </p>
                <p className="mt-1 leading-relaxed text-muted-foreground">
                  {referral.referral_form?.investigation_results || "Investigation details not recorded for this referral."}
                </p>
              </div>
              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Treatment Before Referral
                  </p>
                  <p className="mt-1 leading-relaxed text-muted-foreground">
                    {referral.referral_form?.treatment_given_before_referral || "Not specified by referring clinician."}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Medication On Transfer
                  </p>
                  <p className="mt-1 leading-relaxed text-muted-foreground">
                    {referral.referral_form?.medication_on_transfer || "No active medications documented at transfer."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attached Documentation */}
          <Card className="border-0 shadow-sm ring-1 ring-border/60">
            <CardHeader className="flex flex-row items-center gap-2 pb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Paperclip className="h-4 w-4" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                Attached Documentation
              </p>
            </CardHeader>
            <CardContent className="border-t border-dashed border-border/60 pt-4">
              {attachments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-6 text-center">
                  <Paperclip className="mx-auto h-6 w-6 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium text-foreground">No attachments uploaded</p>
                  <p className="text-xs text-muted-foreground">
                    Supporting documents will appear here when available.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {attachments.map((attachment) => {
                    const AttachmentIcon = getAttachmentIcon(attachment);
                    const dimensions =
                      attachment.metadata?.width && attachment.metadata?.height
                        ? ` · ${attachment.metadata.width}x${attachment.metadata.height}`
                        : "";

                    return (
                      <div
                        key={attachment.id}
                        className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                          <AttachmentIcon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {attachment.file_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatBytes(attachment.file_size)} · {humanize(attachment.category)}
                            {dimensions}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {humanize(attachment.verification)} · Uploaded {formatDate(attachment.uploaded_at)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => downloadAttachment(attachment)}
                          className="flex shrink-0 items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                          aria-label={`Download ${attachment.file_name}`}
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reason for Referral */}
          <Card className="border-0 shadow-sm ring-1 ring-border/60">
            <CardHeader className="flex flex-row items-center gap-3 pb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ClipboardList className="h-4 w-4" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                Reason for Referral
              </p>
            </CardHeader>
            <CardContent className="space-y-4 border-t border-dashed border-border/60 pt-4 text-sm">
              <p className="leading-relaxed text-foreground">
                {referral.referral_form?.reason_of_referral || "Reason not provided."}
              </p>
              <div className="grid gap-3 text-xs md:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Category
                  </p>
                  <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-[11px] font-medium text-rose-700 ring-1 ring-rose-100">
                    {referral.referral_form?.reason_for_referral_category ||
                      targetDepartmentName ||
                      "General referral"}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Condition
                  </p>
                  <p className="text-sm font-medium capitalize">
                    {humanize(referral.referral_form?.condition_at_referral)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Mode of Transport
                  </p>
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    {humanize(referral.referral_form?.mode_of_transport)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4 lg:space-y-5">
          {/* Accompanying person */}
          <Card className="border-0 shadow-sm ring-1 ring-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Accompanying Person
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium text-foreground">{referral.referral_form?.accompanying_person_name || "Not provided."}</p>
              <p className="flex items-center gap-2 text-xs text-primary">
                <Phone className="h-3 w-3" />
                {referral.referral_form?.accompanying_person_phone || "No phone recorded"}
              </p>
            </CardContent>
          </Card>

          {/* Patient information (dark card) */}
          <Card className="overflow-hidden rounded-xl border-0 bg-slate-900 text-slate-50 shadow-md">
            <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Patient Information
              </p>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-700/80 text-slate-400">
                <User className="h-5 w-5" strokeWidth={1.5} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-0 text-xs">
              <div>
                <p className="text-lg font-bold tracking-tight text-white">
                  {patientName}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  DOB: {formatDate(referral.patient?.date_of_birth)} ({referral.patient ? calculateAge(referral.patient.date_of_birth, referral.created_at) : "-"} yrs)
                </p>
              </div>
              <div className="space-y-0 border-t border-slate-700/80 pt-3">
                <div className="flex items-center justify-between py-2.5 border-b border-slate-700/80">
                  <span className="text-slate-400">Gender</span>
                  <span className="font-medium text-white capitalize">
                    {referral.patient?.sex || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2.5 border-b border-slate-700/80">
                  <span className="text-slate-400">Phone</span>
                  <span className="font-medium text-white">{referral.patient?.phone_number || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-slate-400">SMS Allowed</span>
                  <span className="font-medium text-white">{referral.patient?.allow_sms ? "Yes" : "No"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Referring hospital */}
          <Card className="border-0 shadow-sm ring-1 ring-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Building2 className="h-4 w-4" />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Referring From
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{senderHospitalName}</p>
              <p className="text-xs text-muted-foreground">
                Receiving Hospital:{" "}
                <span className="font-medium text-foreground">{targetHospitalName}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Referred to Dept: {targetDepartmentName}
              </p>
              <p className="text-xs text-muted-foreground">
                Referring Doctor:{" "}
                <span className="font-medium">
                  {referringDoctorName}
                </span>
              </p>
            </CardContent>
          </Card>

          {/* System log (using comments) */}
          <Card className="border-0 shadow-sm ring-1 ring-border/60">
            <CardHeader className="pb-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                System Log
              </p>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {!Array.isArray(referral.comments) || referral.comments.length === 0 ? (
                <p className="text-muted-foreground">
                  No system activity recorded yet.
                </p>
              ) : (
                referral.comments.map((c) => (
                  <div
                    key={c.id}
                    className="border-l border-dashed border-border/70 pl-3"
                  >
                    <p className="font-medium text-foreground">
                      {c.author}{" "}
                      <span className="text-[11px] font-normal text-muted-foreground">
                        ({ROLE_LABELS[c.role] || c.role})
                        </span>
                    </p>
                    <p className="text-muted-foreground">{c.text}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReferralDetail;
