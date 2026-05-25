"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, differenceInYears, format } from "date-fns";
import {
  Printer,
  Share2,
  User,
  Activity,
  FileText,
  Download,
  AlertCircle,
  CheckCircle2,
  XCircle,
  CornerUpRight,
  Clock,
  ChevronLeft,
  Stethoscope,
  ClipboardList,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { AcceptReferralDialog } from "./accept-referral-dialog";
import { RejectReferralDialog } from "./reject-referral-dialog";
import { RedirectReferralDialog } from "./redirect-referral-dialog";
import { ReleaseReferralDialog } from "./release-referral-dialog";
import { ChangeDepartmentDialog } from "./change-department-dialog";
import { MlInsightsCard } from "./MlInsightsCard";
import {
  useGetReferralByIdQuery,
  useAcceptReferralMutation,
  useRejectReferralMutation,
  useMarkReferralReadMutation,
  useReleaseReferralMutation,
  useGetRedirectOptionsQuery,
  useRedirectReferralMutation,
  useChangeReferralDepartmentMutation,
} from "@/features/specialist/specialistApi";
import { useGetDepartmentsQuery } from "@/features/hospitals/hospitalsApi";
import { useGetCurrentUserQuery, useGetUserByIdQuery } from "@/features/auth/authApi";
import { ReferralDetailSkeleton } from "@/components/skeletons/ReferralDetailSkeleton";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/apiError";
import { useRouter } from "next/navigation";
import { useMlRunState } from "@/hooks/useMlRunState";

function formatBytes(bytes?: number) {
  if (!bytes || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024)),
  );
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

