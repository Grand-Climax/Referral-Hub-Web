"use client";

import { RegionalWorkload, PerformanceMatrix } from "@/components/analytics/AnalyticsDashboard";
import type { MohQueryParams } from "@/types/moh-analytics";

export default function RegionalPage() {
  const getDateRange = () => {
    const to = new Date().toISOString().split('T')[0];
    const from = new Date();
    from.setDate(from.getDate() - 30);
    return { from: from.toISOString().split('T')[0], to };
  };

  const { from, to } = getDateRange();
  const queryParams: MohQueryParams = { from, to };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Regional Analytics</h1>
        <p className="text-muted-foreground">Deep dive into regional healthcare performance and capacity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <RegionalWorkload queryParams={queryParams} />
        </div>
        <div className="md:col-span-2">
          <PerformanceMatrix queryParams={queryParams} />
        </div>
      </div>
    </div>
  );
}
