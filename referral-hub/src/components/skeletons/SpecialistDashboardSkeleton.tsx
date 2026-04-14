"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function SpecialistDashboardSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-350 mx-auto">
      {/* Header and top stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-6 mt-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border bg-card shadow-sm">
            <CardContent className="p-4 flex flex-col justify-between h-24">
              <Skeleton className="h-3 w-20" />
              <div className="flex items-end justify-between">
                <Skeleton className="h-7 w-12" />
                <Skeleton className="h-4 w-10" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Area — Mocking the ReferralTable layout */}
      <Card className="border bg-card shadow-sm overflow-hidden min-h-[500px]">
        <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-5">
           <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
           </div>
           <div className="flex gap-2">
              <Skeleton className="h-9 w-64" />
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
           </div>
        </CardHeader>
        <CardContent className="p-0">
           <div className="divide-y divide-border/40">
              {[...Array(8)].map((_, i) => (
                 <div key={i} className="px-6 py-4 flex items-center justify-between gap-4">
                    <Skeleton className="h-4 w-[60px]" />
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-6 w-[80px] rounded-full" />
                    <Skeleton className="h-5 w-5 rounded-md" />
                 </div>
              ))}
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
