'use client';

import Link from 'next/link';
import { useState } from 'react';
import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  History,
  Hospital,
  Info,
  Phone,
  Stethoscope,
  Undo2,
  User,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { useGetSpecialistTriageDetailQuery } from '@/features/specialist/specialistApi';
import type {
  ArrivalStatus,
  Condition,
  ReferralStatusEnum,
} from '@/types/specialist-triage';

import { ScheduleAppointmentDialog } from './ScheduleAppointmentDialog';
import { ReturnToTriageDialog } from './ReturnToTriageDialog';

// ─── Visual helpers (mirrors the queue page's cookbook) ─────────────────────

const CONDITION_PILL: Record<Condition | '', string> = {
  critical: 'bg-red-600 text-white',
  urgent: 'bg-orange-500 text-white',
  stable: 'bg-emerald-500 text-white',
  '': 'bg-slate-300 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
};

const ARRIVAL_BADGE: Record<ArrivalStatus, { cls: string; label: string; emoji: string }> = {
  EXPECTED: {
    cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    label: 'Expected',
    emoji: '◷',
  },
  ARRIVED: {
    cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    label: 'Arrived',
    emoji: '✓',
  },
  ADMITTED: {
    cls: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    label: 'Admitted',
    emoji: '🏥',
  },
  MISSED: {
    cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    label: 'Missed',
    emoji: '⚠',
  },
};

const REFERRAL_BADGE: Record<ReferralStatusEnum, string> = {
  ACCEPTED:
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300',
  SCHEDULED:
    'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
};

const ARRIVAL_FALLBACK = {
  cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  label: 'Unknown',
  emoji: '·',
} as const;

function safeFormat(value?: string | null, pattern = 'MMM d, yyyy HH:mm') {
  if (!value) return undefined;
  const d = parseISO(value);
  return isValid(d) ? format(d, pattern) : undefined;
}

function safeRelative(value?: string | null) {
  if (!value) return undefined;
  const d = parseISO(value);
  return isValid(d) ? `${formatDistanceToNow(d)} ago` : undefined;
}

function ScoreMeter({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score));
  const color =
    score >= 80
      ? 'bg-red-500'
      : score >= 60
        ? 'bg-orange-500'
        : score >= 40
          ? 'bg-amber-400'
          : 'bg-emerald-500';
  const label =
    score >= 80
      ? 'Critical'
      : score >= 60
        ? 'High'
        : score >= 40
          ? 'Medium'
          : 'Low';
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-semibold text-foreground">Priority score</span>
        <span className="tabular-nums font-mono text-foreground">
          {score.toFixed(1)}{' '}
          <span className="text-muted-foreground font-normal">/100</span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full ${color} transition-all`}
          style={{ width: `${pct}%` }}
          aria-label={`${score.toFixed(1)} (${label})`}
        />
      </div>
    </div>
  );
}

function ArrivalChip({ status }: { status?: ArrivalStatus | string | null }) {
  const cfg = (status && ARRIVAL_BADGE[status as ArrivalStatus]) || ARRIVAL_FALLBACK;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${cfg.cls}`}
    >
      <span aria-hidden>{cfg.emoji}</span>
      {cfg.label}
    </span>
  );
}

