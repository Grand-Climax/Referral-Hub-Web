'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Info,
  Loader2,
  Minus,
  Plus,
  RotateCcw,
  Save,
  ShieldAlert,
  Sliders,
  TriangleAlert,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

import {
  useGetDailyCapacityQuery,
  useUpdateDailyCapacityMutation,
  useGetDashboardStatsQuery,
} from '@/features/department-head/departmentHeadApi';
import { getApiErrorMessage } from '@/lib/apiError';

const AUTOREFETCH_INTERVAL = 5 * 60_000; // 5 minutes
const MAX_VALUE = 200;
const MIN_VALUE = 0;

// ─── NumberStepper ──────────────────────────────────────────────────────────

function NumberStepper({
  label,
  unit,
  value,
  onChange,
  disabled,
  accentClass = 'text-foreground',
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
  accentClass?: string;
}) {
  const clamp = (n: number) => Math.max(MIN_VALUE, Math.min(MAX_VALUE, n));
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>

        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onChange(clamp(value - 1))}
            disabled={disabled || value <= MIN_VALUE}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-all hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
            aria-label="Decrease"
          >
            <Minus className="h-4 w-4" />
          </button>

          <input
            type="number"
            inputMode="numeric"
            min={MIN_VALUE}
            max={MAX_VALUE}
            value={value}
            disabled={disabled}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10);
              if (!isNaN(n)) onChange(clamp(n));
              else if (e.target.value === '') onChange(0);
            }}
            className={`h-16 w-24 rounded-2xl border-2 border-border bg-muted/30 text-center text-4xl font-extrabold tabular-nums focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 ${accentClass} disabled:opacity-60`}
            aria-label={label}
          />

          <button
            type="button"
            onClick={() => onChange(clamp(value + 1))}
            disabled={disabled || value >= MAX_VALUE}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-all hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
            aria-label="Increase"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-3 text-xs font-medium text-muted-foreground">{unit}</p>
      </div>
    </div>
  );
}

// ─── Confirm modal ──────────────────────────────────────────────────────────

