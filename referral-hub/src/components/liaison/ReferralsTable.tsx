"use client";

import { ReferralLists } from "@/components/table/referral-lists";
import { MOCK_REFERRALS } from "@/data/mock";

interface ReferralsTableProps {
  statusFilter?: "all" | "approved" | "rejected";
  title?: string;
  description?: string;
}

export function ReferralsTable({ statusFilter = "all", title, description }: ReferralsTableProps) {
  let data = MOCK_REFERRALS;
  
  if (statusFilter === "approved") {
    data = MOCK_REFERRALS.filter(
      (r) => r.status === "approved" || r.status === "accepted" || r.status === "completed"
    );
  } else if (statusFilter === "rejected") {
    data = MOCK_REFERRALS.filter((r) => r.status === "rejected");
  }

  return (
    <div className="space-y-4">
      {(title || description) && (
        <div>
          {title && <h2 className="text-xl font-semibold tracking-tight">{title}</h2>}
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
      )}
      <ReferralLists data={data} />
    </div>
  );
}
