'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

type ReferralLogsHeaderProps = {
  onExportReports?: () => void;
  disabledExport?: boolean;
};

export const ReferralLogsHeader = ({ onExportReports, disabledExport }: ReferralLogsHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Referral analytics
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Rates, wait times, and distribution charts from hospital-admin reporting endpoints.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex items-center gap-2 border-slate-200 dark:border-slate-800"
          onClick={onExportReports}
          disabled={disabledExport}
        >
          <Download className="h-4 w-4" />
          Export reports JSON
        </Button>
      </div>
    </div>
  );
};
