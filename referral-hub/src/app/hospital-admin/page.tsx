import React from 'react';
import { StaffStats } from '@/components/hospital-admin/staff-management/StaffStats';
import { HospitalAdminDashboardRecents } from '@/components/hospital-admin/HospitalAdminDashboardRecents';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const HospitalAdminDashboard = () => {
  return (
    <div className="container mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Hospital Admin Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Overview of hospital staff and referral operations.
          </p>
        </div>
        <Link href="/hospital-admin/staff-management">
          <Button className="bg-primary text-white">Manage All Staff</Button>
        </Link>
      </div>

      <StaffStats />

      <HospitalAdminDashboardRecents />
    </div>
  );
};

export default HospitalAdminDashboard;