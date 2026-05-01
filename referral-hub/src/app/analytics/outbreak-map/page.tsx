"use client";

import { DiseaseHeatmap, CriticalAlerts } from "@/components/analytics/AnalyticsDashboard";

export default function OutbreakMapPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Outbreak Map</h1>
        <p className="text-muted-foreground">Real-time disease hotspot tracking and critical outbreak alerts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 h-[600px]">
          <DiseaseHeatmap />
        </div>
        <div className="lg:col-span-4 space-y-8">
          <CriticalAlerts />
        </div>
      </div>
    </div>
  );
}
