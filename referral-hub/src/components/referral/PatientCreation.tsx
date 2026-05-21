"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form } from "@/components/ui/form";
import {
  useLazyLookupPatientQuery,
  useCreatePatientMutation,
} from "@/features/patients/patientsApi";
import type { PatientCreationFormFields } from "@/types/patient";
import PatientCreationForm from "./PatientCreationForm";
import { getApiErrorMessage } from "@/lib/apiError";

function cleanPhone(phone: string | undefined) {
  if (!phone) return undefined;
  if (phone.startsWith("+")) return phone;
  return `+${phone.replace(/\D/g, "")}`;
}

export type PatientCreationProps = {
  onPatientLinked: (patientId: string) => void;
  onLookupStart?: () => void;
  onBusyChange?: (busy: boolean) => void;
  linkedPatientId?: string | null;
};

export default function PatientCreation({
  onPatientLinked,
  onLookupStart,
  onBusyChange,
  linkedPatientId,
}: PatientCreationProps) {
  const [showPatientCreate, setShowPatientCreate] = useState(false);
  const [patientLookupTried, setPatientLookupTried] = useState(false);

  const [lookupPatient, { isFetching: isLookingUpPatient }] =
    useLazyLookupPatientQuery();
  const [createPatient, { isLoading: isCreatingPatient }] =
    useCreatePatientMutation();

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
      national_id_hash: undefined,
    },
  });

  const nationalIdEnc = patientForm.watch("national_id_enc") || "";
  const isBusy = isLookingUpPatient || isCreatingPatient;

  useEffect(() => {
    onBusyChange?.(isBusy);
  }, [isBusy, onBusyChange]);

  const handlePatientLookup = async () => {
    const national_id = nationalIdEnc.trim();
    setPatientLookupTried(true);
    setShowPatientCreate(false);
    onLookupStart?.();

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

      setShowPatientCreate(false);
      onPatientLinked(patientId);
      toast.success("Patient linked successfully.");
    } catch (err: any) {
      if (err?.status === 404 || err?.originalStatus === 404) {
        setShowPatientCreate(true);
        patientForm.setValue("national_id_enc", national_id, {
          shouldDirty: false,
        });
        return;
      }
      console.error("Patient lookup failed:", err);
      toast.error(getApiErrorMessage(err, "Failed to look up patient."));
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
      const val = values[field];
      if (!val || String(val).trim() === "") {
        toast.error(`Please fill ${field.replace(/_/g, " ")}.`);
        return;
      }
    }

    const patientPayload = {
      first_name: values.first_name,
      middle_name: values.middle_name || undefined,
      last_name: values.last_name,
      date_of_birth: values.date_of_birth,
      sex: values.sex,
      home_region: values.home_region,
      phone_number:
        cleanPhone(values.phone_number) || values.phone_number,
      national_id,
    };

    try {
      const created = await createPatient(patientPayload).unwrap();
      const patientId = created.id;

      if (!patientId) {
        toast.error("Patient creation succeeded but no patient id was returned.");
        return;
      }

      setShowPatientCreate(false);
      onPatientLinked(patientId);
      toast.success("Patient created and linked successfully.");
    } catch (err: any) {
      console.error("Patient creation failed:", err);
      toast.error(getApiErrorMessage(err, "Failed to create patient."));
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
        <div className="space-y-2">
          <Label>
            National ID <span className="text-destructive">*</span>
          </Label>
          <Input
            placeholder="Enter national ID"
            value={nationalIdEnc}
            onChange={(e) =>
              patientForm.setValue("national_id_enc", e.target.value, {
                shouldDirty: true,
              })
            }
            className="h-11 rounded-xl border-border/70 bg-background"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={handlePatientLookup}
            disabled={isBusy}
          >
            {isLookingUpPatient ? "Searching..." : "Search Patient"}
          </Button>
        </div>

        {patientLookupTried && !showPatientCreate && linkedPatientId && (
          <p className="text-sm text-muted-foreground">
            Selected patient id:{" "}
            <span className="font-medium">{linkedPatientId}</span>
          </p>
        )}
      </div>

      {showPatientCreate && (
        <div className="space-y-4">
          <div className="rounded-xl border bg-destructive/5 p-4 text-sm">
            Patient not found. Please create the patient to continue.
          </div>

          <Form {...patientForm}>
            <PatientCreationForm />
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
  );
}
