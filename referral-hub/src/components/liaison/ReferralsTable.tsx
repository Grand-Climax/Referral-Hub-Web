"use client";

import { ReferralLists } from "@/components/table/referral-lists";
import { useGetReferralsQuery } from "@/features/liaison/liaisonApi";

interface ReferralsTableProps {
  statusFilter?: "all" | "approved" | "rejected";
  title?: string;
  description?: string;
}

export function ReferralsTable({ statusFilter = "all", title, description }: ReferralsTableProps) {
  const { data: response, isLoading } = useGetReferralsQuery();
  const allReferrals = response?.data || [];
  
  let data = allReferrals;
  
  if (statusFilter === "approved") {
    data = allReferrals.filter(
      (r) => r.Status === "APPROVED" || r.Status === "ACCEPTED" || r.Status === "COMPLETED"
    );
  } else if (statusFilter === "rejected") {
    data = allReferrals.filter((r) => r.Status === "REJECTED");
  }

  return (
    <div className="space-y-4">
      {(title || description) && (
        <div>
          {title && <h2 className="text-xl font-semibold tracking-tight">{title}</h2>}
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
      )}
      <ReferralLists 
        data={data} 
        isLoading={isLoading}
        getRowHref={(id) => `/liaison-officer/referrals/${id}`} 
      />
    </div>
  );
}
