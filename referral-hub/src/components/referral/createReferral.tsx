'use client'
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
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

import PatientCreationStep from "./PatientCreationStep";

// Redux & API
import { useCreateReferralMutation } from "@/features/referral/referralApi";
import { useGetDepartmentsQuery } from "@/features/hospitals/hospitalsApi";
import { CreateReferralRequest } from "@/types/referral";
import { useGetCurrentUserQuery } from "@/features/auth/authApi";
import { useLazyLookupPatientQuery, useCreatePatientMutation } from "@/features/patients/patientsApi";
import { useGetIcdCodesQuery } from "@/features/reference/icdApi";
import { useGetLiaisonsQuery } from "@/features/reference/liaisonsApi";
import { useGetNetworkedHospitalsQuery } from "@/features/reference/networkedHospitalsApi";
import type { PatientCreationFormFields } from "@/types/patient";
import { Form } from "@/components/ui/form";

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
  const [showPatientCreate, setShowPatientCreate] = useState(false);
  const [patientLookupTried, setPatientLookupTried] = useState(false);

  // Redux & API hooks
  const { data: user, isLoading: isUserLoading } = useGetCurrentUserQuery();
  const [createReferral, { isLoading: isSubmitting }] = useCreateReferralMutation();
  const { data: networkedHospitals = [], isLoading: isLoadingHospitals } = useGetNetworkedHospitalsQuery();
  const [lookupPatient, { isFetching: isLookingUpPatient }] = useLazyLookupPatientQuery();
  const [createPatient, { isLoading: isCreatingPatient }] = useCreatePatientMutation();
  const { data: icdCodes = [] } = useGetIcdCodesQuery();
  const { data: liaisons = [], isLoading: isLoadingLiaisons } = useGetLiaisonsQuery();

  type ReferralFormValues = Partial<CreateReferralRequest>;

  // Referral form state (matches backend referral payload fields)
  const referralForm = useForm<ReferralFormValues>({
    defaultValues: {
      patient_id: "",
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
      diagnoses: [
        {
          diagnosis_certainty: "SUSPECTED",
          icd_code: "",
          is_primary: true,
        },
      ],
    },
  });

  // Patient creation form state (only used inside PatientCreationStep)
  const patientForm = useForm<PatientCreationFormFields>({
    defaultValues: {
      first_name: "",
      middle_name: "",
      last_name: "",
      date_of_birth: "",
      sex: "male",
      phone_number: "",
      home_region: "",
      national_id_enc: "",
      // Keep optional fields so RHF registration is stable
      national_id_hash: undefined,
    },
  });

  const referralData = referralForm.watch();
  const nationalIdEnc = patientForm.watch("national_id_enc") || "";

  const { data: departments = [], isLoading: isLoadingDepts } = useGetDepartmentsQuery(
    referralData.target_hospital_id || "",
    { skip: !referralData.target_hospital_id }
  );

  const hospitalsList = useMemo(() => networkedHospitals || [], [networkedHospitals]);
  const departmentsList = useMemo(() => departments || [], [departments]);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes("vitals.")) {
      const vitalField = field.split(".")[1];
      referralForm.setValue(`vitals.${vitalField}` as any, value, { shouldDirty: true });
    } else if (field.includes("emergency_detail.")) {
      referralForm.setValue(
        "emergency_detail.emergency_justification" as any,
        value,
        { shouldDirty: true }
      );
    } else {
      referralForm.setValue(field as any, value, { shouldDirty: true });
    }
  };

  const handleDiagnosisChange = (index: number, field: string, value: any) => {
    const newDiagnoses = [...(referralData.diagnoses || [])];
    newDiagnoses[index] = { ...newDiagnoses[index], [field]: value };
    referralForm.setValue("diagnoses" as any, newDiagnoses, { shouldDirty: true });
  };

  const addDiagnosis = () => {
    referralForm.setValue(
      "diagnoses" as any,
      [
        ...(referralData.diagnoses || []),
        { diagnosis_certainty: "SUSPECTED", icd_code: "", is_primary: false },
      ] as any,
      { shouldDirty: true }
    );
  };

  const removeDiagnosis = (index: number) => {
    referralForm.setValue(
      "diagnoses" as any,
      referralData.diagnoses?.filter((_, i) => i !== index) as any,
      { shouldDirty: true }
    );
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

  const handlePatientLookup = async () => {
    const national_id = (nationalIdEnc || "").trim();
    setPatientLookupTried(true);
    setShowPatientCreate(false);
    referralForm.setValue("patient_id" as any, "" as any, { shouldDirty: true });

    if (!national_id) {
      toast.error("National ID is required to search for the patient.");
      return;
    }

    try {
      const lookedUp = await lookupPatient({ national_id }).unwrap();
      const patientId = lookedUp.id;

      if (!patientId) {
        toast.error("Patient lookup succeeded but no patient id was returned.");
        return;
      }

      referralForm.setValue("patient_id" as any, patientId as any, { shouldDirty: true });
      setShowPatientCreate(false);
      setStep(2);
      toast.success("Patient linked successfully.");
    } catch (err: any) {
      if (err?.status === 404 || err?.originalStatus === 404) {
        setShowPatientCreate(true);
        patientForm.setValue("national_id_enc", national_id, { shouldDirty: false });
        return;
      }
      console.error("Patient lookup failed:", err);
      toast.error(err?.data?.message || "Failed to look up patient.");
    }
  };

  const handlePatientCreate = async () => {
    const values = patientForm.getValues();
    const national_id = (values.national_id_enc || "").trim();

    if (!national_id) {
      toast.error("National ID is required to create the patient.");
      return;
    }

    const requiredFields: Array<keyof PatientCreationFormFields> = [
      "first_name",
      "last_name",
      "date_of_birth",
      "sex",
      "home_region",
      "phone_number",
    ];

    for (const field of requiredFields) {
      const val = (values as any)[field];
      if (!val || String(val).trim() === "") {
        toast.error(`Please fill ${field.replace("_", " ")}.`);
        return;
      }
    }

    const patientPayload = {
      first_name: values.first_name as string,
      middle_name: values.middle_name || undefined,
      last_name: values.last_name as string,
      date_of_birth: values.date_of_birth as string,
      sex: values.sex as "male" | "female",
      home_region: values.home_region as string,
      phone_number: cleanPhone(values.phone_number) || (values.phone_number as string),
      national_id,
    };

    try {
      const created = await createPatient(patientPayload).unwrap();
      const patientId = created.id;

      if (!patientId) {
        toast.error("Patient creation succeeded but no patient id was returned.");
        return;
      }

      referralForm.setValue("patient_id" as any, patientId as any, { shouldDirty: true });
      setShowPatientCreate(false);
      setStep(2);
      toast.success("Patient created and linked successfully.");
    } catch (err: any) {
      console.error("Patient creation failed:", err);
      toast.error(err?.data?.message || "Failed to create patient.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to submit a referral.");
      return;
    }

    try {
      const patient_id = referralData.patient_id;
      if (!patient_id) {
        toast.error("Please select or create a patient first (Step 1).");
        return;
      }

      const payload: CreateReferralRequest = {
        patient_id,
        doctor_id: user.id || (user as any).ID || (user as any).doctor_id,
        hospital_id: user.hospital_id || (user as any).HospitalID || (user as any).hospital_id,

        clinical_summary: referralData.clinical_summary || "",
        patient_history: referralData.patient_history || "",
        physical_examination_findings: referralData.physical_examination_findings || undefined,
        investigation_results: referralData.investigation_results || undefined,
        treatment_given_before_referral: referralData.treatment_given_before_referral || undefined,
        medication_on_transfer: referralData.medication_on_transfer || undefined,

        reason_for_referral_category: referralData.reason_for_referral_category as any,
        reason_of_referral: referralData.reason_of_referral || "",
        condition_at_referral: referralData.condition_at_referral as any,
        status: referralData.status as any,

        mode_of_transport: referralData.mode_of_transport as any,
        accompanying_person_name: referralData.accompanying_person_name || undefined,
        accompanying_person_phone: cleanPhone(referralData.accompanying_person_phone) || undefined,

        target_hospital_id: referralData.target_hospital_id || "",
        target_dept_id: referralData.target_dept_id || "",
        liaison_officer_id: referralData.liaison_officer_id || undefined,

        vitals: referralData.vitals as any,
        diagnoses: (referralData.diagnoses || []) as any,

        emergency_detail:
          referralData.reason_for_referral_category === "EMERGENCY"
            ? {
                emergency_justification: referralData.emergency_detail?.emergency_justification || "",
              }
            : undefined,
      };

      // Clean up optional/empty values before sending
      if (!payload.accompanying_person_phone) delete (payload as any).accompanying_person_phone;
      if (!payload.liaison_officer_id) delete (payload as any).liaison_officer_id;
      if (!payload.investigation_results) delete (payload as any).investigation_results;
      if (!payload.physical_examination_findings)
        delete (payload as any).physical_examination_findings;
      if (!payload.treatment_given_before_referral)
        delete (payload as any).treatment_given_before_referral;
      if (!payload.medication_on_transfer) delete (payload as any).medication_on_transfer;
      if (payload.reason_for_referral_category !== "EMERGENCY") delete (payload as any).emergency_detail;

      // patient_id is already validated above

      // console.log("Submitting referral payload:", JSON.stringify(payload, null, 2));
      await createReferral(payload).unwrap();

      toast.success("Referral submitted successfully!", {
        description: "Your referral has been sent for admin approval.",
      });
      router.push("/referring-doctor");
    } catch (err: any) {
      console.error("Referral creation failed:", err);
      toast.error(err.data?.message || "Failed to submit referral. Please try again.");
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (step === 1) {
      if (!referralData.patient_id) {
        toast.error("Select or create a patient first (Step 1).");
        return;
      }
    }
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

      <Form {...referralForm}>
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
                    1. Patient Lookup / Registration
                  </h3>
                </div>

                <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
                  <div className="space-y-2">
                    <Label>
                      National ID <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      placeholder="Enter national ID"
                      value={nationalIdEnc}
                      onChange={(e) =>
                        patientForm.setValue("national_id_enc", e.target.value, { shouldDirty: true })
                      }
                      className="h-11 rounded-xl bg-background border-border/70"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      onClick={handlePatientLookup}
                      disabled={isLookingUpPatient || isCreatingPatient}
                    >
                      {isLookingUpPatient ? "Searching..." : "Search Patient"}
                    </Button>
                  </div>

                  {patientLookupTried && !showPatientCreate && referralData.patient_id && (
                    <p className="text-sm text-muted-foreground">
                      Selected patient id:{" "}
                      <span className="font-medium">{referralData.patient_id}</span>
                    </p>
                  )}
                </div>

                {showPatientCreate && (
                  <div className="space-y-4">
                    <div className="rounded-xl border bg-destructive/5 p-4 text-sm">
                      Patient not found. Please create the patient to continue.
                    </div>

                    <Form {...patientForm}>
                      <PatientCreationStep />
                    </Form>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={handlePatientCreate}
                        disabled={isCreatingPatient}
                      >
                        {isCreatingPatient ? "Creating..." : "Create Patient"}
                      </Button>
                    </div>
                  </div>
                )}
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
                        value={referralData.clinical_summary}
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
                        value={referralData.patient_history}
                        onChange={(e) => handleInputChange("patient_history", e.target.value)}
                        className="resize-none rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Physical Examination Findings</Label>
                      <Textarea
                        placeholder="Findings from physical exam..."
                        rows={4}
                        value={referralData.physical_examination_findings}
                        onChange={(e) => handleInputChange("physical_examination_findings", e.target.value)}
                        className="resize-none rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Investigation Results</Label>
                      <Textarea
                        placeholder="Lab results, imaging, etc..."
                        rows={4}
                        value={referralData.investigation_results}
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
                        value={referralData.vitals?.systolic_bp}
                        onChange={(e) => handleInputChange("vitals.systolic_bp", Number(e.target.value))}
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Diastolic BP (mmHg)</Label>
                      <Input 
                        type="number" 
                        value={referralData.vitals?.diastolic_bp}
                        onChange={(e) => handleInputChange("vitals.diastolic_bp", Number(e.target.value))}
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Heart Rate (bpm)</Label>
                      <Input 
                        type="number" 
                        value={referralData.vitals?.heart_rate}
                        onChange={(e) => handleInputChange("vitals.heart_rate", Number(e.target.value))}
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Temp (°C)</Label>
                      <Input 
                        type="number" 
                        step="0.1"
                        value={referralData.vitals?.temperature}
                        onChange={(e) => handleInputChange("vitals.temperature", Number(e.target.value))}
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Resp. Rate (bpm)</Label>
                      <Input 
                        type="number" 
                        value={referralData.vitals?.respiratory_rate}
                        onChange={(e) => handleInputChange("vitals.respiratory_rate", Number(e.target.value))}
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>SpO2 (%)</Label>
                      <Input 
                        type="number" 
                        value={referralData.vitals?.sp_o2}
                        onChange={(e) => handleInputChange("vitals.sp_o2", Number(e.target.value))}
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>GCS Score (3-15)</Label>
                      <Input 
                        type="number" 
                        min="3" max="15"
                        value={referralData.vitals?.gcs_score}
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
                    {referralData.diagnoses?.map((diag, idx) => (
                      <div key={idx} className="flex flex-wrap items-end gap-3 p-3 rounded-xl border bg-muted/20">
                        <div className="flex-1 min-w-[200px] space-y-2">
                          <Label className="text-xs">ICD-10 Code</Label>
                          <Select
                            value={diag.icd_code}
                            onValueChange={(v) => handleDiagnosisChange(idx, "icd_code", v)}
                          >
                            <SelectTrigger className="h-9 text-sm rounded-lg">
                              <SelectValue placeholder={idx === 0 ? "Select primary ICD-10 code" : "Select ICD-10 code"} />
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
                          <Label htmlFor={`primary-${idx}`} className="text-xs cursor-pointer">Primary</Label>
                        </div>
                        {referralData.diagnoses!.length > 1 && (
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
                        value={referralData.reason_of_referral}
                        onChange={(e) => handleInputChange("reason_of_referral", e.target.value)}
                        className="resize-none rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category <span className="text-destructive">*</span></Label>
                      <Select onValueChange={(v) => handleInputChange("reason_for_referral_category", v)} value={referralData.reason_for_referral_category}>
                        <SelectTrigger className={selectTriggerCls}>
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="EMERGENCY">Emergency</SelectItem>
                          <SelectItem value="ROUTINE">Routine</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {referralData.reason_for_referral_category === "EMERGENCY" && (
                      <div className="space-y-2 md:col-span-2">
                        <Label>Emergency Justification <span className="text-destructive">*</span></Label>
                        <Textarea
                          placeholder="Why is this an emergency?..."
                          rows={2}
                          required
                          value={referralData.emergency_detail?.emergency_justification}
                          onChange={(e) => handleInputChange("emergency_detail.emergency_justification", e.target.value)}
                          className="resize-none rounded-xl border-destructive/50 focus:ring-destructive/20"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Condition <span className="text-destructive">*</span></Label>
                      <Select onValueChange={(v) => handleInputChange("condition_at_referral", v)} value={referralData.condition_at_referral}>
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
                      <Select onValueChange={(v) => handleInputChange("mode_of_transport", v)} value={referralData.mode_of_transport}>
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
                        value={referralData.accompanying_person_name}
                        onChange={(e) => handleInputChange("accompanying_person_name", e.target.value)}
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Accompanying Phone</Label>
                      <Input 
                        placeholder="+251 ..." 
                        value={referralData.accompanying_person_phone}
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
                      value={referralData.target_hospital_id}
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
                          hospitalsList.map((h, hIdx) => (
                            <SelectItem key={`${h.id}-${hIdx}`} value={h.id}>
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
                      value={referralData.target_dept_id}
                      disabled={!referralData.target_hospital_id || isLoadingDepts}
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
                    <Label>Liaison Officer ID (Optional)</Label>
                    <Select
                      onValueChange={(v) => handleInputChange("liaison_officer_id", v)}
                      value={referralData.liaison_officer_id || ""}
                    >
                      <SelectTrigger className={selectTriggerCls}>
                        <SelectValue placeholder={isLoadingLiaisons ? "Loading liaisons..." : "Select liaison officer"} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-lg">
                        {isLoadingLiaisons ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            Loading liaisons...
                          </div>
                        ) : liaisons.length > 0 ? (
                          liaisons.map((liaison, liaisonIdx) => (
                            <SelectItem key={`${liaison.id}-${liaisonIdx}`} value={liaison.id}>
                              {[liaison.first_name, liaison.last_name].filter(Boolean).join(" ") || liaison.email || liaison.id}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            No liaisons found
                          </div>
                        )}
                      </SelectContent>
                    </Select>
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
                    <span className="font-medium">{referralData.patient_id || "Not linked"}</span>
                    
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-medium flex items-center gap-2">
                      {referralData.reason_for_referral_category}
                      {referralData.reason_for_referral_category === "EMERGENCY" && (
                        <span className="bg-destructive/10 text-destructive text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">
                          Urgent
                        </span>
                      )}
                    </span>

                    <span className="text-muted-foreground">Transport:</span>
                    <span className="font-medium">{referralData.mode_of_transport}</span>

                    <span className="text-muted-foreground">Hospital:</span>
                    <span className="font-medium">
                      {hospitalsList.find(h => h.id === referralData.target_hospital_id)?.name || "Not selected"}
                    </span>

                    <span className="text-muted-foreground">Department:</span>
                    <span className="font-medium">
                      {departmentsList.find(d => d.id === referralData.target_dept_id)?.name || "Not selected"}
                    </span>

                    <span className="text-muted-foreground">Diagnoses:</span>
                    <span className="font-medium">
                      {referralData.diagnoses?.length || 0} entry(s)
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
                  disabled={isSubmitting || isLookingUpPatient || isCreatingPatient}
                >
                  {isSubmitting
                    ? "Submitting..."
                    : "Submit Referral"}
                  {!isSubmitting && <ArrowRight className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>
        </Card>
        </form>
      </Form>
    </div>
  );
};

export default CreateReferral;
