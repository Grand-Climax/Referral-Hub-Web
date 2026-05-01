"use client";

import React from "react";
import { MOCK_REFERRALS } from "@/data/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, differenceInYears } from "date-fns";
import {
  Printer,
  Share2,
  User,
  Activity,
  FileText,
  Download,
  AlertCircle,
  BrainCircuit,
  CheckCircle2,
  XCircle,
  CornerUpRight,
  Clock,
  Plus,
  ChevronLeft,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import {
  useGetReferralByIdQuery,
  useAcceptReferralMutation,
  useRejectReferralMutation,
  useMarkReferralReadMutation,
  useReleaseReferralMutation,
} from "@/features/specialist/specialistApi";
import { useGetUserByIdQuery } from "@/features/auth/authApi";
import { ReferralDetailSkeleton } from "@/components/skeletons/ReferralDetailSkeleton";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

const ReferralDetail = ({ referralId }: { referralId: string }) => {
  const [rejectionReason, setRejectionReason] = useState("");
  const {
    data: referral,
    isLoading,
    isError,
  } = useGetReferralByIdQuery(referralId);
  const [acceptReferral, { isLoading: isAccepting }] =
    useAcceptReferralMutation();
  const [rejectReferral, { isLoading: isRejecting }] =
    useRejectReferralMutation();
  const [markReferralRead, { isLoading: isMarkingRead }] =
    useMarkReferralReadMutation();
  const [releaseReferral, { isLoading: isReleasing }] =
    useReleaseReferralMutation();
  const { data: doctor } = useGetUserByIdQuery(
    referral?.referring_doctor_id || "",
    {
      skip: !referral?.referring_doctor_id,
    },
  );

  const doctorName = doctor
    ? [doctor.first_name, doctor.middle_name, doctor.last_name]
      .filter(Boolean)
      .join(" ")
    : referral?.referring_doctor_id;

  const lastProcessedId = useRef<string | null>(null);
  const handleMarkRead = async () => {
    if (lastProcessedId.current === referralId) return;
    try {
      lastProcessedId.current = referralId;
      await markReferralRead(referralId).unwrap();
      toast.success("Referral marked as read.");
    } catch (error) {
      lastProcessedId.current = null;
      toast.error("Failed to mark referral as read.");
    }
  };

  // console.log("referral status", referral?.status)
  useEffect(() => {
    // Strictly trigger FORWARDED only and only once per referralId
    if (
      referral?.status === "FORWARDED" &&
      lastProcessedId.current !== referralId &&
      !isMarkingRead
    ) {
      handleMarkRead();
    }
  }, [referral?.status, referralId, isMarkingRead]);

  const handleRelease = async () => {
    try {
      await releaseReferral(referralId).unwrap();
      toast.success("Referral released (unassigned).");
    } catch (error) {
      toast.error("Failed to release referral.");
    }
  };

  const handleAccept = async () => {
    try {
      await acceptReferral(referralId).unwrap();
      toast.success("Referral accepted successfully.");
    } catch (error) {
      toast.error("Failed to accept referral.");
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a clinical justification for rejection.");
      return;
    }
    try {
      await rejectReferral({
        id: referralId,
        rejection_reason: rejectionReason,
      }).unwrap();
      toast.success("Referral rejected successfully.");
    } catch (error) {
      toast.error("Failed to reject referral.");
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
  const patientFullName =
    [patient?.first_name, patient?.middle_name, patient?.last_name]
      .filter(Boolean)
      .join(" ") || "Unknown Patient";
  const dob = patient?.date_of_birth ? new Date(patient.date_of_birth) : null;
  const age = dob ? differenceInYears(new Date(), dob) : null;
  const dobLabel = dob ? dob.toLocaleDateString() : "Unknown";
  const bpLabel = latestVitals
    ? `${latestVitals.systolic_bp}/${latestVitals.diastolic_bp}`
    : "N/A";
  const heartRate = latestVitals?.heart_rate;
  const spO2 = latestVitals?.sp_o2;
  const temperature = latestVitals?.temperature;
  const diagnosis =
    referral.diagnoses?.[0]?.code_info?.description ?? "Not specified";
  const clinicalSummary =
    referral.referral_form?.clinical_summary ?? "No summary provided.";
  const historyText =
    referral.referral_form?.patient_history ??
    "No relevant medical history provided.";
  const displayStatus =
    referral.status === "PENDING" ? "Pending Review" : referral.status;
  const severityScore =
    referral.ml_status === "SUCCESS" ? (referral.waiting_hours_weight ?? 0) : 0;

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
          </div>

          <div className="flex items-center text-sm text-muted-foreground mt-2">
            <Clock className="h-4 w-4 mr-1.5" />
            Submitted {formatDistanceToNow(new Date(referral.created_at))} ago
            by {doctorName} (Primary Care)
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
                    {age ?? "Unknown"} Years /{" "}
                    {patient?.sex === "male" ? "Male" : "Female"}
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
                    {patient?.phone_number || "(555) 123-4567"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    Insurance
                  </p>
                  <p className="font-medium">BlueCross Platinum</p>
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
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Latest Vitals (T-0H)
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold">
                        {heartRate ?? "N/A"} bpm
                      </span>
                    </div>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">SpO2</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold">
                        {spO2 ?? "N/A"}%
                      </span>
                    </div>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">Temp</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold">
                        {temperature ?? "N/A"} &deg;F
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reason for Referral */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Reason for Referral
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {referral.referral_form?.reason_of_referral ??
                    "No reason provided."}
                </p>
              </div>

              {/* Relevant Medical History */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Relevant Medical History
                </h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {historyText ? (
                    historyText.split(". ").map((item: string, idx: number) => {
                      if (!item) return null;
                      return (
                        <li key={idx}>
                          {item.trim()}
                          {item.endsWith(".") ? "" : "."}
                        </li>
                      );
                    })
                  ) : (
                    <li>No relevant medical history provided.</li>
                  )}
                </ul>
              </div>

              {/* Attached Documentation */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Attached Documentation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-background">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-md shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          Abdominal_Ultrasound_Report.pdf
                        </p>
                        <p className="text-xs text-muted-foreground">
                          2.4 MB &bull; May 12, 2024
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-foreground"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-background">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-md shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          Blood_Panel_Results_Complete.pdf
                        </p>
                        <p className="text-xs text-muted-foreground">
                          1.1 MB &bull; May 10, 2024
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-foreground"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Side Panels */}
        <div className="space-y-6">
          {/* ML Insights Card */}
          <Card className="border-blue-200 shadow-sm overflow-hidden bg-blue-50/30">
            <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold">
                <BrainCircuit className="h-5 w-5" />
                ML Insights
              </div>
              <Badge
                variant="secondary"
                className="bg-blue-500/30 hover:bg-blue-500/30 text-white border-0 text-[10px] uppercase tracking-wider"
              >
                V2.4 Engine
              </Badge>
            </div>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                    Triage Severity
                  </p>
                  <p className="text-3xl font-black text-blue-600">
                    {severityScore >= 80
                      ? "HIGH"
                      : severityScore >= 50
                        ? "MEDIUM"
                        : "LOW"}
                  </p>
                </div>
                <div className="relative flex items-center justify-center w-16 h-16 rounded-full border-4 border-blue-500 bg-white shadow-sm">
                  <span className="text-xl font-bold text-blue-700">
                    {severityScore}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm mb-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Key Findings
                </div>
                <ul className="text-xs text-slate-600 space-y-2">
                  <li className="flex items-start gap-1.5">
                    <span className="text-red-500 mt-1">&bull;</span>
                    High risk correlation between Ultrasound findings and
                    comorbid Type 2 Diabetes.
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-red-500 mt-1">&bull;</span>
                    Blood panel indicates elevated CRP (12.4 mg/L) suggesting
                    inflammation.
                  </li>
                </ul>
              </div>

              <p className="text-[11px] text-center text-slate-500 font-medium italic">
                AI generated suggestion. Please verify clinically.
              </p>
            </CardContent>
          </Card>

          {/* Decision Panel */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-4 border-b border-border bg-muted/20">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <CheckCircle2 className="h-5 w-5 text-slate-700" />
                Decision Panel
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              {referral?.status === "FORWARDED" && (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                  <p className="text-sm font-medium text-blue-600 animate-pulse">
                    Initiating clinical review...
                  </p>
                </div>
              )}

              {referral.status === "UNDER_SPECIALIST_REVIEW" && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Assign Department
                    </label>
                    <Select
                      defaultValue={referral.target_dept_id.toLowerCase()}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value={referral.target_dept_id.toLowerCase()}
                        >
                          {referral.target_dept_id} (Recommended)
                        </SelectItem>
                        <SelectItem value="general-surgery">
                          General Surgery
                        </SelectItem>
                        <SelectItem value="internal-medicine">
                          Internal Medicine
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold h-11 gap-2"
                    onClick={handleAccept}
                    disabled={isAccepting}
                  >
                    {isAccepting ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5" />
                    )}
                    Accept Referral
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 gap-2"
                      onClick={handleReject}
                      disabled={isRejecting}
                    >
                      {isRejecting ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-rose-600 border-t-transparent" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      Reject
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={handleRelease}
                      disabled={isReleasing}
                    >
                      {isReleasing ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                      ) : (
                        <CornerUpRight className="h-4 w-4" />
                      )}
                      Release
                    </Button>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Reason for Rejection / Release
                    </label>
                    <Textarea
                      placeholder="Provide clinical justification..."
                      className="resize-none h-20 bg-background"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                  </div>
                </>
              )}

              {referral.status !== "FORWARDED" &&
                referral.status !== "UNDER_SPECIALIST_REVIEW" && (
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
                      Today, 09:12 AM
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
                      Specialist Review
                    </span>
                    <span className="text-[10px] text-muted-foreground italic">
                      In progress...
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
    </div>
  );
};

export default ReferralDetail;