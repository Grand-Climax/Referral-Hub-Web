import TriageQueuePage from '@/components/department-head/triage/TriageQueuePage';

export const metadata = {
  title: 'Triage Queue – Department Head',
  description: 'Prioritized list of patients waiting for scheduling.',
};

export default function TriageQueueRoute() {
  return <TriageQueuePage />;
}
