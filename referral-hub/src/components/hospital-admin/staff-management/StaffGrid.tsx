import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, MoreHorizontal, Loader2, UserX, RefreshCw } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  HospitalAdminStaff,
  formatHospitalStaffRole,
  hospitalStaffRoleBadgeClass,
} from '@/types/hospital-admin';
import { useRouter } from 'next/navigation';

interface StaffGridProps {
  staffList: HospitalAdminStaff[];
  isLoading: boolean;
  departmentNameById?: Record<string, string>;
  onEditRole: (staff: HospitalAdminStaff) => void;
  onReplace: (staff: HospitalAdminStaff) => void;
  onDelete: (id: string) => void;
}

export const StaffGrid = ({
  staffList,
  isLoading,
  departmentNameById,
  onEditRole,
  onReplace,
  onDelete,
}: StaffGridProps) => {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
      </div>
    );
  }

  if (staffList.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        No staff found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {staffList.map((staff) => {
        const initials = `${staff.first_name?.[0] || ''}${staff.last_name?.[0] || ''}`.toUpperCase();
        const fullName = [staff.first_name, staff.middle_name, staff.last_name].filter(Boolean).join(' ');
        const deptLabel = staff.department_id
          ? departmentNameById?.[staff.department_id] ?? staff.department_id
          : '—';
        
        return (
          <Card 
            key={staff.id} 
            className="border-none shadow-sm dark:bg-slate-900/50 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push(`/hospital-admin/staff-management/${staff.id}`)}
          >
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <Avatar className="h-14 w-14 border-2 border-slate-100 dark:border-slate-800">
                <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditRole(staff)}>
                      <Edit2 className="h-4 w-4 mr-2" /> Change Role
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onReplace(staff)}>
                      <RefreshCw className="h-4 w-4 mr-2" /> Replace
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(staff.id)} className="text-red-600">
                      <UserX className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-bold text-slate-900 dark:text-slate-50 text-lg leading-tight mb-0.5 truncate">{fullName}</h4>
              <p className="text-xs text-slate-400 truncate">{staff.email}</p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <Badge variant="outline" className={`${hospitalStaffRoleBadgeClass(staff.role)} py-0.5 px-2 text-[10px] font-bold rounded-md uppercase tracking-wide border`}>
                  {formatHospitalStaffRole(staff.role)}
                </Badge>
                <div className={`h-2.5 w-2.5 rounded-full ${staff.is_active ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
              </div>
              
              <div className="text-sm text-slate-600 dark:text-slate-400">
                <p className="font-medium text-[10px] text-slate-400 uppercase tracking-wider mb-1">Department</p>
                <p>{deptLabel}</p>
              </div>

              <div className="pt-2 border-t border-slate-50 dark:border-slate-800">
                <p className="font-medium text-[10px] text-slate-400 uppercase tracking-wider mb-2">Permissions</p>
                <div className="flex gap-1.5 flex-wrap">
                  <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium px-2 py-0 border-none rounded-md">
                    Standard
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    })}
    </div>
  );
};
