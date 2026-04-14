import { ReferralsTable } from "@/components/liaison/ReferralsTable";

export default function LiaisonAllReferralsPage() {
  return (
    <div className="mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Referrals</h1>
          <p className="text-muted-foreground mt-2">Manage all incoming and outgoing referral requests.</p>
        </div>
      </div>
      <ReferralsTable statusFilter="all" />
    </div>
  );
}
