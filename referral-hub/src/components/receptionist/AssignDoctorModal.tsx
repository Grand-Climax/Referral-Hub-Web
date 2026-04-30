import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAssignDoctorMutation } from "@/features/receptionist/receptionistApi";
import { toast } from "sonner";

interface AssignDoctorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referralId: string | null;
}

export function AssignDoctorModal({ open, onOpenChange, referralId }: AssignDoctorModalProps) {
  const [assignDoctor, { isLoading }] = useAssignDoctorMutation();
  const [doctorId, setDoctorId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referralId) return;
    
    try {
      await assignDoctor({ id: referralId, doctor_id: doctorId }).unwrap();
      toast.success("Doctor assigned successfully");
      onOpenChange(false);
      setDoctorId("");
    } catch (err) {
      toast.error("Failed to assign doctor");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Treating Doctor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="doctorId">Doctor ID</Label>
            <Input 
              id="doctorId" 
              required 
              value={doctorId} 
              onChange={(e) => setDoctorId(e.target.value)} 
              placeholder="Enter Doctor ID"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Assigning..." : "Assign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
