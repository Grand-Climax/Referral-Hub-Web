'use client';

import React from 'react';
import { ActivityHeader } from './ActivityHeader';
import { ActivityStats } from './ActivityStats';
import { ActivityFilters } from './ActivityFilters';
import { ActivityList } from './ActivityList';

export const ActivityContainer = () => {
  return (
    <div className="mx-auto min-h-screen bg-slate-50/30 dark:bg-transparent">
      <ActivityHeader />
      <ActivityStats />
      <ActivityFilters />
      <ActivityList />
    </div>
  );
};
