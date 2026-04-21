'use client'

import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Search,
  ArrowLeft,
  Clock,
  User,
  FileText,
  Activity,
  Paperclip,
  Plus,
  Send,
  AlertCircle,
  Stethoscope,
  ChevronRight,
  ChevronLeft,
  Upload,
  X,
  ClipboardList,
  Truck,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  useGetReferralsQuery,
  useGetReferralByIdQuery,
  useResubmitReferralMutation,
  useUploadAttachmentMutation,
} from "@/features/referral/referralApi";
import { useGetIcdCodesQuery } from "@/features/reference/icdApi";
import { useGetNetworkedHospitalsQuery } from "@/features/reference/networkedHospitalsApi";
import { useGetDepartmentsQuery } from "@/features/hospitals/hospitalsApi";
import { useGetLiaisonsQuery } from "@/features/reference/liaisonsApi";
import { CreateReferralRequest } from "@/types/referral";
import { Form } from "@/components/ui/form";

/* ─── Reusable enhanced SelectTrigger className ─── */
const selectTriggerCls =
  "h-11 w-full rounded-xl border border-border/70 bg-background px-3 shadow-sm " +
  "transition-colors hover:border-primary/50 focus:ring-2 focus:ring-primary/20 " +
  "data-[placeholder]:text-muted-foreground font-medium";

