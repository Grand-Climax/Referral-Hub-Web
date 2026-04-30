import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useChangeStaffRoleMutation } from "@/features/hospitalAdmin/hospitalAdminApi";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HospitalAdminStaff } from "@/types/hospital-admin";

export function EditStaffRoleModal({ open, onOpenChange, staff }: { open: boolean; onOpenChange: (open: boolean) => void; staff: HospitalAdminStaff | null }) {
  const [changeRole, { isLoading }] = useChangeStaffRoleMutation();
  const [role, setRole] = useState("");

  useEffect(() => {
    if (staff) setRole(staff.role);
  }, [staff]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staff) return;
    try {
      await changeRole({ id: staff.id, role }).unwrap();
      toast.success("Staff role updated successfully");
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to update staff role");
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
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="specialist">Specialist</SelectItem>
                <SelectItem value="receptionist">Receptionist</SelectItem>
                <SelectItem value="liaison">Liaison Officer</SelectItem>
                <SelectItem value="system_admin">System Admin</SelectItem>
                <SelectItem value="hospital_admin">Hospital Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Updating..." : "Update"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
