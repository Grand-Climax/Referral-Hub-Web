import React from 'react';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';

export const metadata = {
  title: 'National Healthcare Analytics | Referral Hub',
  description: 'Overview of national healthcare trends, regional performance, and critical alerts.',
};

const AnalyticsPage = () => {
  return (
    <div className="flex-1 overflow-y-auto">
      <AnalyticsDashboard />
    </div>
  );
};

export default AnalyticsPage;