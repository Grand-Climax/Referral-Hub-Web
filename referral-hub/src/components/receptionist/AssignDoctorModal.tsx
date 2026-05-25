import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useAssignDoctorMutation,
  useGetDoctorsQuery,
  useGetReferralByIdQuery,
  useGetTriageDetailQuery,
} from "@/features/receptionist/receptionistApi";
import { useGetMeQuery } from "@/features/users/usersApi";
import { toast } from "sonner";
import { getReceptionistErrorMessage } from "@/lib/receptionistScopeError";
import {
  canReceptionistActOnReferral,
  receptionistScopeHint,
} from "@/lib/receptionistDepartmentScope";
import { Loader2, AlertTriangle } from "lucide-react";

interface AssignDoctorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referralId: string | null;
}

export function AssignDoctorModal({ open, onOpenChange, referralId }: AssignDoctorModalProps) {
  const [assignDoctor, { isLoading }] = useAssignDoctorMutation();
  const { data: me } = useGetMeQuery(undefined, { skip: !open });
  const { data: referral } = useGetReferralByIdQuery(referralId || "", { skip: !referralId });
  const { data: triageDetail } = useGetTriageDetailQuery(referralId || "", {
    skip: !referralId,
  });

  const referralDepartmentId =
    referral?.department_id ?? triageDetail?.department_id;
  const referralDepartmentName =
    referral?.department_name ?? triageDetail?.department_name;

  const canAssign = canReceptionistActOnReferral(
    me?.department_id,
    referralDepartmentId,
  );
  const scopeMessage = receptionistScopeHint(
    me?.department_id,
    referralDepartmentName,
  );

  const { data: doctors = [], isLoading: isLoadingDoctors } = useGetDoctorsQuery(
    referralDepartmentId ? { department_id: referralDepartmentId } : undefined,
    { skip: !open || !canAssign },
  );

  const [doctorId, setDoctorId] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) {
      setDoctorId("");
      setReason("");
    }
  }, [open]);

  const doctorPlaceholder = useMemo(() => {
    if (!canAssign) return "Not available for your department";
    if (isLoadingDoctors) return "Loading doctors...";
    if (doctors.length === 0) return "No doctors in this department";
    return "Select treating doctor";
  }, [canAssign, isLoadingDoctors, doctors.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referralId || !doctorId.trim()) return;

    if (!canAssign) {
      toast.error(
        scopeMessage ??
          "You cannot assign a doctor for a patient outside your department.",
      );
      return;
    }

    try {
      await assignDoctor({
        id: referralId,
        doctor_id: doctorId.trim(),
        reason: reason.trim() || undefined,
      }).unwrap();
      toast.success("Doctor assigned successfully");
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(getReceptionistErrorMessage(err, "Failed to assign doctor"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Treating Doctor</DialogTitle>
          <DialogDescription>
            Choose a treating doctor from the same department as this referral.
            The patient must already be checked in.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {!canAssign && scopeMessage && (
            <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-amber-900">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
              <p className="text-sm">{scopeMessage}</p>
            </div>
          )}

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
                {referralDepartmentName && (
                  <div className="sm:col-span-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Department</p>
                    <p className="font-semibold text-slate-900">{referralDepartmentName}</p>
                  </div>
                )}
                {me?.department?.name && (
                  <div className="sm:col-span-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your scope</p>
                    <p className="font-semibold text-slate-900">{me.department.name}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="doctorId">Doctor *</Label>
            {canAssign && (isLoadingDoctors || doctors.length > 0) ? (
              <Select
                value={doctorId}
                onValueChange={setDoctorId}
                disabled={isLoading || isLoadingDoctors}
              >
                <SelectTrigger id="doctorId">
                  <SelectValue placeholder={doctorPlaceholder} />
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
                  placeholder={
                    canAssign
                      ? "No doctor list available, enter doctor ID manually"
                      : "Assignment disabled — wrong department"
                  }
                  disabled={isLoading || !canAssign}
                />
                {canAssign && (
                  <p className="text-xs text-slate-500">
                    Doctor list is unavailable; you can still provide a valid doctor ID
                    for this department.
                  </p>
                )}
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
              disabled={isLoading || !canAssign}
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
            <Button
              type="submit"
              disabled={isLoading || !doctorId.trim() || !canAssign}
              className="w-full sm:w-auto"
            >
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
