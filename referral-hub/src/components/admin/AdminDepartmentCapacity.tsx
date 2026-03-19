"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DEPARTMENTS = [
  { name: "Orthopedics", limit: 10, pct: 80, left: 2, trend: "+5%", trendUp: true },
  { name: "Internal Medicine", limit: 20, pct: 95, left: 2, trend: "-2%", trendUp: false },
  { name: "Radiology", limit: 10, pct: 40, left: 6, trend: "+5%", trendUp: true },
];

export function AdminDepartmentCapacity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Capacity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {DEPARTMENTS.map((dept) => (
          <div key={dept.name} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{dept.name}</span>
              <span className="text-muted-foreground">Limit {dept.limit} / day</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    dept.pct >= 90 ? "bg-destructive" : dept.pct >= 70 ? "bg-primary" : "bg-chart-2"
                  }`}
                  style={{ width: `${dept.pct}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-24">{dept.left} referrals left</span>
              <span className={`text-xs ${dept.trendUp ? "text-chart-2" : "text-destructive"}`}>
                {dept.trend}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
