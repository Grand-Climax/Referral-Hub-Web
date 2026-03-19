"use client";

import { useState } from "react";
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
import { SPECIALTIES, HOSPITALS } from "@/data/mock";
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
} from "lucide-react";

const STEPS = [
  { id: 1, label: "Patient Info" },
  { id: 2, label: "Clinical Data" },
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Referral submitted successfully!", {
      description: "Your referral has been sent for admin approval.",
    });
    router.push("/referrals");
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
            {/* Header: title + Save Progress */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Detailed Referral Submission
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Step {step} of 4: {STEP_LABELS[step]}
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" className="shrink-0">
                Save Progress
              </Button>
            </div>

            {/* Progress stepper with connecting lines */}
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

            {/* ───────────────────────────────────────────────
                Step 1: Patient Info
            ─────────────────────────────────────────────── */}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name <span className="text-destructive">*</span></Label>
                    <Input placeholder="Patient full name" required className="h-11 rounded-xl bg-background border-border/70 transition-colors hover:border-primary/50 focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div className="space-y-2">
                    <Label>MRN <span className="text-destructive">*</span></Label>
                    <Input placeholder="Medical Record Number" required className="h-11 rounded-xl bg-background border-border/70 transition-colors hover:border-primary/50 focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div className="space-y-2">
                    <Label>Age <span className="text-destructive">*</span></Label>
                    <Input type="number" placeholder="Age" required className="h-11 rounded-xl bg-background border-border/70 transition-colors hover:border-primary/50 focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div className="space-y-2">
                    <Label>Sex <span className="text-destructive">*</span></Label>
                    <Select required>
                      <SelectTrigger className={selectTriggerCls}>
                        <SelectValue placeholder="Select sex" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-lg border-border/70">
                        <SelectItem value="M">Male</SelectItem>
                        <SelectItem value="F">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Phone</Label>
                    <Input placeholder="+1 (555) 000-0000" className="h-11 rounded-xl bg-background border-border/70 transition-colors hover:border-primary/50 focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
              </div>
            )}

            {/* ───────────────────────────────────────────────
                Step 2: Clinical & Referral Data
            ─────────────────────────────────────────────── */}
            {step === 2 && (
              <div className="space-y-10">

                {/* 1. Clinical Data */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <ClipboardList className="h-4 w-4" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">
                      1. Clinical Data
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-foreground">
                        Clinical Summary <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        placeholder="Brief clinical overview..."
                        rows={5}
                        className="resize-y rounded-xl border border-border/70 bg-background shadow-sm transition-colors hover:border-primary/50 focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">
                        Patient History <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        placeholder="Relevant past medical history..."
                        rows={5}
                        className="resize-y rounded-xl border border-border/70 bg-background shadow-sm transition-colors hover:border-primary/50 focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">
                        Physical Examination Findings
                      </Label>
                      <Textarea
                        placeholder="Findings from physical exam..."
                        rows={5}
                        className="resize-y rounded-xl border border-border/70 bg-background shadow-sm transition-colors hover:border-primary/50 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">
                        Investigation Results
                      </Label>
                      <Textarea
                        placeholder="Lab results, imaging, etc..."
                        rows={5}
                        className="resize-y rounded-xl border border-border/70 bg-background shadow-sm transition-colors hover:border-primary/50 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">
                        Treatment Given Before Referral
                      </Label>
                      <Textarea
                        placeholder="Initial interventions..."
                        rows={5}
                        className="resize-y rounded-xl border border-border/70 bg-background shadow-sm transition-colors hover:border-primary/50 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">
                        Medication on Transfer
                      </Label>
                      <Textarea
                        placeholder="Current medications..."
                        rows={5}
                        className="resize-y rounded-xl border border-border/70 bg-background shadow-sm transition-colors hover:border-primary/50 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  {/* ── File Attachment ── */}
                  <div className="space-y-3 pt-2">
                    <Label className="flex items-center gap-1.5 text-foreground">
                      <Paperclip className="h-3.5 w-3.5" />
                      Attachments
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        (Reports, Images, Lab results)
                      </span>
                    </Label>

                    {/* Drop Zone */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => document.getElementById("file-upload-input")?.click()}
                      onKeyDown={(e) => e.key === "Enter" && document.getElementById("file-upload-input")?.click()}
                      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={handleDrop}
                      className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all duration-200 ${
                        isDragOver
                          ? "border-primary bg-primary/10 scale-[1.01]"
                          : "border-border/60 bg-muted/30 hover:border-primary/50 hover:bg-primary/5"
                      }`}
                    >
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-colors ${
                          isDragOver ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                        }`}
                      >
                        <Upload className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">
                          {isDragOver ? "Release to upload" : "Drop files here, or click to browse"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Supports PDF, JPG, PNG, DICOM — up to 10 MB each
                        </p>
                      </div>
                      <input
                        id="file-upload-input"
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.dcm"
                        className="sr-only"
                        onChange={(e) => handleFileChange(e.target.files)}
                      />
                    </div>

                    {/* Attached File List */}
                    {attachedFiles.length > 0 && (
                      <div className="space-y-2">
                        {attachedFiles.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 rounded-xl border border-border/60 bg-background px-4 py-2.5 shadow-sm"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <FileText className="h-4 w-4" />
                            </div>
                            <span className="flex-1 truncate text-sm font-medium text-foreground">
                              {file.name}
                            </span>
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {file.size < 1024 * 1024
                                ? `${(file.size / 1024).toFixed(0)} KB`
                                : `${(file.size / (1024 * 1024)).toFixed(1)} MB`}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFile(idx)}
                              className="ml-1 rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Referral Specifics */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">
                      2. Referral Specifics
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-foreground">
                        Reason of Referral <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        placeholder="Main reason for referring the patient..."
                        rows={4}
                        className="resize-y rounded-xl border border-border/70 bg-background shadow-sm transition-colors hover:border-primary/50 focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">
                        Referral Category <span className="text-destructive">*</span>
                      </Label>
                      <Select required>
                        <SelectTrigger className={selectTriggerCls}>
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl shadow-lg border-border/70">
                          {REFERRAL_CATEGORIES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">
                        Condition at Referral <span className="text-destructive">*</span>
                      </Label>
                      <Select required>
                        <SelectTrigger className={selectTriggerCls}>
                          <SelectValue placeholder="Select Condition Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl shadow-lg border-border/70">
                          {CONDITION_OPTIONS.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* 3. Logistics & Accompaniment */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Truck className="h-4 w-4" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">
                      3. Logistics & Accompaniment
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Mode of Transport</Label>
                      <Select>
                        <SelectTrigger className={selectTriggerCls}>
                          <SelectValue placeholder="Select Mode" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl shadow-lg border-border/70">
                          {TRANSPORT_MODES.map((m) => (
                            <SelectItem key={m} value={m}>
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Accompanying Person Name</Label>
                      <Input
                        placeholder="Full Name"
                        className="h-11 rounded-xl border-border/70 bg-background shadow-sm transition-colors hover:border-primary/50 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Accompanying Person Phone</Label>
                      <Input
                        placeholder="+1 (555) 000-0000"
                        className="h-11 rounded-xl border-border/70 bg-background shadow-sm transition-colors hover:border-primary/50 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ───────────────────────────────────────────────
                Step 3: Department
            ─────────────────────────────────────────────── */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ClipboardList className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    Department Selection
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Required Specialty <span className="text-destructive">*</span></Label>
                    <Select required>
                      <SelectTrigger className={selectTriggerCls}>
                        <SelectValue placeholder="Select specialty" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-lg border-border/70">
                        {SPECIALTIES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Receiving Hospital <span className="text-destructive">*</span></Label>
                    <Select required>
                      <SelectTrigger className={selectTriggerCls}>
                        <SelectValue placeholder="Select hospital" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-lg border-border/70">
                        {HOSPITALS.map((h) => (
                          <SelectItem key={h} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* ───────────────────────────────────────────────
                Step 4: Review
            ─────────────────────────────────────────────── */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ClipboardList className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    Review & Submit
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Review your referral details before submission. You can go back to
                  edit any section.
                </p>
                {attachedFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      Attached Files ({attachedFiles.length})
                    </p>
                    {attachedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 rounded-xl border border-border/60 bg-background px-4 py-2.5"
                      >
                        <FileText className="h-4 w-4 shrink-0 text-primary" />
                        <span className="flex-1 truncate text-sm">{file.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>

          {/* Footer: Previous Step | Save as Draft | Next */}
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
                  Previous Step
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline">
                Save as Draft
              </Button>
              {step < 4 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {step === 1 && "Next: Clinical Data"}
                  {step === 2 && "Next: Department Selection"}
                  {step === 3 && "Next: Review"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" className="gap-2">
                  Submit Referral
                  <ArrowRight className="h-4 w-4" />
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
