import TriageDetailPage from '@/components/department-head/triage/TriageDetailPage';

export const metadata = {
  title: 'Triage Detail – Department Head',
};

interface Props {
  params: Promise<{ referralId: string }>;
}

export default async function TriageDetailRoute({ params }: Props) {
  const { referralId } = await params;
  return <TriageDetailPage referralId={referralId} />;
}
