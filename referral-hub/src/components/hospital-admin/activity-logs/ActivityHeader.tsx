import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Activity } from 'lucide-react';

export const ActivityHeader = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">System Activity</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Monitor all user actions and system events across the referral hub in real-time.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" className="flex items-center gap-2 border-slate-200 dark:border-slate-800">
          <Download className="h-4 w-4" />
          Export Audit Log
        </Button>
      </div>
    </div>
  );
};
