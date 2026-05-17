import { ReferralsTable } from "@/components/liaison/ReferralsTable";

export default function RejectedReferralsPage() {
  return (
    <div className="container mx-auto max-w-[1400px] py-12 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rejected Referrals</h1>
        <p className="text-muted-foreground mt-2">
          View referrals that have been rejected by liaison or specialist
        </p>
      </div>
      <ReferralsTable listType="rejected" title="Rejected Referrals" />
    </div>
  );
}