function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Proceed',
  tone = 'warning',
  onConfirm,
  onClose,
  isLoading,
}: {
  open: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  tone?: 'warning' | 'danger';
  onConfirm: () => void;
  onClose: () => void;
  isLoading?: boolean;
}) {
  const Icon = tone === 'danger' ? TriangleAlert : AlertTriangle;
  const color = tone === 'danger' ? 'text-destructive' : 'text-amber-500';

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${color}`} />
            {title}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="text-sm text-muted-foreground space-y-2 mt-1">
              {description}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={tone === 'danger' ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main page ──────────────────────────────────────────────────────────────

type PendingConfirm =
  | { kind: 'lower-than-booked'; bookedToday: number }
  | { kind: 'set-zero' }
  | null;

export default function CapacitySettingsPage() {
  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetDailyCapacityQuery(undefined, {
    pollingInterval: AUTOREFETCH_INTERVAL,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const { data: stats } = useGetDashboardStatsQuery(undefined, {
    pollingInterval: AUTOREFETCH_INTERVAL,
  });

  const [updateBaseline, { isLoading: isSaving }] =
    useUpdateDailyCapacityMutation();

  const [std, setStd] = useState(0);
  const [ovr, setOvr] = useState(0);
  const [savedFlash, setSavedFlash] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync form state with server data
  useEffect(() => {
    if (data && data.standard_daily_limit !== undefined) {
      setStd(data.standard_daily_limit);
      setOvr(data.overbook_limit ?? 0);
    }
  }, [data]);

  useEffect(() => {
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, []);

  const dirty =
    !!data &&
    (std !== data.standard_daily_limit || ovr !== data.overbook_limit);
  const valid = std >= MIN_VALUE && ovr >= MIN_VALUE;

  const bookedToday = stats?.today_capacity?.booked_slots ?? 0;
  const overbookOverflow = ovr > std && std > 0;
  const willOverflowToday = dirty && std < bookedToday && bookedToday > 0;
  const willPauseDept = dirty && std === 0 && (data?.standard_daily_limit ?? 0) > 0;

  const updatedRelative = data?.updated_at
    ? formatDistanceToNowStrict(new Date(data.updated_at), { addSuffix: true })
    : null;

  const handleReset = () => {
    if (data) {
      setStd(data.standard_daily_limit);
      setOvr(data.overbook_limit ?? 0);
    }
  };

  const performSave = async () => {
    try {
      await updateBaseline({
        standard_daily_limit: std,
        overbook_limit: ovr,
      }).unwrap();
      toast.success('Capacity baseline saved.', {
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
      });
      setPendingConfirm(null);
      setSavedFlash(true);
      if (flashTimer.current) clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setSavedFlash(false), 3000);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not save baseline.'));
    }
  };

  const handleSave = () => {
    if (!dirty || !valid || isSaving) return;

    // Guardrail 1: lowering below today's already-booked count
    if (willOverflowToday) {
      setPendingConfirm({ kind: 'lower-than-booked', bookedToday });
      return;
    }

    // Guardrail 2: setting standard limit to 0
    if (willPauseDept) {
      setPendingConfirm({ kind: 'set-zero' });
      return;
    }

    void performSave();
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-8 flex flex-col items-center gap-4 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive" />
            <div>
              <p className="font-semibold text-foreground">
                Could not load capacity settings
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Check your connection or try again in a moment.
              </p>
            </div>
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Capacity Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Baseline daily capacity for your department. Overrides still win on
            specific dates.
          </p>
        </div>
        {updatedRelative && (
          <Badge variant="outline" className="text-[11px] gap-1.5 self-start">
            <Sliders className="h-3 w-3" />
            Updated {updatedRelative}
          </Badge>
        )}
      </div>

      {/* ─── Inline saved flash ─────────────────────────────────────────── */}
      {savedFlash && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 px-4 py-2.5 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            Baseline saved — applies to all future dates without an override.
          </p>
        </div>
      )}

      {/* ─── Main card ──────────────────────────────────────────────────── */}
      <Card className="border bg-card shadow-sm">
        <CardHeader className="py-4 px-6 border-b border-border">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Sliders className="h-4 w-4 text-primary" />
            Baseline Limits
            {isFetching && !isSaving && (
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NumberStepper
              label="Standard Daily Limit"
              unit="patients / day"
              value={std}
              onChange={setStd}
              disabled={isSaving}
            />
            <NumberStepper
              label="Overbook Limit"
              unit="extra emergency slots"
              value={ovr}
              onChange={setOvr}
              disabled={isSaving}
              accentClass={overbookOverflow ? 'text-amber-600' : 'text-foreground'}
            />
          </div>

          {/* Soft warnings */}
          <div className="space-y-2">
            <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 px-3 py-2.5">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Applies to all future dates without an active override. Today&apos;s
                bookings are not affected. Past schedule logs stay frozen.
              </p>
            </div>

            {overbookOverflow && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 px-3 py-2.5">
                <TriangleAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Overbook limit ({ovr}) is larger than the standard limit ({std}).
                  That&apos;s unusual — confirm this is intentional.
                </p>
              </div>
            )}

            {willOverflowToday && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 px-3 py-2.5">
                <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Today already has <strong>{bookedToday}</strong> booked. Lowering
                  to <strong>{std}</strong> will show today as over-capacity until
                  patients arrive.
                </p>
              </div>
            )}

            {willPauseDept && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2.5">
                <TriangleAlert className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs text-destructive">
                  Setting standard limit to 0 pauses all future bookings without
                  an override.
                </p>
              </div>
            )}
          </div>

          {/* Action row */}
          <div className="flex items-center justify-between gap-3 border-t border-border pt-5">
            <div className="text-xs text-muted-foreground">
              {dirty ? (
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Unsaved changes
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Synced with server
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={!dirty || isSaving}
                onClick={handleReset}
                className="gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
              <Button
                disabled={!dirty || !valid || isSaving}
                onClick={handleSave}
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Link
        href="/department-head/capacity"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        See how this affects upcoming dates
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>

      {/* ─── Confirm modals ─────────────────────────────────────────────── */}
      <ConfirmModal
        open={pendingConfirm?.kind === 'lower-than-booked'}
        title="Lower limit below today's bookings?"
        description={
          pendingConfirm?.kind === 'lower-than-booked' && (
            <>
              <p>
                Today already has{' '}
                <strong className="text-foreground">
                  {pendingConfirm.bookedToday}
                </strong>{' '}
                booked.
              </p>
              <p>
                The new standard limit is{' '}
                <strong className="text-foreground">{std}</strong> — today will
                display as <strong>over-capacity</strong> until patients arrive
                or are rescheduled.
              </p>
              <p>Proceed?</p>
            </>
          )
        }
        confirmLabel="Save anyway"
        onConfirm={performSave}
        onClose={() => setPendingConfirm(null)}
        isLoading={isSaving}
      />

      <ConfirmModal
        open={pendingConfirm?.kind === 'set-zero'}
        tone="danger"
        title="Pause new bookings?"
        description={
          <>
            <p>
              Setting the standard daily limit to <strong>0</strong> pauses new
              bookings for <strong>all future dates</strong> without an active
              override.
            </p>
            <p>
              Existing bookings and overrides are not affected. You can raise it
              again any time.
            </p>
            <p>Confirm pause?</p>
          </>
        }
        confirmLabel="Pause department"
        onConfirm={performSave}
        onClose={() => setPendingConfirm(null)}
        isLoading={isSaving}
      />
    </div>
  );
}
