'use client';

import Link from 'next/link';
import { useState } from 'react';
import { format } from 'date-fns';
import {
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Loader2,
  ListFilter,
  ArrowRight,
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
} from 'recharts';

import {
  useGetTriageQueueQuery,
  useGetPriorityBucketsQuery,
} from '@/features/department-head/departmentHeadApi';
import type { TriagePatient } from '@/types/department-head';

const PAGE_SIZE = 20;

const CONDITION_COLORS: Record<string, { bar: string; badge: string }> = {
  CRITICAL: {
    bar: '#ef4444',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  },
  URGENT: {
    bar: '#f59e0b',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  STABLE: {
    bar: '#10b981',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  UNSPECIFIED: { bar: '#9ca3af', badge: 'bg-slate-100 text-slate-600' },
};

const SEVERITY_COLORS: Record<string, { bar: string; badge: string }> = {
  HIGH: { bar: '#ef4444', badge: 'bg-red-100 text-red-700' },
  MEDIUM: { bar: '#f59e0b', badge: 'bg-amber-100 text-amber-700' },
  LOW: { bar: '#10b981', badge: 'bg-emerald-100 text-emerald-700' },
  UNKNOWN: { bar: '#9ca3af', badge: 'bg-slate-100 text-slate-600' },
};

function UrgencyBadge({ level }: { level?: string }) {
  const cfg = CONDITION_COLORS[level ?? ''] ?? CONDITION_COLORS.UNSPECIFIED;
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${cfg.badge}`}
    >
      {level ?? 'UNSPECIFIED'}
    </span>
  );
}

function CompositeBar({ score }: { score?: number }) {
  const s = score ?? 0;
  const pct = Math.min((s / 100) * 100, 100);
  const color = s >= 80 ? '#ef4444' : s >= 50 ? '#f59e0b' : '#10b981';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-sm font-bold tabular-nums text-foreground">{s.toFixed(1)}</span>
    </div>
  );
}

function BucketsChart({
  data,
  colors,
}: {
  data: { label: string; count: number }[];
  colors: Record<string, { bar: string; badge: string }>;
}) {
  const chartData = data.map((d) => ({
    name: d.label,
    count: d.count,
    fill: colors[d.label]?.bar ?? '#9ca3af',
  }));
  return (
    <ResponsiveContainer width="100%" height={120}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ left: 0, right: 12, top: 0, bottom: 0 }}
      >
        <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
        <YAxis
          type="category"
          dataKey="name"
          width={92}
          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
        />
        <Tooltip
          contentStyle={{
            fontSize: 11,
            background: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 6,
          }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function TriageRow({ patient }: { patient: TriagePatient }) {
  const referralId = patient.referral_id ?? patient.id;
  const score = patient.composite_score ?? patient.severity_score;
  const urgency = patient.urgency_level;
  const aptDate = patient.appointment_date
    ? format(new Date(patient.appointment_date), 'MMM d')
    : '—';

  return (
    <tr
      className={`transition-colors hover:bg-muted/40 ${
        urgency === 'CRITICAL' ? 'bg-red-50/30 dark:bg-red-950/10' : ''
      }`}
    >
      <td className="px-4 py-3.5">
        <span className="font-semibold text-foreground">{patient.patient_name}</span>
        {patient.waiting_days !== undefined && (
          <p className="text-xs text-muted-foreground mt-0.5">{patient.waiting_days}d waiting</p>
        )}
      </td>
      <td className="px-4 py-3.5">
        <CompositeBar score={score} />
      </td>
      <td className="px-4 py-3.5">
        <UrgencyBadge level={urgency} />
      </td>
      <td className="px-4 py-3.5 text-sm text-foreground">{patient.status ?? '—'}</td>
      <td className="px-4 py-3.5 text-sm text-foreground">{aptDate}</td>
      <td className="px-4 py-3.5 text-sm text-muted-foreground">
        {patient.assigned_doctor_id ? (
          <Badge variant="outline" className="text-[10px]">
            Assigned
          </Badge>
        ) : (
          <span className="text-[11px] text-muted-foreground">Unassigned</span>
        )}
      </td>
      <td className="px-4 py-3.5">
        <Link href={`/department-head/triage-queue/${referralId}`}>
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
            View <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </td>
    </tr>
  );
}

export default function TriageQueuePage() {
  const [page, setPage] = useState(1);

  const { data: queueResult, isLoading, isError } = useGetTriageQueueQuery(
    { page, page_size: PAGE_SIZE },
    { pollingInterval: 90_000 }
  );

  const { data: buckets, isLoading: isBucketsLoading } = useGetPriorityBucketsQuery(undefined, {
    pollingInterval: 90_000,
  });

  const patients = queueResult?.data ?? [];
  const total = queueResult?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-[1400px] mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Triage Queue</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Prioritized by composite score — matches the booking engine order.
        </p>
      </div>

      {/* Buckets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border bg-card shadow-sm">
          <CardHeader className="py-3 px-5 border-b border-border">
            <CardTitle className="text-sm font-semibold">
              By Condition
              {buckets && (
                <span className="ml-2 text-muted-foreground font-normal">
                  ({buckets.total_waiting} waiting)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            {isBucketsLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : buckets?.by_condition ? (
              <BucketsChart data={buckets.by_condition} colors={CONDITION_COLORS} />
            ) : (
              <p className="text-sm text-muted-foreground">No data</p>
            )}
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-sm">
          <CardHeader className="py-3 px-5 border-b border-border">
            <CardTitle className="text-sm font-semibold">By ML Severity</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            {isBucketsLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : buckets?.by_severity ? (
              <BucketsChart data={buckets.by_severity} colors={SEVERITY_COLORS} />
            ) : (
              <p className="text-sm text-muted-foreground">No data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Queue Table */}
      <Card className="border bg-card shadow-sm">
        <CardHeader className="py-4 px-5 border-b border-border flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Queue</CardTitle>
            {total > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">{total} patients total</p>
            )}
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-3.5 w-3.5" />
            Filter
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <span className="ml-3 text-sm text-muted-foreground">Loading queue…</span>
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <p className="text-sm font-medium text-foreground">Failed to load triage queue</p>
              <p className="text-xs">Please try again later.</p>
            </div>
          )}

          {!isLoading && !isError && patients.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
              <ListFilter className="h-10 w-10 opacity-30" />
              <p className="text-sm font-medium text-foreground">Queue is empty</p>
              <p className="text-xs">No patients waiting in triage.</p>
            </div>
          )}

          {!isLoading && !isError && patients.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {[
                        'Patient',
                        'Composite Score',
                        'ML Tier',
                        'Status',
                        'Appointment',
                        'Doctor',
                        'Actions',
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {patients.map((p) => (
                      <TriageRow key={p.id} patient={p} />
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-muted-foreground">
                  <span>
                    Page {page} of {totalPages} · {total} total
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background disabled:opacity-40"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background disabled:opacity-40"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
