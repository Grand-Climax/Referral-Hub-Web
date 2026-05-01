import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle,
  TrendingUp
} from 'lucide-react';

const stats = [
  {
    label: 'TOTAL REFERRALS',
    value: '1,248',
    subtext: '+12% from last month',
    icon: FileText,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50 dark:bg-blue-900/20',
    trend: 'up',
  },
  {
    label: 'PENDING REVIEW',
    value: '42',
    subtext: '12 require urgent action',
    icon: Clock,
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-50 dark:bg-orange-900/20',
    trend: 'neutral',
  },
  {
    label: 'APPROVED/ACCEPTED',
    value: '892',
    subtext: '95% acceptance rate',
    icon: CheckCircle2,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-50 dark:bg-green-900/20',
    trend: 'up',
  },
  {
    label: 'REJECTED/CANCELLED',
    value: '64',
    subtext: '-5% from last month',
    icon: XCircle,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-50 dark:bg-red-900/20',
    trend: 'down',
  },
];

export const ReferralLogsStats = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="border-none shadow-sm dark:bg-slate-900/50 hover:shadow-md transition-shadow group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg ${stat.iconBg} transition-colors group-hover:scale-110 duration-300`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              {stat.trend === 'up' && (
                <Badge variant="secondary" className="bg-green-50 text-green-600 border-none text-[10px] font-bold">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  TRENDING
                </Badge>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase mb-1">
                {stat.label}
              </p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-1">
                {stat.value}
              </h3>
              <p className="text-xs text-slate-400">
                {stat.subtext}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
