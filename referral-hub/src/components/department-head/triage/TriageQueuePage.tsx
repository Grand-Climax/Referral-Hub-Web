'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import {
  AlertTriangle,
  ArrowDownUp,
  ArrowRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  Clock4,
  Hospital,
  ListFilter,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  Stethoscope,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  useGetTriageQueueQuery,
  useGetPriorityBucketsQuery,
} from '@/features/department-head/departmentHeadApi';
import type {
  ArrivalStatus,
  Condition,
  ReferralStatusEnum,
  TriageListItem,
  TriageQueueFilters,
  TriageSortBy,
  TriageSortOrder,
} from '@/types/department-head';

// ─── Visual cookbook (§8.5) ──────────────────────────────────────────────────

function scoreChip(score: number) {
  if (score >= 80)
    return {
      cls: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900',
      label: 'Critical',
    };
  if (score >= 60)
    return {
      cls: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900',
      label: 'High',
    };
  if (score >= 40)
    return {
      cls: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
      label: 'Medium',
    };
  return {
    cls: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
    label: 'Low',
  };
}

const CONDITION_PILL: Record<Condition | '', string> = {
  critical: 'bg-red-600 text-white',
  urgent: 'bg-orange-500 text-white',
  stable: 'bg-emerald-500 text-white',
  '': 'bg-slate-300 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
};

const ARRIVAL_BADGE: Record<ArrivalStatus, { cls: string; label: string; emoji: string }> = {
  EXPECTED: {
    cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    label: 'Expected',
    emoji: '◷',
  },
  ARRIVED: {
    cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    label: 'Arrived',
    emoji: '✓',
  },
  ADMITTED: {
    cls: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    label: 'Admitted',
    emoji: '🏥',
  },
  MISSED: {
    cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    label: 'Missed',
    emoji: '⚠',
  },
};

const REFERRAL_BADGE: Record<ReferralStatusEnum, string> = {
  ACCEPTED:
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300',
  SCHEDULED:
    'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
};

// ─── Chip components ─────────────────────────────────────────────────────────

function ScoreChip({ score }: { score: number }) {
  const cfg = scoreChip(score);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold tabular-nums ${cfg.cls}`}
      aria-label={`Composite score: ${score.toFixed(1)}, ${cfg.label}`}
      title={cfg.label}
    >
      {score.toFixed(1)}
    </span>
  );
}

function ConditionPill({ condition }: { condition?: Condition | '' | null }) {
  // Backend may send "" or null on rows where the condition wasn't captured.
  // Render a neutral dash rather than crashing the row.
  const key = (condition ?? '') as Condition | '';
  if (!key) return <span className="text-muted-foreground text-xs">—</span>;
  const cls = CONDITION_PILL[key] ?? CONDITION_PILL[''];
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cls}`}
    >
      {key}
    </span>
  );
}

const ARRIVAL_FALLBACK = {
  cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  label: 'Unknown',
  emoji: '·',
} as const;

function ArrivalBadge({ status }: { status?: ArrivalStatus | string | null }) {
  // Defensive: server may return new/empty statuses; never crash the row.
  const cfg = (status && ARRIVAL_BADGE[status as ArrivalStatus]) || ARRIVAL_FALLBACK;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${cfg.cls}`}
    >
      <span aria-hidden>{cfg.emoji}</span>
      {cfg.label}
    </span>
  );
}

function ReferralBadge({ status }: { status?: ReferralStatusEnum | string | null }) {
  if (!status) return <span className="text-muted-foreground text-xs">—</span>;
  const cls =
    REFERRAL_BADGE[status as ReferralStatusEnum] ??
    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cls}`}
    >
      {status}
    </span>
  );
}

// ─── Buckets chart (dept-head only convenience widget) ───────────────────────

