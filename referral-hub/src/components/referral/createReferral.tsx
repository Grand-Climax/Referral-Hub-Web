'use client'
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardList,
  AlertCircle,
  Truck,
  Upload,
  X,
  FileText,
  Paperclip,
  Activity,
  Stethoscope,
} from "lucide-react";

// Redux & API
import { useAppSelector } from "@/lib/store/hooks";
import { useCreateReferralMutation } from "@/features/referral/referralApi";
import { useGetHospitalsQuery, useGetDepartmentsQuery } from "@/features/hospitals/hospitalsApi";
import { CreateReferralRequest } from "@/types/referral";
import { useGetCurrentUserQuery } from "@/features/auth/authApi";

const STEPS = [
  { id: 1, label: "Patient Info" },
  { id: 2, label: "Clinical & Vitals" },
  { id: 3, label: "Department" },
  { id: 4, label: "Review" },
];

const STEP_LABELS: Record<number, string> = {
  1: "Patient Information",
  2: "Clinical & Referral Data",
  3: "Department Selection",
  4: "Review & Submit",
};

const REFERRAL_CATEGORIES = [
  "Urgent - Oncology",
  "Urgent - Cardiology",
  "Urgent - General",
  "Routine - Follow-up",
  "Routine - Consultation",
];

const CONDITION_OPTIONS = ["Stable", "Unstable", "Critical", "Improving"];

const TRANSPORT_MODES = ["Private Vehicle", "Ambulance", "Hospital Transfer", "Other"];

/* ─── Reusable enhanced SelectTrigger className ─── */
const selectTriggerCls =
  "h-11 w-full rounded-xl border border-border/70 bg-background px-3 shadow-sm " +
  "transition-colors hover:border-primary/50 focus:ring-2 focus:ring-primary/20 " +
  "data-[placeholder]:text-muted-foreground font-medium";

