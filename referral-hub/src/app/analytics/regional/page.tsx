"use client";

import { RegionalWorkload, PerformanceMatrix } from "@/components/analytics/AnalyticsDashboard";

export default function RegionalPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Regional Analytics</h1>
        <p className="text-muted-foreground">Deep dive into regional healthcare performance and capacity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <RegionalWorkload />
        </div>
        <div className="md:col-span-2">
          <PerformanceMatrix />
        </div>
      </div>
    </div>
  );
}
