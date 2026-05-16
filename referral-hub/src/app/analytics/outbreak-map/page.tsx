"use client";

import { useState } from "react";
import { DiseaseHeatmap } from "@/components/analytics/AnalyticsDashboard";
import type { MohQueryParams } from "@/types/moh-analytics";

export default function OutbreakMapPage() {
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
        <h1 className="text-2xl font-bold tracking-tight">Outbreak Map</h1>
        <p className="text-muted-foreground">Real-time disease hotspot tracking and critical outbreak alerts.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="h-[600px]">
          <DiseaseHeatmap queryParams={queryParams} />
        </div>
      </div>
    </div>
  );
}
