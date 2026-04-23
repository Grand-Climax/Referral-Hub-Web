'use client';

import { useMemo, useState }       from 'react';
import { AlertTriangle, Lock, Info } from 'lucide-react';
import { Button }                    from '@/components/ui/button';
import { Card, CardContent }         from '@/components/ui/card';

import { CapacityStatsCards } from './capacity/CapacityStatsCards';
import { PlanningCalendar }   from './capacity/PlanningCalendar';
import { PersonnelTable }     from './capacity/PersonnelTable';
import { ReasonDialog }       from './capacity/ReasonDialog';
import {
  DOCTORS,
  TOTAL_SPECIALISTS,
  DEFAULT_SCHEDULE,
  buildDays,
  type DaySchedule,
} from './capacity/types';

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CapacityManagementPage() {
  const DAYS = useMemo(() => buildDays(7), []);

  // Which calendar day is selected (0 = today/locked, default = tomorrow)
  const [selectedDay,    setSelectedDay]    = useState(1);
  const [calendarOffset, setCalendarOffset] = useState(0);

  // Per-day schedule: all active by default
  const [scheduleByDay, setScheduleByDay] = useState<Record<number, DaySchedule>>(
    Object.fromEntries(DAYS.map((_, i) => [i, { ...DEFAULT_SCHEDULE }]))
  );
  const [unsaved, setUnsaved] = useState<Record<number, boolean>>({});
  const [applied, setApplied] = useState<Record<number, boolean>>({});

  // Pending toggle waiting for a reason
  const [pendingChange, setPendingChange] = useState<{
    doctorId: string;
    doctorName: string;
    newActive: boolean;
  } | null>(null);

  // ── Derived values ───────────────────────────────────────────────────────
  const isToday         = selectedDay === 0;
  const currentSchedule = scheduleByDay[selectedDay] ?? { ...DEFAULT_SCHEDULE };
  const selectedLabel   = DAYS[selectedDay]?.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) ?? '';
  const activeCount     = Object.values(currentSchedule).filter(Boolean).length;
  const projectedCapacity = Math.round((activeCount / TOTAL_SPECIALISTS) * 100);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleToggle = (doctorId: string, doctorName: string) => {
    if (isToday) return;
    setPendingChange({ doctorId, doctorName, newActive: !(currentSchedule[doctorId] ?? true) });
  };

  const handleConfirm = (_category: string, _note: string) => {
    if (!pendingChange) return;
    setScheduleByDay((prev) => ({
      ...prev,
      [selectedDay]: { ...(prev[selectedDay] ?? DEFAULT_SCHEDULE), [pendingChange.doctorId]: pendingChange.newActive },
    }));
    setUnsaved((prev) => ({ ...prev, [selectedDay]: true }));
    setApplied((prev) => ({ ...prev, [selectedDay]: false }));
    setPendingChange(null);
  };

  const handleApply = () => {
    setUnsaved((prev) => ({ ...prev, [selectedDay]: false }));
    setApplied((prev) => ({ ...prev, [selectedDay]: true }));
  };

  const handleReset = () => {
    setScheduleByDay((prev) => ({ ...prev, [selectedDay]: { ...DEFAULT_SCHEDULE } }));
    setUnsaved((prev) => ({ ...prev, [selectedDay]: false }));
    setApplied((prev) => ({ ...prev, [selectedDay]: false }));
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-[1400px] mx-auto space-y-6">

      {/* Header */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Administrative Dashboard
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
          Capacity Management
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Plan and manage specialist deployment for future dates. Today is locked.
        </p>
      </div>

      {/* Stats */}
      <CapacityStatsCards projectedCapacity={projectedCapacity} />

      {/* Calendar */}
      <PlanningCalendar
        days={DAYS}
        selectedDay={selectedDay}
        calendarOffset={calendarOffset}
        appliedDays={applied}
        onSelectDay={setSelectedDay}
        onOffsetChange={setCalendarOffset}
      />

      {/* Notice banner */}
      {isToday ? (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3">
          <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
          <p className="text-sm text-muted-foreground">
            Today&apos;s schedule is <strong>locked</strong> and cannot be modified. Select a future date to manage capacity.
          </p>
        </div>
      ) : selectedDay === 1 ? (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
            <span className="font-bold">Operational Notice:</span> Changes for tomorrow require a clinical justification. Today is locked.
          </p>
        </div>
      ) : null}

      {/* Personnel deployment table */}
      <PersonnelTable
        doctors={DOCTORS}
        schedule={currentSchedule}
        selectedDateLabel={selectedLabel}
        isToday={isToday}
        hasUnsavedChanges={!!unsaved[selectedDay]}
        onToggle={handleToggle}
        onApply={handleApply}
        onReset={handleReset}
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
                Modifications made today for future dates directly affect the availability of slots
                shown to patients. Ensure specialist duty covers the projected patient volume for
                better clinical outcomes and reduced wait times.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border bg-foreground dark:bg-slate-800 shadow-sm">
          <CardContent className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
              Automated Optimization
            </p>
            <p className="text-sm font-medium text-background dark:text-foreground leading-snug">
              AI models suggest increasing availability for the selected date due to a projected 20% spike in referral trends.
            </p>
            <Button variant="outline" size="sm" className="mt-4 w-full h-9 text-sm font-semibold bg-background text-foreground hover:bg-muted border-border">
              Review Suggestions
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Reason confirmation dialog */}
      <ReasonDialog
        open={pendingChange !== null}
        doctorName={pendingChange?.doctorName ?? ''}
        newActive={pendingChange?.newActive ?? true}
        onConfirm={handleConfirm}
        onCancel={() => setPendingChange(null)}
      />
    </div>
  );
}