function humanize(value?: string | null) {
  if (!value) return "—";
  return value
    .toString()
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeId(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

function idsMatch(a?: string | null, b?: string | null) {
  const left = normalizeId(a);
  const right = normalizeId(b);
  return Boolean(left) && Boolean(right) && left === right;
}

async function downloadAttachment(url: string, fileName: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to download file");
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = fileName || "attachment";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
  } catch (error) {
    toast.error("Unable to download attachment.");
  }
}

const ReferralDetail = ({ referralId }: { referralId: string }) => {
  const router = useRouter();
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isRedirectDialogOpen, setIsRedirectDialogOpen] = useState(false);
  const [isReleaseDialogOpen, setIsReleaseDialogOpen] = useState(false);
  const [isChangeDeptDialogOpen, setIsChangeDeptDialogOpen] = useState(false);
  const [referralPollMs, setReferralPollMs] = useState(0);
  const {
    data: referral,
    isLoading,
    isError,
  } = useGetReferralByIdQuery(referralId, {
    pollingInterval: referralPollMs,
  });
  const mlRunState = useMlRunState({
    ml_status: referral?.ml_status,
    ml_run_started_at: referral?.ml_run_started_at,
    ml_successful_rerun_count: referral?.ml_successful_rerun_count,
  });

  useEffect(() => {
    setReferralPollMs(mlRunState.shouldPollReferral ? 3000 : 0);
  }, [mlRunState.shouldPollReferral]);
  const [acceptReferral, { isLoading: isAccepting }] =
    useAcceptReferralMutation();
  const [rejectReferral, { isLoading: isRejecting }] =
    useRejectReferralMutation();
  const [markReferralRead, { isLoading: isMarkingRead }] =
    useMarkReferralReadMutation();
  const [releaseReferral, { isLoading: isReleasing }] =
    useReleaseReferralMutation();
  const [redirectReferral, { isLoading: isRedirecting }] =
    useRedirectReferralMutation();
  const [changeDepartment, { isLoading: isChangingDepartment }] =
    useChangeReferralDepartmentMutation();
  const {
    data: redirectOptions = [],
    isFetching: isFetchingRedirectOptions,
  } = useGetRedirectOptionsQuery(referralId, {
    skip: !referralId,
  });
  const { data: doctor } = useGetUserByIdQuery(
    referral?.referring_doctor_id || "",
    {
      skip: !referral?.referring_doctor_id,
    },
  );
  const { data: assignedSpecialist, isFetching: isFetchingAssignedSpecialist } =
    useGetUserByIdQuery(referral?.specialist_id ?? "", {
      skip: !referral?.specialist_id,
    });
  const { data: currentUser } = useGetCurrentUserQuery();
  // Hospital this specialist belongs to — drives the available
  // departments for the change-department dialog.
  const specialistHospitalId = currentUser?.hospital_id ?? "";
  const {
    data: hospitalDepartments = [],
    isFetching: isFetchingHospitalDepartments,
  } = useGetDepartmentsQuery(specialistHospitalId, {
    skip: !specialistHospitalId,
  });

  const doctorName = doctor
    ? [doctor.first_name, doctor.middle_name, doctor.last_name]
      .filter(Boolean)
      .join(" ")
    : referral?.referring_doctor_id;
  const assignedSpecialistName = assignedSpecialist
    ? [assignedSpecialist.first_name, assignedSpecialist.middle_name, assignedSpecialist.last_name]
      .filter(Boolean)
      .join(" ")
    : null;

  const lastReadKeyRef = useRef<string | null>(null);
  const handleMarkRead = async (status: "FORWARDED" | "REDIRECTED") => {
    const readKey = `${referralId}:${status}`;
    if (lastReadKeyRef.current === readKey) return;
    try {
      lastReadKeyRef.current = readKey;
      await markReferralRead(referralId).unwrap();
      if (status === "FORWARDED") {
        toast.success("Referral marked as read.");
      }
    } catch (error) {
      lastReadKeyRef.current = null;
      toast.error(getApiErrorMessage(error, "Failed to mark referral as read."));
    }
  };

  useEffect(() => {
    const status = referral?.status;
    if (
      (status === "FORWARDED" || status === "REDIRECTED") &&
      lastReadKeyRef.current !== `${referralId}:${status}` &&
      !isMarkingRead
    ) {
      void handleMarkRead(status);
    }
  }, [referral?.status, referralId, isMarkingRead]);

  const handleRelease = async (reason: string) => {
    if (!reason) {
      toast.error("Please provide a reason for releasing this referral.");
      return;
    }

    try {
      await releaseReferral({ id: referralId, reason }).unwrap();
      toast.success("Referral released (unassigned).");
      setIsReleaseDialogOpen(false);
      router.push("/receiving-specialist/referrals");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to release referral."));
    }
  };

  const handleRedirect = async ({
    hospitalId,
    reason,
  }: {
    hospitalId: string;
    reason: string;
  }) => {
    if (!hospitalId) {
      toast.error("Please select a hospital to redirect this referral.");
      return;
    }

    if (!reason) {
      toast.error("Please provide a reason for redirecting this referral.");
      return;
    }

    const selectedHospital = redirectOptions.find(
      (hospital) => hospital.id === hospitalId,
    );
    const departmentId =
      selectedHospital?.department_id ||
      selectedHospital?.target_dept_id ||
      referral?.target_dept_id;

    if (!departmentId) {
      toast.error(
        "No department is available for the selected redirect hospital.",
      );
      return;
    }

    try {
      await redirectReferral({
        id: referralId,
        target_hospital_id: hospitalId,
        department_id: departmentId,
        reason,
      }).unwrap();
      toast.success("Referral redirected successfully.");
      setIsRedirectDialogOpen(false);
      router.push("/receiving-specialist/referrals");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to redirect referral."));
    }
  };

  const handleChangeDepartment = async ({
    departmentId,
  }: {
    departmentId: string;
  }) => {
    if (!departmentId) {
      toast.error("Please select a department.");
      return;
    }
    try {
      await changeDepartment({
        referralId,
        departmentId,
      }).unwrap();
      toast.success("Target department updated.");
      setIsChangeDeptDialogOpen(false);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Failed to change target department."),
      );
    }
  };

  const handleAccept = async () => {
    try {
      await acceptReferral(referralId).unwrap();
      toast.success("Referral accepted successfully.");
      setIsAcceptDialogOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to accept referral."));
    }
  };

  const handleReject = async (reason: string) => {
    if (!reason) {
      toast.error("Please provide a clinical justification for rejection.");
      return;
    }
    try {
      await rejectReferral({
        id: referralId,
        rejection_reason: reason,
      }).unwrap();
      toast.success("Referral rejected successfully.");
      setIsRejectDialogOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to reject referral."));
    }
  };

  if (isLoading) {
    return <ReferralDetailSkeleton />;
  }

  if (isError || !referral) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <AlertCircle className="h-12 w-12 text-rose-500 opacity-50" />
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground">
            Referral not found
          </h2>
          <p className="text-muted-foreground">
            The referral might have been moved or doesn't exist.
          </p>
        </div>
        <Link href="/receiving-specialist">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const patient = referral.patient;
  const latestVitals = referral.vitals?.[0];
  const diagnoses = referral.diagnoses ?? [];
  const attachments = referral.attachments ?? [];
  const referralForm = referral.referral_form;
  const patientFullName =
    [patient?.first_name, patient?.middle_name, patient?.last_name]
      .filter(Boolean)
      .join(" ") || "Unknown Patient";
  const dob = patient?.date_of_birth ? new Date(patient.date_of_birth) : null;
  const age = dob ? differenceInYears(new Date(), dob) : null;
  const dobLabel = dob ? dob.toLocaleDateString() : "Unknown";
  const sexLabel = patient?.sex
    ? patient.sex.charAt(0).toUpperCase() + patient.sex.slice(1)
    : "Unknown";
  const bpLabel = latestVitals
    ? `${latestVitals.systolic_bp}/${latestVitals.diastolic_bp}`
    : "N/A";
  const heartRate = latestVitals?.heart_rate;
  const spO2 = latestVitals?.sp_o2;
  const temperature = latestVitals?.temperature;
  const respiratoryRate = latestVitals?.respiratory_rate;
  const gcsScore = latestVitals?.gcs_score;
  const vitalsRecordedAt = latestVitals?.recorded_at
    ? format(new Date(latestVitals.recorded_at), "PPp")
    : null;
  const historyText = referralForm?.patient_history?.trim() || "";
  const examFindings = referralForm?.physical_examination_findings?.trim() || "";
  const investigationResults = referralForm?.investigation_results?.trim() || "";
  const statusKey = String(referral.status);
  const displayStatus =
    statusKey === "PENDING" ? "Pending Review" : humanize(statusKey);
  const canRedirect = statusKey === "UNDER_SPECIALIST_REVIEW";
  const canTakeDecision =
    statusKey === "UNDER_SPECIALIST_REVIEW" || statusKey === "REDIRECTED";
  const assignedToAnotherSpecialist =
    Boolean(referral.specialist_id) &&
    Boolean(currentUser?.id) &&
    !idsMatch(referral.specialist_id, currentUser?.id);
  const canManageReferral = canTakeDecision && !assignedToAnotherSpecialist;
  const isPendingSpecialistRead =
    statusKey === "FORWARDED" || statusKey === "REDIRECTED";
  const createdAtLabel = referral.created_at
    ? format(new Date(referral.created_at), "PPp")
    : "—";
  const updatedAtLabel = referral.updated_at
    ? format(new Date(referral.updated_at), "PPp")
    : null;

  return (
    <div className="mx-auto space-y-6 pb-12">
      {/* Top Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Link
            href="/receiving-specialist"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {patientFullName}
            </h1>
            <Badge
              variant="secondary"
              className="bg-orange-100 text-orange-700 hover:bg-orange-100 uppercase text-xs"
            >
              {displayStatus}
            </Badge>
            {referral.ml_severity_score != null ? (
              <Badge
                variant="outline"
                className={
                  referral.ml_status?.toUpperCase() === "MANUAL"
                    ? "border-amber-300 bg-amber-50 text-amber-800 text-xs"
                    : "border-blue-200 bg-blue-50 text-blue-700 text-xs"
                }
              >
                Severity: {referral.ml_severity_score.toFixed(1)}
                {referral.ml_status?.toUpperCase() === "MANUAL"
                  ? " (Manually Overridden)"
                  : ""}
              </Badge>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mt-2">
            <span className="inline-flex items-center">
              <Clock className="h-4 w-4 mr-1.5" />
              Submitted {formatDistanceToNow(new Date(referral.created_at))} ago
              {doctorName ? ` by ${doctorName}` : ""}
            </span>
            {referral.triage_status ? (
              <Badge
                variant="outline"
                className="border-blue-200 bg-blue-50 text-blue-700 text-[10px] uppercase tracking-wider"
              >
                Triage: {humanize(referral.triage_status)}
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="bg-background">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" className="bg-background">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="xl:col-span-2 space-y-6">
          {/* Patient Information Card */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6 text-lg font-semibold">
                <User className="h-5 w-5 text-blue-600" />
                Patient Information
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    Age / Gender
                  </p>
                  <p className="font-medium">
                    {age ?? "Unknown"} Years / {sexLabel}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    DOB
                  </p>
                  <p className="font-medium">{dobLabel}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    Phone
                  </p>
                  <p className="font-medium">
                    {patient?.phone_number || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    Home Region
                  </p>
                  <p className="font-medium">{patient?.home_region || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clinical Overview Card */}
          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border bg-muted/20">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Activity className="h-5 w-5 text-blue-600" />
                Clinical Overview
              </div>
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                Referral ID: {referral.id}
              </Badge>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              {/* Vitals */}
              <div>
                <div className="flex items-baseline justify-between mb-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Latest Vitals
                  </h3>
                  {vitalsRecordedAt ? (
                    <span className="text-[11px] text-muted-foreground">
                      Recorded {vitalsRecordedAt}
                    </span>
                  ) : null}
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-muted/40 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">BP</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold">{bpLabel}</span>
                      {latestVitals && latestVitals.systolic_bp > 130 && (
                        <span className="text-xs font-medium text-orange-600">
                          Elevated
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">
                      Heart Rate
                    </p>
                    <span className="text-xl font-bold">
                      {heartRate ?? "—"} bpm
                    </span>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">SpO2</p>
                    <span className="text-xl font-bold">
                      {spO2 ?? "—"}%
                    </span>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">Temp</p>
                    <span className="text-xl font-bold">
                      {temperature ?? "—"} &deg;C
                    </span>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">
                      Respiratory Rate
                    </p>
                    <span className="text-xl font-bold">
                      {respiratoryRate ?? "—"} /min
                    </span>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">
                      GCS Score
                    </p>
                    <span className="text-xl font-bold">
                      {gcsScore ?? "—"}
                      <span className="text-xs font-medium text-muted-foreground">
                        {gcsScore != null ? " / 15" : ""}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Reason for Referral */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    Reason for Referral
                  </h3>
                  {referralForm?.reason_for_referral_category ? (
                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase tracking-wider"
                    >
                      {humanize(referralForm.reason_for_referral_category)}
                    </Badge>
                  ) : null}
                  {referralForm?.condition_at_referral ? (
                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase tracking-wider"
                    >
                      Condition:{" "}
                      {humanize(referralForm.condition_at_referral)}
                    </Badge>
                  ) : null}
                  {referralForm?.mode_of_transport ? (
                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase tracking-wider"
                    >
                      Transport: {humanize(referralForm.mode_of_transport)}
                    </Badge>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {referralForm?.reason_of_referral?.trim() ||
                    "No reason provided."}
                </p>
              </div>

              {/* Clinical Summary */}
              {referralForm?.clinical_summary?.trim() ? (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">
                    Clinical Summary
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {referralForm.clinical_summary}
                  </p>
                </div>
              ) : null}

              {/* Diagnoses */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Stethoscope className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Diagnoses
                  </h3>
                </div>
                {diagnoses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No diagnoses recorded.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {diagnoses.map((diagnosis) => (
                      <li
                        key={diagnosis.id}
                        className="flex flex-col gap-1 rounded-lg border border-border bg-background p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-foreground">
                              {diagnosis.icd_code}
                            </span>
                            {diagnosis.is_primary ? (
                              <Badge className="bg-blue-600 hover:bg-blue-600 text-[10px] uppercase tracking-wider">
                                Primary
                              </Badge>
                            ) : null}
                            <Badge
                              variant="outline"
                              className="text-[10px] uppercase tracking-wider"
                            >
                              {humanize(diagnosis.diagnosis_certainty)}
                            </Badge>
                          </div>
                          <p className="text-sm text-foreground">
                            {diagnosis.code_info?.description ?? "—"}
                          </p>
                          {diagnosis.code_info?.category ? (
                            <p className="text-xs text-muted-foreground">
                              {diagnosis.code_info.category}
                            </p>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Patient History */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Relevant Medical History
                </h3>
                {historyText ? (
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {historyText}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No relevant medical history provided.
                  </p>
                )}
              </div>

              {/* Physical Exam */}
              {examFindings ? (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">
                    Physical Examination Findings
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {examFindings}
                  </p>
                </div>
              ) : null}

              {/* Investigation Results */}
              {investigationResults ? (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">
                    Investigation Results
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {investigationResults}
                  </p>
                </div>
              ) : null}

              {/* Attached Documentation */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ClipboardList className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Attached Documentation
                  </h3>
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase tracking-wider"
                  >
                    {attachments.length} file
                    {attachments.length === 1 ? "" : "s"}
                  </Badge>
                </div>
                {attachments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No attachments uploaded.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {attachments.map((attachment) => {
                      const uploadedLabel = attachment.uploaded_at
                        ? format(new Date(attachment.uploaded_at), "PP")
                        : null;
                      return (
                        <div
                          key={attachment.id}
                          className="flex items-center justify-between p-3 border border-border rounded-lg bg-background"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-md shrink-0">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">
                                {attachment.file_name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatBytes(attachment.file_size)}
                                {uploadedLabel
                                  ? ` \u2022 ${uploadedLabel}`
                                  : ""}
                                {attachment.category
                                  ? ` \u2022 ${humanize(attachment.category)}`
                                  : ""}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="shrink-0 text-muted-foreground hover:text-foreground"
                            onClick={() =>
                              downloadAttachment(
                                attachment.storage_path,
                                attachment.file_name,
                              )
                            }
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Side Panels */}
        <div className="space-y-6">
          <MlInsightsCard referralId={referralId} referral={referral} />

          {/* Decision Panel */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-4 border-b border-border bg-muted/20">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <CheckCircle2 className="h-5 w-5 text-slate-700" />
                Decision Panel
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              {isPendingSpecialistRead && (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                  <p className="text-sm font-medium text-blue-600 animate-pulse">
                    {statusKey === "REDIRECTED"
                      ? "Acknowledging redirected referral…"
                      : "Initiating clinical review…"}
                  </p>
                </div>
              )}

              {referral.specialist_id && !isPendingSpecialistRead && (
                <div
                  className={`flex items-start gap-2 rounded-md border p-3 text-xs ${
                    assignedToAnotherSpecialist && canTakeDecision
                      ? "border-amber-200 bg-amber-50 text-amber-800"
                      : "border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                >
                  <Stethoscope className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    <span className="font-semibold">Assigned specialist: </span>
                    {isFetchingAssignedSpecialist
                      ? "Loading…"
                      : assignedSpecialistName ?? "Unknown specialist"}
                    {assignedToAnotherSpecialist && canTakeDecision
                      ? ". Accept, reject, redirect, and release actions are not available to you."
                      : idsMatch(referral.specialist_id, currentUser?.id)
                        ? " (you)"
                        : "."}
                  </span>
                </div>
              )}

              {canManageReferral && !isPendingSpecialistRead && (
                <div className="space-y-3">
                  {!canRedirect && (
                    <div className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700">
                      <Share2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>
                        This referral was already redirected to your hospital
                        and cannot be redirected again. You can accept, reject,
                        or release it.
                      </span>
                    </div>
                  )}

                  <Button
                    type="button"
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold h-11 gap-2"
                    onClick={() => setIsAcceptDialogOpen(true)}
                    disabled={isAccepting}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    Accept Referral
                  </Button>

                  {canRedirect && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                      onClick={() => setIsRedirectDialogOpen(true)}
                      disabled={isRedirecting}
                    >
                      <Share2 className="h-4 w-4" />
                      Redirect Referral
                    </Button>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 gap-2"
                      onClick={() => setIsRejectDialogOpen(true)}
                      disabled={isRejecting}
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2"
                      onClick={() => setIsReleaseDialogOpen(true)}
                      disabled={isReleasing}
                    >
                      <CornerUpRight className="h-4 w-4" />
                      Release
                    </Button>
                  </div>
                </div>
              )}

              {!canTakeDecision && !isPendingSpecialistRead && (
                <div className="flex flex-col items-center justify-center p-8 bg-muted/20 rounded-lg border border-dashed border-border">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Current Status
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-700 hover:bg-orange-100 uppercase text-xs px-4 py-1"
                  >
                    {displayStatus}
                  </Badge>
                  <p className="text-[11px] text-muted-foreground mt-4 text-center">
                    No actions available for this status.
                  </p>
                </div>
              )}

              {/* Change-department is independent of accept/reject/redirect:
                  the target department can be reassigned at any point in the
                  referral's lifecycle. */}
              {!isPendingSpecialistRead && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => setIsChangeDeptDialogOpen(true)}
                  disabled={isChangingDepartment}
                >
                  <Building2 className="h-4 w-4" />
                  Change Department
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Lifecycle Tracking */}
          <div className="p-6">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-center mb-6">
              Referral Lifecycle
            </h3>

            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.75 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-emerald-500 before:via-blue-500 before:to-muted">
              {/* Step 1 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-emerald-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
                <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] pl-3 md:pl-0 md:group-odd:pr-3 md:group-even:pl-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">
                      Referral Submitted
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {createdAtLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <div className="h-2 w-2 bg-white rounded-sm animate-pulse" />
                </div>
                <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] pl-3 md:pl-0 md:group-odd:pr-3 md:group-even:pl-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">
                      {humanize(referral.status) || "Specialist Review"}
                    </span>
                    <span className="text-[10px] text-muted-foreground italic">
                      {updatedAtLabel
                        ? `Last update ${updatedAtLabel}`
                        : "In progress..."}
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-muted shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <div className="h-2 w-2 rounded-full border border-muted-foreground" />
                </div>
                <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] pl-3 md:pl-0 md:group-odd:pr-3 md:group-even:pl-3 opacity-50">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">
                      Patient Notified
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Pending decision
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AcceptReferralDialog
        open={isAcceptDialogOpen}
        onOpenChange={setIsAcceptDialogOpen}
        patientName={patientFullName}
        onConfirm={handleAccept}
        isSubmitting={isAccepting}
      />

      <RejectReferralDialog
        open={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
        onConfirm={handleReject}
        isSubmitting={isRejecting}
      />

      <RedirectReferralDialog
        open={isRedirectDialogOpen}
        onOpenChange={setIsRedirectDialogOpen}
        hospitals={redirectOptions}
        isLoadingHospitals={isFetchingRedirectOptions}
        onConfirm={handleRedirect}
        isSubmitting={isRedirecting}
      />

      <ReleaseReferralDialog
        open={isReleaseDialogOpen}
        onOpenChange={setIsReleaseDialogOpen}
        onConfirm={handleRelease}
        isSubmitting={isReleasing}
      />

      <ChangeDepartmentDialog
        open={isChangeDeptDialogOpen}
        onOpenChange={setIsChangeDeptDialogOpen}
        departments={hospitalDepartments.map((d) => ({
          id: d.id,
          name: d.name,
        }))}
        isLoadingDepartments={isFetchingHospitalDepartments}
        currentDepartmentId={referral.target_dept_id ?? null}
        onConfirm={handleChangeDepartment}
        isSubmitting={isChangingDepartment}
      />
    </div>
  );
};

export default ReferralDetail;