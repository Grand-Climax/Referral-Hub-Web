'use client';

import Link from 'next/link';
import { format, isValid, parseISO } from 'date-fns';
import {
  ArrowLeft,
  Calendar,
  FileText,
  Info,
  Mail,
  MapPin,
  Stethoscope,
  History,
  User,
  Building2,
  Hash,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useGetTriageDetailQuery } from '@/features/department-head/departmentHeadApi';
import type {
  ArrivalHistoryEvent,
  ArrivalStatus,
  Condition,
  ReferralStatusEnum,
} from '@/types/department-head';

// ─── Visual cookbook (mirrors the list-page cookbook, §8.5) ──────────────────

function scoreChip(score: number) {
  if (score >= 80)
    return {
      cls: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-950/40 dark:text-red-300',
      label: 'Critical',
    };
  if (score >= 60)
    return {
      cls: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-950/40 dark:text-orange-300',
      label: 'High',
    };
  if (score >= 40)
    return {
      cls: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300',
      label: 'Medium',
    };
  return {
    cls: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300',
    label: 'Low',
  };
}

const CONDITION_PILL: Record<Condition | '', string> = {
  critical: 'bg-red-600 text-white',
  urgent: 'bg-orange-500 text-white',
  stable: 'bg-emerald-500 text-white',
  '': 'bg-slate-300 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
};

const ARRIVAL_BADGE: Record<ArrivalStatus, { cls: string; label: string; emoji: string }> = {
  EXPECTED: { cls: 'bg-slate-100 text-slate-700', label: 'Expected', emoji: '◷' },
  ARRIVED: { cls: 'bg-emerald-100 text-emerald-700', label: 'Arrived', emoji: '✓' },
  ADMITTED: { cls: 'bg-sky-100 text-sky-700', label: 'Admitted', emoji: '🏥' },
  MISSED: { cls: 'bg-red-100 text-red-700', label: 'Missed', emoji: '⚠' },
};

const ARRIVAL_FALLBACK = {
  cls: 'bg-slate-100 text-slate-600',
  label: 'Unknown',
  emoji: '·',
} as const;

const REFERRAL_BADGE: Record<ReferralStatusEnum, string> = {
  ACCEPTED: 'bg-indigo-100 text-indigo-700',
  SCHEDULED: 'bg-violet-100 text-violet-700',
};

const REFERRAL_FALLBACK = 'bg-slate-100 text-slate-600';

const TIMELINE_ICON: Record<string, string> = {
  ACCEPT_REFERRAL: '📥',
  APPROVE_REFERRAL: '👍',
  CONFIRM_ARRIVAL: '✅',
  MARK_MISSED: '⚠',
  ASSIGN_DOCTOR: '👨‍⚕️',
  UNASSIGN_DOCTOR: '⤴',
  MANUAL_EMERGENCY_SCHEDULE: '🚨',
  BATCH_SCHEDULE_RUN: '📦',
  GRANT_CONSULT_ACCESS: '🔓',
  REVOKE_CONSULT_ACCESS: '🔒',
  RECORD_OUTCOME: '📑',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function safeFormat(value?: string | null, pattern = 'MMM d, yyyy · HH:mm') {
  if (!value) return undefined;
  const d = parseISO(value);
  return isValid(d) ? format(d, pattern) : undefined;
}

function buildFullName(p: {
  full_name?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
}) {
  if (p.full_name) return p.full_name;
  return [p.first_name, p.middle_name, p.last_name].filter(Boolean).join(' ').trim() || '—';
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function InfoRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-3 border-b border-border last:border-0">
      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        {Icon ? <Icon className="h-3.5 w-3.5 opacity-60" /> : null}
        {label}
      </span>
      <span className="text-sm font-semibold text-foreground text-right max-w-[60%]">
        {value ?? '—'}
      </span>
    </div>
  );
}

