import React from 'react';
import { StaffStats } from '@/components/hospital-admin/staff-management/StaffStats';
import { ReferralStatusHistoryCard } from '@/components/hospital-admin/ReferralStatusHistoryCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const HospitalAdminDashboard = () => {
  return (
    <div className="container mx-auto p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Hospital Admin Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Overview of hospital staff and referral operations.
          </p>
        </div>
        <Link href="/hospital-admin/staff-management">
          <Button className="bg-primary text-white">
            Manage All Staff
          </Button>
        </Link>
      </div>

      <StaffStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ReferralStatusHistoryCard />
        
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-bold text-slate-700">Quick Links</h3>
            <div className="flex flex-col gap-2">
              <Link href="/hospital-admin/staff-management">
                <Button variant="outline" className="w-full">Staff Management</Button>
              </Link>
              <Button variant="outline" className="w-full">System Activity Logs</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalAdminDashboard;