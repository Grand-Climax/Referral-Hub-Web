import { ReferralsTable } from "@/components/liaison/ReferralsTable";

export default function LiaisonRejectedReferralsPage() {
  return (
    <div className="mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rejected Referrals</h1>
          <p className="text-muted-foreground mt-2">Review cases that have been rejected or returned.</p>
        </div>
      </div>
      <ReferralsTable statusFilter="rejected" title="Rejected Cases" description="Cases requiring attention or alternate routing." />
    </div>
  );
}
