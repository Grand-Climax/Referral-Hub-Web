import { SpecialistTriageDetailPage } from "@/components/receiving-specialist/triage/SpecialistTriageDetailPage";

interface Props {
  params: Promise<{ referralId: string }>;
}

export default async function TriageDetailRoute({ params }: Props) {
  const { referralId } = await params;
  return <SpecialistTriageDetailPage referralId={referralId} />;
}
