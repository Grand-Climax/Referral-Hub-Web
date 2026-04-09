import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';

export const ReferralLogsHeader = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Referral Logs</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Track and monitor all outgoing and incoming patient referrals.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" className="flex items-center gap-2 border-slate-200 dark:border-slate-800">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
        <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border-none shadow-md shadow-blue-500/20">
          <FileText className="h-4 w-4" />
          Generate Report
        </Button>
      </div>
    </div>
  );
};
