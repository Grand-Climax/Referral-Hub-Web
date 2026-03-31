"use client"

import { useParams } from "next/navigation";
import { ReferralDetailView } from "@/components/liaison/ReferralDetailView";
import { MOCK_REFERRALS } from "@/data/mock";

export default function LiaisonReferralDetailPage() {
  const params = useParams();
  const id = params.id as string;

  // Use mock data for testing layout
  const referral = MOCK_REFERRALS.find((r) => r.id === id) || MOCK_REFERRALS[0];

  return (
    <ReferralDetailView referral={referral} />
  );
}
