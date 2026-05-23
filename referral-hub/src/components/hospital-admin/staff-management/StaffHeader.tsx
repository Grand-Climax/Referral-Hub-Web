import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Download, Monitor, UserPlus } from 'lucide-react';
import { CreateStaffModal } from './CreateStaffModal';

export const StaffHeader = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Staff Management</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Manage hospital personnel, roles, and access permissions across departments.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/hospital-admin/staff-sessions">
          <Button variant="outline" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Active sessions
          </Button>
        </Link>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Directory
        </Button>
        <Button 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border-none"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <UserPlus className="h-4 w-4" />
          Add New User
        </Button>
      </div>
      <CreateStaffModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
    </div>
  );
};
