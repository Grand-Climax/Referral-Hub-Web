'use client';

import React from 'react';
import { ReferralLogsHeader } from './ReferralLogsHeader';
import { ReferralLogsStats } from './ReferralLogsStats';
import { ReferralLogsFilters } from './ReferralLogsFilters';
import { ReferralLogsTable } from './ReferralLogsTable';

export const ReferralLogsContainer = () => {
  return (
    <div className="mx-auto min-h-screen bg-slate-50/30 dark:bg-transparent">
      <ReferralLogsHeader />
      <ReferralLogsStats />
      <ReferralLogsFilters />
      <ReferralLogsTable />
    </div>
  );
};
