'use client';

import Link from 'next/link';
import { format, isValid, parseISO } from 'date-fns';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  AlertTriangle,
  FileText,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetTriageQueueQuery } from '@/features/department-head/departmentHeadApi';
import type { TriagePatient } from '@/types/department-head';

interface Props {
  referralId: string;
}

/**
 * Safely format an ISO-ish date string. Returns `fallback` when the input is
 * missing, empty, or unparseable so that the page doesn't crash on bad data
 * coming back from the API.
 */
function safeFormat(
  value: string | number | Date | null | undefined,
  pattern: string,
  fallback: string | undefined = undefined,
): string | undefined {
  if (value === null || value === undefined || value === '') return fallback;
  const date =
    typeof value === 'string' ? parseISO(value) : new Date(value);
  return isValid(date) ? format(date, pattern) : fallback;
}

const URGENCY_COLORS: Record<string, string> = {
  CRITICAL: 'text-red-700 bg-red-100 dark:bg-red-900/40 dark:text-red-300',
  HIGH: 'text-amber-700 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300',
  MEDIUM: 'text-blue-700 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300',
  LOW: 'text-slate-600 bg-slate-100 dark:bg-slate-700/40',
};

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | number | undefined | null;
}) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground text-right max-w-[60%]">
        {value ?? '—'}
      </span>
    </div>
  );
}

function ScoreMeter({ score }: { score: number }) {
  const pct = Math.min(score, 100);
  const color = score >= 80 ? '#ef4444' : score >= 50 ? '#f59e0b' : '#10b981';
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-4xl font-extrabold tabular-nums text-foreground">
          {score.toFixed(1)}
        </span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1">{pct.toFixed(0)}% priority score</p>
    </div>
  );
}

export default function TriageDetailPage({ referralId }: Props) {
  const { data: queueResult, isLoading, isError } = useGetTriageQueueQuery({
    page: 1,
    page_size: 100,
  });
  const patient: TriagePatient | undefined = queueResult?.data?.find(
    (p) => (p.referral_id ?? p.id) === referralId
  );

  return (
    <div className="max-w-[900px] mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/department-head/triage-queue">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Queue
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Referral Detail</h1>
          <p className="text-xs text-muted-foreground">Read-only view</p>
        </div>
      </div>

      {isLoading && (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-64 rounded-xl md:col-span-2" />
        </div>
      )}

      {isError && (
        <Card className="border-destructive/50">
          <CardContent className="p-8 flex flex-col items-center gap-3 text-center">
            <AlertTriangle className="h-10 w-10 text-amber-500" />
            <p className="font-semibold text-foreground">Could not load triage data</p>
            <Link href="/department-head/triage-queue">
              <Button variant="outline" size="sm">
                Return to queue
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && !patient && (
        <Card>
          <CardContent className="p-8 flex flex-col items-center gap-3 text-center">
            <FileText className="h-10 w-10 text-muted-foreground opacity-40" />
            <p className="font-semibold text-foreground">Referral not found</p>
            <p className="text-sm text-muted-foreground">
              The referral may have been processed or moved.
            </p>
            <Link href="/department-head/triage-queue">
              <Button variant="outline" size="sm">
                Return to queue
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && patient && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border bg-card shadow-sm">
              <CardHeader className="py-3 px-5 border-b border-border">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" /> Patient
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <p className="text-xl font-bold text-foreground">{patient.patient_name}</p>
                <div className="mt-3 space-y-0">
                  <InfoRow label="Age" value={patient.patient_age} />
                  <InfoRow label="Sex" value={patient.patient_sex} />
                  <InfoRow label="Referring Facility" value={patient.referring_facility} />
                </div>
              </CardContent>
            </Card>

            <Card className="border bg-card shadow-sm">
              <CardHeader className="py-3 px-5 border-b border-border">
                <CardTitle className="text-sm font-semibold">Priority Score</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <ScoreMeter
                  score={patient.composite_score ?? patient.severity_score ?? 0}
                />
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">ML Tier:</span>
                  {patient.urgency_level ? (
                    <span
                      className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                        URGENCY_COLORS[patient.urgency_level] ?? ''
                      }`}
                    >
                      {patient.urgency_level}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </div>
                {patient.waiting_days !== undefined && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Waiting {patient.waiting_days} day
                    {patient.waiting_days !== 1 ? 's' : ''}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border bg-card shadow-sm">
            <CardHeader className="py-3 px-5 border-b border-border">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" /> Scheduling Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                <div>
                  <InfoRow
                    label="Current Status"
                    value={patient.status ?? patient.arrival_status}
                  />
                  <InfoRow
                    label="Appointment Date"
                    value={safeFormat(
                      patient.appointment_date,
                      'EEEE, MMMM d, yyyy',
                    )}
                  />
                  <InfoRow
                    label="Referral Created"
                    value={safeFormat(
                      patient.created_at,
                      'MMM d, yyyy HH:mm',
                    )}
                  />
                </div>
                <div>
                  <InfoRow
                    label="Assigned Doctor"
                    value={patient.assigned_doctor_id ? 'Assigned' : 'Unassigned'}
                  />
                  <InfoRow
                    label="Estimated Arrival"
                    value={safeFormat(
                      patient.estimated_arrival,
                      'MMM d, HH:mm',
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 px-4 py-3">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Department heads have read-only access to triage. Contact a specialist or
              receptionist for emergency scheduling.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
