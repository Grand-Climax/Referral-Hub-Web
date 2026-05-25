'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  addDays,
  differenceInCalendarDays,
  format,
  isToday,
  isTomorrow,
  isValid,
  parseISO,
} from 'date-fns';
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  Info,
  Users,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

import { useGetScheduleQuery } from '@/features/department-head/departmentHeadApi';
import type { DailySchedule } from '@/types/department-head';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseScheduleDate(s: DailySchedule): Date | null {
  const raw = s.schedule_date ?? s.date;
  if (!raw) return null;
  const d = parseISO(raw);
  return isValid(d) ? d : null;
}

/**
 * Returns a short, human friendly label for the row's date —
 *   "Today", "Tomorrow", "Yesterday", or a +N/-N day offset relative to
 *   today. Combined with the full date in the card, this lets the user
 *   scan the list quickly without converting calendar dates in their
 *   head.
 */
function relativeLabel(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  const diff = differenceInCalendarDays(date, new Date());
  if (diff === -1) return 'Yesterday';
  if (diff > 0 && diff <= 14) return `+${diff} days`;
  if (diff < 0 && diff >= -14) return `${diff} days`;
  return format(date, 'EEEE');
}

interface FillSummary {
  routineBooked: number;
  routineCap: number;
  overbookUsed: number;
  overbookCap: number;
  totalCap: number;
  routinePct: number;
  totalPct: number;
  /** Visual status for the badge + bar tint. */
  status:
    | { label: 'Available'; barClass: string; pillClass: string }
    | { label: 'Filling up'; barClass: string; pillClass: string }
    | { label: 'Routine full'; barClass: string; pillClass: string }
    | { label: 'Overbooked'; barClass: string; pillClass: string }
    | { label: 'Full'; barClass: string; pillClass: string };
}

function summarise(schedule: DailySchedule): FillSummary {
  const routineCap = schedule.max_slots ?? 0;
  const overbookCap = schedule.overbook_limit ?? 0;
  const totalCap = routineCap + overbookCap;
  const booked = schedule.booked_slots ?? 0;

  const routineBooked = Math.min(booked, routineCap);
  const overbookUsed = Math.max(0, booked - routineCap);
  const routinePct = routineCap > 0 ? (routineBooked / routineCap) * 100 : 0;
  const totalPct = totalCap > 0 ? (booked / totalCap) * 100 : 0;

  // Pick a status pill + matching bar tint. Order matters: check the
  // worst cases first so e.g. "Full" wins over "Filling up".
  let status: FillSummary['status'];
  if (totalCap > 0 && booked >= totalCap) {
    status = {
      label: 'Full',
      barClass: 'bg-red-600',
      pillClass:
        'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900',
    };
  } else if (overbookUsed > 0) {
    status = {
      label: 'Overbooked',
      barClass: 'bg-amber-600',
      pillClass:
        'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
    };
  } else if (routinePct >= 100) {
    status = {
      label: 'Routine full',
      barClass: 'bg-amber-500',
      pillClass:
        'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
    };
  } else if (routinePct >= 80) {
    status = {
      label: 'Filling up',
      barClass: 'bg-amber-500',
      pillClass:
        'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
    };
  } else {
    status = {
      label: 'Available',
      barClass: 'bg-emerald-500',
      pillClass:
        'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
    };
  }

  return {
    routineBooked,
    routineCap,
    overbookUsed,
    overbookCap,
    totalCap,
    routinePct,
    totalPct,
    status,
  };
}

// ─── Card ────────────────────────────────────────────────────────────────────

