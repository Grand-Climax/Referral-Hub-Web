import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGetReferralByIdQuery } from "@/features/receptionist/receptionistApi";
import { Loader2 } from "lucide-react";

interface ReferralDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referralId: string | null;
}

export function ReferralDetailsModal({ open, onOpenChange, referralId }: ReferralDetailsModalProps) {
  const { data, isLoading, error } = useGetReferralByIdQuery(referralId || "", {
    skip: !referralId,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Referral Details</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {!referralId ? (
            <p className="text-center text-slate-500">No referral selected.</p>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
            </div>
          ) : error ? (
            <p className="text-center text-red-500">Failed to load referral details.</p>
          ) : data ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patient Name</p>
                  <p className="text-sm font-bold text-slate-900">{data.patient_first_name} {data.patient_last_name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">DOB</p>
                  <p className="text-sm font-bold text-slate-900">{data.dob || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Referral ID</p>
                  <p className="text-sm font-bold text-slate-900">{data.referral_id || data.id}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                  <p className="text-sm font-bold text-slate-900">{data.status}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Source Facility</p>
                  <p className="text-sm font-bold text-slate-900">{data.source_facility}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Urgency</p>
                  <p className="text-sm font-bold text-slate-900">{data.urgency}</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
