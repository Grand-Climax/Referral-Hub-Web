'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

type ActivityHeaderProps = {
  onExportJson?: () => void;
  disabledExport?: boolean;
};

export const ActivityHeader = ({ onExportJson, disabledExport }: ActivityHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Audit log
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Hospital-wide audit trail from the API: user actions, resources, and request metadata.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex items-center gap-2 border-slate-200 dark:border-slate-800"
          onClick={onExportJson}
          disabled={disabledExport}
        >
          <Download className="h-4 w-4" />
          Export JSON
        </Button>
      </div>
    </div>
  );
};
