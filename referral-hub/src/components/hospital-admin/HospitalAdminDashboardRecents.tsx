"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Activity, ChevronRight, ClipboardList, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useGetAuditLogsQuery,
  useGetReferralsLogQuery,
} from "@/features/hospitalAdmin/hospitalAdminApi";
import {
  auditLogCategory,
  parseAuditTimestamp,
} from "@/components/hospital-admin/activity-logs/auditLogDisplay";
import { AuditLogUserCell } from "@/components/hospital-admin/activity-logs/AuditLogUserCell";

const RECENT_LIMIT = 15;

function formatStatus(status: string) {
  return status.replace(/_/g, " ");
}

function formatLogTimestamp(value: string) {
  if (!value) return "—";
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return formatDistanceToNow(date, { addSuffix: true });
}

function RecentActivityCard() {
  const { data, isLoading, isError } = useGetAuditLogsQuery({
    page: 1,
    page_size: RECENT_LIMIT,
  });
  const logs = data?.data ?? [];

  return (
    <Card className="h-full border-none rounded-2xl bg-white shadow-sm dark:bg-slate-950/50 dark:border-slate-800">
      <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-slate-50 px-8 py-5 dark:border-slate-800">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-700 dark:text-slate-200">
            <ClipboardList className="h-4 w-4" />
            Recent activity
          </CardTitle>
          <p className="text-sm font-normal normal-case tracking-normal text-slate-500 dark:text-slate-400">
            Latest audit events across your hospital.
          </p>
        </div>
        <Button variant="ghost" size="sm" className="shrink-0 text-xs" asChild>
          <Link href="/hospital-admin/activity-logs">
            View all
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-8">
        <div className="max-h-[22rem] overflow-y-auto pr-1">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
          </div>
        ) : isError ? (
          <p className="py-8 text-center text-sm text-destructive">
            Could not load recent activity.
          </p>
        ) : logs.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            No recent activity yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {logs.map((log) => {
              const category = auditLogCategory(log);
              return (
                <li
                  key={log.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/40"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {log.action_type}
                      </p>
                      <p className="truncate text-xs text-slate-500">{log.resource}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {category}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <AuditLogUserCell userId={log.user_id} />
                    <span className="whitespace-nowrap">
                      {formatDistanceToNow(parseAuditTimestamp(log.timestamp), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        </div>
      </CardContent>
    </Card>
  );
}

function RecentReferralLogsCard() {
  const { data, isLoading, isError } = useGetReferralsLogQuery({
    page: 1,
    page_size: RECENT_LIMIT,
  });
  const logs = data?.data ?? [];

  return (
    <Card className="h-full border-none rounded-2xl bg-white shadow-sm dark:bg-slate-950/50 dark:border-slate-800">
      <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-slate-50 px-8 py-5 dark:border-slate-800">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-700 dark:text-slate-200">
            <Activity className="h-4 w-4" />
            Recent referral logs
          </CardTitle>
          <p className="text-sm font-normal normal-case tracking-normal text-slate-500 dark:text-slate-400">
            Latest referral status changes at your hospital.
          </p>
        </div>
        <Button variant="ghost" size="sm" className="shrink-0 text-xs" asChild>
          <Link href="/hospital-admin/referrals">
            View all
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-8">
        <div className="max-h-[22rem] overflow-y-auto pr-1">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
          </div>
        ) : isError ? (
          <p className="py-8 text-center text-sm text-destructive">
            Could not load referral logs.
          </p>
        ) : logs.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            No referral log entries yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {logs.map((entry) => (
              <li
                key={entry.history_id}
                className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/40"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link
                    href={`/hospital-admin/referrals/${entry.referral_id}`}
                    className="font-mono text-xs font-semibold text-primary hover:underline"
                  >
                    {entry.referral_id.slice(0, 8)}…
                  </Link>
                  <span className="text-xs text-slate-500">
                    {formatLogTimestamp(entry.created_at)}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <Badge variant="outline" className="text-[10px]">
                    {formatStatus(entry.from_status)}
                  </Badge>
                  <span className="text-slate-400">→</span>
                  <Badge className="text-[10px]">{formatStatus(entry.to_status)}</Badge>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {entry.role ? `${entry.role} · ` : ""}
                  <span className="font-mono">{entry.changed_by_id.slice(0, 8)}…</span>
                </p>
              </li>
            ))}
          </ul>
        )}
        </div>
      </CardContent>
    </Card>
  );
}

/** Replaces the former audit & reports dashboard overview. */
export function HospitalAdminDashboardRecents() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <RecentActivityCard />
      <RecentReferralLogsCard />
    </div>
  );
}
