import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useAssignDoctorMutation,
  useGetDoctorsQuery,
  useGetReferralByIdQuery,
} from "@/features/receptionist/receptionistApi";
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
  const { data: doctors = [], isLoading: isLoadingDoctors } = useGetDoctorsQuery(undefined, {
    skip: !open,
  });
  const { data: referral } = useGetReferralByIdQuery(referralId || "", { skip: !referralId });
  const [doctorId, setDoctorId] = useState("");
  const [reason, setReason] = useState("");

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setDoctorId("");
      setReason("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referralId || !doctorId.trim()) return;
    
    try {
      await assignDoctor({
        id: referralId,
        doctor_id: doctorId.trim(),
        reason: reason.trim() || undefined,
      }).unwrap();
      toast.success("Doctor assigned successfully");
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to assign doctor"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Treating Doctor</DialogTitle>
          <DialogDescription>
            Assign a treating doctor to this patient. The doctor must belong to your hospital and the patient must be checked in.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {referral && (
            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
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
            <Label htmlFor="doctorId">Doctor *</Label>
            {isLoadingDoctors || doctors.length > 0 ? (
              <Select
                value={doctorId}
                onValueChange={setDoctorId}
                disabled={isLoading || isLoadingDoctors}
              >
                <SelectTrigger id="doctorId">
                  <SelectValue
                    placeholder={
                      isLoadingDoctors ? "Loading doctors..." : "Select doctor to assign"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {`${doctor.first_name} ${doctor.last_name}`.trim() || doctor.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <>
                <Input
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  placeholder="No doctor list available, enter doctor ID manually"
                  disabled={isLoading}
                />
                <p className="text-xs text-slate-500">
                  Doctor list is unavailable; you can still provide a valid doctor ID.
                </p>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignReason">Reason (optional)</Label>
            <Input
              id="assignReason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a reason when reassigning"
              disabled={isLoading}
            />
          </div>

          <DialogFooter className="gap-2 flex-col-reverse sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !doctorId.trim()} className="w-full sm:w-auto">
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
