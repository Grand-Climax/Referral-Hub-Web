'use client';

import { useState } from 'react';
import { format, subDays } from 'date-fns';
import { CalendarDays, AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

import { useGetScheduleQuery } from '@/features/department-head/departmentHeadApi';
import type { DailySchedule } from '@/types/department-head';

function ScheduleCard({ schedule }: { schedule: DailySchedule }) {
  const dateStr = schedule.schedule_date ?? schedule.date ?? '';
  const formattedDate = dateStr ? format(new Date(dateStr), 'EEEE, MMMM d, yyyy') : '—';
  const pct =
    schedule.max_slots > 0
      ? Math.round((schedule.booked_slots / schedule.max_slots) * 100)
      : 0;
  const barColor =
    pct >= 100 ? 'bg-destructive' : pct >= 80 ? 'bg-amber-500' : 'bg-primary';

  return (
    <Card className="border bg-card shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm font-bold text-foreground">{formattedDate}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Immutable history snapshot</p>
          </div>
          <Badge variant="outline" className="text-[10px]">
            Log
          </Badge>
        </div>
        <div className="flex items-baseline gap-2 mb-2 flex-wrap">
          <span className="text-3xl font-extrabold tabular-nums text-foreground">
            {schedule.booked_slots}
          </span>
          <span className="text-lg text-muted-foreground">/ {schedule.max_slots}</span>
          {(schedule.overbook_limit ?? 0) > 0 && (
            <span className="text-xs text-muted-foreground">
              (+{schedule.overbook_limit} overbook)
            </span>
          )}
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full ${barColor}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">{pct}% of frozen max</p>
      </CardContent>
    </Card>
  );
}

type Mode = 'single' | 'range';

export default function ScheduleLogPage() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [mode, setMode] = useState<Mode>('single');
  const [singleDate, setSingleDate] = useState(today);
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 6), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(today);

  const queryArg =
    mode === 'single'
      ? { date: singleDate }
      : { start_date: startDate, end_date: endDate };

  const { data: raw, isLoading, isError } = useGetScheduleQuery(queryArg);

  const schedules: DailySchedule[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const isEmpty = !raw || schedules.length === 0;

  return (
    <div className="max-w-[900px] mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Daily Schedule Log</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Immutable history of booked days.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setMode('single')}
          className={`h-9 rounded-lg px-4 text-sm font-semibold transition-colors ${
            mode === 'single'
              ? 'bg-primary text-primary-foreground'
              : 'border border-border bg-background text-muted-foreground hover:bg-muted'
          }`}
        >
          Single Day
        </button>
        <button
          onClick={() => setMode('range')}
          className={`h-9 rounded-lg px-4 text-sm font-semibold transition-colors ${
            mode === 'range'
              ? 'bg-primary text-primary-foreground'
              : 'border border-border bg-background text-muted-foreground hover:bg-muted'
          }`}
        >
          Date Range
        </button>
      </div>

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
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end-date">End Date</Label>
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

      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <p>
          Max slots and overbook limit shown here are frozen from when the first slot was
          booked for that day.
        </p>
      </div>

      {isLoading && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-4">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-foreground">Failed to load schedule data.</p>
        </div>
      )}

      {!isLoading && !isError && isEmpty && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
          <CalendarDays className="h-10 w-10 opacity-30" />
          <p className="text-sm font-medium text-foreground">
            No schedule log for this {mode === 'single' ? 'date' : 'period'}
          </p>
          <p className="text-xs">Nothing has been booked yet.</p>
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
