'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  useChangeStaffRoleMutation,
  useDeleteStaffMutation,
  useForceLogoutStaffMutation,
  useGetStaffByIdQuery,
  useUpdateStaffMutation,
} from '@/features/hospitalAdmin/hospitalAdminApi';
import {
  useGetDepartmentByIdQuery,
  useGetDepartmentsQuery,
} from '@/features/department/department';
import type { Department } from '@/types/hospital';
import {
  formatHospitalStaffRole,
  hospitalStaffRoleBadgeClass,
  HOSPITAL_STAFF_ROLE_LABELS,
  HOSPITAL_STAFF_ROLE_OPTIONS,
  HospitalAdminStaffDetail,
} from '@/types/hospital-admin';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Hash,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Shield,
  Trash2,
  UserCircle2,
  LogOut,
} from 'lucide-react';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/apiError';

type StaffForm = {
  email: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  national_id: string;
  role: string;
  department_id: string;
  is_active: boolean;
};

function staffToForm(staff: HospitalAdminStaffDetail): StaffForm {
  return {
    email: staff.email,
    first_name: staff.first_name,
    middle_name: staff.middle_name ?? '',
    last_name: staff.last_name,
    national_id: staff.national_id ?? '',
    role: staff.role,
    department_id: staff.department_id ?? '',
    is_active: staff.is_active,
  };
}

