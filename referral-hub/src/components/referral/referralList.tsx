'use client'
import { useGetReferralsQuery } from "@/features/referral/referralApi";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";
import { ReferralTable } from "./ReferralTable";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const ReferralList = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const router = useRouter();

  const pageSize = 10;
  const { data: response, isLoading, isFetching } = useGetReferralsQuery({ 
    page, 
    limit: pageSize,
  });

  const referrals = response?.data ?? [];
  const total = response?.total ?? 0;

  const showActions = "referring_doctor";

  return (
    <div>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Referrals</h1>
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Loading..." : `${total} referrals found`}
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search referrals..."
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0); // Reset to first page on search
              }}
            />
          </div>
        </div>

        <div className="bg-card rounded-lg border overflow-hidden">
          <ReferralTable
            data={referrals}
            total={total}
            isLoading={isLoading}
            isFetching={isFetching}
            page={page}
            onPageChange={setPage}
            pageSize={pageSize}
            actionSlot={
              showActions
                ? (ref) => (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/referring-doctor/${ref.id}`);
                        }}
                      >
                        View
                      </Button>
                    </div>
                  )
                : undefined
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ReferralList;
