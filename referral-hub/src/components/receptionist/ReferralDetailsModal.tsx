import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetReferralByIdQuery } from "@/features/receptionist/receptionistApi";
import { Loader2, Calendar, Clock, Building2, AlertCircle, User, FileText } from "lucide-react";

interface ReferralDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referralId: string | null;
}

export function ReferralDetailsModal({ open, onOpenChange, referralId }: ReferralDetailsModalProps) {
  const { data, isLoading, error } = useGetReferralByIdQuery(referralId || "", {
    skip: !referralId,
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency?.toUpperCase()) {
      case "EMERGENCY":
      case "HIGH":
        return "bg-red-100 text-red-700 border-red-200";
      case "URGENT":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "ROUTINE":
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const getArrivalStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ARRIVED":
        return "bg-green-100 text-green-700 border-green-200";
      case "MISSED":
        return "bg-red-100 text-red-700 border-red-200";
      case "PENDING":
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Referral Details</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {!referralId ? (
            <p className="text-center text-slate-500">No referral selected.</p>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
              <p className="text-sm text-slate-400 mt-2">Loading details...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 text-red-500">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p className="text-center">Failed to load referral details.</p>
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* Patient Information */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Patient Information</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</p>
                    <p className="text-sm font-bold text-slate-900">
                      {data.patient_first_name} {data.patient_middle_name ? data.patient_middle_name + " " : ""}{data.patient_last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date of Birth</p>
                    <p className="text-sm font-bold text-slate-900">{data.dob || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Referral Information */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Referral Information</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Referral ID</p>
                    <p className="text-sm font-bold text-slate-900 font-mono">{data.referral_id || data.id}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                    <p className="text-sm font-bold text-slate-900">{data.status}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Urgency</p>
                    <Badge className={`${getUrgencyColor(data.urgency)} border font-bold`}>
                      {data.urgency || "ROUTINE"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Arrival Status</p>
                    <Badge className={`${getArrivalStatusColor(data.arrival_status || "PENDING")} border font-bold`}>
                      {data.arrival_status || "PENDING"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Scheduling Information */}
              {(data.scheduled_date || data.scheduled_time) && (
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Scheduling</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {data.scheduled_date && (
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scheduled Date</p>
                        <p className="text-sm font-bold text-slate-900">{data.scheduled_date}</p>
                      </div>
                    )}
                    {data.scheduled_time && (
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scheduled Time</p>
                        <p className="text-sm font-bold text-slate-900">{data.scheduled_time}</p>
                      </div>
                    )}
                    {data.arrival_time && (
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actual Arrival</p>
                        <p className="text-sm font-bold text-slate-900">{data.arrival_time}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Facility Information */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Facility Information</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Source Facility</p>
                    <p className="text-sm font-bold text-slate-900">{data.source_facility || data.referring_hospital_name || "N/A"}</p>
                  </div>
                  {data.department_name && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Department</p>
                      <p className="text-sm font-bold text-slate-900">{data.department_name}</p>
                    </div>
                  )}
                  {data.assigned_doctor_name && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assigned Doctor</p>
                      <p className="text-sm font-bold text-slate-900">{data.assigned_doctor_name}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Clinical Information */}
              {(data.reason || data.clinical_summary) && (
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="h-4 w-4 text-slate-500" />
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Clinical Information</h3>
                  </div>
                  {data.reason && (
                    <div className="mb-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reason for Referral</p>
                      <p className="text-sm text-slate-700">{data.reason}</p>
                    </div>
                  )}
                  {data.clinical_summary && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Clinical Summary</p>
                      <p className="text-sm text-slate-700">{data.clinical_summary}</p>
                    </div>
                  )}
                </div>
              )}
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
