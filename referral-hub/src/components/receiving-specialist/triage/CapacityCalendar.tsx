'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  format,
  parseISO,
  isValid,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  isBefore,
  isAfter,
  addMonths,
  subMonths,
  startOfDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ScheduleOption } from '@/types/specialist-triage';

export type CalendarMode = 'routine' | 'override';

interface Props {
  /** Capacity data from `schedule-options` — typically the next 14 days. */
  options: ScheduleOption[];
  /** YYYY-MM-DD of the currently picked date. */
  selectedDate: string;
  onSelect: (date: string) => void;
  /**
   * Drives the colour scheme of the indicator dots.
   * - `routine`:   green when available, amber when tight, red when full.
   * - `override`:  green when overbook room exists, amber when only overbook
   *                is left (routine full), red when even overbook is full.
   * The override mode also makes overbook-full days unclickable, since the
   * backend will reject those anyway.
   */
  mode?: CalendarMode;
  /** Smallest selectable day; defaults to today. */
  minDate?: Date;
}

type DayClassification =
  | 'available'
  | 'tight'
  | 'routine-full'
  | 'overbook-full'
  | 'no-data';

interface DayMeta {
  status: DayClassification;
  available: number;
  total: number;
  hasOverride: boolean;
}

/**
 * Translates a `ScheduleOption` into a visual status for the calendar grid.
 * Keeps the logic in one place so the dots and the disabled-state agree
 * with what the server will accept on POST.
 */
function classifyDay(option: ScheduleOption | undefined, mode: CalendarMode): DayMeta {
  if (!option) {
    return { status: 'no-data', available: 0, total: 0, hasOverride: false };
  }
  const overbookCap = option.max_slots + option.overbook_limit;
  const overbookRoom = Math.max(0, overbookCap - option.booked_slots);
  const hasOverride = option.has_override;

  if (mode === 'override') {
    if (overbookRoom === 0) {
      return { status: 'overbook-full', available: 0, total: overbookCap, hasOverride };
    }
    // Routine full but overbook room left → exactly what override is for.
    if (option.available_slots <= 0) {
      return { status: 'tight', available: overbookRoom, total: overbookCap, hasOverride };
    }
    return { status: 'available', available: overbookRoom, total: overbookCap, hasOverride };
  }

  // routine mode
  if (option.available_slots <= 0) {
    return { status: 'routine-full', available: 0, total: option.max_slots, hasOverride };
  }
  if (option.available_slots <= 2) {
    return {
      status: 'tight',
      available: option.available_slots,
      total: option.max_slots,
      hasOverride,
    };
  }
  return {
    status: 'available',
    available: option.available_slots,
    total: option.max_slots,
    hasOverride,
  };
}

const WEEKDAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] as const;

