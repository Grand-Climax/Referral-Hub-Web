import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const stats = [
  {
    label: 'TOTAL PERSONNEL',
    value: '1,248',
    subtext: '+12 this month',
    subtextColor: 'text-green-500',
    badge: 'ALL',
    badgeColor: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  },
  {
    label: 'ACTIVE DUTY',
    value: '892',
    subtext: 'Current shift load: 72%',
    subtextColor: 'text-slate-500',
    badge: 'ONLINE',
    badgeColor: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  },
  {
    label: 'ON LEAVE',
    value: '46',
    subtext: 'Scheduled returns next 48h',
    subtextColor: 'text-slate-500',
    badge: 'AWAY',
    badgeColor: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  },
  {
    label: 'ACCESS REQUESTS',
    value: '14',
    subtext: 'Requires immediate review',
    subtextColor: 'text-slate-500',
    badge: 'PENDING',
    badgeColor: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  },
];

export const StaffStats = () => {
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
