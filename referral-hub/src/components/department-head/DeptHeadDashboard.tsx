'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import {
  LayoutDashboard,
  Zap,
  Users,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  XCircle,
  BarChart3,
  Activity as ActivityIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

import {
  useGetDashboardStatsQuery,
  useGetDashboardTrendsQuery,
  useGetPriorityBucketsQuery,
  useGetActivityQuery,
} from '@/features/department-head/departmentHeadApi';
import type {
  DashboardStats,
  TrendEntry,
  ActivityEntry,
  TopWaiting,
} from '@/types/department-head';

// ─── Color tables ─────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  ACCEPTED: '#3b82f6',
  SCHEDULED: '#8b5cf6',
  COMPLETED: '#10b981',
  UNDER_SPECIALIST_REVIEW: '#f59e0b',
  FORWARDED: '#6366f1',
  REJECTED_BY_SPECIALIST: '#ef4444',
  REJECTED: '#ef4444',
  CANCELLED: '#9ca3af',
};

// ─── Capacity Today Card ──────────────────────────────────────────────────────

function CapacityTodayCard({ stats }: { stats: DashboardStats }) {
  const cap = stats.today_capacity;
  if (!cap) {
    return (
      <Card className="border bg-card shadow-sm">
        <CardContent className="p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Today&apos;s Capacity
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            No capacity computed for today
          </p>
        </CardContent>
      </Card>
    );
  }
  const pct = cap.max_slots > 0 ? (cap.booked_slots / cap.max_slots) * 100 : 0;
  const barColor =
    pct >= 100 ? 'bg-destructive' : pct >= 80 ? 'bg-amber-500' : 'bg-primary';

  return (
    <Link href="/department-head/capacity">
      <Card className="border bg-card shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Today&apos;s Capacity
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <LayoutDashboard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2 flex-wrap">
            <span className="text-4xl font-extrabold tabular-nums text-foreground">
              {cap.booked_slots}
            </span>
            <span className="text-lg font-semibold text-muted-foreground">
              / {cap.max_slots}
            </span>
            {cap.overbook_limit > 0 && (
              <Badge variant="outline" className="text-[10px]">
                +{cap.overbook_limit} overbook
              </Badge>
            )}
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${barColor}`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {pct.toFixed(0)}% utilized
            {cap.is_full && (
              <span className="ml-2 text-destructive font-semibold">• Full</span>
            )}
            {cap.has_override && (
              <span className="ml-2 text-amber-600 font-semibold">• Override</span>
            )}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

// ─── Waiting Queue Card ───────────────────────────────────────────────────────

function WaitingQueueCard({ stats }: { stats: DashboardStats }) {
  if (stats.waiting_queue_size === 0) {
    return (
      <Link href="/department-head/triage-queue">
        <Card className="border bg-card shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
          <CardContent className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Waiting Queue
            </p>
            <div className="mt-4 flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
              <p className="text-sm font-semibold">No waiting patients</p>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }
  return (
    <Link href="/department-head/triage-queue">
      <Card className="border bg-card shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Waiting Queue
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/30">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tabular-nums text-foreground">
              {stats.waiting_queue_size}
            </span>
            <span className="text-sm text-muted-foreground">patients</span>
          </div>
          {stats.oldest_waiting_days > 0 && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-3 w-3" />
              Oldest: {stats.oldest_waiting_days}d waiting
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

// ─── Run Batch Card ───────────────────────────────────────────────────────────

function RunBatchCard({ stats }: { stats: DashboardStats }) {
  const hasWaiting = stats.waiting_queue_size > 0;
  return (
    <Card className="border bg-card shadow-sm h-full">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Batch Scheduling
          </p>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Zap className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {hasWaiting
            ? `${stats.waiting_queue_size} patients waiting for scheduling`
            : 'Queue is clear — nothing to schedule'}
        </p>
        <Link href="/department-head/schedule/batch">
          <Button
            className="mt-4 w-full gap-2 font-semibold"
            disabled={!hasWaiting}
          >
            <Zap className="h-4 w-4" />
            Run Batch Schedule
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// ─── Mini KPI Card ────────────────────────────────────────────────────────────

function KpiCard({
  title,
  value,
  href,
  accent,
  icon: Icon,
  emptyLabel,
}: {
  title: string;
  value: number;
  href: string;
  accent?: 'red' | 'green';
  icon: React.ComponentType<{ className?: string }>;
  emptyLabel?: string;
}) {
  const isEmpty = value === 0;
  const valueColor =
    accent === 'red' && value > 0
      ? 'text-destructive'
      : accent === 'green'
      ? 'text-emerald-600'
      : 'text-foreground';

  return (
    <Link href={href}>
      <Card className="border bg-card shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground leading-tight">
              {title}
            </p>
            <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
          {isEmpty && emptyLabel ? (
            <div className="flex items-center gap-1.5 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs font-semibold">{emptyLabel}</span>
            </div>
          ) : (
            <p className={`text-3xl font-extrabold tabular-nums ${valueColor}`}>
              {value}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

// ─── Status Breakdown Chart ───────────────────────────────────────────────────

function StatusBreakdownChart({ stats }: { stats: DashboardStats }) {
  const data = (stats.status_counts || [])
    .filter((s) => s.count > 0)
    .map((s) => ({
      name: s.status.replace(/_/g, ' '),
      count: s.count,
      fill: STATUS_COLORS[s.status] || '#9ca3af',
    }));

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
        <BarChart3 className="h-10 w-10 opacity-30 mb-2" />
        <p className="text-sm">No referral data</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 0, right: 16, top: 0, bottom: 0 }}
      >
        <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
        <YAxis
          type="category"
          dataKey="name"
          width={160}
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
        />
        <Tooltip
          contentStyle={{
            background: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 8,
            fontSize: 12,
          }}
          cursor={{ fill: 'hsl(var(--muted))' }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Trends Chart ─────────────────────────────────────────────────────────────

function TrendsChart({ data }: { data: TrendEntry[] }) {
  const chartData = data.map((d) => ({
    date: format(new Date(d.date), 'MMM d'),
    booked: d.booked_slots,
    max: d.max_slots,
    utilization: Math.round(d.utilization * 100),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
        <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
        <Tooltip
          contentStyle={{
            background: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Line
          type="monotone"
          dataKey="max"
          stroke="hsl(var(--muted-foreground))"
          strokeDasharray="4 2"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="booked"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── Activity Row ─────────────────────────────────────────────────────────────

function ActivityRow({ entry }: { entry: ActivityEntry }) {
  const when = format(new Date(entry.timestamp), 'MMM d, HH:mm');
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
      <div className="mt-0.5 h-7 w-7 shrink-0 rounded-lg flex items-center justify-center bg-muted">
        <ActivityIcon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-snug">{entry.summary}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {entry.actor_name} · {when}
        </p>
      </div>
    </div>
  );
}

// ─── Top Waiting List ─────────────────────────────────────────────────────────

function TopWaitingRow({ item }: { item: TopWaiting }) {
  return (
    <Link href={`/department-head/triage-queue/${item.referral_id}`}>
      <div className="flex items-center gap-3 py-2.5 hover:bg-muted/40 rounded-lg px-2 transition-colors cursor-pointer">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {item.patient_name}
          </p>
          <p className="text-xs text-muted-foreground">
            {item.waiting_days}d waiting
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-foreground tabular-nums">
            {item.composite_score.toFixed(1)}
          </p>
          <p className="text-[10px] text-muted-foreground">score</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </div>
    </Link>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function DeptHeadDashboard() {
  const {
    data: stats,
    isLoading: isStatsLoading,
    isError: isStatsError,
  } = useGetDashboardStatsQuery(undefined, { pollingInterval: 60_000 });

  const { data: trends = [], isLoading: isTrendsLoading } =
    useGetDashboardTrendsQuery(14, { pollingInterval: 60_000 });

  const { data: buckets } = useGetPriorityBucketsQuery(undefined, {
    pollingInterval: 90_000,
  });

  const { data: activityResult } = useGetActivityQuery(
    { limit: 5 },
    { pollingInterval: 90_000 }
  );
  const activityEntries = activityResult?.data ?? [];

  const today = format(new Date(), 'EEEE, MMMM d, yyyy');

  if (isStatsLoading) {
    return (
      <div className="max-w-[1400px] mx-auto space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  if (isStatsError || !stats) {
    return (
      <div className="max-w-[1400px] mx-auto">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-8 flex flex-col items-center gap-4 text-center">
            <XCircle className="h-12 w-12 text-destructive" />
            <div>
              <p className="font-semibold text-foreground">
                Could not load dashboard
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Check your connection or contact support.
              </p>
            </div>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Department Head Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{today}</p>
        </div>
        <Link href="/department-head/schedule/batch">
          <Button className="gap-2 font-semibold">
            <Zap className="h-4 w-4" />
            Run Batch Schedule
          </Button>
        </Link>
      </div>

      {/* Row 1: 3 main cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CapacityTodayCard stats={stats} />
        <WaitingQueueCard stats={stats} />
        <RunBatchCard stats={stats} />
      </div>

      {/* Row 2: 4 mini KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Scheduled Today"
          value={stats.scheduled_today}
          href={`/department-head/schedule/patients?date=${format(new Date(), 'yyyy-MM-dd')}`}
          icon={Calendar}
        />
        <KpiCard
          title="Next 7 Days"
          value={stats.scheduled_next_7_days}
          href="/department-head/capacity"
          icon={TrendingUp}
        />
        <KpiCard
          title="Missed Last 7 Days"
          value={stats.missed_last_7_days}
          href="/department-head/schedule"
          accent="red"
          emptyLabel="None missed"
          icon={XCircle}
        />
        <KpiCard
          title="Active Staff"
          value={stats.active_staff}
          href="/department-head/staff"
          icon={Users}
        />
      </div>

      {/* Row 3: Active overrides + status breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KpiCard
          title="Active Overrides"
          value={stats.active_overrides}
          href="/department-head/capacity/overrides"
          emptyLabel="None active"
          icon={ShieldAlert}
        />
        <div className="sm:col-span-3">
          <Card className="border bg-card shadow-sm h-full">
            <CardHeader className="py-3 px-5 border-b border-border">
              <CardTitle className="text-sm font-semibold">
                Referral Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <StatusBreakdownChart stats={stats} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Row 4: Trends chart */}
      <Card className="border bg-card shadow-sm">
        <CardHeader className="py-3 px-5 border-b border-border">
          <CardTitle className="text-sm font-semibold">
            Capacity Utilization — Last 14 Days
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          {isTrendsLoading ? (
            <Skeleton className="h-52 w-full" />
          ) : trends.length > 0 ? (
            <TrendsChart data={trends} />
          ) : (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
              No trend data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Row 5: Activity + Top Waiting */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border bg-card shadow-sm">
          <CardHeader className="py-3 px-5 border-b border-border flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
            <Link
              href="/department-head/activity"
              className="text-xs text-primary hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-4">
            {activityEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <ActivityIcon className="h-8 w-8 opacity-30 mb-2" />
                <p className="text-sm">Quiet so far</p>
              </div>
            ) : (
              <div>
                {activityEntries.map((e) => (
                  <ActivityRow key={e.id} entry={e} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-sm">
          <CardHeader className="py-3 px-5 border-b border-border flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Top Waiting Patients</CardTitle>
            <Link
              href="/department-head/triage-queue"
              className="text-xs text-primary hover:underline"
            >
              View queue
            </Link>
          </CardHeader>
          <CardContent className="p-4">
            {!buckets?.top_waiting || buckets.top_waiting.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 opacity-30 mb-2" />
                <p className="text-sm">Queue is clear</p>
              </div>
            ) : (
              <div>
                {buckets.top_waiting.slice(0, 5).map((item) => (
                  <TopWaitingRow key={item.referral_id} item={item} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
