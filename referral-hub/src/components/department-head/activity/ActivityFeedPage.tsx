'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format, subDays } from 'date-fns';
import {
  Activity,
  Zap,
  ShieldAlert,
  UserCog,
  LogIn,
  LogOut,
  Clipboard,
  ArrowRight,
  AlertTriangle,
  History,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

import { useGetActivityQuery } from '@/features/department-head/departmentHeadApi';
import type { ActivityEntry } from '@/types/department-head';

const ACTION_CONFIG: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }
> = {
  BATCH_SCHEDULE_RUN: { icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  MANUAL_EMERGENCY_SCHEDULE: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bg: 'bg-red-50 dark:bg-red-900/20',
  },
  MANAGE_CAPACITY: { icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  OVERRIDE_QUEUE: { icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  ASSIGN_DOCTOR: { icon: UserCog, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
  UNASSIGN_DOCTOR: { icon: UserCog, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
  CONFIRM_ARRIVAL: {
    icon: LogIn,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
  MARK_MISSED: { icon: LogOut, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
  RECORD_OUTCOME: { icon: Clipboard, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/20' },
  ADD_CLINICAL_UPDATE: { icon: Clipboard, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/20' },
  ACCEPT_REFERRAL: { icon: ArrowRight, color: 'text-slate-600', bg: 'bg-slate-50 dark:bg-slate-800/40' },
  REJECT_REFERRAL: { icon: ArrowRight, color: 'text-slate-600', bg: 'bg-slate-50 dark:bg-slate-800/40' },
  REDIRECT_REFERRAL: { icon: ArrowRight, color: 'text-slate-600', bg: 'bg-slate-50 dark:bg-slate-800/40' },
};

function ActivityRow({ entry }: { entry: ActivityEntry }) {
  const cfg = ACTION_CONFIG[entry.action_type] ?? {
    icon: Activity,
    color: 'text-muted-foreground',
    bg: 'bg-muted',
  };
  const Icon = cfg.icon;
  const when = format(new Date(entry.timestamp), 'MMM d, HH:mm');
  const referralId = entry.new_value?.referral_id as string | undefined;

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div
        className={`mt-0.5 h-8 w-8 shrink-0 rounded-lg flex items-center justify-center ${cfg.bg}`}
      >
        <Icon className={`h-4 w-4 ${cfg.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-snug">{entry.summary}</p>
        {entry.action_type === 'BATCH_SCHEDULE_RUN' && entry.new_value?.result && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Scheduled: {entry.new_value.result.scheduled_count ?? 0} · Skipped:{' '}
            {entry.new_value.result.skipped_count ?? 0}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">{entry.actor_name}</span>
          <span className="text-[10px] text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">{when}</span>
        </div>
      </div>
      {referralId && (
        <Link
          href={`/department-head/triage-queue/${referralId}`}
          className="text-xs text-primary hover:underline shrink-0"
        >
          View →
        </Link>
      )}
    </div>
  );
}

export default function ActivityFeedPage() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 6), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(today);
  const [limit, setLimit] = useState(20);

  const { data: result, isLoading, isError, refetch } = useGetActivityQuery(
    { limit, start_date: startDate, end_date: endDate },
    { pollingInterval: 90_000 }
  );

  const entries = result?.data ?? [];
  const total = result?.total ?? 0;

  return (
    <div className="max-w-[900px] mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Activity Feed</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Department-level audit log — every action taken by your team.
        </p>
      </div>

      <Card className="border bg-card shadow-sm">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="act-start">From</Label>
              <Input
                id="act-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-44"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="act-end">To</Label>
              <Input
                id="act-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-44"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="act-limit">Limit</Label>
              <select
                id="act-limit"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border bg-card shadow-sm">
        <CardHeader className="py-3 px-5 border-b border-border flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold">
            {total > 0 ? `${total} event${total !== 1 ? 's' : ''}` : 'Events'}
          </CardTitle>
          {limit < total && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLimit((l) => l + 20)}
              className="text-xs"
            >
              Load more
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-4">
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <p className="text-sm font-medium text-foreground">Failed to load activity</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          )}

          {!isLoading && !isError && entries.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
              <History className="h-10 w-10 opacity-30" />
              <p className="text-sm font-medium text-foreground">Quiet so far</p>
              <p className="text-xs">No events in this date range.</p>
            </div>
          )}

          {!isLoading && !isError && entries.length > 0 && (
            <div>
              {entries.map((e) => (
                <ActivityRow key={e.id} entry={e} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
