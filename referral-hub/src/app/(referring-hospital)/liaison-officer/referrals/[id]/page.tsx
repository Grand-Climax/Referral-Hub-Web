'use client'
import { useParams } from "next/navigation";
import { ReferralDetailView } from "@/components/liaison/ReferralDetailView";

const LiaisonReferralDetailPage = () => {
  const params = useParams();
  const id = params.id as string;

  return (
    <ReferralDetailView referral_id={id} />
  );
}

export default LiaisonReferralDetailPage; 