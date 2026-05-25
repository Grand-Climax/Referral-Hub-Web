import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useChangeStaffRoleMutation } from "@/features/hospitalAdmin/hospitalAdminApi";
import { useGetCurrentUserQuery } from "@/features/auth/authApi";
import { useGetDepartmentsQuery } from "@/features/hospitals/hospitalsApi";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/apiError";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  HospitalAdminStaff,
  HOSPITAL_STAFF_ROLE_OPTIONS,
  HOSPITAL_STAFF_ROLE_LABELS,
  hospitalStaffRoleRequiresDepartment,
} from "@/types/hospital-admin";

export function EditStaffRoleModal({ open, onOpenChange, staff }: { open: boolean; onOpenChange: (open: boolean) => void; staff: HospitalAdminStaff | null }) {
  const [changeRole, { isLoading }] = useChangeStaffRoleMutation();
  const { data: currentUser, isLoading: isLoadingCurrentUser } =
    useGetCurrentUserQuery();
  const hospitalId = currentUser?.hospital_id ?? staff?.hospital_id;
  const { data: departments = [], isLoading: isLoadingDepartments } =
    useGetDepartmentsQuery(hospitalId ?? "", { skip: !hospitalId });

  const [role, setRole] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  useEffect(() => {
    if (staff) {
      setRole(staff.role);
      setDepartmentId(staff.department_id ?? "");
    }
  }, [staff]);

  const roleNeedsDepartment = hospitalStaffRoleRequiresDepartment(role);

  const handleRoleChange = (value: string) => {
    setRole(value);
    if (!hospitalStaffRoleRequiresDepartment(value)) {
      setDepartmentId("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staff) return;
    if (roleNeedsDepartment && !departmentId) {
      toast.error("Please select a department for this role.");
      return;
    }
    try {
      await changeRole({
        id: staff.id,
        role,
        ...(roleNeedsDepartment && departmentId
          ? { department_id: departmentId }
          : {}),
      }).unwrap();
      toast.success("Staff role updated successfully");
      onOpenChange(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to update staff role"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Staff Role</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Staff Name</Label>
            <p className="text-sm font-semibold">{staff?.first_name} {staff?.last_name}</p>
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {HOSPITAL_STAFF_ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {HOSPITAL_STAFF_ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {roleNeedsDepartment && (
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={departmentId}
                onValueChange={setDepartmentId}
                disabled={!hospitalId || isLoadingCurrentUser || isLoadingDepartments}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isLoadingCurrentUser || isLoadingDepartments
                        ? "Loading departments..."
                        : !hospitalId
                          ? "Hospital unavailable"
                          : "Select department"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button
              type="submit"
              disabled={
                isLoading ||
                !role ||
                (roleNeedsDepartment && !departmentId)
              }
            >
              {isLoading ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
