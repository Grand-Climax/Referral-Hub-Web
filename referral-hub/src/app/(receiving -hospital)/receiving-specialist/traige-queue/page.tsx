import { Suspense } from "react";
import { TriageQueue } from "@/components/receiving-specialist/triage-queue";
import { Skeleton } from "@/components/ui/skeleton";

// Wrapping in Suspense is required because <TriageQueue> uses
// `useSearchParams()` for URL-synced filter state. Without this boundary
// Next would CSR-bailout the whole `/receiving-specialist` dashboard layout.
export default function TriageQueuePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1400px] mx-auto space-y-4 pb-8">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      }
    >
      <TriageQueue />
    </Suspense>
  );
}
