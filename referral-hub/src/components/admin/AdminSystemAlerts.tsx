"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const ALERTS = [
  {
    dot: "bg-primary",
    title: "MFA Reset Completed",
    detail: "Dr. Winston Tsui has reset multi-factor authentication.",
    time: "2 min ago",
  },
  {
    dot: "bg-orange-500",
    title: "New Referral Received",
    detail: "Urgent Care: Orthopedics | Steven Zweldu Hospital",
    time: "3 min ago",
  },
  {
    dot: "bg-muted-foreground",
    title: "Data Export Triggered",
    detail: "Admin Tigist M. exported Monthly Audit Report",
    time: "1 hour ago",
  },
  {
    dot: "bg-destructive",
    title: "Dept. Capacity Limit",
    detail: "Internal Medicine at 95% capacity.",
    time: "2 hours ago",
  },
];

export function AdminSystemAlerts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          System Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {ALERTS.map((alert) => (
          <div key={alert.title} className="flex gap-3 items-start">
            <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${alert.dot}`} />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{alert.title}</p>
              <p className="text-xs text-muted-foreground">{alert.detail}</p>
            </div>
            <span className="text-xs text-muted-foreground shrink-0">{alert.time}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
