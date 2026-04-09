import { ReferralsTable } from "@/components/liaison/ReferralsTable";

export default function LiaisonApprovedReferralsPage() {
  return (
    <div className="mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Approved Referrals
          </h1>
          <p className="text-muted-foreground mt-2">
            View all cases that have been approved by you.
          </p>
        </div>
      </div>
      <ReferralsTable statusFilter="approved" />
    </div>
  );
}
