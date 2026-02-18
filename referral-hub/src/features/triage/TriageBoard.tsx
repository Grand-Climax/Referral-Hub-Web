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
  const urgencyColors = {
    emergency: "bg-destructive text-destructive-foreground",
    urgent: "bg-yellow-500 text-white",
    routine: "bg-chart-2 text-white",
  };

  return (
    <div
      className="bg-card border rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow min-h-[120px]"
      onClick={() => onView(referral.id)}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-xs font-semibold px-2 py-1 rounded ${
            urgencyColors[referral.referral.urgency]
          }`}
        >
          {referral.referral.urgency.toUpperCase()}
        </span>
      </div>
      <h3 className="font-semibold text-base mb-1">
        {referral.patient.firstName} {referral.patient.lastName}
      </h3>
      <p className="text-sm text-muted-foreground mb-1">
        DOB: {referral.patient.dateOfBirth}
      </p>
      <p className="text-sm font-medium">{referral.medical.primaryDiagnosis}</p>
      <Button
        variant="outline"
        size="sm"
        className="mt-3 w-full"
        onClick={(e) => {
          e.stopPropagation();
          onView(referral.id);
        }}
      >
        View
      </Button>
    </div>
  );
}

export function TriageBoard() {
  const [referrals] = useState<Referral[]>([]); // TODO: Fetch from API
  const [selectedStatus, setSelectedStatus] =
    useState<ReferralStatus>("new");

  const filteredReferrals = referrals.filter(
    (r) => r.status === selectedStatus
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4 items-center">
        <input
          type="search"
          placeholder="Search referrals..."
          className="flex-1 h-11 px-3 rounded-md border border-input bg-background"
        />
        <select className="h-11 px-3 rounded-md border border-input bg-background">
          <option>Priority</option>
          <option>Date</option>
        </select>
      </div>

      {/* Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {REFERRAL_STATUSES.map((status) => {
          const statusReferrals = referrals.filter((r) => r.status === status);
          return (
            <div key={status} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold capitalize">{status}</h2>
                <span className="text-sm text-muted-foreground">
                  ({statusReferrals.length})
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
                {status === "new" && (
                  <Button variant="outline" className="w-full">
                    + Add Card
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
