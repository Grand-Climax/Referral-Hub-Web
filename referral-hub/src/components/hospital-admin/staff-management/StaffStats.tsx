'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGetPersonnelWidgetQuery } from '@/features/hospitalAdmin/hospitalAdminApi';
import { Loader2 } from 'lucide-react';

export const StaffStats = () => {
  const { data, isLoading, isError } = useGetPersonnelWidgetQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8 mb-8">
        <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
      </div>
    );
  }

  const totalStaff = data?.total_personnel ?? 0;
  const activeStaff = data?.active_duty ?? 0;
  const inactiveStaff = data?.inactive ?? 0;
  const pendingApprovals = data?.access_requests ?? 0;

  const stats = [
    {
      label: 'TOTAL PERSONNEL',
      value: totalStaff.toString(),
      subtext: 'Registered system users',
      subtextColor: 'text-slate-500',
      badge: 'ALL',
      badgeColor: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
      label: 'ACTIVE DUTY',
      value: activeStaff.toString(),
      subtext: 'Currently active accounts',
      subtextColor: 'text-slate-500',
      badge: 'ONLINE',
      badgeColor: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    },
    {
      label: 'INACTIVE',
      value: inactiveStaff.toString(),
      subtext: 'Disabled or on leave',
      subtextColor: 'text-slate-500',
      badge: 'AWAY',
      badgeColor: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    },
    {
      label: 'ACCESS REQUESTS',
      value: pendingApprovals.toString(),
      subtext: isError ? 'Could not load latest count' : 'Requires immediate review',
      subtextColor: isError ? 'text-destructive' : 'text-slate-500',
      badge: 'PENDING',
      badgeColor: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="border-none shadow-sm dark:bg-slate-900/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
                {stat.label}
              </p>
              <Badge variant="secondary" className={`${stat.badgeColor} border-none font-bold text-[10px]`}>
                {stat.badge}
              </Badge>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-1">
              {stat.value}
            </h3>
            <p className={`text-xs ${stat.subtextColor}`}>
              {stat.subtext}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
