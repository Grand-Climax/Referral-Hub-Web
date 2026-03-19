"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Referral, UrgencyLevel, ReferralType } from "@/types/referral";
import { REFERRAL_TYPES, URGENCY_LEVELS } from "@/lib/constants";

export function ReferralForm() {
  const [formData, setFormData] = useState<Partial<Referral>>({
    patient: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      phone: "",
    },
    medical: {
      primaryDiagnosis: "",
    },
    referral: {
      referringProvider: "",
      type: "specialist-consultation",
      urgency: "routine",
    },
    additional: {},
    status: "new",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    console.log("Form submitted", formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Patient Information */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-primary">
          Patient Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="firstName" className="text-sm font-medium">
              First Name <span className="text-destructive">*</span>
            </label>
            <input
              id="firstName"
              type="text"
              required
              value={formData.patient?.firstName || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  patient: {
                    ...formData.patient!,
                    firstName: e.target.value,
                  },
                })
              }
              className="w-full h-11 px-3 rounded-md border border-input bg-background"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="lastName" className="text-sm font-medium">
              Last Name <span className="text-destructive">*</span>
            </label>
            <input
              id="lastName"
              type="text"
              required
              value={formData.patient?.lastName || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  patient: {
                    ...formData.patient!,
                    lastName: e.target.value,
                  },
                })
              }
              className="w-full h-11 px-3 rounded-md border border-input bg-background"
            />
          </div>
        </div>
      </section>

      {/* Medical Information */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-primary">
          Medical Information
        </h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="primaryDiagnosis" className="text-sm font-medium">
              Primary Diagnosis <span className="text-destructive">*</span>
            </label>
            <input
              id="primaryDiagnosis"
              type="text"
              required
              value={formData.medical?.primaryDiagnosis || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  medical: {
                    ...formData.medical!,
                    primaryDiagnosis: e.target.value,
                  },
                })
              }
              className="w-full h-11 px-3 rounded-md border border-input bg-background"
            />
          </div>
        </div>
      </section>

      {/* Referral Details */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-primary">
          Referral Details
        </h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="urgency" className="text-sm font-medium">
              Urgency Level <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-4">
              {URGENCY_LEVELS.map((level) => (
                <label key={level} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="urgency"
                    value={level}
                    checked={formData.referral?.urgency === level}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        referral: {
                          ...formData.referral!,
                          urgency: e.target.value as UrgencyLevel,
                        },
                      })
                    }
                    className="h-4 w-4"
                  />
                  <span className="capitalize">{level}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Form Actions */}
      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit">Submit Referral</Button>
      </div>
    </form>
  );
}
