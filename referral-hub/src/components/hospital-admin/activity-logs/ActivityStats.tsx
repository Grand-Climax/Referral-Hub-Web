import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Activity, 
  ShieldAlert, 
  UserPlus, 
  FileCheck2,
  TrendingUp
} from 'lucide-react';

const stats = [
  {
    label: 'TOTAL ACTIVITIES',
    value: '342',
    subtext: 'Last 24 hours',
    icon: Activity,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    label: 'SECURITY ALERTS',
    value: '5',
    subtext: 'Requires attention',
    icon: ShieldAlert,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-50 dark:bg-red-900/20',
  },
  {
    label: 'NEW USERS',
    value: '12',
    subtext: 'Joined this week',
    icon: UserPlus,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-50 dark:bg-green-900/20',
  },
  {
    label: 'REFERRALS PROCESSED',
    value: '86',
    subtext: 'Last 7 days',
    icon: FileCheck2,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-50 dark:bg-indigo-900/20',
  },
];

export const ActivityStats = () => {
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
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                    {stat.value}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {stat.subtext}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