const CreateReferral = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // Redux & API hooks
  const { data: user, isLoading: isUserLoading } = useGetCurrentUserQuery();
  const [createReferral, { isLoading: isSubmitting }] = useCreateReferralMutation();
  const { data: hospitals = [], isLoading: isLoadingHospitals } = useGetHospitalsQuery();

  // Form State
  const [formData, setFormData] = useState<Partial<CreateReferralRequest>>({
    first_name: "",
    middle_name: "",
    last_name: "",
    date_of_birth: "",
    sex: "male",
    phone_number: "",
    home_region: "",
    national_id_enc: "",
    national_id_hash: "",
    clinical_summary: "",
    patient_history: "",
    physical_examination_findings: "",
    investigation_results: "",
    treatment_given_before_referral: "",
    medication_on_transfer: "",
    reason_of_referral: "",
    reason_for_referral_category: "ROUTINE",
    emergency_detail: {
      emergency_justification: "",
    },
    condition_at_referral: "STABLE",
    mode_of_transport: "OTHER",
    accompanying_person_name: "",
    accompanying_person_phone: "",
    target_hospital_id: "",
    target_dept_id: "",
    liaison_officer_id: "",
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
    diagnoses: [
      {
        diagnosis_certainty: "SUSPECTED",
        icd_code: "",
        is_primary: true,
      },
    ],
  });

  const { data: departments = [], isLoading: isLoadingDepts } = useGetDepartmentsQuery(
    formData.target_hospital_id || "",
    { skip: !formData.target_hospital_id }
  );

  const hospitalsList = useMemo(() => hospitals || [], [hospitals]);
  const departmentsList = useMemo(() => departments || [], [departments]);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes("vitals.")) {
      const vitalField = field.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        vitals: { ...prev.vitals, [vitalField]: value } as any,
      }));
    } else if (field.includes("emergency_detail.")) {
      setFormData((prev) => ({
        ...prev,
        emergency_detail: { ...prev.emergency_detail, emergency_justification: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleDiagnosisChange = (index: number, field: string, value: any) => {
    const newDiagnoses = [...(formData.diagnoses || [])];
    newDiagnoses[index] = { ...newDiagnoses[index], [field]: value };
    setFormData((prev) => ({ ...prev, diagnoses: newDiagnoses }));
  };

  const addDiagnosis = () => {
    setFormData((prev) => ({
      ...prev,
      diagnoses: [
        ...(prev.diagnoses || []),
        { diagnosis_certainty: "SUSPECTED", icd_code: "", is_primary: false },
      ],
    }));
  };

  const removeDiagnosis = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      diagnoses: prev.diagnoses?.filter((_, i) => i !== index),
    }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to submit a referral.");
      return;
    }

    try {
      const payload = {
        ...(formData as CreateReferralRequest),
        doctor_id: user.id || (user as any).ID || (user as any).doctor_id,
        hospital_id: user.hospital_id || (user as any).HospitalID || (user as any).hospital_id,
      };

      // Clean phone numbers and formatting
      const cleanPhone = (p: string) => {
        if (!p) return undefined;
        if (p.startsWith("+")) return p;
        return `+${p.replace(/\D/g, "")}`;
      };

      payload.phone_number = cleanPhone(payload.phone_number) || "";
      if (payload.accompanying_person_phone) {
        payload.accompanying_person_phone = cleanPhone(payload.accompanying_person_phone);
      } else {
        delete payload.accompanying_person_phone;
      }

      // Cleanup emergency detail if not emergency
      if (payload.reason_for_referral_category !== "EMERGENCY") {
        delete payload.emergency_detail;
      }

      // Remove empty optional strings
      if (!payload.middle_name) delete payload.middle_name;
      if (!payload.national_id_enc) delete payload.national_id_enc;
      if (!payload.national_id_hash) delete payload.national_id_hash;
      if (!payload.liaison_officer_id) delete payload.liaison_officer_id;
      if (!payload.investigation_results) delete payload.investigation_results;
      if (!payload.physical_examination_findings) delete payload.physical_examination_findings;

      console.log("Submitting referral payload:", JSON.stringify(payload, null, 2));
      await createReferral(payload).unwrap();

      toast.success("Referral submitted successfully!", {
        description: "Your referral has been sent for admin approval.",
      });
      router.push("/referrals");
    } catch (err: any) {
      console.error("Referral creation failed:", err);
      toast.error(err.data?.message || "Failed to submit referral. Please try again.");
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (step < 4) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="mx-auto space-y-6 py-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            Detailed Referral Submission
          </h1>
          <p className="text-sm text-muted-foreground">
            Step {step} of 4: {STEP_LABELS[step]}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-0">
        <Card className="overflow-hidden rounded-xl border-0 bg-muted/30 shadow-sm ring-1 ring-border/50">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Detailed Referral Submission
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Step {step} of 4: {STEP_LABELS[step]}
                </p>
              </div>
            </div>

            {/* Progress stepper */}
            <div className="mb-10 flex items-start">
              {STEPS.map((s, index) => {
                const isCompleted = s.id < step;
                const isCurrent = s.id === step;
                const lineLeftActive = step >= s.id;
                const lineRightActive = step > s.id;
                return (
                  <div key={s.id} className="flex flex-1 flex-col items-center">
                    <div className="flex w-full items-center">
                      {index > 0 && (
                        <div
                          className={`h-0.5 flex-1 transition-colors ${
                            lineLeftActive ? "bg-primary" : "bg-muted"
                          }`}
                        />
                      )}
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                          isCompleted
                            ? "bg-primary text-primary-foreground"
                            : isCurrent
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <span className="text-xs">
                            {String(s.id).padStart(2, "0")}
                          </span>
                        )}
                      </div>
                      {index < STEPS.length - 1 && (
                        <div
                          className={`h-0.5 flex-1 transition-colors ${
                            lineRightActive ? "bg-primary" : "bg-muted"
                          }`}
                        />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        isCompleted || isCurrent
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Step 1: Patient Information */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ClipboardList className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    1. Patient Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>First Name <span className="text-destructive">*</span></Label>
                    <Input 
                      placeholder="First name" 
                      required 
                      value={formData.first_name}
                      onChange={(e) => handleInputChange("first_name", e.target.value)}
                      className="h-11 rounded-xl bg-background border-border/70" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Middle Name</Label>
                    <Input 
                      placeholder="Middle name" 
                      value={formData.middle_name}
                      onChange={(e) => handleInputChange("middle_name", e.target.value)}
                      className="h-11 rounded-xl bg-background border-border/70" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name <span className="text-destructive">*</span></Label>
                    <Input 
                      placeholder="Last name" 
                      required 
                      value={formData.last_name}
                      onChange={(e) => handleInputChange("last_name", e.target.value)}
                      className="h-11 rounded-xl bg-background border-border/70" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Birth <span className="text-destructive">*</span></Label>
                    <Input 
                      type="date" 
                      required 
                      value={formData.date_of_birth}
                      onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                      className="h-11 rounded-xl bg-background border-border/70" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sex <span className="text-destructive">*</span></Label>
                    <Select onValueChange={(v) => handleInputChange("sex", v)} value={formData.sex}>
                      <SelectTrigger className={selectTriggerCls}>
                        <SelectValue placeholder="Select sex" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-lg">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Home Region <span className="text-destructive">*</span></Label>
                    <Input 
                      placeholder="Region" 
                      required 
                      value={formData.home_region}
                      onChange={(e) => handleInputChange("home_region", e.target.value)}
                      className="h-11 rounded-xl bg-background border-border/70" 
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-1">
                    <Label>Phone <span className="text-destructive">*</span></Label>
                    <Input 
                      placeholder="+251 ..." 
                      required
                      value={formData.phone_number}
                      onChange={(e) => handleInputChange("phone_number", e.target.value)}
                      className="h-11 rounded-xl bg-background border-border/70" 
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>National ID (Optional)</Label>
                    <Input 
                      placeholder="ID number" 
                      value={formData.national_id_enc}
                      onChange={(e) => handleInputChange("national_id_enc", e.target.value)}
                      className="h-11 rounded-xl bg-background border-border/70" 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Clinical & Vitals */}
            {step === 2 && (
              <div className="space-y-10">
                {/* 1. Clinical Data */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Stethoscope className="h-4 w-4" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">
                      1. Clinical Data
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label>Clinical Summary <span className="text-destructive">*</span></Label>
                      <Textarea
                        placeholder="Brief clinical overview..."
                        rows={4}
                        required
                        value={formData.clinical_summary}
                        onChange={(e) => handleInputChange("clinical_summary", e.target.value)}
                        className="resize-none rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Patient History <span className="text-destructive">*</span></Label>
                      <Textarea
                        placeholder="Relevant past medical history..."
                        rows={4}
                        required
                        value={formData.patient_history}
                        onChange={(e) => handleInputChange("patient_history", e.target.value)}
                        className="resize-none rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Physical Examination Findings</Label>
                      <Textarea
                        placeholder="Findings from physical exam..."
                        rows={4}
                        value={formData.physical_examination_findings}
                        onChange={(e) => handleInputChange("physical_examination_findings", e.target.value)}
                        className="resize-none rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Investigation Results</Label>
                      <Textarea
                        placeholder="Lab results, imaging, etc..."
                        rows={4}
                        value={formData.investigation_results}
                        onChange={(e) => handleInputChange("investigation_results", e.target.value)}
                        className="resize-none rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Vital Signs */}
                <div className="space-y-4 border-t pt-8">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Activity className="h-4 w-4" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">
                      2. Vital Signs
                    </h3>
                  </div>

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
                        min="3" max="15"
                        value={formData.vitals?.gcs_score}
                        onChange={(e) => handleInputChange("vitals.gcs_score", Number(e.target.value))}
                        className="h-11 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Diagnoses */}
                <div className="space-y-4 border-t pt-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <ClipboardList className="h-4 w-4" />
                      </div>
                      <h3 className="text-base font-semibold text-foreground">
                        3. Diagnoses <span className="text-destructive">*</span>
                      </h3>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={addDiagnosis}
                      className="h-8 rounded-lg gap-1"
                    >
                      Add Diagnosis
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {formData.diagnoses?.map((diag, idx) => (
                      <div key={idx} className="flex flex-wrap items-end gap-3 p-3 rounded-xl border bg-muted/20">
                        <div className="flex-1 min-w-[150px] space-y-2">
                          <Label className="text-xs">ICD Code / Diagnosis</Label>
                          <Input 
                            placeholder="e.g. I21.9" 
                            required={idx === 0}
                            value={diag.icd_code}
                            onChange={(e) => handleDiagnosisChange(idx, "icd_code", e.target.value)}
                            className="h-9 text-sm rounded-lg"
                          />
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
                          <Label htmlFor={`primary-${idx}`} className="text-xs cursor-pointer">Primary</Label>
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
                </div>

                {/* 4. Referral Details */}
                <div className="space-y-4 border-t pt-8">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">
                      3. Referral Details
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label>Reason of Referral <span className="text-destructive">*</span></Label>
                      <Textarea
                        placeholder="Main reason for referring..."
                        rows={3}
                        required
                        value={formData.reason_of_referral}
                        onChange={(e) => handleInputChange("reason_of_referral", e.target.value)}
                        className="resize-none rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category <span className="text-destructive">*</span></Label>
                      <Select onValueChange={(v) => handleInputChange("reason_for_referral_category", v)} value={formData.reason_for_referral_category}>
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
                        <Label>Emergency Justification <span className="text-destructive">*</span></Label>
                        <Textarea
                          placeholder="Why is this an emergency?..."
                          rows={2}
                          required
                          value={formData.emergency_detail?.emergency_justification}
                          onChange={(e) => handleInputChange("emergency_detail.emergency_justification", e.target.value)}
                          className="resize-none rounded-xl border-destructive/50 focus:ring-destructive/20"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Condition <span className="text-destructive">*</span></Label>
                      <Select onValueChange={(v) => handleInputChange("condition_at_referral", v)} value={formData.condition_at_referral}>
                        <SelectTrigger className={selectTriggerCls}>
                          <SelectValue placeholder="Condition" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {["STABLE", "UNSTABLE", "CRITICAL", "IMPROVING"].map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Mode of Transport <span className="text-destructive">*</span></Label>
                      <Select onValueChange={(v) => handleInputChange("mode_of_transport", v)} value={formData.mode_of_transport}>
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
                        value={formData.accompanying_person_name}
                        onChange={(e) => handleInputChange("accompanying_person_name", e.target.value)}
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Accompanying Phone</Label>
                      <Input 
                        placeholder="+251 ..." 
                        value={formData.accompanying_person_phone}
                        onChange={(e) => handleInputChange("accompanying_person_phone", e.target.value)}
                        className="h-11 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Attachments */}
                <div className="space-y-4 border-t pt-8">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Paperclip className="h-4 w-4" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">
                      4. Attachments (Optional)
                    </h3>
                  </div>
                  
                  <div 
                    className={`relative rounded-xl border-2 border-dashed p-8 transition-colors ${
                      isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/20"
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="mb-4 rounded-full bg-primary/10 p-3 text-primary">
                        <Upload className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-medium">
                        Click to upload or drag and drop
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        PDF, PNG, JPG or DICOM (max. 10MB each)
                      </p>
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
                              <p className="truncate text-sm font-medium">
                                {file.name}
                              </p>
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
                </div>
              </div>
            )}

            {/* Step 3: Department selection */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Activity className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    Destination Selection
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Receiving Hospital <span className="text-destructive">*</span></Label>
                    <Select 
                      onValueChange={(v) => handleInputChange("target_hospital_id", v)} 
                      value={formData.target_hospital_id}
                    >
                      <SelectTrigger className={selectTriggerCls}>
                        <SelectValue placeholder={isLoadingHospitals ? "Loading hospitals..." : "Select hospital"} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-lg">
                        {isLoadingHospitals ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            Loading hospitals...
                          </div>
                        ) : hospitalsList.length > 0 ? (
                          hospitalsList.map((h) => (
                            <SelectItem key={h.id} value={h.id}>
                              {h.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            No hospitals found
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Target Department <span className="text-destructive">*</span></Label>
                    <Select 
                      onValueChange={(v) => handleInputChange("target_dept_id", v)} 
                      value={formData.target_dept_id}
                      disabled={!formData.target_hospital_id || isLoadingDepts}
                    >
                      <SelectTrigger className={selectTriggerCls}>
                        <SelectValue placeholder={isLoadingDepts ? "Loading departments..." : "Select department"} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-lg">
                        {isLoadingDepts ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            Loading departments...
                          </div>
                        ) : departmentsList.length > 0 ? (
                          departmentsList.map((d) => (
                            <SelectItem key={d.ID} value={d.ID}>
                              {d.Name}
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
                    <Label>Liaison Officer ID (Optional)</Label>
                    <Input 
                      placeholder="e.g. LIA-12345" 
                      value={formData.liaison_officer_id}
                      onChange={(e) => handleInputChange("liaison_officer_id", e.target.value)}
                      className="h-11 rounded-xl bg-background border-border/70" 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ClipboardList className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    Review Information
                  </h3>
                </div>
                <div className="rounded-xl border bg-muted/20 p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                    <span className="text-muted-foreground">Patient:</span>
                    <span className="font-medium">{formData.first_name} {formData.middle_name} {formData.last_name}</span>
                    
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-medium flex items-center gap-2">
                      {formData.reason_for_referral_category}
                      {formData.reason_for_referral_category === "EMERGENCY" && (
                        <span className="bg-destructive/10 text-destructive text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">
                          Urgent
                        </span>
                      )}
                    </span>

                    <span className="text-muted-foreground">Transport:</span>
                    <span className="font-medium">{formData.mode_of_transport}</span>

                    <span className="text-muted-foreground">Hospital:</span>
                    <span className="font-medium">
                      {hospitalsList.find(h => h.id === formData.target_hospital_id)?.name || "Not selected"}
                    </span>

                    <span className="text-muted-foreground">Department:</span>
                    <span className="font-medium">
                      {departmentsList.find(d => d.ID === formData.target_dept_id)?.Name || "Not selected"}
                    </span>

                    <span className="text-muted-foreground">Diagnoses:</span>
                    <span className="font-medium">
                      {formData.diagnoses?.length || 0} entry(s)
                    </span>

                    <span className="text-muted-foreground">Attachments:</span>
                    <span className="font-medium">
                      {attachedFiles.length} file(s) attached
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  By submitting, you confirm that all information provided is accurate to the best of your knowledge.
                </p>
              </div>
            )}
          </CardContent>

          {/* Footer actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t bg-muted/20 px-6 py-4 sm:px-8">
            <div>
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrev}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {step < 4 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  className="gap-2 px-8" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Referral"}
                  {!isSubmitting && <ArrowRight className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default CreateReferral;
