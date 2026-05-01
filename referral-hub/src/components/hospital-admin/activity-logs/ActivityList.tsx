import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { mockActivityLogs, ActivityLog } from './activityMockData';
import { formatDistanceToNow } from 'date-fns';

const getStatusIcon = (status: ActivityLog['status']) => {
  switch (status) {
    case 'success':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'failure':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'warning':
      return <AlertCircle className="h-4 w-4 text-orange-500" />;
    default:
      return null;
  }
};

const getCategoryColor = (category: ActivityLog['category']) => {
  switch (category) {
    case 'referral':
      return 'bg-blue-50 text-blue-600 border-blue-100';
    case 'staff':
      return 'bg-purple-50 text-purple-600 border-purple-100';
    case 'security':
      return 'bg-red-50 text-red-600 border-red-100';
    case 'system':
      return 'bg-slate-50 text-slate-600 border-slate-100';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-100';
  }
};

export const ActivityList = () => {
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="divide-y divide-slate-50 dark:divide-slate-900">
          {mockActivityLogs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors flex items-start gap-4">
              <div className="pt-1">
                <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-800">
                  <AvatarImage src={log.user.avatar} alt={log.user.name} />
                  <AvatarFallback className="bg-slate-100 text-slate-600 font-semibold text-xs">
                    {log.user.initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-50">{log.user.name}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{log.user.role}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {log.action} <span className="font-medium text-slate-900 dark:text-slate-100">{log.target}</span>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={`${getCategoryColor(log.category)} py-0 px-2 text-[10px] font-bold rounded-md uppercase tracking-wide border`}>
                    {log.category}
                  </Badge>
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-800">
                    {getStatusIcon(log.status)}
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {log.status}
                    </span>
                  </div>
                </div>
              </div>

              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between py-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          SHOWING 1-7 OF 342 ACTIVITIES
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-slate-200 dark:border-slate-800">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1 mx-2">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:border-blue-500">1</Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500">2</Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500">3</Button>
            <span className="text-slate-300 mx-1">...</span>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500">49</Button>
          </div>
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-slate-200 dark:border-slate-800">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
