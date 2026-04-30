import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegisterWalkInMutation } from "@/features/receptionist/receptionistApi";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface WalkInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalkInModal({ open, onOpenChange }: WalkInModalProps) {
  const [registerWalkIn, { isLoading }] = useRegisterWalkInMutation();
  const [formData, setFormData] = useState({
    patient_first_name: "",
    patient_last_name: "",
    patient_middle_name: "",
    dob: "",
    reason: "",
    urgency: "ROUTINE",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerWalkIn(formData).unwrap();
      toast.success("Walk-in patient registered successfully");
      onOpenChange(false);
      setFormData({
        patient_first_name: "",
        patient_last_name: "",
        patient_middle_name: "",
        dob: "",
        reason: "",
        urgency: "ROUTINE",
      });
    } catch (err) {
      toast.error("Failed to register walk-in patient");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Register Walk-In Patient</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" required value={formData.patient_first_name} onChange={(e) => handleChange("patient_first_name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" required value={formData.patient_last_name} onChange={(e) => handleChange("patient_last_name", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="middleName">Middle Name (Optional)</Label>
              <Input id="middleName" value={formData.patient_middle_name} onChange={(e) => handleChange("patient_middle_name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input id="dob" type="date" required value={formData.dob} onChange={(e) => handleChange("dob", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Visit</Label>
            <Input id="reason" required value={formData.reason} onChange={(e) => handleChange("reason", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="urgency">Urgency</Label>
            <Select value={formData.urgency} onValueChange={(val) => handleChange("urgency", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ROUTINE">Routine</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="EMERGENCY">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Registering..." : "Register"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
