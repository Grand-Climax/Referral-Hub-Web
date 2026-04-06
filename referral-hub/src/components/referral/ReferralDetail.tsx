'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, FileText, Building2, Paperclip, Download, ImageIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Referral, ROLE_LABELS, SeverityLevel } from "@/types/referral";
import { StatusBadge } from "../StatusBadge";
import { PriorityIndicator } from "../PriorityIndicator";
import { useRouter } from "next/navigation";
import { useGetReferralByIdQuery } from "@/features/referral/referralApi";

const ReferralDetail = ({id}: {id: string}) => {
  const router = useRouter();
  const { data: referral, isLoading, error } = useGetReferralByIdQuery(id);

  console.log(referral);
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

  const calculateAge = (dobString: string) => {
    if (!dobString) return "N/A";
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return "N/A";
    const ageDifMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
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
            <span>›</span>
            <span className="text-foreground">{referral.id}</span>
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
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Submitted on {new Date(referral.created_at).toLocaleString()} • ID:{" "}
                <span className="font-mono text-foreground">{referral.id}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm">
                Print Details
              </Button>
              <Button size="sm" className="bg-primary text-primary-foreground">
                Export to PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Status banner */}
      <Card className="border-0 bg-amber-50 text-amber-900 shadow-none ring-1 ring-amber-100">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em]">
                Status: {referral.status}
              </p>
              <p className="text-xs text-amber-800">
                This referral is currently being assessed by the receiving
                clinical team at Hospital ID: {referral.target_hospital_id}.
              </p>
            </div>
          </div>
          <div className="text-[11px] font-medium text-amber-800">
            Estimated response: 24–48h
          </div>
        </CardContent>
      </Card>

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
                    {vital 
                      ? `BP ${vital.systolic_bp}/${vital.diastolic_bp}, HR ${vital.heart_rate} bpm, O₂ Sat ${vital.sp_o2}% on room air, Temp ${vital.temperature}°C.` 
                      : (referral.referral_form?.physical_examination_findings || "No vitals or findings recorded.")}
                  </p>
                </div>
              </div>
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
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* PDF */}
                <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 ring-1 ring-rose-100">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">Clinical_Summary.pdf</p>
                    <p className="text-xs text-muted-foreground">2.4 MB</p>
                  </div>
                  <button
                    type="button"
                    className="flex items-center justify-center shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
                {/* Image */}
                <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">Lab_Results.png</p>
                    <p className="text-xs text-muted-foreground">1.8 MB</p>
                  </div>
                  <button
                    type="button"
                    className="flex items-center justify-center shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reason for Referral */}
          <Card className="border-0 shadow-sm ring-1 ring-border/60">
            <CardHeader className="pb-4">
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
                    {referral.referral_form?.reason_for_referral_category || referral.target_dept_id || "General referral"}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Condition
                  </p>
                  <p className="text-sm font-medium capitalize">
                    {referral.status.toLowerCase()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Mode of Transport
                  </p>
                  <p className="text-sm font-medium">
                    {referral.referral_form?.mode_of_transport || "Private vehicle"}
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
              <p className="text-xs text-primary">{referral.referral_form?.accompanying_person_phone || ""}</p>
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
                  {referral.patient ? `${referral.patient.first_name} ${referral.patient.middle_name || ''} ${referral.patient.last_name}` : "Unknown Patient"}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  DOB: {referral.patient?.date_of_birth} ({referral.patient ? calculateAge(referral.patient.date_of_birth) : '-'} yrs)
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
                  <span className="text-slate-400">Patient ID</span>
                  <span className="font-mono font-medium text-white truncate max-w-[120px]">
                    {referral.patient_id}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-slate-400">Phone</span>
                  <span className="font-medium text-white">{referral.patient?.phone_number || "N/A"}</span>
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
              <p className="font-medium">Hospital ID: {referral.sender_hospital_id}</p>
              <p className="text-xs text-muted-foreground">
                Referred to Dept: {referral.target_dept_id}
              </p>
              <p className="text-xs text-muted-foreground">
                Referring Doc ID:{" "}
                <span className="font-medium">
                  {referral.referring_doctor_id || "Not recorded"}
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
