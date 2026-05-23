'use client';

import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, ShieldAlert, Users, Zap } from 'lucide-react';
import type { HospitalAdminAuditLog } from '@/types/hospital-admin';
import { auditLogCategory, parseAuditTimestamp } from './auditLogDisplay';

type ActivityStatsProps = {
  logs: HospitalAdminAuditLog[];
  /** Total rows matching server filters (from API `total`). */
  totalCount?: number;
  isLoading?: boolean;
};

function countLast24h(logs: HospitalAdminAuditLog[]): number {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  return logs.filter((log) => parseAuditTimestamp(log.timestamp).getTime() >= cutoff).length;
}

export const ActivityStats = ({ logs, totalCount, isLoading }: ActivityStatsProps) => {
  const stats = useMemo(() => {
    const totalDisplay = totalCount ?? logs.length;
    const last24 = countLast24h(logs);
    const apiCalls = logs.filter((l) => l.action_type === 'API_CALL').length;
    const uniqueUsers = new Set(logs.map((l) => l.user_id)).size;
    const securityHints = logs.filter((l) => auditLogCategory(l) === 'security').length;
    return [
      {
        label: 'TOTAL EVENTS',
        value: String(totalDisplay),
        subtext: totalCount != null ? 'Matching server filters' : 'Loaded rows',
        icon: Activity,
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-50 dark:bg-blue-900/20',
      },
      {
        label: 'LAST 24 HOURS',
        value: String(last24),
        subtext: 'On this page',
        icon: Zap,
        iconColor: 'text-amber-600',
        iconBg: 'bg-amber-50 dark:bg-amber-900/20',
      },
      {
        label: 'UNIQUE ACTORS',
        value: String(uniqueUsers),
        subtext: 'On this page',
        icon: Users,
        iconColor: 'text-green-600',
        iconBg: 'bg-green-50 dark:bg-green-900/20',
      },
      {
        label: 'SECURITY-TAGGED',
        value: String(securityHints),
        subtext: `${apiCalls} API calls (page)`,
        icon: ShieldAlert,
        iconColor: 'text-red-600',
        iconBg: 'bg-red-50 dark:bg-red-900/20',
      },
    ];
  }, [logs, totalCount]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i} className="border-none shadow-sm dark:bg-slate-900/50 animate-pulse">
            <CardContent className="p-6 h-28 bg-slate-100/80 dark:bg-slate-800/50 rounded-xl" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="border-none shadow-sm dark:bg-slate-900/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  {stat.label}
                </p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{stat.value}</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{stat.subtext}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
