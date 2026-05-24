'use client';

import Link from 'next/link';
import { useState } from 'react';
import { format } from 'date-fns';
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  Users,
  Loader2,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

import {
  useGetDashboardStatsQuery,
  useGetPriorityBucketsQuery,
  useRunBatchSchedulingMutation,
} from '@/features/department-head/departmentHeadApi';
import type { BatchScheduleDetail, BatchSchedulingResponse } from '@/types/department-head';
import { getApiErrorMessage } from '@/lib/apiError';

type Step = 'preview' | 'result';

function OutcomeIcon({ outcome }: { outcome: string }) {
  if (outcome === 'SCHEDULED')
    return <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />;
  return <XCircle className="h-4 w-4 text-amber-500 shrink-0" />;
}

function BatchResultView({
  result,
  onReset,
}: {
  result: BatchSchedulingResponse;
  onReset: () => void;
}) {
  const scheduled = result.scheduled_count ?? 0;
  const skipped = result.skipped_count ?? 0;
  const waiting = result.waiting_count ?? 0;
  const alreadyRunning = result.message?.toLowerCase().includes('already running');

  if (alreadyRunning) {
    return (
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
        <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
          <Info className="h-12 w-12 text-amber-600" />
          <div>
            <p className="font-semibold text-foreground text-lg">Batch Already Running</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">{result.message}</p>
          </div>
          <Button variant="outline" onClick={onReset}>
            Done
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (waiting === 0 && scheduled === 0 && !result.message) {
    return (
      <Card className="border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20">
        <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-600" />
          <div>
            <p className="font-semibold text-foreground text-lg">Queue Already Clear</p>
            <p className="text-sm text-muted-foreground mt-1">Nothing to schedule.</p>
          </div>
          <Button variant="outline" onClick={onReset}>
            Done
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className={`rounded-xl border p-6 flex flex-col items-center gap-3 text-center ${
          scheduled > 0
            ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20'
            : 'border-amber-200 bg-amber-50 dark:bg-amber-900/20'
        }`}
      >
        {scheduled > 0 ? (
          <CheckCircle2 className="h-12 w-12 text-emerald-600" />
        ) : (
          <AlertTriangle className="h-12 w-12 text-amber-600" />
        )}
        <div>
          <p className="text-2xl font-extrabold text-foreground">
            Scheduled {scheduled} of {waiting} patients
          </p>
          {skipped > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {skipped} patient{skipped !== 1 ? 's' : ''} could not be placed
            </p>
          )}
        </div>
      </div>

      {scheduled === 0 && waiting > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              No patients could be placed
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Review capacity overrides or check if slots are available.
            </p>
            <Link
              href="/department-head/capacity"
              className="text-xs text-primary hover:underline mt-1 inline-block"
            >
              Open Capacity Calendar →
            </Link>
          </div>
        </div>
      )}

      {result.details && result.details.length > 0 && (
        <Card className="border bg-card shadow-sm">
          <CardHeader className="py-3 px-5 border-b border-border">
            <CardTitle className="text-sm font-semibold">Batch Details</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {['Outcome', 'Patient', 'Scheduled For', 'Notes'].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {result.details.map((d: BatchScheduleDetail) => (
                    <tr key={d.referral_id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <OutcomeIcon outcome={d.outcome} />
                          <Badge
                            variant={d.outcome === 'SCHEDULED' ? 'default' : 'secondary'}
                            className={`text-[10px] ${
                              d.outcome === 'SCHEDULED'
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                                : ''
                            }`}
                          >
                            {d.outcome}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {d.patient_name}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {d.scheduled_for
                          ? format(new Date(d.scheduled_for), 'MMM d, yyyy')
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {d.reason ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/department-head/capacity">
          <Button variant="default" className="gap-2">
            <Calendar className="h-4 w-4" />
            View Calendar
          </Button>
        </Link>
        <Link
          href={`/department-head/schedule/patients?date=${format(new Date(), 'yyyy-MM-dd')}`}
        >
          <Button variant="outline" className="gap-2">
            <Users className="h-4 w-4" />
            Scheduled Patients
          </Button>
        </Link>
        <Button variant="ghost" onClick={onReset}>
          Run Again
        </Button>
      </div>
    </div>
  );
}

export default function BatchSchedulePage() {
  const [step, setStep] = useState<Step>('preview');
  const [sendNotifications, setSendNotifications] = useState(true);
  const [batchResult, setBatchResult] = useState<BatchSchedulingResponse | null>(null);

  const { data: stats } = useGetDashboardStatsQuery();
  const { data: buckets, isLoading: isBucketsLoading } = useGetPriorityBucketsQuery();
  const [runBatch, { isLoading: isRunning }] = useRunBatchSchedulingMutation();

  const waitingCount = stats?.waiting_queue_size ?? 0;

  const handleRun = async () => {
    try {
      const result = await runBatch({ send_notifications: sendNotifications }).unwrap();
      setBatchResult(result);
      setStep('result');

      if (result.message?.toLowerCase().includes('already running')) {
        toast.info(
          "A batch run is already in progress. We'll refresh the queue in a few minutes."
        );
      } else if ((result.scheduled_count ?? 0) > 0) {
        toast.success(`Scheduled ${result.scheduled_count} patients`);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Batch scheduling failed'));
    }
  };

  if (step === 'result' && batchResult) {
    return (
      <div className="max-w-[860px] mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Batch Schedule — Results
          </h1>
        </div>
        <BatchResultView
          result={batchResult}
          onReset={() => {
            setStep('preview');
            setBatchResult(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-[860px] mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Run Batch Schedule
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Automatically assign appointment dates to waiting referrals based on priority and
          capacity.
        </p>
      </div>

      <Card className="border bg-card shadow-sm">
        <CardHeader className="py-4 px-5 border-b border-border">
          <CardTitle className="text-sm font-semibold">Queue Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-extrabold tabular-nums text-foreground">
              {waitingCount}
            </span>
            <span className="text-lg text-muted-foreground">patients waiting</span>
          </div>

          {isBucketsLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : buckets ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  By Condition
                </p>
                {buckets.by_condition?.map((b) => {
                  const colors: Record<string, string> = {
                    CRITICAL: 'bg-red-500',
                    URGENT: 'bg-amber-500',
                    STABLE: 'bg-emerald-500',
                    UNSPECIFIED: 'bg-slate-400',
                  };
                  const pct =
                    buckets.total_waiting > 0 ? (b.count / buckets.total_waiting) * 100 : 0;
                  return (
                    <div key={b.label} className="flex items-center gap-3 mb-2">
                      <span className="text-xs text-muted-foreground w-20 shrink-0">
                        {b.label}
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            colors[b.label] ?? 'bg-slate-400'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold w-6 text-right">{b.count}</span>
                    </div>
                  );
                })}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  By ML Severity
                </p>
                {buckets.by_severity?.map((b) => {
                  const colors: Record<string, string> = {
                    HIGH: 'bg-red-500',
                    MEDIUM: 'bg-amber-500',
                    LOW: 'bg-emerald-500',
                    UNKNOWN: 'bg-slate-400',
                  };
                  const pct =
                    buckets.total_waiting > 0 ? (b.count / buckets.total_waiting) * 100 : 0;
                  return (
                    <div key={b.label} className="flex items-center gap-3 mb-2">
                      <span className="text-xs text-muted-foreground w-20 shrink-0">
                        {b.label}
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            colors[b.label] ?? 'bg-slate-400'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold w-6 text-right">{b.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border bg-card shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="send-notif" className="text-sm font-semibold">
                Send patient SMS / push notifications
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Patients will be notified of their scheduled appointment.
              </p>
            </div>
            <Switch
              id="send-notif"
              checked={sendNotifications}
              onCheckedChange={setSendNotifications}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col items-center gap-3">
        <Button
          size="lg"
          className="w-full max-w-sm gap-3 font-bold text-base h-14"
          onClick={handleRun}
          disabled={isRunning || waitingCount === 0}
        >
          {isRunning ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Scheduling…
            </>
          ) : (
            <>
              <Zap className="h-5 w-5" />
              Run Batch Scheduling
            </>
          )}
        </Button>
        {waitingCount === 0 && (
          <p className="text-xs text-muted-foreground">
            Nothing to schedule — the queue is already clear.
          </p>
        )}
      </div>

      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <p>
          A 5-minute exclusive lease is acquired per department to prevent concurrent runs.
        </p>
      </div>
    </div>
  );
}