export function StaffDetailProfile({ staffId }: { staffId: string }) {
  const router = useRouter();
  const { data: staff, isLoading, error, refetch } = useGetStaffByIdQuery(staffId);
  const { data: departments = [], isLoading: departmentsListLoading } = useGetDepartmentsQuery();
  const selectedDeptId = staff?.department_id ?? '';
  const { data: departmentById, isLoading: departmentByIdLoading } = useGetDepartmentByIdQuery(
    selectedDeptId,
    { skip: !selectedDeptId },
  );
  const departmentsLoading = departmentsListLoading || departmentByIdLoading;
  const [updateStaff, { isLoading: isUpdating }] = useUpdateStaffMutation();
  const [changeRole, { isLoading: isChangingRole }] = useChangeStaffRoleMutation();
  const [deleteStaff, { isLoading: isDeleting }] = useDeleteStaffMutation();
  const [forceLogoutStaff, { isLoading: isForcingLogout }] = useForceLogoutStaffMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState<StaffForm | null>(null);

  useEffect(() => {
    if (!staff) return;
    if (!isEditing) {
      setForm(staffToForm(staff));
    }
  }, [staff, isEditing]);

  const departmentLabel = useMemo(() => {
    if (!staff) return '—';
    return (
      staff.department?.name ??
      departmentById?.name ??
      staff.department_id ??
      '—'
    );
  }, [staff, departmentById?.name]);

  const hospitalLabel = useMemo(() => {
    if (!staff) return '—';
    return staff.hospital?.name ?? staff.hospital_id ?? '—';
  }, [staff]);

  /** `getDepartments` list plus nested staff dept / `getDepartmentById` when missing from the list. */
  const departmentOptions = useMemo((): Department[] => {
    const list = [...departments];
    const pushIfMissing = (d?: Pick<Department, 'id' | 'name'> | null) => {
      if (d?.id && !list.some((x) => x.id === d.id)) {
        list.push({ id: d.id, name: d.name });
      }
    };
    pushIfMissing(staff?.department ?? null);
    pushIfMissing(departmentById ?? null);
    return list;
  }, [departments, staff?.department, departmentById]);

  const saving = isUpdating || isChangingRole;

  const resetFromStaff = () => {
    if (staff) setForm(staffToForm(staff));
  };

  const handleCancelEdit = () => {
    resetFromStaff();
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!staff || !form) return;
    try {
      await updateStaff({
        id: staffId,
        email: form.email.trim(),
        first_name: form.first_name.trim(),
        middle_name: form.middle_name.trim() || undefined,
        last_name: form.last_name.trim(),
        national_id: form.national_id.trim() || undefined,
        is_active: form.is_active,
      }).unwrap();

      const roleChanged = form.role !== staff.role;
      const deptChanged =
        (form.department_id || '') !== (staff.department_id || '');
      if (roleChanged || deptChanged) {
        await changeRole({
          id: staffId,
          role: form.role,
          department_id: form.department_id ? form.department_id : undefined,
        }).unwrap();
      }

      toast.success('Staff updated successfully');
      setIsEditing(false);
      refetch();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not save changes. Please try again.'));
    }
  };

  const handleForceLogout = async () => {
    try {
      await forceLogoutStaff(staffId).unwrap();
      toast.success('Staff session terminated.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not force logout staff member.'));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteStaff(staffId).unwrap();
      toast.success('Staff member removed');
      setDeleteOpen(false);
      router.push('/hospital-admin/staff-management');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete staff member'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] rounded-2xl border border-dashed border-slate-200 bg-white/80 dark:bg-slate-950/40 dark:border-slate-800">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="mt-4 text-sm font-medium text-slate-500">Loading staff profile…</p>
      </div>
    );
  }

  if (error || !staff) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] rounded-2xl border border-red-100 bg-red-50/50 px-6 text-center dark:border-red-900/40 dark:bg-red-950/20">
        <p className="text-red-600 dark:text-red-400 font-medium max-w-md">
          We couldn&apos;t load this staff profile. It may have been removed or you may not have access.
        </p>
        <Link href="/hospital-admin/staff-management" className="mt-6">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to staff list
          </Button>
        </Link>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] rounded-2xl border border-dashed border-slate-200 bg-white/80 dark:bg-slate-950/40 dark:border-slate-800">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="mt-4 text-sm font-medium text-slate-500">Loading staff profile…</p>
      </div>
    );
  }

  const editForm = form;

  const initials =
    `${staff.first_name?.[0] ?? ''}${staff.last_name?.[0] ?? ''}`.toUpperCase() || '?';
  const displayName = [staff.first_name, staff.middle_name, staff.last_name]
    .filter(Boolean)
    .join(' ');

  const createdLabel = staff.created_at
    ? format(new Date(staff.created_at), 'MMM d, yyyy')
    : '—';
  const updatedLabel = staff.updated_at
    ? format(new Date(staff.updated_at), 'MMM d, yyyy · h:mm a')
    : '—';

  return (
    <div className="mx-auto space-y-8 pb-16 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link href="/hospital-admin/staff-management">
            <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-xl border-slate-200 dark:border-slate-800">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Staff profile
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              View and manage account details, role, and status.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!isEditing ? (
            <>
              <Button
                variant="outline"
                className="gap-2 rounded-xl"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                className="gap-2 rounded-xl"
                onClick={() => void handleForceLogout()}
                disabled={isForcingLogout}
              >
                {isForcingLogout ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                Force logout
              </Button>
              <Button
                variant="outline"
                className="gap-2 rounded-xl text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-950/40"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" className="rounded-xl" onClick={handleCancelEdit} disabled={saving}>
                Cancel
              </Button>
              <Button className="rounded-xl gap-2" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save changes
              </Button>
            </>
          )}
        </div>
      </div>

      <Card className="overflow-hidden border-slate-200/80 shadow-lg rounded-2xl dark:border-slate-800 dark:bg-slate-950/50">
        <div className="h-28 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-800" />
        <CardContent className="relative px-6 pb-8 pt-0 sm:px-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col items-center gap-5 md:flex-row md:items-end">
              <Avatar className="h-28 w-28 -mt-14 border-4 border-white shadow-xl rounded-2xl dark:border-slate-950">
                <AvatarFallback className="rounded-2xl bg-slate-100 text-3xl font-bold text-blue-700 dark:bg-slate-800 dark:text-blue-300">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left space-y-2 pb-1">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                    {displayName}
                  </h2>
                  <Badge
                    variant="outline"
                    className={`${hospitalStaffRoleBadgeClass(staff.role)} border font-bold text-[10px] uppercase tracking-wide`}
                  >
                    {formatHospitalStaffRole(staff.role)}
                  </Badge>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-slate-400" />
                    {staff.email}
                  </span>
                  {staff.national_id ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Hash className="h-4 w-4 text-slate-400" />
                      {staff.national_id}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center md:items-end gap-2 shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Account status
              </span>
              <Badge
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg border-none ${
                  staff.is_active
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                    : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {staff.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-2xl border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Profile & access</CardTitle>
              <CardDescription>
                {isEditing
                  ? 'Update identity, contact, role, department, and activation.'
                  : 'Identity and permissions for this user.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First name</Label>
                  <Input
                    id="first_name"
                    value={editForm.first_name}
                    onChange={(e) => setForm((f) => (f ? { ...f, first_name: e.target.value } : f))}
                    disabled={!isEditing}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="middle_name">Middle name</Label>
                  <Input
                    id="middle_name"
                    value={editForm.middle_name}
                    onChange={(e) => setForm((f) => (f ? { ...f, middle_name: e.target.value } : f))}
                    disabled={!isEditing}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="last_name">Last name</Label>
                  <Input
                    id="last_name"
                    value={editForm.last_name}
                    onChange={(e) => setForm((f) => (f ? { ...f, last_name: e.target.value } : f))}
                    disabled={!isEditing}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setForm((f) => (f ? { ...f, email: e.target.value } : f))}
                    disabled={!isEditing}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="national_id">National ID</Label>
                  <Input
                    id="national_id"
                    value={editForm.national_id}
                    onChange={(e) => setForm((f) => (f ? { ...f, national_id: e.target.value } : f))}
                    disabled={!isEditing}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={editForm.role}
                    onValueChange={(role) => setForm((f) => (f ? { ...f, role } : f))}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className="rounded-xl w-full">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      {HOSPITAL_STAFF_ROLE_OPTIONS.map((role) => (
                        <SelectItem key={role} value={role}>
                          {HOSPITAL_STAFF_ROLE_LABELS[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select
                    value={editForm.department_id || 'none'}
                    onValueChange={(v) =>
                      setForm((f) => (f ? { ...f, department_id: v === 'none' ? '' : v } : f))
                    }
                    disabled={!isEditing || departmentsLoading}
                  >
                    <SelectTrigger className="rounded-xl w-full">
                      <SelectValue placeholder={departmentsLoading ? 'Loading…' : 'Department'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No department</SelectItem>
                      {departmentOptions.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/40">
                <Checkbox
                  id="is_active"
                  checked={editForm.is_active}
                  onCheckedChange={(checked) =>
                    setForm((f) => (f ? { ...f, is_active: checked === true } : f))
                  }
                  disabled={!isEditing}
                />
                <div className="space-y-0.5">
                  <Label htmlFor="is_active" className="cursor-pointer font-medium">
                    Account active
                  </Label>
                  <p className="text-xs text-slate-500">
                    Inactive users cannot sign in or perform hospital actions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="rounded-2xl border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                Organization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 text-sm">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Hospital
                </p>
                <p className="font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                  {hospitalLabel}
                </p>
                {staff.hospital?.region ? (
                  <p className="text-slate-500 mt-1 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {staff.hospital.region}
                  </p>
                ) : null}
                {staff.hospital?.contact_phone ? (
                  <p className="text-slate-500 mt-1 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    {staff.hospital.contact_phone}
                  </p>
                ) : null}
              </div>
              <Separator />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Department
                </p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{departmentLabel}</p>
                {staff.department?.description ? (
                  <p className="text-slate-500 mt-2 text-xs leading-relaxed">
                    {staff.department.description}
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                Record
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex gap-3">
                <UserCircle2 className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Staff ID</p>
                  <p className="font-mono text-xs text-slate-700 dark:text-slate-300 break-all">{staff.id}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Calendar className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Created</p>
                  <p className="text-slate-700 dark:text-slate-300">{createdLabel}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Calendar className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Last updated</p>
                  <p className="text-slate-700 dark:text-slate-300">{updatedLabel}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Remove staff member?</DialogTitle>
            <DialogDescription>
              This will permanently delete <strong>{displayName}</strong> from your hospital staff list.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" className="gap-2" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
