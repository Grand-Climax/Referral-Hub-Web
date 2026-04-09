"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ReferralHistorySkeleton() {
  return (
    <div className="container mx-auto py-6 animate-in fade-in duration-500 space-y-6">
      {/* Header Area */}
      <div className="space-y-2 mb-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-[400px]" />
      </div>

      {/* Main Content Area — Mocking the ReferralTable layout */}
      <Card className="border bg-card shadow-sm overflow-hidden h-[calc(100vh-200px)]">
        <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
           <div className="flex gap-2">
              <Skeleton className="h-9 w-64 rounded-md" />
           </div>
           <div className="flex gap-2">
              <Skeleton className="h-9 w-24 rounded-md" />
           </div>
        </CardHeader>
        <CardContent className="p-0">
           <div className="divide-y divide-border/40">
              {[...Array(10)].map((_, i) => (
                 <div key={i} className="px-6 py-4 flex items-center justify-between gap-4">
                    <Skeleton className="h-4 w-[60px]" />
                    <Skeleton className="h-4 w-[240px]" />
                    <Skeleton className="h-4 w-[180px]" />
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-6 w-[80px] rounded-full" />
                    <Skeleton className="h-5 w-24 rounded-md opacity-30" />
                 </div>
              ))}
           </div>
        </CardContent>
        {/* Pagination Footer Mockup */}
        <div className="p-4 border-t flex items-center justify-between bg-muted/20">
           <Skeleton className="h-4 w-[120px]" />
           <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
           </div>
           <div className="h-4 w-[120px]" />
        </div>
      </Card>
    </div>
  );
}
