'use client';

import React, { useState } from 'react';
import { StaffHeader } from './StaffHeader';
import { StaffStats } from './StaffStats';
import { StaffList } from './StaffList';
import { StaffGrid } from './StaffGrid';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  LayoutGrid, 
  List, 
  Search, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

import { useGetStaffQuery, useDeleteStaffMutation } from '@/features/hospitalAdmin/hospitalAdminApi';
import { toast } from 'sonner';
import { EditStaffRoleModal } from './EditStaffRoleModal';
import { ReplaceStaffModal } from './ReplaceStaffModal';
import { HospitalAdminStaff } from '@/types/hospital-admin';

export const StaffManagement = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data, isLoading } = useGetStaffQuery({ page, limit });
  const [deleteStaff] = useDeleteStaffMutation();

  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<HospitalAdminStaff | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this staff member?")) {
      try {
        await deleteStaff(id).unwrap();
        toast.success("Staff deleted successfully");
      } catch (err) {
        toast.error("Failed to delete staff");
      }
    }
  };

  const staffList = data?.data || [];
  const totalItems = data?.total || 0;
  const totalPages = Math.ceil(totalItems / limit) || 1;

  return (
    <div className="mx-auto min-h-screen bg-slate-50/30 dark:bg-transparent">
      <StaffHeader />
      <StaffStats />

      {/* Filters & View Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <Select defaultValue="all-departments">
            <SelectTrigger className="w-[180px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-departments">All Departments</SelectItem>
              <SelectItem value="cardiology">Cardiology</SelectItem>
              <SelectItem value="neurology">Neurology</SelectItem>
              <SelectItem value="pediatrics">Pediatrics</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all-roles">
            <SelectTrigger className="w-[150px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-roles">All Roles</SelectItem>
              <SelectItem value="specialist">Specialist</SelectItem>
              <SelectItem value="doctor">Doctor</SelectItem>
              <SelectItem value="admin">Admin Staff</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search personnel..." 
              className="pl-9 w-[240px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-100 dark:border-slate-800">
          <Button 
            variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
            size="sm" 
            className={`h-8 px-3 gap-2 ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
            List
          </Button>
          <Button 
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
            size="sm" 
            className={`h-8 px-3 gap-2 ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
            Grid
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="mb-8">
        {viewMode === 'list' ? (
          <StaffList 
            staffList={staffList} 
            isLoading={isLoading} 
            onEditRole={(staff) => { setSelectedStaff(staff); setIsEditRoleModalOpen(true); }}
            onReplace={(staff) => { setSelectedStaff(staff); setIsReplaceModalOpen(true); }}
            onDelete={handleDelete}
          />
        ) : (
          <StaffGrid 
            staffList={staffList} 
            isLoading={isLoading} 
            onEditRole={(staff) => { setSelectedStaff(staff); setIsEditRoleModalOpen(true); }}
            onReplace={(staff) => { setSelectedStaff(staff); setIsReplaceModalOpen(true); }}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-auto py-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          SHOWING {totalItems > 0 ? (page - 1) * limit + 1 : 0}-{Math.min(page * limit, totalItems)} OF {totalItems}
        </p>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 rounded-lg border-slate-200 dark:border-slate-800"
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1 mx-2">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:border-blue-500">
              {page}
            </Button>
            <span className="text-slate-300 mx-1">of</span>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 pointer-events-none">
              {totalPages}
            </Button>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 rounded-lg border-slate-200 dark:border-slate-800"
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <EditStaffRoleModal open={isEditRoleModalOpen} onOpenChange={setIsEditRoleModalOpen} staff={selectedStaff} />
      <ReplaceStaffModal open={isReplaceModalOpen} onOpenChange={setIsReplaceModalOpen} staff={selectedStaff} />
    </div>
  );
};
