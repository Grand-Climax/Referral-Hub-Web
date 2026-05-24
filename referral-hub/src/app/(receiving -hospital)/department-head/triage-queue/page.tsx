import { Suspense } from 'react';
import TriageQueuePage from '@/components/department-head/triage/TriageQueuePage';

export const metadata = {
  title: 'Triage Queue – Department Head',
  description: 'Prioritized list of patients waiting for scheduling.',
};

// `TriageQueuePage` uses `useSearchParams()` to keep filter state in the
// URL. Next.js requires that hook to live inside a Suspense boundary so
// the page can be statically prerendered without bailing the whole route
// out to client-side rendering.
export default function TriageQueueRoute() {
  return (
    <Suspense fallback={null}>
      <TriageQueuePage />
    </Suspense>
  );
}
