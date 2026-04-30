import React from "react";
import { StaffDetailProfile } from "@/components/hospital-admin/staff-management/StaffDetailProfile";

export default function StaffDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8 min-h-screen bg-slate-50/50">
      <StaffDetailProfile staffId={params.id} />
    </div>
  );
}
