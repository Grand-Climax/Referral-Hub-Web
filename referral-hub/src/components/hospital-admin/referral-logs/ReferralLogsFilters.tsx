'use client';

import React from 'react';
import { Info } from 'lucide-react';

export const ReferralLogsFilters = () => {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 px-4 py-3 mb-6 text-sm text-slate-600 dark:text-slate-400">
      <Info className="h-5 w-5 shrink-0 text-primary mt-0.5" aria-hidden />
      <p>
        All metrics on this page are loaded live from{' '}
        <span className="font-medium text-slate-800 dark:text-slate-200">hospital-admin reports</span>{' '}
        APIs. Use your browser export for offline snapshots; filters below apply only to the summary
        tables.
      </p>
    </div>
  );
};
