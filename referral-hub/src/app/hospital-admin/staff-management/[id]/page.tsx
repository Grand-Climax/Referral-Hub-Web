import React from "react";
import { StaffDetailProfile } from "@/components/hospital-admin/staff-management/StaffDetailProfile";

export default async function StaffDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="p-8 min-h-screen bg-slate-50/50">
      <StaffDetailProfile staffId={id} />
    </div>
  );
}
