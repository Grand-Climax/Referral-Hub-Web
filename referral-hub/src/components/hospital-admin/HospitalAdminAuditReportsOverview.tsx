'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, BarChart3, ChevronRight, ClipboardList, Loader2 } from 'lucide-react';
import {
  useGetAcceptanceRejectionRateQuery,
  useGetAuditLogsQuery,
  useGetMonthlyReferralsQuery,
} from '@/features/hospitalAdmin/hospitalAdminApi';
import { formatRateAsPercent } from '@/components/hospital-admin/activity-logs/auditLogDisplay';

export function HospitalAdminAuditReportsOverview() {
  const audit = useGetAuditLogsQuery({ page: 1, page_size: 1 });
  const monthlies = useGetMonthlyReferralsQuery();
  const rates = useGetAcceptanceRejectionRateQuery();

  const lastMonthCount = useMemo(() => {
    const rows = monthlies.data ?? [];
    if (rows.length === 0) return null;
    const last = rows[rows.length - 1];
    return { month: last.month, count: last.count };
  }, [monthlies.data]);

  const loading = audit.isLoading || monthlies.isLoading || rates.isLoading;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Audit & reports</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Live snapshot from audit logs and hospital reporting APIs.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-100 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
              <ClipboardList className="h-4 w-4" />
              Audit events
            </CardDescription>
            <CardTitle className="text-2xl font-bold tabular-nums">
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              ) : (
                audit.data?.total ?? 0
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500">Total entries returned by the API</CardContent>
        </Card>

        <Card className="border-slate-100 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
              <BarChart3 className="h-4 w-4" />
              Latest month volume
            </CardDescription>
            <CardTitle className="text-2xl font-bold tabular-nums">
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              ) : lastMonthCount ? (
                lastMonthCount.count
              ) : (
                '—'
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500">
            {lastMonthCount ? lastMonthCount.month : 'No monthly series yet'}
          </CardContent>
        </Card>

        <Card className="border-slate-100 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
              <Activity className="h-4 w-4" />
              Acceptance rate
            </CardDescription>
            <CardTitle className="text-2xl font-bold tabular-nums">
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              ) : (
                formatRateAsPercent(rates.data?.acceptance_rate ?? 0)
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500">
            Rejection:{' '}
            {loading ? '…' : formatRateAsPercent(rates.data?.rejection_rate ?? 0)}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" className="justify-between h-auto py-3 px-4" asChild>
          <Link href="/hospital-admin/activity-logs">
            <span className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Open audit log
            </span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" className="justify-between h-auto py-3 px-4" asChild>
          <Link href="/hospital-admin/referral-logs">
            <span className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Open referral analytics
            </span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
