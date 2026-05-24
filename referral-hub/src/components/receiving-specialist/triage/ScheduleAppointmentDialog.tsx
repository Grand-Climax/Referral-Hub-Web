'use client';

import { useEffect, useMemo, useState } from 'react';
import { format, addDays, parseISO, isValid } from 'date-fns';
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  Loader2,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  useGetScheduleOptionsQuery,
  useScheduleAppointmentMutation,
  useEmergencyScheduleMutation,
} from '@/features/specialist/specialistApi';
import { getApiErrorMessage } from '@/lib/apiError';
import type {
  ArrivalStatus,
  ReferralStatusEnum,
} from '@/types/specialist-triage';
import { CapacityCalendar } from './CapacityCalendar';

/**
 * Single scheduling dialog implementing "Shape A" from the backend guide.
 *
 * Flow:
 *   1. User picks a date and clicks Schedule → FE calls POST /schedule.
 *   2. If the server replies 500 with "capacity reached", the dialog flips
 *      into an override-confirmation step (still the same dialog, just a
 *      different body) and asks for a reason + justification.
 *   3. Confirming there calls POST /emergency-schedule.
 *
 * Both endpoints accept the same inputs for first-booking, reschedule, and
 * missed-rescue scenarios; they differ only in whether the overbook buffer
 * is allowed. So we always try routine first and only escalate when the
 * server says routine is impossible — that's the single mental model the
 * user wanted.
 */

type Stage = 'schedule' | 'override-confirm';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referralId: string;
  patientName: string;
  arrivalStatus: ArrivalStatus;
  referralStatus: ReferralStatusEnum;
  conditionAtReferral?: string | null;
  currentAppointmentDate?: string | null;
}

const REASON_OPTIONS = [
  { value: 'CLINICAL_URGENCY', label: 'Patient cannot wait (clinical urgency)' },
  { value: 'RESCUE_MISSED', label: 'Rescue a missed appointment' },
  { value: 'PATIENT_REQUEST', label: 'Reschedule at patient request' },
  { value: 'OTHER', label: 'Other (explain below)' },
] as const;

type ReasonValue = (typeof REASON_OPTIONS)[number]['value'];

function todayYmd() {
  return format(new Date(), 'yyyy-MM-dd');
}

function isCritical(condition?: string | null) {
  // Backend matches case-insensitively; mirror that so our optional/required
  // toggle agrees with the server.
  return (condition ?? '').toLowerCase().trim() === 'critical';
}

