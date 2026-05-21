'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, Lock, Info, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/apiError';

import { CapacityStatsCards } from './capacity/CapacityStatsCards';
import { PlanningCalendar } from './capacity/PlanningCalendar';
import { ScheduleTable } from './capacity/ScheduleTable';
import { CapacityOverridesList } from './capacity/CapacityOverridesList';
import { CapacityOverrideDialog } from './capacity/CapacityOverrideDialog';
import { buildDays } from './capacity/types';

// Import API hooks
import {
  useGetScheduleQuery,
  useGetCapacityOverridesQuery,
  useRunBatchSchedulingMutation,
} from '@/features/department-head/departmentHeadApi';

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CapacityManagementPage() {
  const DAYS = useMemo(() => buildDays(30), []); // Show 30 days

  // Which calendar day is selected (0 = today/locked, default = tomorrow)
  const [selectedDay, setSelectedDay] = useState(1);
  const [calendarOffset, setCalendarOffset] = useState(0);
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);

  // Calculate date range for API query
  const startDate = format(DAYS[0], 'yyyy-MM-dd');
  const endDate = format(DAYS[DAYS.length - 1], 'yyyy-MM-dd');

  // ── API Queries ──────────────────────────────────────────────────────────
  
  // Fetch schedule data from backend
  const {
    data: schedules,
    isLoading: isLoadingSchedule,
    isError: isScheduleError,
    error: scheduleError,
  } = useGetScheduleQuery({ start_date: startDate, end_date: endDate });

  // Fetch capacity overrides from backend
  const {
    data: overrides,
    isLoading: isLoadingOverrides,
  } = useGetCapacityOverridesQuery();

  // Batch scheduling mutation
  const [runBatchScheduling, { isLoading: isRunningBatch }] = useRunBatchSchedulingMutation();

  // ── Derived values ───────────────────────────────────────────────────────
  const isToday = selectedDay === 0;
  const selectedDate = DAYS[selectedDay];
  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const selectedLabel = selectedDate
    ? selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    : '';

  // Find schedule for selected date
  const selectedSchedule = schedules?.find((s) => s.date === selectedDateStr);

  // Calculate projected capacity based on schedule data
  const totalCapacity = schedules?.reduce((sum, s) => sum + s.max_slots, 0) || 0;
  const totalBooked = schedules?.reduce((sum, s) => sum + s.booked_slots, 0) || 0;
  const projectedCapacity = totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;

  // Check which days have overrides
  const daysWithOverrides = useMemo(() => {
    if (!overrides) return {};
    return Object.fromEntries(
      overrides.map((override) => [override.target_date, true])
    );
  }, [overrides]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleRunBatchScheduling = async () => {
    try {
      const result = await runBatchScheduling().unwrap();
      toast.success(
        result.message || `Batch scheduling completed! Scheduled ${result.scheduled_count || 0} referrals.`
      );
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, 'Failed to run batch scheduling'));
    }
  };

  const handleCreateOverride = () => {
    if (isToday) {
      toast.error('Cannot create override for today');
      return;
    }
    setShowOverrideDialog(true);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-[1400px] mx-auto space-y-6">

      {/* Stats */}
      <CapacityStatsCards
        projectedCapacity={projectedCapacity}
        totalCapacity={totalCapacity}
        totalBooked={totalBooked}
        isLoading={isLoadingSchedule}
      />

      {/* Calendar */}
      <PlanningCalendar
        days={DAYS}
        selectedDay={selectedDay}
        calendarOffset={calendarOffset}
        appliedDays={daysWithOverrides}
        onSelectDay={setSelectedDay}
        onOffsetChange={setCalendarOffset}
      />

      {/* Notice banner */}
      {isToday ? (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3">
          <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
          <p className="text-sm text-muted-foreground">
            Today&apos;s schedule is <strong>locked</strong> and cannot be modified. Select a
            future date to manage capacity.
          </p>
        </div>
      ) : selectedDay === 1 ? (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
            <span className="font-bold">Operational Notice:</span> Changes for tomorrow require a
            clinical justification. Today is locked.
          </p>
        </div>
      ) : null}

      {/* Error State */}
      {isScheduleError && (
        <Card className="border-destructive">
          <CardContent className="p-6">
            <p className="text-destructive font-medium">Failed to load schedule data</p>
            <p className="text-sm text-muted-foreground mt-1">
              {(scheduleError as any)?.data?.message || 'Please try again later'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Schedule Table for Selected Date */}
      {!isScheduleError && (
        <Card className="border bg-card shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Schedule for {selectedLabel}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {selectedDateStr}
                </p>
              </div>
              {!isToday && (
                <Button onClick={handleCreateOverride} className="gap-2" size="sm">
                  <Plus className="h-4 w-4" />
                  Set Capacity Override
                </Button>
              )}
            </div>

            <ScheduleTable
              schedule={selectedSchedule}
              isLoading={isLoadingSchedule}
              isToday={isToday}
              selectedDate={selectedDateStr}
            />
          </CardContent>
        </Card>
      )}

      {/* Capacity Overrides List */}
      <CapacityOverridesList
        overrides={overrides}
        isLoading={isLoadingOverrides}
      />

      {/* Bottom info row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border bg-card shadow-sm">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">Impact on Patient Experience</p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Capacity overrides directly affect the availability of appointment slots shown to
                patients. Ensure capacity limits match the projected patient volume for better
                clinical outcomes and reduced wait times.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border bg-foreground dark:bg-slate-800 shadow-sm">
          <CardContent className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
              Automated Scheduling
            </p>
            <p className="text-sm font-medium text-background dark:text-foreground leading-snug">
              Use batch scheduling to automatically assign appointment dates to all waiting
              referrals based on priority and available capacity.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full h-9 text-sm font-semibold bg-background text-foreground hover:bg-muted border-border"
              onClick={handleRunBatchScheduling}
              disabled={isRunningBatch}
            >
              {isRunningBatch ? 'Running...' : 'Run Batch Scheduling'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Capacity Override Dialog */}
      <CapacityOverrideDialog
        open={showOverrideDialog}
        onClose={() => setShowOverrideDialog(false)}
        selectedDate={selectedDateStr}
        currentMaxSlots={selectedSchedule?.max_slots}
      />
    </div>
  );
}