export function CapacityCalendar({
  options,
  selectedDate,
  onSelect,
  mode = 'routine',
  minDate,
}: Props) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const minDay = minDate ?? today;

  // When the parent changes `selectedDate` (e.g. user pivoted from routine
  // to override with a pre-picked day), follow it to that month so the
  // selection is visible.
  const [viewMonth, setViewMonth] = useState<Date>(() => {
    const sel = parseISO(selectedDate);
    return startOfMonth(isValid(sel) ? sel : today);
  });

  useEffect(() => {
    const sel = parseISO(selectedDate);
    if (!isValid(sel)) return;
    const target = startOfMonth(sel);
    if (!isSameDay(target, viewMonth)) {
      setViewMonth(target);
    }
    // We intentionally don't depend on viewMonth — only react to outside-driven
    // selection changes. eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const optionMap = useMemo(() => {
    const m = new Map<string, ScheduleOption>();
    for (const o of options) m.set(o.date, o);
    return m;
  }, [options]);

  // The visible grid always shows complete weeks. Weeks start on Monday to
  // match the rest of the dashboards (and matches the standard EU clinical
  // calendar convention).
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [viewMonth]);

  // You can never navigate into a month entirely in the past.
  const canGoBack = isAfter(startOfMonth(viewMonth), startOfMonth(minDay));

  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      {/* Month nav */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
        <button
          type="button"
          onClick={() => canGoBack && setViewMonth(subMonths(viewMonth, 1))}
          disabled={!canGoBack}
          className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous month"
          title={canGoBack ? 'Previous month' : 'Past months are read-only'}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="text-sm font-semibold tabular-nums">
          {format(viewMonth, 'MMMM yyyy')}
        </h3>
        <button
          type="button"
          onClick={() => setViewMonth(addMonths(viewMonth, 1))}
          className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-muted transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1 px-2 pt-2">
        {WEEKDAY_LABELS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1 p-2" role="grid">
        {days.map((d) => {
          const ymd = format(d, 'yyyy-MM-dd');
          const inMonth = isSameMonth(d, viewMonth);
          const isPast = isBefore(d, minDay) && !isSameDay(d, minDay);
          const isSelected = ymd === selectedDate;
          const isToday = isSameDay(d, today);
          const meta = classifyDay(optionMap.get(ymd), mode);

          // In override mode, days where even overbook is full can't be
          // booked at all — the backend rejects with 500. Disable them up-front.
          const isHardDisabled =
            isPast || (mode === 'override' && meta.status === 'overbook-full');

          // Build the cell class progressively. Selected wins over all other
          // visual states except disabled.
          let cellCls =
            'relative flex flex-col items-center justify-center aspect-square rounded-md text-sm transition-all select-none';

          if (isHardDisabled) {
            cellCls += ' text-muted-foreground/40 cursor-not-allowed';
            if (meta.status === 'overbook-full') {
              cellCls += ' line-through';
            }
          } else if (isSelected) {
            cellCls +=
              mode === 'override'
                ? ' bg-amber-500 text-white font-bold shadow-sm ring-2 ring-amber-300 dark:ring-amber-700/50'
                : ' bg-primary text-primary-foreground font-bold shadow-sm ring-2 ring-primary/30';
          } else if (!inMonth) {
            cellCls += ' text-muted-foreground/40 hover:bg-muted cursor-pointer';
          } else {
            cellCls += ' text-foreground hover:bg-muted cursor-pointer font-medium';
            if (isToday) {
              cellCls += ' ring-1 ring-primary/50';
            }
          }

          // Capacity indicator dot — colour reflects the current mode.
          let dotCls = '';
          if (!isHardDisabled && !isSelected && inMonth) {
            switch (meta.status) {
              case 'available':
                dotCls = 'bg-emerald-500';
                break;
              case 'tight':
                dotCls = mode === 'override' ? 'bg-amber-500' : 'bg-amber-500';
                break;
              case 'routine-full':
                dotCls = 'bg-red-500';
                break;
              case 'overbook-full':
                dotCls = 'bg-red-500';
                break;
              case 'no-data':
                dotCls = '';
                break;
            }
          }

          const tooltip =
            meta.status === 'no-data'
              ? format(d, 'EEEE, MMM d')
              : `${format(d, 'EEEE, MMM d')} · ${meta.available} of ${meta.total} available${
                  meta.hasOverride ? ' · override active' : ''
                }`;

          return (
            <button
              key={ymd}
              type="button"
              role="gridcell"
              disabled={isHardDisabled}
              onClick={() => onSelect(ymd)}
              className={cellCls}
              title={tooltip}
              aria-label={tooltip}
              aria-pressed={isSelected}
              aria-current={isToday ? 'date' : undefined}
            >
              <span className={inMonth ? '' : 'opacity-60'}>{format(d, 'd')}</span>
              {dotCls && (
                <span
                  className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full ${dotCls}`}
                  aria-hidden
                />
              )}
              {/* Override marker — small amber pip in the corner, so it
                  reads independently from the capacity dot. */}
              {meta.hasOverride && !isSelected && !isHardDisabled && (
                <span
                  className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-amber-500"
                  aria-hidden
                  title="Capacity override active"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 border-t border-border bg-muted/20 text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Available
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          {mode === 'override' ? 'Routine full' : 'Limited'}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          {mode === 'override' ? 'Overbook full' : 'Full'}
        </span>
        <span className="inline-flex items-center gap-1.5 ml-auto">
          <span className="relative inline-flex h-3 w-3 items-center justify-center">
            <span className="absolute top-0 right-0 h-1.5 w-1.5 rounded-full bg-amber-500" />
          </span>
          Override active
        </span>
      </div>
    </div>
  );
}
