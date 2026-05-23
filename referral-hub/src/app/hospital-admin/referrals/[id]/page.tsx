import { HospitalAdminReferralDetail } from "@/components/hospital-admin/referrals/HospitalAdminReferralDetail";

export default async function HospitalAdminReferralDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <HospitalAdminReferralDetail referralId={id} />;
}
