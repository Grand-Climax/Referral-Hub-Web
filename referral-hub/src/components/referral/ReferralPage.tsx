"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useGetReferralsQuery } from "@/features/referral/referralApi";
import { ReferralDashboardTable } from "./ReferralDashboardTable";
import {
  formatReferralPatientName,
  humanizeReferralValue,
} from "@/types/referral-list";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

function StatCard({
  title,
  value,
  icon: Icon,
  iconCls,
  loading,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  iconCls: string;
  loading?: boolean;
}) {
  return (
    <Card className="border-0 shadow-sm ring-1 ring-border/60">
      <CardContent className="flex items-center gap-3 p-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconCls}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          {loading ? (
            <div className="mb-1 h-6 w-10 animate-pulse rounded bg-muted" />
          ) : (
            <p className="text-2xl font-bold tabular-nums leading-tight text-foreground">
              {value}
            </p>
          )}
          <p className="truncate text-xs text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

const ReferralDashboard = () => {
  const pageSize = 10;
  const [tablePage, setTablePage] = useState(0);

  const { data: statsResponse, isLoading: isStatsLoading } =
    useGetReferralsQuery({ page: 0, limit: 100 });

  const {
    data: tableResponse,
    isLoading: isTableLoading,
    isFetching: isTableFetching,
  } = useGetReferralsQuery({ page: tablePage, limit: pageSize });

  const allReferrals = statsResponse?.data ?? [];
  const totalItems = statsResponse?.total ?? allReferrals.length;

  const pending = allReferrals.filter((r) =>
    ["PENDING", "SUBMITTED", "UNDER_LIAISON_REVIEW"].includes(
      r.status?.toUpperCase() ?? "",
    ),
  );
  const accepted = allReferrals.filter((r) =>
    ["ACCEPTED", "COMPLETED", "FORWARDED"].includes(
      r.status?.toUpperCase() ?? "",
    ),
  );
  const critical = allReferrals.filter(
    (r) => r.condition_at_referral?.toUpperCase() === "CRITICAL",
  );

  return (
    <div className="flex h-full flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your submitted referrals.
        </p>
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          title="Total Referrals"
          value={totalItems}
          icon={FileText}
          iconCls="bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-200"
          loading={isStatsLoading}
        />
        <StatCard
          title="Pending"
          value={pending.length}
          icon={Clock}
          iconCls="bg-amber-50 text-amber-600 dark:bg-amber-500/20 dark:text-amber-200"
          loading={isStatsLoading}
        />
        <StatCard
          title="Accepted / Forwarded"
          value={accepted.length}
          icon={CheckCircle}
          iconCls="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200"
          loading={isStatsLoading}
        />
        <StatCard
          title="Critical"
          value={critical.length}
          icon={AlertTriangle}
          iconCls="bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-200"
          loading={isStatsLoading}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="mb-3 flex shrink-0 items-center gap-2">
            <FileText className="h-4 w-4 text-blue-500" />
            <h2 className="text-base font-semibold text-foreground">
              Referrals List
            </h2>
          </div>

          <Card className="flex min-h-0 flex-1 flex-col overflow-hidden border-0 shadow-sm ring-1 ring-border/60">
            <ReferralDashboardTable
              data={tableResponse?.data}
              total={tableResponse?.total}
              isLoading={isTableLoading}
              isFetching={isTableFetching}
              page={tablePage}
              onPageChange={setTablePage}
              pageSize={pageSize}
            />
          </Card>
        </div>

        <div className="flex min-h-0 w-full shrink-0 flex-col lg:w-[300px]">
          <div className="mb-3 flex shrink-0 items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <h2 className="text-base font-semibold text-foreground">
              Recent Pending
            </h2>
          </div>

          <Card className="min-h-0 flex-1 overflow-hidden border-0 shadow-sm ring-1 ring-border/60">
            <CardContent className="h-full overflow-y-auto p-0">
              {isStatsLoading ? (
                <div className="flex flex-col gap-2 p-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-20 animate-pulse rounded-lg bg-muted"
                    />
                  ))}
                </div>
              ) : pending.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
                  <Clock className="h-7 w-7 opacity-30" />
                  <p className="text-sm">No pending referrals</p>
                </div>
              ) : (
                <ul className="divide-y divide-border/40">
                  {pending.slice(0, 6).map((ref) => (
                    <li key={ref.id}>
                      <Link
                        href={`/referring-doctor/${ref.id}`}
                        className="flex flex-col gap-1.5 px-4 py-3 transition-colors hover:bg-muted/40"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="truncate text-sm font-medium text-foreground">
                            {formatReferralPatientName(ref) || "Unknown"}
                          </span>
                          <Badge
                            variant="outline"
                            className="shrink-0 text-[10px] capitalize"
                          >
                            {humanizeReferralValue(ref.status)}
                          </Badge>
                        </div>
                        {ref.icd_code && (
                          <p className="font-mono text-[10px] text-muted-foreground">
                            {ref.icd_code}
                          </p>
                        )}
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {ref.diagnosis || "No diagnosis"}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                          <span>{ref.patient_region || "—"}</span>
                          {ref.condition_at_referral && (
                            <span className="capitalize">
                              · {humanizeReferralValue(ref.condition_at_referral)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {ref.created_at
                            ? formatDistanceToNow(new Date(ref.created_at), {
                                addSuffix: true,
                              })
                            : "—"}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReferralDashboard;
