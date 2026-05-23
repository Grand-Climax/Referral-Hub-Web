import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { Card, CardContent }               from '@/components/ui/card';
import { dayMeta }                          from './types';

// ── Props ─────────────────────────────────────────────────────────────────────

interface PlanningCalendarProps {
  days: Date[];
  selectedDay: number;
  calendarOffset: number;
  appliedDays: Record<string, boolean>; // Changed from Record<number, boolean> to Record<string, boolean> for date strings
  visibleCount?: number;
  onSelectDay: (idx: number) => void;
  onOffsetChange: (offset: number) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PlanningCalendar({
  days,
  selectedDay,
  calendarOffset,
  appliedDays,
  visibleCount = 5,
  onSelectDay,
  onOffsetChange,
}: PlanningCalendarProps) {
  const visibleDays = days.slice(calendarOffset, calendarOffset + visibleCount);

  return (
    <Card className="border bg-card shadow-sm">
      <CardContent className="p-5">

        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-base font-bold text-foreground">Forward Planning Calendar</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select a date to manage future ward capacity
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onOffsetChange(Math.max(0, calendarOffset - 1))}
              disabled={calendarOffset === 0}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => onOffsetChange(Math.min(days.length - visibleCount, calendarOffset + 1))}
              disabled={calendarOffset >= days.length - visibleCount}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Day buttons */}
        <div className="flex gap-2">
          {visibleDays.map((day, idx) => {
            const absIdx = calendarOffset + idx;
            const { month, dayNum, label } = dayMeta(day, absIdx);
            const isSelected = absIdx === selectedDay;
            const isLocked = absIdx === 0; // today
            const dateStr = day.toISOString().split('T')[0]; // YYYY-MM-DD
            const isApplied = appliedDays[dateStr];

            return (
              <button
                key={absIdx}
                disabled={isLocked}
                onClick={() => {
                  if (!isLocked) onSelectDay(absIdx);
                }}
                className={`relative flex-1 rounded-xl border p-3 flex flex-col items-center gap-0.5 transition-all ${
                  isLocked
                    ? 'border-border bg-muted/30 opacity-50 cursor-not-allowed'
                    : isSelected
                    ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                    : 'border-border bg-background hover:border-primary/40 hover:bg-muted/30'
                }`}
              >
                {isLocked && (
                  <Lock className="absolute top-2 right-2 h-3 w-3 text-muted-foreground" />
                )}
                {isApplied && !isLocked && (
                  <span
                    className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500"
                    title="Has capacity override"
                  />
                )}
                <span
                  className={`text-[10px] font-semibold tracking-wide ${
                    isSelected ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {month} {dayNum}
                </span>
                <span
                  className={`text-2xl font-extrabold tabular-nums leading-none mt-0.5 ${
                    isSelected ? 'text-primary' : 'text-foreground'
                  }`}
                >
                  {String(dayNum).padStart(2, '0')}
                </span>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-widest mt-0.5 ${
                    isSelected ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>

      </CardContent>
    </Card>
  );
}
