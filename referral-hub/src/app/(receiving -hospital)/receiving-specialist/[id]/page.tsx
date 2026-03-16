import ReferralDetail from "@/components/receiving-specialist/referral-detail";

const ReferralDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  return (
    <ReferralDetail referralId={id} />
  );
}

export default ReferralDetailPage;
