import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Edit2, MoreHorizontal, Loader2, UserX, RefreshCw } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  HospitalAdminStaff,
  formatHospitalStaffRole,
  hospitalStaffRoleBadgeClass,
} from '@/types/hospital-admin';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useUpdateStaffActivationMutation } from '@/features/hospitalAdmin/hospitalAdminApi';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/apiError';

interface StaffListProps {
  staffList: HospitalAdminStaff[];
  isLoading: boolean;
  departmentNameById?: Record<string, string>;
  onEditRole: (staff: HospitalAdminStaff) => void;
  onReplace: (staff: HospitalAdminStaff) => void;
  onDelete: (id: string) => void;
}

export const StaffList = ({
  staffList,
  isLoading,
  departmentNameById,
  onEditRole,
  onReplace,
  onDelete,
}: StaffListProps) => {
  const router = useRouter();
  const [updateStaffActivation] = useUpdateStaffActivationMutation();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleActiveChange = async (staff: HospitalAdminStaff, checked: boolean) => {
    setTogglingId(staff.id);
    try {
      await updateStaffActivation({ id: staff.id, is_active: checked }).unwrap();
      toast.success(checked ? 'Staff activated' : 'Staff deactivated');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not update status'));
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
          <TableRow>
            <TableHead className="py-4 px-6 text-[10px] font-bold tracking-wider uppercase text-slate-400">NAME & ID</TableHead>
            <TableHead className="py-4 px-6 text-[10px] font-bold tracking-wider uppercase text-slate-400">ROLE</TableHead>
            <TableHead className="py-4 px-6 text-[10px] font-bold tracking-wider uppercase text-slate-400">DEPARTMENT</TableHead>
            <TableHead className="py-4 px-6 text-[10px] font-bold tracking-wider uppercase text-slate-400">PERMISSIONS</TableHead>
            <TableHead className="py-4 px-6 text-[10px] font-bold tracking-wider uppercase text-slate-400">STATUS</TableHead>
            <TableHead className="py-4 px-6 text-[10px] font-bold tracking-wider uppercase text-slate-400 text-right">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-300" />
              </TableCell>
            </TableRow>
          ) : staffList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-center text-slate-500">
                No staff found.
              </TableCell>
            </TableRow>
          ) : (
            staffList.map((staff) => {
              const initials = `${staff.first_name?.[0] || ''}${staff.last_name?.[0] || ''}`.toUpperCase();
              const fullName = [staff.first_name, staff.middle_name, staff.last_name]
                .filter(Boolean)
                .join(' ');
              const deptLabel = staff.department_id
                ? departmentNameById?.[staff.department_id] ?? staff.department_id
                : '—';
              return (
                <TableRow 
                  key={staff.id} 
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors cursor-pointer"
                  onClick={() => router.push(`/hospital-admin/staff-management/${staff.id}`)}
                >
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-800">
                        <AvatarFallback className="bg-slate-100 text-slate-600 font-semibold">{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-sm text-slate-900 dark:text-slate-50">{fullName}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{staff.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <Badge variant="outline" className={`${hospitalStaffRoleBadgeClass(staff.role)} py-0.5 px-2 text-[10px] font-bold rounded-md uppercase tracking-wide border`}>
                      {formatHospitalStaffRole(staff.role)}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">
                    {deptLabel}
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    {/* Permissions can be derived from role or added to model later */}
                    <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium px-2 py-0 border-none rounded-md">
                      Standard
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`staff-active-${staff.id}`}
                        checked={staff.is_active}
                        disabled={togglingId === staff.id}
                        onCheckedChange={(checked) => void handleActiveChange(staff, checked)}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
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
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