function ScoreMeter({ score }: { score: number }) {
  const cfg = scoreChip(score);
  const pct = Math.min(Math.max(score, 0), 100);
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-4xl font-extrabold tabular-nums text-foreground">
          {score.toFixed(1)}
        </span>
        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${cfg.cls}`}>
          {cfg.label}
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background:
              score >= 80
                ? '#dc2626'
                : score >= 60
                  ? '#ea580c'
                  : score >= 40
                    ? '#f59e0b'
                    : '#10b981',
          }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1">{pct.toFixed(0)}% priority</p>
    </div>
  );
}

function TimelineList({ events }: { events: ArrivalHistoryEvent[] }) {
  if (!events?.length) {
    return (
      <div className="py-6 text-center text-sm text-muted-foreground">
        No timeline events yet.
      </div>
    );
  }
  return (
    <ol className="space-y-0">
      {events.map((ev, idx) => {
        const isLast = idx === events.length - 1;
        return (
          <li key={`${ev.at}-${idx}`} className="relative pl-9 pb-5">
            {/* dot + connector */}
            <span
              className="absolute left-2.5 top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-primary bg-background text-[10px]"
              aria-hidden
            >
              {TIMELINE_ICON[ev.event] ?? '•'}
            </span>
            {!isLast && (
              <span className="absolute left-[18px] top-5 bottom-0 w-px bg-border" aria-hidden />
            )}
            <div className="text-xs font-mono text-muted-foreground">
              {safeFormat(ev.at, 'MMM d · HH:mm') ?? '—'}
            </div>
            <div className="mt-0.5 text-sm font-semibold text-foreground">
              {ev.event.replaceAll('_', ' ')}
            </div>
            {ev.description ? (
              <p className="text-xs text-muted-foreground mt-0.5">{ev.description}</p>
            ) : null}
            {ev.actor_name ? (
              <p className="text-[11px] text-muted-foreground mt-0.5">— {ev.actor_name}</p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

// ─── Main page ──────────────────────────────────────────────────────────────

interface Props {
  referralId: string;
}

export default function TriageDetailPage({ referralId }: Props) {
  const {
    data: detail,
    isLoading,
    isError,
    error,
  } = useGetTriageDetailQuery(referralId, { skip: !referralId });

  const notFound =
    !isLoading &&
    !isError &&
    detail === null;

  // 401 should bounce through the global re-auth handler, so we don't
  // special-case it here. Surface any other server error generically.
  const isServerError = isError && (error as { status?: number })?.status !== 404;

  return (
    <div className="max-w-[1000px] mx-auto space-y-5">
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Link href="/department-head/triage-queue">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Queue
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Referral Detail</h1>
          <p className="text-xs text-muted-foreground">Read-only audit view</p>
        </div>
      </div>

      {/* ─── Loading ────────────────────────────────────────────────── */}
      {isLoading && (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-64 rounded-xl md:col-span-2" />
        </div>
      )}

      {/* ─── 404 ────────────────────────────────────────────────────── */}
      {notFound && (
        <Card>
          <CardContent className="p-8 flex flex-col items-center gap-3 text-center">
            <FileText className="h-10 w-10 text-muted-foreground opacity-40" />
            <p className="font-semibold text-foreground">Referral not on the triage queue</p>
            <p className="text-sm text-muted-foreground max-w-md">
              This referral may have been completed, redirected, or moved off the queue.
              Switch the list to <strong>Audit view</strong> to see terminal referrals.
            </p>
            <Link href="/department-head/triage-queue?include_terminal=true">
              <Button variant="outline" size="sm">
                Open audit view
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* ─── 5xx error ──────────────────────────────────────────────── */}
      {isServerError && (
        <Card className="border-destructive/50">
          <CardContent className="p-8 flex flex-col items-center gap-3 text-center">
            <FileText className="h-10 w-10 text-amber-500" />
            <p className="font-semibold text-foreground">Could not load triage data</p>
            <Link href="/department-head/triage-queue">
              <Button variant="outline" size="sm">
                Return to queue
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* ─── Detail body ────────────────────────────────────────────── */}
      {detail && (
        <>
          {/* Identity + score row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border bg-card shadow-sm">
              <CardHeader className="py-3 px-5 border-b border-border">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" /> Patient
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <p className="text-xl font-bold text-foreground">
                  {buildFullName(detail.patient)}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {detail.patient.sex ? <span>{detail.patient.sex}</span> : null}
                  {detail.patient.age_years !== undefined ? (
                    <>
                      <span>·</span>
                      <span>{detail.patient.age_years}y</span>
                    </>
                  ) : null}
                  {detail.patient.home_region ? (
                    <>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {detail.patient.home_region}
                      </span>
                    </>
                  ) : null}
                </div>
                <div className="mt-4 space-y-0">
                  <InfoRow
                    label="Department"
                    value={detail.department_name}
                    icon={Building2}
                  />
                  <InfoRow
                    label="Queue ID"
                    value={
                      detail.queue_id ? (
                        <span className="font-mono text-[11px] opacity-70">
                          {detail.queue_id.slice(0, 8)}…
                        </span>
                      ) : (
                        '—'
                      )
                    }
                    icon={Hash}
                  />
                </div>
                <p className="mt-4 text-[10px] uppercase tracking-wider text-muted-foreground">
                  Patient ID & phone are hidden for department heads.
                </p>
              </CardContent>
            </Card>

            <Card className="border bg-card shadow-sm">
              <CardHeader className="py-3 px-5 border-b border-border">
                <CardTitle className="text-sm font-semibold">Priority Score</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <ScoreMeter score={detail.composite_score ?? 0} />
                <div className="flex flex-wrap items-center gap-2">
                  {(() => {
                    const condKey = (detail.condition_at_referral ?? '') as Condition | '';
                    if (!condKey) return null;
                    const cls = CONDITION_PILL[condKey] ?? CONDITION_PILL[''];
                    return (
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cls}`}
                      >
                        {condKey}
                      </span>
                    );
                  })()}
                  {(() => {
                    const cfg =
                      (detail.arrival_status && ARRIVAL_BADGE[detail.arrival_status]) ||
                      ARRIVAL_FALLBACK;
                    return (
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${cfg.cls}`}
                      >
                        <span aria-hidden>{cfg.emoji}</span>
                        {cfg.label}
                      </span>
                    );
                  })()}
                  {detail.referral_status ? (
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        REFERRAL_BADGE[detail.referral_status] ?? REFERRAL_FALLBACK
                      }`}
                    >
                      {detail.referral_status}
                    </span>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Scheduling + doctor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border bg-card shadow-sm">
              <CardHeader className="py-3 px-5 border-b border-border">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" /> Scheduling
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <InfoRow
                  label="Appointment"
                  value={safeFormat(detail.appointment_date, 'EEE, MMM d · HH:mm')}
                />
                <InfoRow
                  label="Referral created"
                  value={safeFormat(detail.created_at, 'MMM d, yyyy · HH:mm')}
                />
              </CardContent>
            </Card>

            <Card className="border bg-card shadow-sm">
              <CardHeader className="py-3 px-5 border-b border-border">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" /> Assigned doctor
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                {detail.has_doctor_assigned && detail.assigned_doctor ? (
                  <div className="space-y-2">
                    <p className="font-semibold text-foreground">
                      {detail.assigned_doctor.full_name ?? '—'}
                    </p>
                    {detail.assigned_doctor.email ? (
                      <a
                        href={`mailto:${detail.assigned_doctor.email}`}
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <Mail className="h-3 w-3" />
                        {detail.assigned_doctor.email}
                      </a>
                    ) : null}
                    <Badge variant="outline" className="mt-1 text-[10px]">
                      Assigned
                    </Badge>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No treating doctor assigned yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Arrival history timeline */}
          <Card className="border bg-card shadow-sm">
            <CardHeader className="py-3 px-5 border-b border-border">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" /> Arrival history
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  ({detail.arrival_history?.length ?? 0} events)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <TimelineList events={detail.arrival_history ?? []} />
            </CardContent>
          </Card>

          {/* Read-only notice */}
          <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 px-4 py-3">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium">Department heads have read-only access to triage.</p>
              <p className="text-xs mt-0.5">
                For emergency scheduling or doctor reassignment, contact a specialist or the
                receptionist on duty.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
