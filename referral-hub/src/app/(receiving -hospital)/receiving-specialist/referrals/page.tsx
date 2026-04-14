"use client";
import { useState } from "react";
import { ReferralTable } from "@/components/referral/ReferralTable";
import { useGetReferralsQuery } from "@/features/specialist/specialistApi";
import { AlertCircle } from "lucide-react";
import { ReferralHistorySkeleton } from "@/components/skeletons/ReferralHistorySkeleton";

const ReferralHistoryPage = () => {
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const { data: response, isLoading, isFetching, isError } = useGetReferralsQuery({
    page: page + 1,
    limit: pageSize,
  });

  if (isLoading) {
    return <ReferralHistorySkeleton />;
  }

  if (isError) {
    return (
      <div className="container mx-auto py-20 flex flex-col items-center justify-center gap-4">
        <AlertCircle className="h-10 w-10 text-destructive opacity-50" />
        <div className="text-center">
          <h2 className="text-lg font-semibold">Failed to load referrals</h2>
          <p className="text-muted-foreground">Please check your connection and try again.</p>
        </div>
      </div>
    );
  }

  const referrals = response?.data || [];
  const totalCount = response?.total || 0;

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Referral History</h1>
        <p className="text-muted-foreground text-sm">View and manage all your historical referrals.</p>
      </div>
      
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden h-[calc(100vh-200px)]">
        <ReferralTable
          data={referrals}
          total={totalCount}
          isLoading={isLoading}
          isFetching={isFetching}
          page={page}
          onPageChange={setPage}
          pageSize={pageSize}
          detailHrefPrefix="/receiving-specialist"
        />
      </div>
    </div>
  );
};

export default ReferralHistoryPage;