function ReferralChip({ status }: { status?: ReferralStatusEnum | string | null }) {
  if (!status) return <span className="text-muted-foreground text-xs">—</span>;
  const cls =
    REFERRAL_BADGE[status as ReferralStatusEnum] ??
    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cls}`}
    >
      {status}
    </span>
  );
}

function ConditionChip({ condition }: { condition?: Condition | '' | string | null }) {
  const key = (condition ?? '') as Condition | '';
  if (!key) return null;
  const cls = CONDITION_PILL[key] ?? CONDITION_PILL[''];
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cls}`}
    >
      {key}
    </span>
  );
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 text-sm">
      {icon && <span className="mt-0.5 text-muted-foreground shrink-0">{icon}</span>}
      <span className="text-muted-foreground min-w-[110px]">{label}</span>
      <span className="font-medium text-foreground">{value ?? '—'}</span>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function SpecialistTriageDetailPage({
  referralId,
}: {
  referralId: string;
}) {
  const {
    data: detail,
    isLoading,
    isError,
    refetch,
  } = useGetSpecialistTriageDetailQuery(referralId);

  // Single scheduling dialog. It always tries the routine `/schedule`
  // endpoint first and only surfaces the override step if the server
  // says the date is full — see ScheduleAppointmentDialog for the flow.
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Skeleton className="xl:col-span-2 h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <div className="max-w-[1200px] mx-auto py-16 flex flex-col items-center gap-3">
        <AlertTriangle className="h-10 w-10 text-amber-500 opacity-70" />
        <p className="text-base font-medium">Couldn’t load this triage entry.</p>
        <p className="text-xs text-muted-foreground">
          The referral may have been completed, deceased, or never accepted.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
          <Link href="/receiving-specialist/traige-queue">
            <Button size="sm" variant="ghost" className="gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to queue
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const patient = detail.patient ?? {};
  const fullName =
    patient.full_name ||
    [patient.first_name, patient.middle_name, patient.last_name]
      .filter(Boolean)
      .join(' ') ||
    'Unknown patient';

  const isOnSite =
    detail.arrival_status === 'ARRIVED' || detail.arrival_status === 'ADMITTED';
  const isMissed = detail.arrival_status === 'MISSED';
  const actions = detail.available_actions ?? {
    schedule: false,
    emergency_schedule: false,
    return_to_triage: false,
  };

  // The button text follows the patient's current state. The dialog itself
  // handles the routine→override escalation, so we don't expose "override"
  // in the button — only after the server tells us it's needed.
  const scheduleLabel = isMissed
    ? 'Rescue & reschedule'
    : detail.referral_status === 'SCHEDULED'
      ? 'Reschedule patient'
      : 'Schedule patient';

  return (
    <div className="max-w-[1300px] mx-auto space-y-5 pb-12">
      {/* ─── Back link + breadcrumbs ───────────────────────────────── */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link
          href="/receiving-specialist/traige-queue"
          className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Triage queue
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground/80 font-mono">
          {referralId.slice(0, 8)}…
        </span>
      </div>

      {/* ─── Header card ───────────────────────────────────────────── */}
      <Card className="border bg-card shadow-sm">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {fullName}
                </h1>
                <ConditionChip condition={detail.condition_at_referral} />
                <ArrivalChip status={detail.arrival_status} />
                <ReferralChip status={detail.referral_status} />
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Hospital className="h-3.5 w-3.5" />
                  {detail.department_name || '—'}
                </span>
                {patient.sex && (
                  <span className="inline-flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {patient.sex}
                    {patient.age_years != null ? ` · ${patient.age_years} yrs` : ''}
                  </span>
                )}
                {patient.phone_number && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {patient.phone_number}
                  </span>
                )}
                {patient.national_id && (
                  <span className="font-mono">
                    ID: {patient.national_id}
                  </span>
                )}
                {detail.created_at && (
                  <span>Queued {safeRelative(detail.created_at) ?? '—'}</span>
                )}
              </div>
            </div>

            <div className="w-full md:w-72 shrink-0">
              <ScoreMeter score={detail.composite_score ?? 0} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* ─── Left column ─────────────────────────────────────────── */}
        <div className="xl:col-span-2 space-y-5">
          {/* Clinical snapshot */}
          <Card className="border bg-card shadow-sm">
            <CardHeader className="py-3 px-5 border-b border-border">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600" />
                Clinical snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              {/* Vitals row */}
              {detail.vitals ? (
                <div>
                  <div className="flex items-baseline justify-between mb-2">
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Latest vitals
                    </h3>
                    {detail.vitals.recorded_at && (
                      <span className="text-[10px] text-muted-foreground">
                        {safeFormat(detail.vitals.recorded_at, 'MMM d HH:mm') ?? '—'}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                    {[
                      {
                        label: 'BP',
                        value:
                          detail.vitals.systolic_bp != null
                            ? `${detail.vitals.systolic_bp}/${detail.vitals.diastolic_bp ?? '—'}`
                            : null,
                      },
                      { label: 'HR', value: detail.vitals.heart_rate },
                      { label: 'SpO₂', value: detail.vitals.sp_o2 },
                      { label: 'Temp', value: detail.vitals.temperature },
                      { label: 'RR', value: detail.vitals.respiratory_rate },
                      { label: 'GCS', value: detail.vitals.gcs_score },
                    ].map((v) => (
                      <div
                        key={v.label}
                        className="rounded-md bg-muted/40 p-2"
                      >
                        <p className="text-[10px] text-muted-foreground">
                          {v.label}
                        </p>
                        <p className="text-base font-bold tabular-nums">
                          {v.value ?? '—'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No vitals recorded.
                </p>
              )}

              {detail.reason_of_referral && (
                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Reason for referral
                  </h3>
                  <p className="text-sm whitespace-pre-line leading-relaxed">
                    {detail.reason_of_referral}
                  </p>
                </div>
              )}

              {detail.clinical_summary && (
                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Clinical summary
                  </h3>
                  <p className="text-sm whitespace-pre-line leading-relaxed">
                    {detail.clinical_summary}
                  </p>
                </div>
              )}

              {detail.diagnoses && detail.diagnoses.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Diagnoses
                  </h3>
                  <ul className="space-y-1.5">
                    {detail.diagnoses.map((d, i) => (
                      <li
                        key={`${d.icd_code}-${i}`}
                        className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm"
                      >
                        <span className="font-mono text-[11px] font-semibold">
                          {d.icd_code}
                        </span>
                        <span className="text-foreground">{d.description ?? '—'}</span>
                        {d.is_primary && (
                          <Badge className="ml-auto bg-blue-600 hover:bg-blue-600 text-[9px]">
                            Primary
                          </Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {detail.investigation_results && (
                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Investigation results
                  </h3>
                  <p className="text-sm whitespace-pre-line leading-relaxed">
                    {detail.investigation_results}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Doctors / access list */}
          <Card className="border bg-card shadow-sm">
            <CardHeader className="py-3 px-5 border-b border-border">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-blue-600" />
                Assigned doctors
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3 text-sm">
              {detail.treating_doctor ? (
                <div className="flex items-center gap-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 dark:bg-blue-950/30 dark:border-blue-900">
                  <Stethoscope className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                  <div className="flex-1">
                    <p className="font-semibold">
                      {detail.treating_doctor.full_name ?? '—'}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Treating doctor
                      {detail.treating_doctor.granted_at
                        ? ` · since ${safeFormat(detail.treating_doctor.granted_at, 'MMM d') ?? '—'}`
                        : ''}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No treating doctor assigned yet — the dept head manages
                  these assignments.
                </p>
              )}

              {detail.consulting_doctors && detail.consulting_doctors.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Consulting doctors
                  </p>
                  {detail.consulting_doctors.map((d) => (
                    <div
                      key={d.user_id}
                      className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs"
                    >
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">{d.full_name ?? '—'}</span>
                      {d.revoked_at && (
                        <Badge variant="outline" className="ml-auto text-[9px]">
                          Revoked
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Arrival history timeline */}
          <Card className="border bg-card shadow-sm">
            <CardHeader className="py-3 px-5 border-b border-border">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <History className="h-4 w-4 text-blue-600" />
                Arrival history
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {!detail.arrival_history || detail.arrival_history.length === 0 ? (
                <p className="text-xs text-muted-foreground">No history yet.</p>
              ) : (
                <ol className="relative border-l border-border ml-2 space-y-3">
                  {detail.arrival_history.map((e, i) => (
                    <li key={i} className="pl-4">
                      <div className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full border border-border bg-background" />
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">
                          {e.event}
                        </p>
                        <span className="text-[10px] text-muted-foreground tabular-nums">
                          {safeFormat(e.at, 'MMM d HH:mm') ?? '—'}
                        </span>
                      </div>
                      {e.description && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {e.description}
                        </p>
                      )}
                      {e.actor_name && (
                        <p className="text-[10px] text-muted-foreground italic">
                          by {e.actor_name}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ─── Right column — action rail ───────────────────────────── */}
        <div className="space-y-5">
          {/* Schedule + Override actions per §4 of the guide */}
          <Card className="border bg-card shadow-sm">
            <CardHeader className="py-3 px-5 border-b border-border">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-indigo-600" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Current scheduling state */}
              <div className="space-y-1.5 text-xs">
                <InfoRow
                  label="Current"
                  value={
                    detail.appointment_date
                      ? safeFormat(detail.appointment_date, 'MMM d, yyyy')
                      : 'Not scheduled'
                  }
                />
                <InfoRow
                  label="Arrival"
                  value={<ArrivalChip status={detail.arrival_status} />}
                />
                <InfoRow
                  label="Referral"
                  value={<ReferralChip status={detail.referral_status} />}
                />
              </div>

              {/* Hide both buttons when ARRIVED/ADMITTED — show info card */}
              {isOnSite ? (
                <div className="rounded-md border border-sky-200 bg-sky-50 p-3 text-xs text-sky-900 dark:bg-sky-950/30 dark:border-sky-900 dark:text-sky-200">
                  <p className="flex items-start gap-2">
                    <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>
                      Patient has already arrived. Use the reception flow to
                      manage their visit — scheduling actions are disabled
                      once a patient is on-site.
                    </span>
                  </p>
                </div>
              ) : (
                <>
                  {/*
                    Single primary CTA. The dialog always tries `/schedule`
                    first and falls back to the override confirmation step
                    only if the server returns "capacity reached". That keeps
                    the rail to one button and the override is just a
                    follow-up step inside the same flow.
                  */}
                  {(actions.schedule || actions.emergency_schedule) && (
                    <Button
                      className="w-full gap-2"
                      onClick={() => setScheduleOpen(true)}
                    >
                      <CalendarClock className="h-4 w-4" />
                      {scheduleLabel}
                    </Button>
                  )}

                  {actions.return_to_triage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full gap-1.5 text-sky-700 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-950/40"
                      onClick={() => setReturnOpen(true)}
                    >
                      <Undo2 className="h-3.5 w-3.5" />
                      Return to triage
                    </Button>
                  )}

                  {/* If the server says no actions are available but the
                      patient isn't on-site, surface a calm explainer rather
                      than a confusing blank panel. */}
                  {!actions.schedule &&
                    !actions.emergency_schedule &&
                    !actions.return_to_triage && (
                      <p className="text-[11px] text-muted-foreground">
                        No scheduling actions are available for this referral
                        right now.
                      </p>
                    )}
                </>
              )}

              <Link href={`/receiving-specialist/${detail.referral_id}`}>
                <Button variant="ghost" size="sm" className="w-full gap-1 text-xs">
                  <ClipboardList className="h-3 w-3" />
                  Open full referral record
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick facts */}
          <Card className="border bg-card shadow-sm">
            <CardHeader className="py-3 px-5 border-b border-border">
              <CardTitle className="text-sm font-semibold">Quick facts</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-1.5">
              <InfoRow
                label="Referral ID"
                value={<span className="font-mono text-[11px]">{detail.referral_id.slice(0, 8)}…</span>}
              />
              <InfoRow
                label="Queue ID"
                value={<span className="font-mono text-[11px]">{detail.queue_id.slice(0, 8)}…</span>}
              />
              <InfoRow
                label="ML severity"
                value={
                  detail.ml_severity_score != null
                    ? detail.ml_severity_score.toFixed(1)
                    : undefined
                }
              />
              <InfoRow
                label="Triage status"
                value={detail.triage_status ?? undefined}
              />
              <InfoRow
                label="Created"
                value={safeFormat(detail.created_at) ?? undefined}
                icon={<CheckCircle2 className="h-3 w-3" />}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── Modals ──────────────────────────────────────────────────── */}
      <ScheduleAppointmentDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        referralId={detail.referral_id}
        patientName={fullName}
        arrivalStatus={detail.arrival_status}
        referralStatus={detail.referral_status}
        conditionAtReferral={detail.condition_at_referral}
        currentAppointmentDate={detail.appointment_date}
      />

      <ReturnToTriageDialog
        open={returnOpen}
        onOpenChange={setReturnOpen}
        referralId={detail.referral_id}
        patientName={fullName}
      />
    </div>
  );
}
