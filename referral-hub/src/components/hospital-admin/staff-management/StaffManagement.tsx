'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
import { useGetDepartmentsQuery } from '@/features/department/department';
import { toast } from 'sonner';
import { EditStaffRoleModal } from './EditStaffRoleModal';
import { ReplaceStaffModal } from './ReplaceStaffModal';
import {
  HospitalAdminStaff,
  HOSPITAL_STAFF_ROLE_OPTIONS,
  HOSPITAL_STAFF_ROLE_LABELS,
} from '@/types/hospital-admin';

const PAGE_SIZE = 12;

export const StaffManagement = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [page, setPage] = useState(1);
  const [deptId, setDeptId] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [deptId, roleFilter, statusFilter, debouncedSearch]);

  const { data: departments = [] } = useGetDepartmentsQuery();
  const departmentNameById = useMemo(() => {
    const m: Record<string, string> = {};
    for (const d of departments) m[d.id] = d.name;
    return m;
  }, [departments]);

  const searchLooksLikeEmail = debouncedSearch.includes('@');
  const staffQueryArgs = useMemo(
    () => ({
      page,
      page_size: PAGE_SIZE,
      ...(deptId !== 'all' ? { dept_id: deptId } : {}),
      ...(roleFilter !== 'all' ? { role: roleFilter } : {}),
      ...(statusFilter === 'active' ? { is_active: true as const } : {}),
      ...(statusFilter === 'inactive' ? { is_active: false as const } : {}),
      ...(debouncedSearch
        ? searchLooksLikeEmail
          ? { email: debouncedSearch }
          : { name: debouncedSearch }
        : {}),
    }),
    [page, deptId, roleFilter, statusFilter, debouncedSearch, searchLooksLikeEmail],
  );

  const { data, isLoading } = useGetStaffQuery(staffQueryArgs);
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
  const totalItems = data?.total ?? 0;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE) || 1;

  return (
    <div className="mx-auto min-h-screen bg-slate-50/30 dark:bg-transparent">
      <StaffHeader />
      <StaffStats />

      {/* Filters & View Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={deptId} onValueChange={setDeptId}>
            <SelectTrigger className="w-[200px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg">
              <SelectValue placeholder="All departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[190px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {HOSPITAL_STAFF_ROLE_OPTIONS.map((role) => (
                <SelectItem key={role} value={role}>
                  {HOSPITAL_STAFF_ROLE_LABELS[role]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as 'all' | 'active' | 'inactive')}
          >
            <SelectTrigger className="w-[150px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or email..."
              className="pl-9 w-[260px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg"
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
            departmentNameById={departmentNameById}
            onEditRole={(staff) => { setSelectedStaff(staff); setIsEditRoleModalOpen(true); }}
            onReplace={(staff) => { setSelectedStaff(staff); setIsReplaceModalOpen(true); }}
            onDelete={handleDelete}
          />
        ) : (
          <StaffGrid 
            staffList={staffList} 
            isLoading={isLoading}
            departmentNameById={departmentNameById}
            onEditRole={(staff) => { setSelectedStaff(staff); setIsEditRoleModalOpen(true); }}
            onReplace={(staff) => { setSelectedStaff(staff); setIsReplaceModalOpen(true); }}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-auto py-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          SHOWING {totalItems > 0 ? (page - 1) * PAGE_SIZE + 1 : 0}-{Math.min(page * PAGE_SIZE, totalItems)} OF {totalItems}
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
