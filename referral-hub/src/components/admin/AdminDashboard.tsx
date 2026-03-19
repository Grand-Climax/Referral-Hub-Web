"use client";

import { useState, useEffect } from "react";
import { AdminStatsCards } from "./AdminStatsCards";
import { AdminReferralChart } from "./AdminReferralChart";
import { AdminSystemAlerts } from "./AdminSystemAlerts";
import { AdminUserManagement, type StaffMember } from "./AdminUserManagement";
import { AdminDepartmentCapacity } from "./AdminDepartmentCapacity";
import { AdminControls } from "./AdminControls";
import { AdminAuditTrail } from "./AdminAuditTrail";

const INITIAL_STAFF: StaffMember[] = [
  { id: "1", initials: "AT", name: "Dr. Frew Thomas", role: "Referring Doctor", isActive: true },
  { id: "2", initials: "KM", name: "Kebede Mulat", role: "Liaison Officer", isActive: true },
  { id: "3", initials: "TM", name: "Tigist Mekonnen", role: "Hospital Admin", isActive: true },
];

export function AdminDashboard() {
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);

  const updateStaffRole = (id: string, role: StaffMember["role"]) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, role } : s)));
  };

  const toggleStaffActive = (id: string) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s)));
  };

  const handleResetMFA = (name: string) => {
    alert(`MFA reset initiated for ${name}. User will need to re-enroll on next login.`);
  };

  const activeStaffCount = staff.filter((s) => s.isActive).length;

  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Hospital Administration and Access Control</h2>
        <p className="text-muted-foreground">
          Manage user accounts, roles, facility-wide capacity, and view audit trail for your hospital (UC-HA1)
        </p>
      </div>

      <AdminStatsCards activeStaffCount={activeStaffCount} totalStaff={staff.length} />
      <AdminReferralChart />
      <AdminSystemAlerts />
      <section id="user-management" className="scroll-mt-6">
        <AdminUserManagement
          staff={staff}
          onRoleChange={updateStaffRole}
          onToggleActive={toggleStaffActive}
          onResetMFA={handleResetMFA}
        />
      </section>
      <section id="department-capacity" className="scroll-mt-6">
        <AdminDepartmentCapacity />
      </section>
      <section id="administrative-controls" className="scroll-mt-6">
        <AdminControls />
      </section>
      <section id="audit-trail" className="scroll-mt-6">
        <AdminAuditTrail />
      </section>
    </div>
  );
}
