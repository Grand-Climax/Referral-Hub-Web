"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, Shield, FileText } from "lucide-react";

interface AdminStatsCardsProps {
  activeStaffCount: number;
  totalStaff: number;
}

export function AdminStatsCards({ activeStaffCount, totalStaff }: AdminStatsCardsProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Active Staff (Own Hospital)</p>
            <p className="text-3xl font-bold mt-1">{activeStaffCount}</p>
            <p className="text-xs text-muted-foreground mt-2">{totalStaff} total accounts</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg">
            <Users className="h-6 w-6 text-primary" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">System Status</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl font-bold">Online</span>
              <span className="h-2 w-2 rounded-full bg-chart-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Updated 5M ago</p>
          </div>
          <div className="p-3 bg-chart-2/10 rounded-lg">
            <Shield className="h-6 w-6 text-chart-2" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Pending Referrals</p>
            <p className="text-3xl font-bold mt-1">18</p>
            <p className="text-xs text-orange-600 mt-2">4 urgent cases already</p>
          </div>
          <div className="p-3 bg-orange-500/10 rounded-lg">
            <FileText className="h-6 w-6 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
