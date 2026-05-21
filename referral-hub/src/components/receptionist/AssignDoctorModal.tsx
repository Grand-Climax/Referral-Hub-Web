import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAssignDoctorMutation, useGetReferralByIdQuery } from "@/features/receptionist/receptionistApi";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/apiError";
import { Loader2 } from "lucide-react";

interface AssignDoctorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referralId: string | null;
}

export function AssignDoctorModal({ open, onOpenChange, referralId }: AssignDoctorModalProps) {
  const [assignDoctor, { isLoading }] = useAssignDoctorMutation();
  const { data: referral } = useGetReferralByIdQuery(referralId || "", { skip: !referralId });
  const [doctorId, setDoctorId] = useState("");

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setDoctorId("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referralId || !doctorId.trim()) return;
    
    try {
      await assignDoctor({ id: referralId, doctor_id: doctorId.trim() }).unwrap();
      toast.success("Doctor assigned successfully");
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to assign doctor"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Treating Doctor</DialogTitle>
          <DialogDescription>
            Assign a receiving specialist to treat this patient. The doctor must be from the same hospital and patient must have arrived.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {referral && (
            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patient</p>
                  <p className="font-semibold text-slate-900">
                    {referral.patient_first_name} {referral.patient_last_name}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Referral ID</p>
                  <p className="font-semibold text-slate-900">{referral.referral_id}</p>
                </div>
                {referral.department_name && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Department</p>
                    <p className="font-semibold text-slate-900">{referral.department_name}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="doctorId">Doctor ID *</Label>
            <Input
              id="doctorId"
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              placeholder="Enter doctor ID"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-slate-500">
              Enter the ID of a receiving specialist from your hospital
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !doctorId.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Assign Doctor"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
