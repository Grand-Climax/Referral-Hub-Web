"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Referral, ReferralStatus } from "@/types/referral";
import { REFERRAL_STATUSES } from "@/lib/constants";

interface TriageCardProps {
  referral: Referral;
  onView: (id: string) => void;
}

function TriageCard({ referral, onView }: TriageCardProps) {
  const severityColors: Record<string, string> = {
    critical: "bg-red-600 text-white",
    high: "bg-orange-500 text-white",
    medium: "bg-blue-500 text-white",
    low: "bg-slate-500 text-white",
  };

  const patient = referral.patient;
  const fullName = patient ? [patient.first_name, patient.last_name].filter(Boolean).join(' ') : "Unknown Patient";
  const severity = referral.severity || "low";
  const primaryDiagnosis = referral.diagnoses?.[0]?.code_info?.description || "No Diagnosis Provided";

  return (
    <div
      className="bg-card border rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow min-h-[140px] flex flex-col justify-between"
      onClick={() => onView(referral.id)}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${severityColors[severity]}`}>
            {severity}
          </span>
        </div>
        <h3 className="font-semibold text-base mb-1 truncate">{fullName}</h3>
        <p className="text-xs text-muted-foreground mb-2">
          DOB: {patient?.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : "—"}
        </p>
        <p className="text-sm font-medium line-clamp-2 text-slate-700 dark:text-slate-300">
          {primaryDiagnosis}
        </p>
      </div>
      <Button variant="outline" size="sm" className="mt-4 w-full h-8 text-xs font-semibold" onClick={(e) => {
        e.stopPropagation();
        onView(referral.id);
      }}>
        View Referral
      </Button>
    </div>
  );
}

export function TriageBoard() {
  const [referrals] = useState<Referral[]>([]); // TODO: Fetch from API or mock
  const [selectedStatus, setSelectedStatus] = useState<ReferralStatus>("PENDING");

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight shrink-0">Incoming Triage</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="search"
            placeholder="Search referrals..."
            className="flex-1 sm:w-64 h-10 px-3 rounded-md border border-input bg-background text-sm"
          />
          <select className="h-10 px-3 rounded-md border border-input bg-background text-sm">
            <option>Priority</option>
            <option>Date</option>
          </select>
        </div>
      </div>

      {/* Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
        {REFERRAL_STATUSES.filter(s => ["SUBMITTED", "PENDING", "ACCEPTED"].includes(s)).map((status) => {
          const statusReferrals = referrals.filter((r) => r.status === status);
          return (
            <div key={status} className="bg-slate-50/50 dark:bg-slate-900/20 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4 min-w-[280px]">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">{status}</h2>
                <span className="text-xs font-medium bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border shadow-sm">
                  {statusReferrals.length}
                </span>
              </div>
              <div className="space-y-3">
                {statusReferrals.map((referral) => (
                  <TriageCard
                    key={referral.id}
                    referral={referral}
                    onView={(id) => console.log("View referral", id)}
                  />
                ))}
                {statusReferrals.length === 0 && (
                  <div className="h-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-center text-xs text-slate-400">
                    Empty Queue
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