export function ScheduleAppointmentDialog({
  open,
  onOpenChange,
  referralId,
  patientName,
  arrivalStatus,
  referralStatus,
  conditionAtReferral,
  currentAppointmentDate,
}: Props) {
  const isRescue = arrivalStatus === 'MISSED';
  const isReschedule = referralStatus === 'SCHEDULED' && !isRescue;
  const critical = isCritical(conditionAtReferral);

  // ─── Form state ────────────────────────────────────────────────────────
  const defaultDate = useMemo(
    () => format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    [],
  );

  const [stage, setStage] = useState<Stage>('schedule');
  const [date, setDate] = useState(defaultDate);
  const [notes, setNotes] = useState('');
  const [reason, setReason] = useState<ReasonValue>(
    isRescue ? 'RESCUE_MISSED' : 'CLINICAL_URGENCY',
  );
  const [justification, setJustification] = useState('');

  // Reset everything whenever the dialog re-opens.
  useEffect(() => {
    if (open) {
      setStage('schedule');
      setDate(defaultDate);
      setNotes('');
      setReason(isRescue ? 'RESCUE_MISSED' : 'CLINICAL_URGENCY');
      setJustification('');
    }
  }, [open, defaultDate, isRescue]);

  // ─── Data ──────────────────────────────────────────────────────────────
  const { data: options = [], isLoading: isLoadingOptions } =
    useGetScheduleOptionsQuery(
      { referralId, days: 14 },
      { skip: !open || !referralId },
    );

  const [routineMutation, { isLoading: isRoutineSubmitting }] =
    useScheduleAppointmentMutation();
  const [overrideMutation, { isLoading: isOverrideSubmitting }] =
    useEmergencyScheduleMutation();
  const isSubmitting = isRoutineSubmitting || isOverrideSubmitting;

  const selectedOption = options.find((o) => o.date === date);
  const overbookLimit = selectedOption?.overbook_limit ?? 0;

  // ─── Derived labels ───────────────────────────────────────────────────
  const baseAction = isRescue
    ? 'Rescue & reschedule'
    : isReschedule
      ? 'Reschedule appointment'
      : 'Schedule appointment';

  const isOverrideStage = stage === 'override-confirm';
  const titleLabel = isOverrideStage ? `${baseAction} (override)` : baseAction;

  // ─── Validation ───────────────────────────────────────────────────────
  // Override path: justification mandatory UNLESS condition is critical.
  const justificationRequired = isOverrideStage && !critical;
  const justificationLong = justification.trim().length >= 10;
  const justificationValid = !justificationRequired || justificationLong;

  // ─── Submit handlers ──────────────────────────────────────────────────

  /**
   * Stage 1 — routine schedule. If the server returns the well-known
   * "capacity reached" 500, we DON'T toast an error — we flip the dialog
   * into Stage 2 so the user can confirm an override with a justification.
   */
  const handleScheduleSubmit = async () => {
    if (!date) {
      toast.error('Please select an appointment date.');
      return;
    }
    if (date < todayYmd()) {
      toast.error('Appointment date cannot be in the past.');
      return;
    }
    // Routine endpoint takes RFC3339; midnight UTC keeps the server's DATE
    // coercion stable across browser timezones.
    const rfc3339 = `${date}T00:00:00Z`;
    try {
      const result = await routineMutation({
        referralId,
        body: { appointment_date: rfc3339, notes: notes.trim() || undefined },
      }).unwrap();
      const dateLabel = format(parseISO(date), 'MMM d, yyyy');
      if (result.rescheduled_from_missed) {
        toast.success(`Missed appointment rescued for ${dateLabel}.`);
      } else if (isReschedule) {
        toast.success(`Rescheduled to ${dateLabel}.`);
      } else {
        toast.success(`Scheduled for ${dateLabel}.`);
      }
      onOpenChange(false);
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Failed to schedule appointment.');
      if (/capacity reached/i.test(msg)) {
        // The single concrete reason we expose the override flow at all.
        setStage('override-confirm');
      } else {
        toast.error(msg);
      }
    }
  };

  /**
   * Stage 2 — emergency override. Uses YYYY-MM-DD (no timestamp), prefixes
   * the picked reason into the justification before POST, and reads the
   * `rescheduled_from_missed` flag for a better success toast.
   */
  const handleOverrideSubmit = async () => {
    if (!justificationValid) {
      toast.error('Justification of at least 10 characters is required.');
      return;
    }
    const reasonLabel =
      REASON_OPTIONS.find((r) => r.value === reason)?.label ?? reason;
    const body = {
      appointment_date: date,
      justification: justification.trim()
        ? `${reasonLabel}: ${justification.trim()}`
        : reasonLabel,
    };
    try {
      const result = await overrideMutation({ referralId, body }).unwrap();
      const dateLabel = format(parseISO(date), 'MMM d, yyyy');
      if (result.rescheduled_from_missed) {
        toast.success(
          `Missed appointment rescued and rescheduled for ${dateLabel}.`,
        );
      } else {
        toast.success(
          `Override scheduled for ${dateLabel} — dept head notified.`,
        );
      }
      onOpenChange(false);
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Failed to override schedule.');
      if (/overbook.*full/i.test(msg)) {
        // Show the user the next few days that have room so they can bail
        // out of this date without poking around the calendar.
        const suggestion = options
          .filter(
            (o) =>
              o.date !== date &&
              o.max_slots + o.overbook_limit - o.booked_slots > 0,
          )
          .slice(0, 3)
          .map((o) => format(parseISO(o.date), 'MMM d'))
          .join(', ');
        toast.error('Even the overbook buffer is full on this date.', {
          description: suggestion
            ? `Try: ${suggestion}`
            : 'No nearby days have room either. Try a later date.',
        });
      } else {
        toast.error(msg);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !isSubmitting && onOpenChange(v)}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader
          className={`px-6 pt-6 pb-4 border-b transition-colors ${
            isOverrideStage
              ? 'border-amber-200 bg-amber-50/40 dark:bg-amber-950/20 dark:border-amber-900/60'
              : 'border-border'
          }`}
        >
          <DialogTitle className="flex items-center gap-2 text-base">
            <span
              className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                isOverrideStage
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                  : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300'
              }`}
            >
              {isOverrideStage ? (
                <ShieldAlert className="h-4 w-4" />
              ) : (
                <CalendarClock className="h-4 w-4" />
              )}
            </span>
            {titleLabel}
          </DialogTitle>
          <DialogDescription className="text-xs flex flex-wrap items-center gap-1.5">
            <span className="font-medium text-foreground">{patientName}</span>
            {currentAppointmentDate && !isOverrideStage && (
              <>
                <span className="text-muted-foreground">· current</span>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {isValid(parseISO(currentAppointmentDate))
                    ? format(parseISO(currentAppointmentDate), 'MMM d, yyyy')
                    : '—'}
                </Badge>
              </>
            )}
            {isRescue && (
              <Badge
                variant="outline"
                className="text-[10px] border-red-300 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300"
              >
                <Sparkles className="h-2.5 w-2.5 mr-1" />
                Missed — rescuing
              </Badge>
            )}
            {critical && isOverrideStage && (
              <Badge className="text-[10px] bg-emerald-600 hover:bg-emerald-600 text-white">
                Critical — justification optional
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {stage === 'schedule' ? (
            <>
              {/* ─── Calendar ──────────────────────────────────────── */}
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <Label className="text-xs font-semibold">
                    Pick a date <span className="text-red-500">*</span>
                  </Label>
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {isValid(parseISO(date))
                      ? format(parseISO(date), 'EEE, MMM d, yyyy')
                      : '—'}
                  </span>
                </div>
                {isLoadingOptions ? (
                  <Skeleton className="h-[320px] w-full rounded-lg" />
                ) : (
                  <CapacityCalendar
                    options={options}
                    selectedDate={date}
                    onSelect={setDate}
                    mode="routine"
                  />
                )}
              </div>

              {/* ─── Selected day capacity summary ─────────────────── */}
              {selectedOption ? (
                <div
                  className={`rounded-md border px-3 py-2.5 text-xs ${
                    selectedOption.available_slots <= 0
                      ? 'border-red-200 bg-red-50/60 dark:bg-red-950/30 dark:border-red-900'
                      : 'border-border bg-muted/40'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold tabular-nums text-foreground">
                      {selectedOption.booked_slots}/{selectedOption.max_slots}{' '}
                      booked
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">
                      {selectedOption.available_slots} routine slot
                      {selectedOption.available_slots === 1 ? '' : 's'} left
                    </span>
                    {selectedOption.has_override && (
                      <Badge
                        variant="outline"
                        className="border-amber-300 bg-amber-50 text-amber-800 text-[10px] dark:bg-amber-950/30 dark:text-amber-300"
                      >
                        Override active
                      </Badge>
                    )}
                    {selectedOption.available_slots <= 0 && (
                      <span className="ml-auto inline-flex items-center gap-1 font-medium text-red-700 dark:text-red-300">
                        <AlertTriangle className="h-3 w-3" />
                        Capacity full — confirm to use override
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-border bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground">
                  No capacity preview for this day. The booking will succeed
                  if the department’s baseline limit hasn’t been reached yet.
                </div>
              )}

              {/* ─── Notes ─────────────────────────────────────────── */}
              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs font-semibold">
                  Notes{' '}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Internal note for the appointment record…"
                  rows={3}
                  className="text-sm resize-none"
                  maxLength={500}
                />
                <p className="text-[10px] text-muted-foreground text-right tabular-nums">
                  {notes.length}/500
                </p>
              </div>
            </>
          ) : (
            <>
              {/* ─── Override confirm step ─────────────────────────── */}
              <div
                role="region"
                aria-label="Capacity exhausted"
                className="rounded-md border border-amber-300 bg-amber-50 px-3 py-3 space-y-2 dark:bg-amber-950/30 dark:border-amber-900"
              >
                <div className="flex items-start gap-2 text-amber-900 dark:text-amber-200">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold">
                      Routine capacity is full for{' '}
                      {isValid(parseISO(date))
                        ? format(parseISO(date), 'EEEE, MMM d, yyyy')
                        : date}
                      .
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      Booking now will consume the department’s overbook
                      buffer{' '}
                      <span className="font-semibold">
                        (+{overbookLimit} slot{overbookLimit === 1 ? '' : 's'}
                        /day)
                      </span>
                      . The dept head is notified every time the buffer is
                      used.
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-amber-900 hover:bg-amber-100 text-[11px] dark:text-amber-200 dark:hover:bg-amber-900/40"
                  onClick={() => setStage('schedule')}
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="h-3 w-3" />
                  Choose another date
                </Button>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">
                  Reason <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-1 gap-1.5">
                  {REASON_OPTIONS.map((opt) => {
                    const checked = reason === opt.value;
                    return (
                      <label
                        key={opt.value}
                        className={`flex items-center gap-2.5 rounded-md border px-3 py-2 text-xs cursor-pointer transition-colors ${
                          checked
                            ? 'border-amber-400 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100'
                            : 'border-border hover:bg-muted text-foreground'
                        }`}
                      >
                        <input
                          type="radio"
                          name="override-reason"
                          value={opt.value}
                          checked={checked}
                          onChange={() => setReason(opt.value)}
                          className="h-3.5 w-3.5 accent-amber-600 shrink-0"
                        />
                        <span className="flex-1">{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Justification */}
              <div className="space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <Label
                    htmlFor="justification"
                    className="text-xs font-semibold"
                  >
                    Justification{' '}
                    {justificationRequired ? (
                      <span className="text-red-500">*</span>
                    ) : (
                      <span className="font-normal text-muted-foreground">
                        (optional — patient is critical)
                      </span>
                    )}
                  </Label>
                  {justificationRequired && (
                    <span
                      className={`text-[10px] tabular-nums ${
                        justificationLong
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {justification.trim().length}/10
                    </span>
                  )}
                </div>
                <Textarea
                  id="justification"
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder={
                    critical
                      ? 'Add context if you wish (not required for critical patients)…'
                      : 'Why must this patient be scheduled outside normal capacity?'
                  }
                  rows={3}
                  maxLength={500}
                  className="text-sm resize-none"
                  required={justificationRequired}
                  aria-required={justificationRequired}
                  aria-invalid={
                    justificationRequired &&
                    justification.length > 0 &&
                    !justificationLong
                  }
                />
                {justificationRequired &&
                  justification.length > 0 &&
                  !justificationLong && (
                    <p className="text-[11px] text-amber-700 dark:text-amber-400">
                      Need at least 10 characters.
                    </p>
                  )}
              </div>
            </>
          )}
        </div>

        <DialogFooter
          className={`px-6 py-4 border-t sm:justify-between ${
            isOverrideStage
              ? 'border-amber-200 bg-amber-50/40 dark:bg-amber-950/20 dark:border-amber-900/60'
              : 'border-border bg-muted/30'
          }`}
        >
          {isOverrideStage ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStage('schedule')}
                disabled={isSubmitting}
                className="gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </Button>
              <Button
                onClick={handleOverrideSubmit}
                disabled={isSubmitting || !justificationValid}
                className="gap-2 min-w-[200px] bg-amber-600 hover:bg-amber-700 text-white"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Submitting…' : 'Confirm override'}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleScheduleSubmit}
                disabled={isSubmitting || !date}
                className="gap-2 min-w-[200px]"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Scheduling…' : baseAction}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
