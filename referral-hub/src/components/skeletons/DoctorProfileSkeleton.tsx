"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function DoctorProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Profile card skeleton */}
      <div className="rounded-3xl border bg-card/60 backdrop-blur-xl shadow-sm p-8 space-y-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-6">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3.5 w-28" />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 border-t border-border/50 pt-6 sm:flex-row sm:gap-8">
          <div className="flex flex-1 items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <div className="flex flex-1 items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* Account settings card skeleton */}
      <div className="rounded-3xl border bg-card/60 backdrop-blur-xl shadow-sm overflow-hidden">
        <div className="border-b border-border/50 bg-muted/20 px-8 py-5">
          <Skeleton className="h-4 w-36" />
        </div>
        {[0, 1].map((i) => (
          <div key={i} className="flex items-center justify-between px-8 py-5 border-b border-border/50 last:border-0">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-64" />
              </div>
            </div>
            <Skeleton className="h-3.5 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}
