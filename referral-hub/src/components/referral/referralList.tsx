"use client";
import { MOCK_REFERRALS } from "@/data/mock";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";
import { ReferralTable } from "./ReferralTable";
import { ApprovalActions } from "../ApprovalActions";
import { useRouter } from "next/navigation";

const ReferralList = () => {
  const [search, setSearch] = useState("");
    const router = useRouter();
  const referrals = MOCK_REFERRALS.filter(
    (r) =>
      r.patient.fullName.toLowerCase().includes(search.toLowerCase()) ||
      r.provisionalDiagnosis.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase()),
  );

  const showActions = "hospital_admin";

  return (
    <div>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Referrals</h1>
            <p className="text-sm text-muted-foreground">
              {referrals.length} referrals found
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search referrals..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-card rounded-lg border overflow-hidden">
          <ReferralTable
            referrals={referrals}
            onRowClick={(ref) => router.push(`/referring-doctor/${ref.id}`)}
            actionSlot={
              showActions
                ? (ref) => (
                    <div className="flex items-center gap-2">
                      <ApprovalActions
                        onApprove={() => toast.success(`Approved ${ref.id}`)}
                        onReject={() => toast.error(`Rejected ${ref.id}`)}
                      />
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
