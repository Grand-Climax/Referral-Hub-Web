"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FileText, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useGetReferralsQuery } from "@/features/referral/referralApi";
import { ReferralDashboardTable } from "./ReferralDashboardTable";
import Link from "next/link";

// ── Stat card ─────────────────────────────────────────────────────────────────
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
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${iconCls}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          {loading ? (
            <div className="h-6 w-10 bg-muted animate-pulse rounded mb-1" />
          ) : (
            <p className="text-2xl font-bold text-foreground tabular-nums leading-tight">{value}</p>
          )}
          <p className="text-xs text-muted-foreground truncate">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
const ReferralDashboard = () => {
  // Fetch page 0 just for stats
  const { data: statsResponse, isLoading: isStatsLoading } = useGetReferralsQuery({ page: 0, page_size: 10 });

  // Separate state for the paginated table
  const [tablePage, setTablePage] = useState(0);
  const pageSize = 10;
  const { 
    data: tableResponse, 
    isLoading: isTableLoading, 
    isFetching: isTableFetching 
  } = useGetReferralsQuery({ page: tablePage, page_size: pageSize });

  const referrals  = statsResponse?.data  ?? [];
  const totalItems = statsResponse?.total ?? 0;

  const pending  = referrals.filter((r) => ["PENDING", "SUBMITTED"].includes(r.status?.toUpperCase()));
  const accepted = referrals.filter((r) => ["ACCEPTED", "COMPLETED"].includes(r.status?.toUpperCase()));
  const critical = referrals.filter((r) => r.condition_at_referral?.toUpperCase() === "CRITICAL");

  return (
    <div className="flex flex-col gap-6 h-full">

      {/* ── Page header ──────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back — here's an overview of your referrals.</p>
      </div>

      {/* ── Stats row ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
        <StatCard title="Total Referrals" value={totalItems}       icon={FileText}      iconCls="bg-blue-50 text-blue-600"    loading={isStatsLoading} />
        <StatCard title="Pending"          value={pending.length}  icon={Clock}          iconCls="bg-amber-50 text-amber-600"  loading={isStatsLoading} />
        <StatCard title="Accepted"         value={accepted.length} icon={CheckCircle}    iconCls="bg-emerald-50 text-emerald-600" loading={isStatsLoading} />
        <StatCard title="Critical"         value={critical.length} icon={AlertTriangle}  iconCls="bg-red-50 text-red-600"      loading={isStatsLoading} />
      </div>

      {/* ── Main content row ─────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">

        {/* ── Referrals table card ─────────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-3 shrink-0">
            <FileText className="h-4 w-4 text-blue-500" />
            <h2 className="text-base font-semibold text-foreground">Referrals List</h2>
          </div>

          <Card className="border-0 shadow-sm ring-1 ring-border/60 flex-1 flex flex-col min-h-0 overflow-hidden">
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

        {/* ── Recent Pending sidebar ──────────────────────────────── */}
        <div className="w-full lg:w-[280px] shrink-0 flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-3 shrink-0">
            <Clock className="h-4 w-4 text-amber-500" />
            <h2 className="text-base font-semibold text-foreground">Recent Pending</h2>
          </div>

          <Card className="border-0 shadow-sm ring-1 ring-border/60 flex-1 min-h-0 overflow-hidden">
            <CardContent className="p-0 h-full overflow-y-auto">
              {isStatsLoading ? (
                <div className="flex flex-col gap-2 p-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
                  ))}
                </div>
              ) : pending.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground gap-2">
                  <Clock className="h-7 w-7 opacity-30" />
                  <p className="text-sm">No pending referrals</p>
                </div>
              ) : (
                <ul className="divide-y divide-border/40">
                  {pending.slice(0, 6).map((ref) => (
                    <li key={ref.id}>
                      <Link
                        href={`/referring-doctor/${ref.id}`}
                        className="flex flex-col gap-1 px-4 py-3 transition-colors hover:bg-muted/40"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-medium text-foreground">
                            {[ref.patient_first_name, ref.patient_last_name].filter(Boolean).join(" ") || "Unknown"}
                          </span>
                          {ref.condition_at_referral && (
                            <span className="shrink-0 inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-100 capitalize">
                              {ref.condition_at_referral.toLowerCase()}
                            </span>
                          )}
                        </div>
                        {ref.diagnosis && (
                          <p className="truncate text-xs text-muted-foreground">{ref.diagnosis}</p>
                        )}
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {ref.date ? new Date(ref.date).toLocaleDateString() : "—"}
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