function ScheduleCard({ schedule }: { schedule: DailySchedule }) {
  const date = parseScheduleDate(schedule);
  const fill = summarise(schedule);

  const isPast =
    date != null && differenceInCalendarDays(date, new Date()) < 0;

  const detailHref = date
    ? `/department-head/schedule/patients?date=${format(date, 'yyyy-MM-dd')}`
    : '#';

  return (
    <Card
      className={`border bg-card shadow-sm transition-shadow hover:shadow-md ${
        isPast ? 'opacity-80' : ''
      }`}
    >
      <CardContent className="p-5 space-y-3.5">
        {/* Header: date + status pill */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-sm font-bold text-foreground">
                {date ? relativeLabel(date) : '—'}
              </span>
              <span className="text-xs text-muted-foreground">
                {date ? format(date, 'EEE') : ''}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
              {date ? format(date, 'MMMM d, yyyy') : '—'}
            </p>
          </div>
          <Badge
            variant="outline"
            className={`text-[10px] font-semibold tracking-wide shrink-0 ${fill.status.pillClass}`}
          >
            {fill.status.label}
          </Badge>
        </div>

        {/* Booked / max + progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold tabular-nums text-foreground leading-none">
              {schedule.booked_slots}
            </span>
            <span className="text-base text-muted-foreground tabular-nums">
              / {fill.routineCap}
            </span>
            <span className="text-[11px] text-muted-foreground ml-1">
              booked
            </span>
          </div>
          <div
            className="h-2 w-full rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(fill.totalPct)}
            aria-label={`${schedule.booked_slots} of ${fill.totalCap} total slots booked`}
          >
            <div
              className={`h-full rounded-full ${fill.status.barClass} transition-all`}
              style={{ width: `${Math.min(fill.totalPct, 100)}%` }}
            />
          </div>
        </div>

        {/* Capacity breakdown */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-md bg-muted/40 px-2.5 py-1.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Routine left
            </p>
            <p className="font-bold tabular-nums text-foreground">
              {Math.max(0, fill.routineCap - fill.routineBooked)}
              <span className="text-muted-foreground font-normal text-[11px]">
                {' '}
                / {fill.routineCap}
              </span>
            </p>
          </div>
          <div className="rounded-md bg-muted/40 px-2.5 py-1.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Overbook
            </p>
            <p className="font-bold tabular-nums text-foreground">
              {fill.overbookUsed}
              <span className="text-muted-foreground font-normal text-[11px]">
                {' '}
                / {fill.overbookCap}
              </span>
            </p>
          </div>
        </div>

        {/* Footer: patients-of-day link */}
        <Link
          href={detailHref}
          className="flex items-center justify-between gap-2 -mx-1.5 px-1.5 py-1 rounded text-xs font-semibold text-primary hover:bg-primary/5 transition-colors"
        >
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            View patients
          </span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </CardContent>
    </Card>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

type Mode = 'single' | 'range';

export default function ScheduleLogPage() {
  const today = format(new Date(), 'yyyy-MM-dd');
  // Default range matches the backend's default (today through +30 days)
  // so the first paint of this page mirrors what you'd see by hitting the
  // endpoint with no params at all.
  const defaultRangeEnd = format(addDays(new Date(), 30), 'yyyy-MM-dd');

  const [mode, setMode] = useState<Mode>('range');
  const [singleDate, setSingleDate] = useState(today);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(defaultRangeEnd);

  const queryArg =
    mode === 'single'
      ? { date: singleDate }
      : { start_date: startDate, end_date: endDate };

  const { data: raw, isLoading, isError } = useGetScheduleQuery(queryArg);

  // Normalise to an array regardless of whether the backend returned a
  // single record (date mode) or a list (range mode), and sort by date so
  // the user sees nearest-future days first.
  const schedules: DailySchedule[] = useMemo(() => {
    const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];
    return [...arr].sort((a, b) => {
      const da = parseScheduleDate(a)?.getTime() ?? 0;
      const db = parseScheduleDate(b)?.getTime() ?? 0;
      return da - db;
    });
  }, [raw]);

  // Roll up high-level numbers across the visible window so the user can
  // see total load at a glance without scanning every card.
  const totals = useMemo(() => {
    if (schedules.length === 0) return null;
    return schedules.reduce(
      (acc, s) => {
        acc.days += 1;
        acc.booked += s.booked_slots ?? 0;
        acc.maxSlots += s.max_slots ?? 0;
        acc.overbook += s.overbook_limit ?? 0;
        return acc;
      },
      { days: 0, booked: 0, maxSlots: 0, overbook: 0 },
    );
  }, [schedules]);

  const isEmpty = schedules.length === 0;

  return (
    <div className="max-w-[1100px] mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Daily Schedule
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Booked vs. capacity for each day the department has on file.
        </p>
      </div>

      {/* Mode switcher */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMode('single')}
          className={`h-9 rounded-lg px-4 text-sm font-semibold transition-colors ${
            mode === 'single'
              ? 'bg-primary text-primary-foreground'
              : 'border border-border bg-background text-muted-foreground hover:bg-muted'
          }`}
        >
          Single day
        </button>
        <button
          onClick={() => setMode('range')}
          className={`h-9 rounded-lg px-4 text-sm font-semibold transition-colors ${
            mode === 'range'
              ? 'bg-primary text-primary-foreground'
              : 'border border-border bg-background text-muted-foreground hover:bg-muted'
          }`}
        >
          Date range
        </button>
      </div>

      {/* Date controls */}
      <Card className="border bg-card shadow-sm">
        <CardContent className="p-5">
          {mode === 'single' ? (
            <div className="flex items-end gap-4">
              <div className="space-y-1.5 flex-1 max-w-xs">
                <Label htmlFor="single-date">Date</Label>
                <Input
                  id="single-date"
                  type="date"
                  value={singleDate}
                  onChange={(e) => setSingleDate(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="start-date">Start date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end-date">End date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Totals strip */}
      {totals && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg border border-border bg-card px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Days with schedule
            </p>
            <p className="text-xl font-bold tabular-nums text-foreground mt-0.5">
              {totals.days}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Total booked
            </p>
            <p className="text-xl font-bold tabular-nums text-foreground mt-0.5">
              {totals.booked}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Routine capacity
            </p>
            <p className="text-xl font-bold tabular-nums text-foreground mt-0.5">
              {totals.maxSlots}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Overbook buffer
            </p>
            <p className="text-xl font-bold tabular-nums text-foreground mt-0.5">
              +{totals.overbook}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <p>
          <span className="font-semibold text-foreground">Max slots</span> and{' '}
          <span className="font-semibold text-foreground">overbook limit</span>{' '}
          shown here are frozen from when the first slot was booked for that
          day. Overbook slots can only be filled via emergency scheduling.
        </p>
      </div>

      {/* Body */}
      {isLoading && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-4">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-foreground">
            Failed to load schedule data.
          </p>
        </div>
      )}

      {!isLoading && !isError && isEmpty && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
          <CalendarDays className="h-10 w-10 opacity-30" />
          <p className="text-sm font-medium text-foreground">
            No schedule for this {mode === 'single' ? 'date' : 'period'}
          </p>
          <p className="text-xs max-w-sm text-center">
            Daily schedule rows are only created once a referral is booked
            for that day. Try a wider range, or run batch scheduling to
            populate the queue.
          </p>
        </div>
      )}

      {!isLoading && !isError && schedules.length > 0 && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {schedules.map((s) => (
            <ScheduleCard key={s.id} schedule={s} />
          ))}
        </div>
      )}
    </div>
  );
}
