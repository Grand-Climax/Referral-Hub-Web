'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  format,
  getDaysInMonth,
  startOfMonth,
  getDay,
  addMonths,
  subMonths,
  isBefore,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  X,
  Users,
  ShieldAlert,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

import {
  useGetCapacityCalendarQuery,
  useGetCapacityDetailQuery,
} from '@/features/department-head/departmentHeadApi';
import type { CalendarDayEntry } from '@/types/department-head';

function DetailDrawer({ date, onClose }: { date: string; onClose: () => void }) {
  const { data: detail, isLoading, isError } = useGetCapacityDetailQuery(date);

  const pct =
    detail && detail.max_slots > 0
      ? Math.round((detail.booked_slots / detail.max_slots) * 100)
      : 0;
  const barColor =
    pct >= 100 ? 'bg-destructive' : pct >= 80 ? 'bg-amber-500' : 'bg-primary';
  const formatted = format(new Date(date), 'EEE, MMMM d, yyyy');

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-80 flex-col border-l border-border bg-background shadow-2xl">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="font-semibold text-foreground">{formatted}</h2>
        <button onClick={onClose} className="rounded-md p-1 hover:bg-muted">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-5 space-y-5">
        {isLoading && <Skeleton className="h-40 w-full" />}
        {isError && (
          <div className="text-center py-8">
            <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Could not load detail</p>
          </div>
        )}
        {detail && detail.date && (
          <>
            <div>
              <div className="flex items-baseline gap-1.5 mb-1 flex-wrap">
                <span className="text-3xl font-extrabold tabular-nums text-foreground">
                  {detail.booked_slots}
                </span>
                <span className="text-sm text-muted-foreground">
                  / {detail.max_slots} booked
                </span>
                {detail.overbook_limit > 0 && (
                  <Badge variant="outline" className="text-[10px]">
                    +{detail.overbook_limit} overbook
                  </Badge>
                )}
              </div>
              <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full ${barColor}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{pct}% capacity used</p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Staff capacity hint</span>
                <span className="font-semibold text-foreground">{detail.staff_capacity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Doctors assigned</span>
                <span className="font-semibold text-foreground">{detail.staff_assigned}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Available slots</span>
                <span className="font-semibold text-foreground">{detail.available_slots}</span>
              </div>
              {detail.has_override && (
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <ShieldAlert className="h-4 w-4" />
                  <span className="text-xs font-semibold">Capacity override active</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="border-t border-border p-4 space-y-2">
        <Link href={`/department-head/schedule/patients?date=${date}`}>
          <Button variant="outline" className="w-full gap-2" size="sm">
            <Users className="h-4 w-4" />
            View Scheduled Patients
          </Button>
        </Link>
        <Link href={`/department-head/capacity/overrides/new?date=${date}`}>
          <Button className="w-full gap-2" size="sm">
            <ShieldAlert className="h-4 w-4" />
            Create Override
          </Button>
        </Link>
      </div>
    </div>
  );
}

function CalendarCell({
  day,
  entry,
  isToday,
  isPast,
  onClick,
  isSelected,
}: {
  day: number;
  entry?: CalendarDayEntry;
  isToday: boolean;
  /** Past days are read-only — capacity changes only apply to today onward. */
  isPast: boolean;
  onClick: () => void;
  isSelected: boolean;
}) {
  const pct = entry && entry.max_slots > 0
    ? Math.round((entry.booked_slots / entry.max_slots) * 100)
    : 0;
  const bgColor =
    pct >= 100
      ? 'bg-red-50 dark:bg-red-950/20'
      : pct >= 80
      ? 'bg-amber-50 dark:bg-amber-950/20'
      : '';
  const ringClass = isSelected
    ? 'ring-2 ring-primary'
    : isToday
    ? 'ring-2 ring-primary/50'
    : '';

  return (
    <button
      type="button"
      onClick={isPast ? undefined : onClick}
      disabled={isPast}
      aria-disabled={isPast}
      title={isPast ? 'Past dates are read-only' : undefined}
      className={`relative rounded-xl border border-border p-2 text-left transition-colors min-h-[72px] ${bgColor} ${ringClass} ${
        isPast
          ? 'cursor-not-allowed bg-muted/30 opacity-50'
          : 'hover:bg-muted/50'
      }`}
    >
      <span
        className={`text-sm font-bold ${
          isPast
            ? 'text-muted-foreground line-through decoration-muted-foreground/50'
            : isToday
              ? 'text-primary'
              : 'text-foreground'
        }`}
      >
        {day}
      </span>

      {entry && (
        <>
          <p className="text-[10px] text-muted-foreground mt-1">
            {entry.booked_slots}/{entry.max_slots}
          </p>
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full ${
                pct >= 100 ? 'bg-destructive' : pct >= 80 ? 'bg-amber-500' : 'bg-primary'
              }`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>

          {entry.has_override && (
            <span
              className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500"
              title="Override active"
            />
          )}
          {entry.is_full && (
            <span className="absolute top-0 right-0 border-t-8 border-r-8 border-t-destructive border-r-transparent" />
          )}
        </>
      )}
    </button>
  );
}

export default function CapacityCalendarPage() {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth() + 1;

  const { data: days = [], isLoading, isError, refetch } = useGetCapacityCalendarQuery({
    year,
    month,
  });

  const dayMap = new Map(days.map((d) => [d.date, d]));
  const daysInMonth = getDaysInMonth(viewDate);
  const firstDayOfWeek = getDay(startOfMonth(viewDate));
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Disallow navigating into months that are entirely in the past so the
  // calendar stays scoped to "today forward". String comparison on
  // YYYY-MM-DD is correct here.
  const currentMonthStart = startOfMonth(new Date());
  const viewMonthStart = startOfMonth(viewDate);
  const canGoBack = isBefore(currentMonthStart, viewMonthStart);

  const cells: (number | null)[] = [
    ...Array.from({ length: firstDayOfWeek }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Capacity Calendar
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Click a day to view detail. Yellow dot = override. Red corner = full.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/department-head/capacity/overrides">
            <Button variant="outline" size="sm" className="gap-2">
              <ShieldAlert className="h-4 w-4" />
              Overrides
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => canGoBack && setViewDate((d) => subMonths(d, 1))}
          disabled={!canGoBack}
          aria-disabled={!canGoBack}
          title={canGoBack ? 'Previous month' : 'Past months are read-only'}
          className="rounded-md p-1.5 border border-border transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h2 className="text-lg font-bold text-foreground min-w-[160px] text-center">
          {format(viewDate, 'MMMM yyyy')}
        </h2>
        <button
          type="button"
          onClick={() => setViewDate((d) => addMonths(d, 1))}
          className="rounded-md p-1.5 hover:bg-muted border border-border"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Normal
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" /> 80%+
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-destructive" /> Full
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400" /> Override
        </div>
      </div>

      {isError && (
        <Card className="border-destructive/30">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-foreground">Failed to load calendar data.</p>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <Skeleton className="h-96 w-full rounded-xl" />
      ) : (
        <div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div
                key={d}
                className="text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground py-2"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              // YYYY-MM-DD strings compare lexicographically, so this is safe.
              const isPast = dateStr < todayStr;
              return (
                <CalendarCell
                  key={dateStr}
                  day={day}
                  entry={dayMap.get(dateStr)}
                  isToday={dateStr === todayStr}
                  isPast={isPast}
                  isSelected={dateStr === selectedDate}
                  onClick={() =>
                    setSelectedDate(selectedDate === dateStr ? null : dateStr)
                  }
                />
              );
            })}
          </div>
        </div>
      )}

      {selectedDate && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setSelectedDate(null)}
          />
          <DetailDrawer date={selectedDate} onClose={() => setSelectedDate(null)} />
        </>
      )}
    </div>
  );
}
