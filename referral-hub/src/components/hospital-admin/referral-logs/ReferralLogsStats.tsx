'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import type {
  AcceptanceRejectionReport,
  AverageWaitTimeReport,
  MissedAppointmentReport,
} from '@/types/hospital-admin';
import { formatRateAsPercent } from '@/components/hospital-admin/activity-logs/auditLogDisplay';

type ReferralLogsStatsProps = {
  acceptanceRejection: AcceptanceRejectionReport | undefined;
  averageWait: AverageWaitTimeReport | undefined;
  missedAppointment: MissedAppointmentReport | undefined;
  isLoading: boolean;
};

function formatWaitLabel(v: number): string {
  if (v == null || Number.isNaN(v)) return '—';
  return `${Number(v.toFixed(2))}`;
}

export const ReferralLogsStats = ({
  acceptanceRejection,
  averageWait,
  missedAppointment,
  isLoading,
}: ReferralLogsStatsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i} className="border-none shadow-sm dark:bg-slate-900/50 animate-pulse">
            <CardContent className="p-6 h-36 bg-slate-100/80 dark:bg-slate-800/50 rounded-xl" />
          </Card>
        ))}
      </div>
    );
  }

  const acc = acceptanceRejection?.acceptance_rate ?? 0;
  const rej = acceptanceRejection?.rejection_rate ?? 0;
  const waitVal = averageWait?.average_wait_time ?? 0;
  const miss = missedAppointment?.missed_appointment_rate ?? 0;

  const stats = [
    {
      label: 'ACCEPTANCE RATE',
      value: formatRateAsPercent(acc),
      subtext: 'Accepted vs total (API)',
      icon: CheckCircle2,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-50 dark:bg-green-900/20',
      trend: 'up' as const,
    },
    {
      label: 'REJECTION RATE',
      value: formatRateAsPercent(rej),
      subtext: 'Rejected vs total (API)',
      icon: XCircle,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-50 dark:bg-red-900/20',
      trend: 'neutral' as const,
    },
    {
      label: 'AVG. WAIT TIME',
      value: formatWaitLabel(waitVal),
      subtext: 'Hospital-reported average',
      icon: Clock,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-50 dark:bg-orange-900/20',
      trend: 'neutral' as const,
    },
    {
      label: 'MISSED APPOINTMENTS',
      value: formatRateAsPercent(miss),
      subtext: 'No-show rate (API)',
      icon: FileText,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50 dark:bg-indigo-900/20',
      trend: 'neutral' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="border-none shadow-sm dark:bg-slate-900/50 hover:shadow-md transition-shadow group"
        >
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div
                className={`p-2 rounded-lg ${stat.iconBg} transition-colors group-hover:scale-110 duration-300`}
              >
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              {stat.trend === 'up' && (
                <Badge
                  variant="secondary"
                  className="bg-green-50 text-green-600 border-none text-[10px] font-bold dark:bg-green-950/40 dark:text-green-400"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  METRICS
                </Badge>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase mb-1">
                {stat.label}
              </p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-1">{stat.value}</h3>
              <p className="text-xs text-slate-400">{stat.subtext}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
