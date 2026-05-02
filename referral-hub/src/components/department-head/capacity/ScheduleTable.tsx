'use client';

import { Loader2, Calendar, Users, CheckCircle2 } from 'lucide-react';
import type { DailySchedule } from '@/types/department-head';

interface ScheduleTableProps {
  schedule?: DailySchedule;
  isLoading: boolean;
  isToday: boolean;
  selectedDate: string;
}

export function ScheduleTable({
  schedule,
  isLoading,
  isToday,
  selectedDate,
}: ScheduleTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-sm text-muted-foreground">Loading schedule...</span>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          No schedule data available for {selectedDate}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Schedule may not be created yet for this date
        </p>
      </div>
    );
  }

  const utilizationPercent = schedule.max_slots > 0
    ? Math.round((schedule.booked_slots / schedule.max_slots) * 100)
    : 0;

  const getUtilizationColor = (percent: number) => {
    if (percent >= 90) return 'text-rose-600 dark:text-rose-400';
    if (percent >= 70) return 'text-amber-600 dark:text-amber-400';
    return 'text-emerald-600 dark:text-emerald-400';
  };

  const getUtilizationBg = (percent: number) => {
    if (percent >= 90) return 'bg-rose-500';
    if (percent >= 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-6">
      {/* Capacity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Max Slots */}
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Max Capacity
            </span>
          </div>
          <p className="text-3xl font-bold text-foreground">{schedule.max_slots}</p>
          <p className="text-xs text-muted-foreground mt-1">Total slots available</p>
        </div>

        {/* Booked Slots */}
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Booked
            </span>
          </div>
          <p className="text-3xl font-bold text-foreground">{schedule.booked_slots}</p>
          <p className="text-xs text-muted-foreground mt-1">Appointments scheduled</p>
        </div>

        {/* Available Slots */}
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Available
            </span>
          </div>
          <p className="text-3xl font-bold text-foreground">{schedule.available_slots}</p>
          <p className="text-xs text-muted-foreground mt-1">Slots remaining</p>
        </div>
      </div>

      {/* Utilization Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Capacity Utilization</span>
          <span className={`text-sm font-bold ${getUtilizationColor(utilizationPercent)}`}>
            {utilizationPercent}%
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${getUtilizationBg(utilizationPercent)}`}
            style={{ width: `${utilizationPercent}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {utilizationPercent >= 90
            ? 'Near capacity - consider increasing max slots'
            : utilizationPercent >= 70
            ? 'Moderate utilization'
            : 'Good availability'}
        </p>
      </div>

      {/* Status Message */}
      {isToday && (
        <div className="bg-muted/50 rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Today&apos;s schedule is locked.</span>{' '}
            You cannot modify capacity for the current day. Select a future date to set capacity
            overrides.
          </p>
        </div>
      )}
    </div>
  );
}
