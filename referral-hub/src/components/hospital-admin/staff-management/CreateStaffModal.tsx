import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateStaffMutation } from "@/features/hospitalAdmin/hospitalAdminApi";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  HOSPITAL_STAFF_ROLE_OPTIONS,
  HOSPITAL_STAFF_ROLE_LABELS,
} from "@/types/hospital-admin";

export function CreateStaffModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [createStaff, { isLoading }] = useCreateStaffMutation();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "doctor",
    password: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createStaff(formData).unwrap();
      toast.success("Staff created successfully");
      onOpenChange(false);
      setFormData({ first_name: "", last_name: "", email: "", role: "doctor", password: "" });
    } catch (err) {
      toast.error("Failed to create staff");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Staff</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input required value={formData.first_name} onChange={(e) => handleChange("first_name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input required value={formData.last_name} onChange={(e) => handleChange("last_name", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" required value={formData.email} onChange={(e) => handleChange("email", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Password (optional for some providers)</Label>
            <Input type="password" value={formData.password} onChange={(e) => handleChange("password", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={formData.role} onValueChange={(val) => handleChange("role", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Creating..." : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
