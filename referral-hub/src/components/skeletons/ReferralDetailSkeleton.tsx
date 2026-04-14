"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ReferralDetailSkeleton() {
  return (
    <div className="mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header Area */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-4">
          <Skeleton className="h-4 w-48" />
          <div className="flex flex-col gap-3">
             <Skeleton className="h-10 w-80" />
             <div className="flex gap-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
             </div>
          </div>
        </div>
        <div className="flex gap-3">
           <Skeleton className="h-10 w-24" />
           <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column — Patient & Clinical Info */}
        <div className="xl:col-span-2 space-y-6">
           <Card className="border bg-card shadow-sm">
              <CardHeader className="border-b px-6 py-4">
                 <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                       <div key={i} className="space-y-2">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-5 w-28" />
                       </div>
                    ))}
                 </div>
                 <div className="space-y-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-20 w-full" />
                 </div>
              </CardContent>
           </Card>

           <Card className="border bg-card shadow-sm">
             <CardHeader className="border-b px-6 py-4">
               <Skeleton className="h-6 w-48" />
             </CardHeader>
             <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {[...Array(4)].map((_, i) => (
                      <div key={i} className="p-4 rounded-xl bg-muted/30 space-y-2 flex flex-col items-center">
                         <Skeleton className="h-4 w-20" />
                         <Skeleton className="h-6 w-16" />
                      </div>
                   ))}
                </div>
             </CardContent>
           </Card>
        </div>

        {/* Right Column — Decisions card */}
        <div className="space-y-6">
           <Card className="border bg-card shadow-sm">
              <CardHeader className="border-b px-6 py-4">
                 <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                 <Skeleton className="h-10 w-full rounded-md" />
                 <Skeleton className="h-11 w-full rounded-md" />
                 <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                 </div>
                 <Skeleton className="h-20 w-full rounded-md" />
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
