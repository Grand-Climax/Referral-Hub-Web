"use client";

import { ClipboardList } from "lucide-react";
import PatientCreation, { type PatientCreationProps } from "./PatientCreation";

export type PatientCreationStepProps = PatientCreationProps;

export default function PatientCreationStep(props: PatientCreationStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ClipboardList className="h-4 w-4" />
        </div>
        <h3 className="text-base font-semibold text-foreground">
          1. Patient Lookup / Registration
        </h3>
      </div>

      <PatientCreation {...props} />
    </div>
  );
}