const ReferralReview = () => {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // ── Data fetching ──
  const { data: referralsData, isLoading: isListLoading } = useGetReferralsQuery({ status: 'NEED_REVISION' });
  const { data: referral, isLoading: isReferralLoading } = useGetReferralByIdQuery(selectedId || "", {
    skip: !selectedId,
  });
  const [resubmitReferral, { isLoading: isResubmitting }] = useResubmitReferralMutation();
  const [uploadAttachment] = useUploadAttachmentMutation();
  const { data: icdCodes = [] } = useGetIcdCodesQuery();
  const { data: networkedHospitals = [], isLoading: isLoadingHospitals } = useGetNetworkedHospitalsQuery();
  const { data: liaisons = [], isLoading: isLoadingLiaisons } = useGetLiaisonsQuery();

  type ReferralFormValues = Partial<CreateReferralRequest>;

  const form = useForm<ReferralFormValues>({
    defaultValues: {
      patient_id: "",
      clinical_summary: "",
      patient_history: "",
      physical_examination_findings: "",
      investigation_results: "",
      reason_of_referral: "",
      reason_for_referral_category: "ROUTINE",
      emergency_detail: { emergency_justification: "" },
      condition_at_referral: "STABLE",
      mode_of_transport: "OTHER",
      accompanying_person_name: "",
      accompanying_person_phone: "",
      target_hospital_id: "",
      target_dept_id: "",
      liaison_officer_id: undefined,
      status: "SUBMITTED",
      vitals: {
        systolic_bp: 120,
        diastolic_bp: 80,
        heart_rate: 80,
        respiratory_rate: 16,
        temperature: 37,
        sp_o2: 98,
        gcs_score: 15,
      },
      diagnoses: [{ diagnosis_certainty: "SUSPECTED", icd_code: "", is_primary: true }],
    },
  });

  const formData = form.watch();

  // Cascading department query
  const { data: departments = [], isLoading: isLoadingDepts } = useGetDepartmentsQuery(
    formData.target_hospital_id || "",
    { skip: !formData.target_hospital_id }
  );

  const hospitalsList = useMemo(() => networkedHospitals || [], [networkedHospitals]);
  const departmentsList = useMemo(() => departments || [], [departments]);

  const returnedReferrals = referralsData?.data ?? [];

  // Auto-select first
  useEffect(() => {
    if (!selectedId && returnedReferrals.length > 0) {
      setSelectedId(returnedReferrals[0].id);
    }
  }, [returnedReferrals, selectedId]);

  // ── Sync form with loaded referral ──
  useEffect(() => {
    if (referral) {
      form.reset({
        patient_id: referral.patient_id || "",
        clinical_summary: referral.referral_form?.clinical_summary || "",
        patient_history: referral.referral_form?.patient_history || "",
        physical_examination_findings: referral.referral_form?.physical_examination_findings || "",
        investigation_results: referral.referral_form?.investigation_results || "",
        reason_of_referral: referral.referral_form?.reason_of_referral || "",
        reason_for_referral_category: (referral.referral_form?.reason_for_referral_category as any) || "ROUTINE",
        emergency_detail: {
          emergency_justification: referral.emergency_detail?.emergency_justification || "",
        },
        condition_at_referral: (referral.referral_form?.condition_at_referral as any) || "STABLE",
        mode_of_transport: (referral.referral_form?.mode_of_transport as any) || "OTHER",
        accompanying_person_name: referral.referral_form?.accompanying_person_name || "",
        accompanying_person_phone: referral.referral_form?.accompanying_person_phone || "",
        target_hospital_id: referral.target_hospital_id || "",
        target_dept_id: referral.target_dept_id || "",
        liaison_officer_id: referral.liaison_officer_id || undefined,
        status: "SUBMITTED",
        vitals: referral.vitals?.[0]
          ? {
              systolic_bp: referral.vitals[0].systolic_bp,
              diastolic_bp: referral.vitals[0].diastolic_bp,
              heart_rate: referral.vitals[0].heart_rate,
              temperature: referral.vitals[0].temperature,
              respiratory_rate: referral.vitals[0].respiratory_rate,
              sp_o2: referral.vitals[0].sp_o2,
              gcs_score: referral.vitals[0].gcs_score ?? 15,
            }
          : {
              systolic_bp: 120,
              diastolic_bp: 80,
              heart_rate: 80,
              respiratory_rate: 16,
              temperature: 37,
              sp_o2: 98,
              gcs_score: 15,
            },
        diagnoses:
          referral.diagnoses?.map((d) => ({
            icd_code: d.icd_code,
            is_primary: d.is_primary,
            diagnosis_certainty: d.diagnosis_certainty,
          })) || [{ diagnosis_certainty: "SUSPECTED" as const, icd_code: "", is_primary: true }],
      });
      setAttachedFiles([]);
    }
  }, [referral, form]);

  // ── Helpers mirrored from CreateReferral ──
  const handleInputChange = (field: string, value: any) => {
    if (field.includes("vitals.")) {
      const vitalField = field.split(".")[1];
      form.setValue(`vitals.${vitalField}` as any, value, { shouldDirty: true });
    } else if (field.includes("emergency_detail.")) {
      form.setValue("emergency_detail.emergency_justification" as any, value, { shouldDirty: true });
    } else {
      form.setValue(field as any, value, { shouldDirty: true });
    }
  };

  const handleDiagnosisChange = (index: number, field: string, value: any) => {
    const newDiagnoses = [...(formData.diagnoses || [])];
    newDiagnoses[index] = { ...newDiagnoses[index], [field]: value };
    form.setValue("diagnoses" as any, newDiagnoses, { shouldDirty: true });
  };

  const addDiagnosis = () => {
    form.setValue(
      "diagnoses" as any,
      [...(formData.diagnoses || []), { diagnosis_certainty: "SUSPECTED", icd_code: "", is_primary: false }] as any,
      { shouldDirty: true }
    );
  };

  const removeDiagnosis = (index: number) => {
    form.setValue("diagnoses" as any, formData.diagnoses?.filter((_, i) => i !== index) as any, { shouldDirty: true });
  };

  const handleFileChange = (files: FileList | null) => {
    if (!files) return;
    setAttachedFiles((prev) => [...prev, ...Array.from(files)]);
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileChange(e.dataTransfer.files);
  };

  const cleanPhone = (p: string | undefined) => {
    if (!p) return undefined;
    if (p.startsWith("+")) return p;
    return `+${p.replace(/\D/g, "")}`;
  };

  // ── Submit ──
  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;

    const vals = form.getValues();

    if (!vals.clinical_summary?.trim()) {
      toast.error("Clinical summary is required.");
      return;
    }
    if (!vals.patient_history?.trim()) {
      toast.error("Patient history is required.");
      return;
    }
    if (!vals.reason_of_referral?.trim()) {
      toast.error("Reason of referral is required.");
      return;
    }
    if (!vals.target_hospital_id) {
      toast.error("Please select a receiving hospital.");
      return;
    }
    if (!vals.target_dept_id) {
      toast.error("Please select a target department.");
      return;
    }

    const payload: CreateReferralRequest = {
      patient_id: vals.patient_id || referral?.patient_id || "",
      clinical_summary: vals.clinical_summary || "",
      patient_history: vals.patient_history || "",
      physical_examination_findings: vals.physical_examination_findings || undefined,
      investigation_results: vals.investigation_results || undefined,
      reason_for_referral_category: vals.reason_for_referral_category as any,
      reason_of_referral: vals.reason_of_referral || "",
      condition_at_referral: vals.condition_at_referral as any,
      status: "SUBMITTED",
      mode_of_transport: vals.mode_of_transport as any,
      accompanying_person_name: vals.accompanying_person_name || undefined,
      accompanying_person_phone: cleanPhone(vals.accompanying_person_phone) || undefined,
      target_hospital_id: vals.target_hospital_id || "",
      target_dept_id: vals.target_dept_id || "",
      liaison_officer_id: vals.liaison_officer_id || undefined,
      vitals: vals.vitals as any,
      diagnoses: (vals.diagnoses || []) as any,
      emergency_detail:
        vals.reason_for_referral_category === "EMERGENCY"
          ? { emergency_justification: vals.emergency_detail?.emergency_justification || "" }
          : undefined,
    };

    // Clean optional empties
    if (!payload.accompanying_person_phone) delete (payload as any).accompanying_person_phone;
    if (!payload.liaison_officer_id) delete (payload as any).liaison_officer_id;
    if (!payload.investigation_results) delete (payload as any).investigation_results;
    if (!payload.physical_examination_findings) delete (payload as any).physical_examination_findings;
    if (payload.reason_for_referral_category !== "EMERGENCY") delete (payload as any).emergency_detail;

    try {
      await resubmitReferral({ id: selectedId, body: payload }).unwrap();
      toast.success("Referral resubmitted successfully!", {
        description: "Your referral has been sent back for review.",
      });
      router.push("/referring-doctor");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to resubmit referral.");
    }
  };

  // ── Loading ──
  if (isListLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* ═══════════ Header ═══════════ */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Referral Action Center</h1>
            <p className="text-muted-foreground">Review and update returned referrals for resubmission.</p>
          </div>
        </div>

        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search referrals, patients, or status..."
            className="pl-10 h-11 rounded-xl bg-muted/50 border-border/50 focus:bg-background transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ═══════════ Returned Referral Cards Strip ═══════════ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Returned Referrals ({returnedReferrals.length})
          </h2>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-border/50">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-border/50">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {returnedReferrals.length === 0 ? (
          <Card className="border-dashed border-2 border-border/50">
            <CardContent className="p-10 text-center text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No returned referrals at this time.</p>
              <p className="text-sm mt-1">All your referrals are progressing normally.</p>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-4 pb-4 px-1">
              {returnedReferrals.map((r) => (
                <Card
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className={`w-[340px] shrink-0 cursor-pointer overflow-hidden transition-all duration-500 relative group ${
                    selectedId === r.id
                      ? "border-primary/50 shadow-xl shadow-primary/10 -translate-y-1"
                      : "border-border/40 hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5"
                  }`}
                >
                  {/* Selected Indicator - Accent Bar */}
                  <div 
                    className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-500 ${
                      selectedId === r.id ? "bg-primary shadow-[2px_0_10px_rgba(var(--primary),0.5)]" : "bg-muted group-hover:bg-primary/30"
                    }`} 
                  />
                  
                  <CardContent className="p-5 pl-7">
                    <div className="flex items-start justify-between gap-3 mb-5">
                      <div className="space-y-1 min-w-0">
                        <h3 className={`font-bold tracking-tight truncate transition-colors ${
                          selectedId === r.id ? "text-primary text-base" : "text-foreground text-sm"
                        }`}>
                          {r.patient_first_name} {r.patient_last_name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground uppercase tracking-widest">
                            #REF-{r.id.slice(0, 8)}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`shrink-0 text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 border-2 ${
                          selectedId === r.id 
                            ? "bg-rose-500 text-white border-rose-500 animate-pulse" 
                            : "bg-rose-50 text-rose-600 border-rose-100"
                        }`}
                      >
                        ACTION REQUIRED
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70">Department</p>
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <div className={`p-1 rounded-md ${selectedId === r.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                            <Stethoscope className="h-3 w-3" />
                          </div>
                          <span className="text-xs font-semibold truncate text-foreground/80">
                            {r.department || "Medical Center"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70">Returned Date</p>
                        <div className="flex items-center gap-1.5">
                          <div className={`p-1 rounded-md ${selectedId === r.id ? "bg-amber-50 text-amber-600" : "bg-muted text-muted-foreground"}`}>
                            <Clock className="h-3 w-3" />
                          </div>
                          <span className="text-xs font-semibold text-foreground/80">
                            {new Date(r.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  {/* Gradient Glow for Selected State */}
                  {selectedId === r.id && (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
                  )}
                </Card>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </div>

      {/* ═══════════ Main Content ═══════════ */}
      {selectedId && (
        <Form {...form}>
        <form onSubmit={handleResubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
          <div className="space-y-8">
            {/* ─── Feedback Banner ─── */}
            <Card className="border-0 shadow-lg shadow-rose-500/5 bg-rose-50/30 ring-1 ring-rose-100 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-white shadow-lg shadow-rose-500/20">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-bold text-rose-950">Liaison / Specialist Feedback</h3>
                    <blockquote className="text-sm text-rose-900 leading-relaxed italic relative">
                      <span className="text-4xl absolute -left-4 -top-2 opacity-20 font-serif">&ldquo;</span>
                      {referral?.comments?.[referral.comments.length - 1]?.text ||
                        "The referral requires additional clinical data or clarification before it can be processed further. Please review the missing information and resubmit."}
                    </blockquote>
                    <div className="flex items-center gap-2">
                      <div className="h-px w-6 bg-rose-300" />
                      <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
                        — {referral?.comments?.[referral.comments.length - 1]?.author || "INTAKE SPECIALIST"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ─── Patient Demographics (read-only) ─── */}
            <Card className="border-0 shadow-sm ring-1 ring-border/50 rounded-2xl overflow-hidden bg-background">
              <CardHeader className="border-b border-dashed border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-base font-bold text-foreground">Patient Demographics</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full Name</p>
                    <p className="text-sm font-bold text-foreground">
                      {referral?.patient?.first_name} {referral?.patient?.middle_name || ""}{" "}
                      {referral?.patient?.last_name}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Date of Birth
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {referral?.patient?.date_of_birth
                        ? new Date(referral.patient.date_of_birth).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      National ID
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {referral?.patient?.national_id_enc || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Sex</p>
                    <p className="text-sm font-bold text-foreground capitalize">
                      {referral?.patient?.sex || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Phone</p>
                    <p className="text-sm font-bold text-foreground">
                      {referral?.patient?.phone_number || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Home Region
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {referral?.patient?.home_region || "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ─── 1. Clinical Data ─── */}
            <Card className="border-0 shadow-sm ring-1 ring-border/50 rounded-2xl overflow-hidden bg-background">
              <CardHeader className="border-b border-dashed border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Stethoscope className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-base font-bold text-foreground">1. Clinical Data</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label>
                      Clinical Summary <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      placeholder="Brief clinical overview..."
                      rows={4}
                      {...form.register('clinical_summary')}
                      className="resize-none rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Patient History <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      placeholder="Relevant past medical history..."
                      rows={4}
                      {...form.register('patient_history')}
                      className="resize-none rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Physical Examination Findings</Label>
                    <Textarea
                      placeholder="Findings from physical exam..."
                      rows={4}
                      {...form.register('physical_examination_findings')}
                      className="resize-none rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Investigation Results</Label>
                    <Textarea
                      placeholder="Lab results, imaging, etc..."
                      rows={4}
                      {...form.register('investigation_results')}
                      className="resize-none rounded-xl"
                    />
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* ─── 2. Vital Signs ─── */}
            <Card className="border-0 shadow-sm ring-1 ring-border/50 rounded-2xl overflow-hidden bg-background">
              <CardHeader className="border-b border-dashed border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Activity className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-base font-bold text-foreground">2. Vital Signs</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Systolic BP (mmHg)</Label>
                    <Input
                      type="number"
                      value={formData.vitals?.systolic_bp}
                      onChange={(e) => handleInputChange("vitals.systolic_bp", Number(e.target.value))}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Diastolic BP (mmHg)</Label>
                    <Input
                      type="number"
                      value={formData.vitals?.diastolic_bp}
                      onChange={(e) => handleInputChange("vitals.diastolic_bp", Number(e.target.value))}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Heart Rate (bpm)</Label>
                    <Input
                      type="number"
                      value={formData.vitals?.heart_rate}
                      onChange={(e) => handleInputChange("vitals.heart_rate", Number(e.target.value))}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Temp (°C)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.vitals?.temperature}
                      onChange={(e) => handleInputChange("vitals.temperature", Number(e.target.value))}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Resp. Rate (bpm)</Label>
                    <Input
                      type="number"
                      value={formData.vitals?.respiratory_rate}
                      onChange={(e) => handleInputChange("vitals.respiratory_rate", Number(e.target.value))}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SpO2 (%)</Label>
                    <Input
                      type="number"
                      value={formData.vitals?.sp_o2}
                      onChange={(e) => handleInputChange("vitals.sp_o2", Number(e.target.value))}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>GCS Score (3-15)</Label>
                    <Input
                      type="number"
                      min="3"
                      max="15"
                      value={formData.vitals?.gcs_score}
                      onChange={(e) => handleInputChange("vitals.gcs_score", Number(e.target.value))}
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ─── 3. Diagnoses ─── */}
            <Card className="border-0 shadow-sm ring-1 ring-border/50 rounded-2xl overflow-hidden bg-background">
              <CardHeader className="flex flex-row items-center justify-between border-b border-dashed border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ClipboardList className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-base font-bold text-foreground">
                    3. Diagnoses <span className="text-destructive">*</span>
                  </CardTitle>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addDiagnosis} className="h-8 rounded-lg gap-1">
                  <Plus className="h-3 w-3" />
                  Add Diagnosis
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {formData.diagnoses?.map((diag, idx) => (
                    <div key={idx} className="flex flex-wrap items-end gap-3 p-3 rounded-xl border bg-muted/20">
                      <div className="flex-1 min-w-[200px] space-y-2">
                        <Label className="text-xs">ICD-10 Code</Label>
                        <Select value={diag.icd_code} onValueChange={(v) => handleDiagnosisChange(idx, "icd_code", v)}>
                          <SelectTrigger className="h-9 text-sm rounded-lg">
                            <SelectValue
                              placeholder={idx === 0 ? "Select primary ICD-10 code" : "Select ICD-10 code"}
                            />
                          </SelectTrigger>
                          <SelectContent className="max-h-64">
                            {icdCodes.map((code, codeIdx) => (
                              <SelectItem key={`${code.code}-${codeIdx}`} value={code.code}>
                                {code.code} — {code.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-[140px] space-y-2">
                        <Label className="text-xs">Certainty</Label>
                        <Select
                          value={diag.diagnosis_certainty}
                          onValueChange={(v) => handleDiagnosisChange(idx, "diagnosis_certainty", v)}
                        >
                          <SelectTrigger className="h-9 text-sm rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SUSPECTED">Suspected</SelectItem>
                            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          id={`primary-${idx}`}
                          checked={diag.is_primary}
                          onChange={(e) => handleDiagnosisChange(idx, "is_primary", e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary scale-50"
                        />
                        <Label htmlFor={`primary-${idx}`} className="text-xs cursor-pointer">
                          Primary
                        </Label>
                      </div>
                      {formData.diagnoses!.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeDiagnosis(idx)}
                          className="h-9 w-9 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ─── 4. Referral Details ─── */}
            <Card className="border-0 shadow-sm ring-1 ring-border/50 rounded-2xl overflow-hidden bg-background">
              <CardHeader className="border-b border-dashed border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-base font-bold text-foreground">4. Referral Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label>
                      Reason of Referral <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      placeholder="Main reason for referring..."
                      rows={3}
                      {...form.register('reason_of_referral')}
                      className="resize-none rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Category <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      onValueChange={(v) => handleInputChange("reason_for_referral_category", v)}
                      value={formData.reason_for_referral_category}
                    >
                      <SelectTrigger className={selectTriggerCls}>
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="EMERGENCY">Emergency</SelectItem>
                        <SelectItem value="ROUTINE">Routine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.reason_for_referral_category === "EMERGENCY" && (
                    <div className="space-y-2 md:col-span-2">
                      <Label>
                        Emergency Justification <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        placeholder="Why is this an emergency?..."
                        rows={2}
                        value={formData.emergency_detail?.emergency_justification}
                        onChange={(e) =>
                          handleInputChange("emergency_detail.emergency_justification", e.target.value)
                        }
                        className="resize-none rounded-xl border-destructive/50 focus:ring-destructive/20"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>
                      Condition <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      onValueChange={(v) => handleInputChange("condition_at_referral", v)}
                      value={formData.condition_at_referral}
                    >
                      <SelectTrigger className={selectTriggerCls}>
                        <SelectValue placeholder="Condition" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {["STABLE", "UNSTABLE", "CRITICAL", "IMPROVING"].map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Mode of Transport <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      onValueChange={(v) => handleInputChange("mode_of_transport", v)}
                      value={formData.mode_of_transport}
                    >
                      <SelectTrigger className={selectTriggerCls}>
                        <SelectValue placeholder="Transport" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="AMBULANCE">Ambulance</SelectItem>
                        <SelectItem value="PRIVATE">Private Vehicle</SelectItem>
                        <SelectItem value="HOSPITAL_TRANSFER">Hospital Transfer</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Accompanying Person</Label>
                    <Input
                      placeholder="Name"
                      {...form.register('accompanying_person_name')}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Accompanying Phone</Label>
                    <Input
                      placeholder="+251 ..."
                      {...form.register('accompanying_person_phone')}
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ─── 5. Destination Selection ─── */}
            <Card className="border-0 shadow-sm ring-1 ring-border/50 rounded-2xl overflow-hidden bg-background">
              <CardHeader className="border-b border-dashed border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Truck className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-base font-bold text-foreground">5. Destination Selection</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      Receiving Hospital <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      onValueChange={(v) => handleInputChange("target_hospital_id", v)}
                      value={formData.target_hospital_id}
                    >
                      <SelectTrigger className={selectTriggerCls}>
                        <SelectValue
                          placeholder={isLoadingHospitals ? "Loading hospitals..." : "Select hospital"}
                        />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-lg">
                        {isLoadingHospitals ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">Loading hospitals...</div>
                        ) : hospitalsList.length > 0 ? (
                          hospitalsList.map((h, hIdx) => (
                            <SelectItem key={`${h.id}-${hIdx}`} value={h.id}>
                              {h.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-4 text-center text-sm text-muted-foreground">No hospitals found</div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Target Department <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      onValueChange={(v) => handleInputChange("target_dept_id", v)}
                      value={formData.target_dept_id}
                      disabled={!formData.target_hospital_id || isLoadingDepts}
                    >
                      <SelectTrigger className={selectTriggerCls}>
                        <SelectValue
                          placeholder={isLoadingDepts ? "Loading departments..." : "Select department"}
                        />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-lg">
                        {isLoadingDepts ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            Loading departments...
                          </div>
                        ) : departmentsList.length > 0 ? (
                          departmentsList.map((d, dIdx) => (
                            <SelectItem key={`${d.id}-${dIdx}`} value={d.id}>
                              {d.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            No departments available
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Liaison Officer (Optional)</Label>
                    <Select
                      onValueChange={(v) => handleInputChange("liaison_officer_id", v)}
                      value={formData.liaison_officer_id || ""}
                    >
                      <SelectTrigger className={selectTriggerCls}>
                        <SelectValue
                          placeholder={isLoadingLiaisons ? "Loading liaisons..." : "Select liaison officer"}
                        />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-lg">
                        {isLoadingLiaisons ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">Loading liaisons...</div>
                        ) : liaisons.length > 0 ? (
                          liaisons.map((liaison, liaisonIdx) => (
                            <SelectItem key={`${liaison.id}-${liaisonIdx}`} value={liaison.id}>
                              {[liaison.first_name, liaison.last_name].filter(Boolean).join(" ") ||
                                liaison.email ||
                                liaison.id}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-4 text-center text-sm text-muted-foreground">No liaisons found</div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ─── 6. Attachments ─── */}
            <Card className="border-0 shadow-sm ring-1 ring-border/50 rounded-2xl overflow-hidden bg-background">
              <CardHeader className="border-b border-dashed border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Paperclip className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-base font-bold text-foreground">6. Attachments (Optional)</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div
                  className={`relative rounded-xl border-2 border-dashed p-8 transition-colors ${
                    isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/20"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="mb-4 rounded-full bg-primary/10 p-3 text-primary">
                      <Upload className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="mt-1 text-xs text-muted-foreground">PDF, PNG, JPG or DICOM (max. 10MB each)</p>
                    <input
                      type="file"
                      className="absolute inset-0 cursor-pointer opacity-0"
                      multiple
                      onChange={(e) => handleFileChange(e.target.files)}
                    />
                  </div>
                </div>

                {attachedFiles.length > 0 && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {attachedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-xl border bg-background p-3 shadow-sm"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="truncate text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ═══════════ Right Sidebar ═══════════ */}
          <div className="space-y-6">
            <Card className="border-0 shadow-xl bg-background ring-1 ring-border/50 sticky top-4">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      Editing Draft
                    </span>
                  </div>

                  <div className="space-y-3">
                    <Button
                      type="submit"
                      disabled={isResubmitting}
                      className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isResubmitting ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Resubmit Referral
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="pt-6 border-t border-dashed border-border/60">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
                    Submission Summary
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Hospital</span>
                      <span className="font-bold text-foreground truncate ml-2 max-w-[160px]">
                        {hospitalsList.find((h) => h.id === formData.target_hospital_id)?.name || "Not selected"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Department</span>
                      <span className="font-bold text-foreground truncate ml-2 max-w-[160px]">
                        {departmentsList.find((d) => d.id === formData.target_dept_id)?.name || "Not selected"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Category</span>
                      <span className="font-bold text-amber-600">
                        {formData.reason_for_referral_category || "ROUTINE"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Transport</span>
                      <span className="font-bold text-foreground">{formData.mode_of_transport || "OTHER"}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Diagnoses</span>
                      <span className="font-bold text-foreground">{formData.diagnoses?.length || 0} entry(s)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Attachments</span>
                      <span className="font-bold text-foreground">{attachedFiles.length} file(s)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-muted/30 ring-1 ring-border/50">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background border border-border/50">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-foreground">Important Note</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">
                    Resubmitting will reset the liaison review process. Ensure all requested changes are present before
                    submitting.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </form>
        </Form>
      )}
    </div>
  );
};

export default ReferralReview;
