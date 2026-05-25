"use client";

import { use } from "react";
import { DoctorReferralWorkspace } from "@/components/referral/doctor/DoctorReferralWorkspace";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ hat?: string }>;
}

export default function AssignedReferralDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = use(params);
  const { hat } = use(searchParams);
  const accessHat =
    hat === "treating" || hat === "consulting" ? hat : undefined;

  return (
    <div className="mx-auto min-w-0 max-w-[1400px]">
      <DoctorReferralWorkspace referralId={id} accessHat={accessHat} />
    </div>
  );
}
