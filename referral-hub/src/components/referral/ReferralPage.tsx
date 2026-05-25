"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Inbox,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useGetReferralsQuery } from "@/features/referral/referralApi";
import { ReferralDashboardTable } from "./ReferralDashboardTable";
import {
  formatReferralPatientName,
  type ReferralListItem,
} from "@/types/referral-list";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

// ─── Pill colour tables ─────────────────────────────────────────────────────
// Kept verbose-on-purpose so each row pill matches the rest of the system's
// chips (queue, detail page, etc). Unknown / legacy values fall through to a
// neutral slate so we never render an "empty" pill.

const CONDITION_PILL: Record<string, string> = {
  CRITICAL:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
  EMERGENCY:
    "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300",
  STABLE:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
  UNSTABLE:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  IMPROVING:
    "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300",
};

function pillClass(table: Record<string, string>, key?: string | null) {
  const safe = (key ?? "").toUpperCase();
  return (
    table[safe] ??
    "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
  );
}

// ─── Pending list row ──────────────────────────────────────────────────────

// Row-level background tints, keyed by condition. The whole row picks up a
// soft wash so the doctor can scan severity without reading any text.
// Falls back to a neutral muted background for legacy / unknown values.
const ROW_BG: Record<string, string> = {
  CRITICAL:
    "bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50",
  EMERGENCY:
    "bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/30 dark:hover:bg-orange-950/50",
  STABLE:
    "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50",
  UNSTABLE:
    "bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-950/50",
  IMPROVING:
    "bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/30 dark:hover:bg-sky-950/50",
};

function rowBg(condition?: string | null) {
  return (
    ROW_BG[(condition ?? "").toUpperCase()] ?? "bg-muted/30 hover:bg-muted/60"
  );
}

function PendingRow({ ref }: { ref: ReferralListItem }) {
  const condition = ref.condition_at_referral;
  return (
    <li>
      <Link
        href={`/referring-doctor/${ref.id}`}
        className={`flex items-center justify-between gap-3 rounded-lg border border-border/40 px-3.5 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${rowBg(condition)}`}
      >
        {/* Name + condition pill — stacked left so the eye lands on the
            patient first, with the colour-coded condition right beneath. */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {formatReferralPatientName(ref) || "Unknown patient"}
          </p>
          {condition && (
            <Badge
              variant="outline"
              className={`mt-1 text-[10px] font-semibold uppercase tracking-wide ${pillClass(CONDITION_PILL, condition)}`}
            >
              {condition}
            </Badge>
          )}
        </div>

        {/* Time — right-aligned, single-line. */}
        <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground tabular-nums">
          <Clock className="h-3 w-3" />
          {ref.created_at
            ? formatDistanceToNow(new Date(ref.created_at), {
                addSuffix: true,
              })
            : "—"}
        </span>
      </Link>
    </li>
  );
}

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

  // Most-recent pending first. The side panel is the doctor's "what still
  // needs my attention?" feed, so chronological-by-creation matches intent.
  const pending = useMemo(
    () =>
      allReferrals
        .filter((r) =>
          ["PENDING", "SUBMITTED", "UNDER_LIAISON_REVIEW"].includes(
            r.status?.toUpperCase() ?? "",
          ),
        )
        .slice()
        .sort((a, b) => {
          const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
          const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
          return tb - ta;
        }),
    [allReferrals],
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

          <Card className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden border-0 py-0 shadow-sm ring-1 ring-border/60">
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

        <aside className="flex w-full shrink-0 flex-col lg:w-[320px]">
          {/* Header — count badge sits next to the title so the user sees
              at a glance how many items are queued without scrolling. */}
          <div className="mb-3 flex shrink-0 items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <h2 className="text-base font-semibold text-foreground">
                Recent Pending
              </h2>
            </div>
            {!isStatsLoading && pending.length > 0 && (
              <Badge
                variant="secondary"
                className="rounded-full px-2 text-[10px] font-bold tabular-nums"
              >
                {pending.length}
              </Badge>
            )}
          </div>

          {/*
            Fixed-height panel rather than `flex-1`. The list is intended
            to scroll *internally* and never push the rest of the page —
            the height caps at the viewport on short screens via the
            calc(), and at 640px otherwise. Mobile gets a shorter cap so
            the table above remains the primary focus.
          */}
          <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-border/60 h-[420px] lg:h-[min(640px,calc(100vh-260px))]">
            <CardContent className="h-full overflow-y-auto p-0">
              {isStatsLoading ? (
                <div className="flex flex-col gap-2 p-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-24 animate-pulse rounded-lg bg-muted"
                    />
                  ))}
                </div>
              ) : pending.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 px-4 py-12 text-center text-muted-foreground">
                  <Inbox className="h-8 w-8 opacity-30" />
                  <p className="text-sm font-medium text-foreground">
                    All caught up
                  </p>
                  <p className="text-xs">
                    Nothing pending right now. Newly submitted referrals
                    will appear here.
                  </p>
                </div>
              ) : (
                <ul className="flex flex-col gap-2 p-3">
                  {pending.map((ref) => (
                    <PendingRow key={ref.id} ref={ref} />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default ReferralDashboard;