function BucketsChart({
  data,
}: {
  data: { label: string; count: number }[];
}) {
  const palette: Record<string, string> = {
    CRITICAL: '#dc2626',
    URGENT: '#ea580c',
    STABLE: '#10b981',
    HIGH: '#dc2626',
    MEDIUM: '#f59e0b',
    LOW: '#10b981',
    UNSPECIFIED: '#94a3b8',
    UNKNOWN: '#94a3b8',
  };
  const chartData = data.map((d) => ({
    name: d.label,
    count: d.count,
    fill: palette[d.label] ?? '#3b82f6',
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
        <Bar dataKey="count" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function safeFormat(value?: string | null, pattern = 'MMM d, HH:mm') {
  if (!value) return '—';
  const d = parseISO(value);
  return isValid(d) ? format(d, pattern) : '—';
}

const ARRIVAL_OPTIONS: { value: ArrivalStatus; label: string }[] = [
  { value: 'EXPECTED', label: 'Expected' },
  { value: 'ARRIVED', label: 'Arrived' },
  { value: 'ADMITTED', label: 'Admitted' },
  { value: 'MISSED', label: 'Missed' },
];

// ─── URL <-> filter state plumbing ──────────────────────────────────────────

function readFiltersFromSearchParams(sp: URLSearchParams): TriageQueueFilters {
  const arrivalRaw = sp.get('arrival_status');
  const referralRaw = sp.get('referral_status');
  const hasDoc = sp.get('has_doctor_assigned');
  const sortBy = sp.get('sort_by') as TriageSortBy | null;
  const sortOrder = sp.get('sort_order') as TriageSortOrder | null;

  const filters: TriageQueueFilters = {
    page: Number(sp.get('page') ?? '1') || 1,
    limit: Number(sp.get('limit') ?? '20') || 20,
  };
  if (arrivalRaw) {
    filters.arrival_status = arrivalRaw.split(',').filter(Boolean) as ArrivalStatus[];
  }
  if (referralRaw) {
    filters.referral_status = referralRaw.split(',').filter(Boolean) as ReferralStatusEnum[];
  }
  if (hasDoc === 'true' || hasDoc === 'false') {
    filters.has_doctor_assigned = hasDoc === 'true';
  }
  const nationalId = sp.get('national_id');
  if (nationalId) filters.national_id = nationalId;
  if (sortBy === 'composite_score' || sortBy === 'appointment_date' || sortBy === 'created_at') {
    filters.sort_by = sortBy;
  }
  if (sortOrder === 'asc' || sortOrder === 'desc') {
    filters.sort_order = sortOrder;
  }
  if (sp.get('include_terminal') === 'true') filters.include_terminal = true;
  return filters;
}

function filtersToSearchParams(f: TriageQueueFilters): URLSearchParams {
  const sp = new URLSearchParams();
  if (f.page && f.page > 1) sp.set('page', String(f.page));
  if (f.limit && f.limit !== 20) sp.set('limit', String(f.limit));
  if (f.arrival_status?.length) sp.set('arrival_status', f.arrival_status.join(','));
  if (f.referral_status?.length) sp.set('referral_status', f.referral_status.join(','));
  if (typeof f.has_doctor_assigned === 'boolean')
    sp.set('has_doctor_assigned', String(f.has_doctor_assigned));
  if (f.national_id) sp.set('national_id', f.national_id);
  if (f.sort_by) sp.set('sort_by', f.sort_by);
  if (f.sort_order) sp.set('sort_order', f.sort_order);
  if (f.include_terminal) sp.set('include_terminal', 'true');
  return sp;
}

// ─── Main page ──────────────────────────────────────────────────────────────

export default function TriageQueuePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Derive the active filter set from URL on every render so deep-links work.
  const filters = useMemo(
    () => readFiltersFromSearchParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  // Local-only state for the search input (debounced before pushing to URL).
  const [nationalIdInput, setNationalIdInput] = useState(filters.national_id ?? '');

  useEffect(() => {
    setNationalIdInput(filters.national_id ?? '');
  }, [filters.national_id]);

  const updateFilters = useCallback(
    (patch: Partial<TriageQueueFilters>, options?: { resetPage?: boolean }) => {
      const merged: TriageQueueFilters = {
        ...filters,
        ...patch,
        page: options?.resetPage ? 1 : (patch.page ?? filters.page),
      };
      // Drop empty arrays / undefined sentinel values so the URL stays clean.
      if (merged.arrival_status && merged.arrival_status.length === 0)
        delete merged.arrival_status;
      if (merged.referral_status && merged.referral_status.length === 0)
        delete merged.referral_status;
      const sp = filtersToSearchParams(merged);
      router.replace(`?${sp.toString()}`, { scroll: false });
    },
    [filters, router],
  );

  // Debounce the national_id input — 300 ms feels right for the table.
  useEffect(() => {
    if ((nationalIdInput || '') === (filters.national_id || '')) return;
    const t = window.setTimeout(() => {
      updateFilters({ national_id: nationalIdInput || undefined }, { resetPage: true });
    }, 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nationalIdInput]);

  const {
    data: envelope,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetTriageQueueQuery(filters, { pollingInterval: 90_000 });

  const { data: buckets, isLoading: isBucketsLoading } = useGetPriorityBucketsQuery(undefined, {
    pollingInterval: 90_000,
  });

  const patients = envelope?.data ?? [];
  const total = envelope?.total ?? 0;
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const hasMore = envelope?.has_more ?? false;

  // Quick header stats from the current page (best-effort; the server has the
  // real totals but we don't have a dedicated counts endpoint here).
  const counts = useMemo(() => {
    return patients.reduce(
      (acc, p) => {
        if (p.referral_status === 'ACCEPTED') acc.waiting++;
        if (p.referral_status === 'SCHEDULED') acc.scheduled++;
        if (p.arrival_status === 'MISSED') acc.missed++;
        return acc;
      },
      { waiting: 0, scheduled: 0, missed: 0 },
    );
  }, [patients]);

  const activeArrivals = filters.arrival_status ?? [];
  const toggleArrival = (status: ArrivalStatus) => {
    const next = activeArrivals.includes(status)
      ? activeArrivals.filter((s) => s !== status)
      : [...activeArrivals, status];
    updateFilters({ arrival_status: next }, { resetPage: true });
  };

  const clearAllFilters = () => {
    router.replace('?', { scroll: false });
    setNationalIdInput('');
  };

  const hasAnyFilter =
    (filters.arrival_status?.length ?? 0) > 0 ||
    (filters.referral_status?.length ?? 0) > 0 ||
    typeof filters.has_doctor_assigned === 'boolean' ||
    !!filters.national_id ||
    !!filters.sort_by ||
    !!filters.include_terminal;

  return (
    <div className="max-w-[1400px] mx-auto space-y-5">
      {/* ─── Page header ────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Triage Queue</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Read-only view of every active referral in your department.{' '}
            <span className="text-foreground/80 font-medium">
              {total} total · {counts.waiting} waiting · {counts.scheduled} scheduled · {counts.missed}{' '}
              missed
            </span>
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* ─── Buckets ────────────────────────────────────────────────── */}
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
            ) : buckets?.by_condition?.length ? (
              <BucketsChart data={buckets.by_condition} />
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
            ) : buckets?.by_severity?.length ? (
              <BucketsChart data={buckets.by_severity} />
            ) : (
              <p className="text-sm text-muted-foreground">No data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── Sticky filter bar ──────────────────────────────────────── */}
      <Card className="border bg-card shadow-sm sticky top-2 z-10 backdrop-blur-sm">
        <CardContent className="p-3 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Arrival status chips */}
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mr-1">
              Arrival
            </span>
            {ARRIVAL_OPTIONS.map((opt) => {
              const isOn = activeArrivals.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleArrival(opt.value)}
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all ${
                    isOn
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-background text-foreground border-border hover:bg-muted'
                  }`}
                >
                  <span aria-hidden>{ARRIVAL_BADGE[opt.value].emoji}</span>
                  {opt.label}
                </button>
              );
            })}

            <span className="mx-1 h-5 w-px bg-border" aria-hidden />

            {/* Referral status — single-select */}
            <Select
              value={filters.referral_status?.[0] ?? 'ALL'}
              onValueChange={(value) =>
                updateFilters(
                  {
                    referral_status: value === 'ALL' ? undefined : [value as ReferralStatusEnum],
                  },
                  { resetPage: true },
                )
              }
            >
              <SelectTrigger className="h-8 w-[150px] text-xs">
                <SelectValue placeholder="Referral status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All referrals</SelectItem>
                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              </SelectContent>
            </Select>

            {/* Doctor assignment */}
            <Select
              value={
                typeof filters.has_doctor_assigned === 'boolean'
                  ? filters.has_doctor_assigned
                    ? 'YES'
                    : 'NO'
                  : 'ALL'
              }
              onValueChange={(value) =>
                updateFilters(
                  {
                    has_doctor_assigned:
                      value === 'YES' ? true : value === 'NO' ? false : undefined,
                  },
                  { resetPage: true },
                )
              }
            >
              <SelectTrigger className="h-8 w-[150px] text-xs">
                <SelectValue placeholder="Assigned doctor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Any doctor</SelectItem>
                <SelectItem value="YES">Has doctor</SelectItem>
                <SelectItem value="NO">Unassigned</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select
              value={`${filters.sort_by ?? 'composite_score'}:${filters.sort_order ?? 'desc'}`}
              onValueChange={(value) => {
                const [sb, so] = value.split(':') as [TriageSortBy, TriageSortOrder];
                updateFilters({ sort_by: sb, sort_order: so }, { resetPage: true });
              }}
            >
              <SelectTrigger className="h-8 w-[200px] text-xs">
                <ArrowDownUp className="h-3 w-3 mr-1.5 opacity-60" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="composite_score:desc">Score (highest first)</SelectItem>
                <SelectItem value="composite_score:asc">Score (lowest first)</SelectItem>
                <SelectItem value="appointment_date:asc">Appointment (soonest)</SelectItem>
                <SelectItem value="appointment_date:desc">Appointment (latest)</SelectItem>
                <SelectItem value="created_at:desc">Newest referrals</SelectItem>
                <SelectItem value="created_at:asc">Oldest referrals</SelectItem>
              </SelectContent>
            </Select>

            <span className="mx-1 h-5 w-px bg-border" aria-hidden />

            {/* Audit toggle */}
            <button
              type="button"
              onClick={() =>
                updateFilters(
                  { include_terminal: filters.include_terminal ? undefined : true },
                  { resetPage: true },
                )
              }
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium transition-all ${
                filters.include_terminal
                  ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300'
                  : 'bg-background text-muted-foreground border-border hover:bg-muted'
              }`}
              title="Include terminal statuses (COMPLETED, DECEASED, REJECTED…)"
            >
              <ShieldAlert className="h-3 w-3" />
              Audit view
            </button>

            <div className="ml-auto flex items-center gap-2">
              {/* National ID search */}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={nationalIdInput}
                  onChange={(e) => setNationalIdInput(e.target.value)}
                  placeholder="Search national ID"
                  className="h-8 w-[200px] pl-8 text-xs"
                />
                {nationalIdInput && (
                  <button
                    type="button"
                    onClick={() => setNationalIdInput('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {hasAnyFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-8 text-xs gap-1.5"
                >
                  <X className="h-3 w-3" />
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Queue table ────────────────────────────────────────────── */}
      <Card className="border bg-card shadow-sm">
        <CardHeader className="py-4 px-5 border-b border-border flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Queue</CardTitle>
            {total > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
              </p>
            )}
          </div>
          {isFetching && !isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </CardHeader>

        <CardContent className="p-0">
          {isLoading && (
            <div className="space-y-1 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <p className="text-sm font-medium text-foreground">Failed to load triage queue</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          )}

          {!isLoading && !isError && patients.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
              <ListFilter className="h-10 w-10 opacity-30" />
              <p className="text-sm font-medium text-foreground">
                {hasAnyFilter ? 'No results match your filters.' : 'Queue is empty.'}
              </p>
              {hasAnyFilter ? (
                <Button variant="outline" size="sm" onClick={clearAllFilters}>
                  Clear filters
                </Button>
              ) : (
                <p className="text-xs">No patients waiting in triage right now — enjoy the moment.</p>
              )}
            </div>
          )}

          {!isLoading && !isError && patients.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" role="table">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {[
                        'Score',
                        'Patient',
                        'Condition',
                        'Referral',
                        'Arrival',
                        'Appointment',
                        'Doctor',
                        '',
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
                      <TriageRow key={p.referral_id} patient={p} />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-muted-foreground">
                <span>
                  Page {page} of {totalPages} · {total} total
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateFilters({ page: Math.max(1, page - 1) })}
                    disabled={page <= 1}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background disabled:opacity-40 hover:bg-muted"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => updateFilters({ page: page + 1 })}
                    disabled={!hasMore && page >= totalPages}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background disabled:opacity-40 hover:bg-muted"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Row ─────────────────────────────────────────────────────────────────────

function TriageRow({ patient }: { patient: TriageListItem }) {
  return (
    <tr className="transition-colors hover:bg-muted/40">
      <td className="px-4 py-3.5">
        <ScoreChip score={patient.composite_score ?? 0} />
      </td>
      <td className="px-4 py-3.5">
        <div className="font-semibold text-foreground">{patient.patient_name}</div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Building2 className="h-3 w-3" />
          {patient.department_name || '—'}
          {patient.queue_id ? (
            <span
              className="ml-2 cursor-help font-mono text-[10px] opacity-60"
              title={`Audit ID: ${patient.queue_id}`}
            >
              #{patient.queue_id.slice(0, 6)}
            </span>
          ) : null}
        </div>
      </td>
      <td className="px-4 py-3.5">
        <ConditionPill condition={patient.condition_at_referral} />
      </td>
      <td className="px-4 py-3.5">
        <ReferralBadge status={patient.referral_status} />
      </td>
      <td className="px-4 py-3.5">
        <ArrivalBadge status={patient.arrival_status} />
      </td>
      <td className="px-4 py-3.5 text-sm text-foreground">
        {patient.appointment_date ? (
          <span className="inline-flex items-center gap-1 text-foreground">
            <Clock4 className="h-3 w-3 text-muted-foreground" />
            {safeFormat(patient.appointment_date, 'MMM d · HH:mm')}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-4 py-3.5 text-xs">
        {patient.has_doctor_assigned ? (
          <Badge variant="outline" className="gap-1 font-normal">
            <Stethoscope className="h-3 w-3" />
            {patient.assigned_doctor_name ?? 'Assigned'}
          </Badge>
        ) : (
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Hospital className="h-3 w-3" />
            Unassigned
          </span>
        )}
      </td>
      <td className="px-4 py-3.5 text-right">
        <Link href={`/department-head/triage-queue/${patient.referral_id}`}>
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
            View <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </td>
    </tr>
  );
}
