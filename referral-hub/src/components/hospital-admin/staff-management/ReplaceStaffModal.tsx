import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useReplaceStaffMutation } from "@/features/hospitalAdmin/hospitalAdminApi";
import { toast } from "sonner";
import { HospitalAdminStaff } from "@/types/hospital-admin";

export function ReplaceStaffModal({ open, onOpenChange, staff }: { open: boolean; onOpenChange: (open: boolean) => void; staff: HospitalAdminStaff | null }) {
  const [replaceStaff, { isLoading }] = useReplaceStaffMutation();
  const [formData, setFormData] = useState({
    new_staff_first_name: "",
    new_staff_last_name: "",
    new_staff_email: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staff) return;
    try {
      await replaceStaff({ id: staff.id, ...formData }).unwrap();
      toast.success("Staff replaced successfully");
      onOpenChange(false);
      setFormData({ new_staff_first_name: "", new_staff_last_name: "", new_staff_email: "" });
    } catch (err) {
      toast.error("Failed to replace staff");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Replace Staff Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Replacing</Label>
            <p className="text-sm font-semibold">{staff?.first_name} {staff?.last_name} ({staff?.role})</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>New First Name</Label>
              <Input required value={formData.new_staff_first_name} onChange={(e) => handleChange("new_staff_first_name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>New Last Name</Label>
              <Input required value={formData.new_staff_last_name} onChange={(e) => handleChange("new_staff_last_name", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>New Email</Label>
            <Input type="email" required value={formData.new_staff_email} onChange={(e) => handleChange("new_staff_email", e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading} variant="destructive">{isLoading ? "Replacing..." : "Replace Staff"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
