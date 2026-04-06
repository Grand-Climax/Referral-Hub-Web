"use client";

import { Button } from "@/components/ui/button";
import { Download, Calendar } from "lucide-react";

export function AnalyticsDashboard() {
  const metrics = {
    totalReferrals: 156,
    completed: 142,
    successRate: 89,
    avgDaysToSchedule: 3.2,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Period: January 2026 - February 2026
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-6">
          <div className="text-3xl font-bold text-primary">
            {metrics.totalReferrals}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Total Referrals
          </div>
          <div className="text-xs text-chart-2 mt-2">+12%</div>
        </div>
        <div className="bg-card border rounded-lg p-6">
          <div className="text-3xl font-bold text-primary">
            {metrics.completed}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Completed</div>
          <div className="text-xs text-chart-2 mt-2">+8%</div>
        </div>
        <div className="bg-card border rounded-lg p-6">
          <div className="text-3xl font-bold text-primary">
            {metrics.successRate}%
          </div>
          <div className="text-sm text-muted-foreground mt-1">Success Rate</div>
          <div className="text-xs text-chart-2 mt-2">+2%</div>
        </div>
        <div className="bg-card border rounded-lg p-6">
          <div className="text-3xl font-bold text-primary">
            {metrics.avgDaysToSchedule}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Avg Days to Schedule
          </div>
          <div className="text-xs text-destructive mt-2">-0.5</div>
        </div>
      </section>

      {/* Charts Placeholder */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Referrals Over Time</h3>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Chart placeholder
          </div>
        </div>
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Referrals by Type</h3>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Chart placeholder
          </div>
        </div>
      </section>

      {/* Performance Table */}
      <section className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">
          Performance by Liaison
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Active</th>
                <th className="text-left p-2">Completed</th>
                <th className="text-left p-2">Avg Days</th>
                <th className="text-left p-2">Success</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2">Sarah Johnson</td>
                <td className="p-2">12</td>
                <td className="p-2">45</td>
                <td className="p-2">2.8</td>
                <td className="p-2">92%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Urgency Distribution */}
      <section className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Urgency Distribution</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="text-destructive">🔴</span> Emergency
            </span>
            <span>15 (10%)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="text-yellow-500">🟡</span> Urgent
            </span>
            <span>45 (29%)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="text-chart-2">🟢</span> Routine
            </span>
            <span>96 (61%)</span>
          </div>
        </div>
      </section>
    </div>
  );
}
