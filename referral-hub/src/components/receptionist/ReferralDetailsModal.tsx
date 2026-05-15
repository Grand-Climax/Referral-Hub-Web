import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetReferralByIdQuery } from "@/features/receptionist/receptionistApi";
import { Loader2, User, Hospital, Calendar, FileText, Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ReferralDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referralId: string | null;
}

export function ReferralDetailsModal({ open, onOpenChange, referralId }: ReferralDetailsModalProps) {
  const { data, isLoading, error } = useGetReferralByIdQuery(referralId || "", {
    skip: !referralId,
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Referral Details</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {!referralId ? (
            <p className="text-center text-slate-500">No referral selected.</p>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
              <p className="text-sm text-slate-400 mt-2">Loading referral details...</p>
            </div>
          ) : error ? (
            <p className="text-center text-red-500">Failed to load referral details.</p>
          ) : data ? (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="clinical">Clinical</TabsTrigger>
                <TabsTrigger value="vitals">Vitals</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-4">
                {/* Patient Information */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-700 font-semibold">
                    <User className="h-4 w-4" />
                    <h3>Patient Information</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</p>
                      <p className="text-sm font-bold text-slate-900">
                        {data.patient?.first_name} {data.patient?.middle_name} {data.patient?.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date of Birth</p>
                      <p className="text-sm font-bold text-slate-900">{data.patient?.date_of_birth || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sex</p>
                      <p className="text-sm font-bold text-slate-900">{data.patient?.sex || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</p>
                      <p className="text-sm font-bold text-slate-900">{data.patient?.phone_number || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">National ID</p>
                      <p className="text-sm font-bold text-slate-900">{data.patient?.national_id || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Home Region</p>
                      <p className="text-sm font-bold text-slate-900">{data.patient?.home_region || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Referral Information */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-700 font-semibold">
                    <FileText className="h-4 w-4" />
                    <h3>Referral Information</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Referral ID</p>
                      <p className="text-sm font-bold text-slate-900 font-mono">{data.id}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                      <Badge variant="outline" className="mt-1">{data.status}</Badge>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Department</p>
                      <p className="text-sm font-bold text-slate-900">{data.target_department?.name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Triage Status</p>
                      <p className="text-sm font-bold text-slate-900">{data.triage_status || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Created</p>
                      <p className="text-sm text-slate-700">{formatDate(data.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Updated</p>
                      <p className="text-sm text-slate-700">{formatDate(data.updated_at)}</p>
                    </div>
                  </div>
                </div>

                {/* Hospital Information */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-700 font-semibold">
                    <Hospital className="h-4 w-4" />
                    <h3>Hospital Information</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">From</p>
                      <p className="text-sm font-bold text-slate-900">{data.sender_hospital?.name}</p>
                      <p className="text-xs text-slate-500">{data.sender_hospital?.region}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">To</p>
                      <p className="text-sm font-bold text-slate-900">{data.receiver_hospital?.name}</p>
                      <p className="text-xs text-slate-500">{data.receiver_hospital?.region}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="clinical" className="space-y-6 mt-4">
                {/* Diagnoses */}
                {data.diagnoses && data.diagnoses.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-slate-700">Diagnoses</h3>
                    <div className="space-y-2">
                      {data.diagnoses.map((diagnosis) => (
                        <div key={diagnosis.id} className="bg-slate-50 p-4 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-bold text-slate-900">{diagnosis.code_info?.description || diagnosis.icd_code}</p>
                              <p className="text-xs text-slate-500">ICD Code: {diagnosis.icd_code}</p>
                              <p className="text-xs text-slate-500">Certainty: {diagnosis.diagnosis_certainty}</p>
                            </div>
                            {diagnosis.is_primary && (
                              <Badge variant="default" className="text-xs">Primary</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Referral Form */}
                {data.referral_form && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-slate-700">Clinical Summary</h3>
                    <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                      {data.referral_form.reason_of_referral && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reason for Referral</p>
                          <p className="text-sm text-slate-700">{data.referral_form.reason_of_referral}</p>
                        </div>
                      )}
                      {data.referral_form.clinical_summary && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clinical Summary</p>
                          <p className="text-sm text-slate-700">{data.referral_form.clinical_summary}</p>
                        </div>
                      )}
                      {data.referral_form.condition_at_referral && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Condition at Referral</p>
                          <p className="text-sm text-slate-700">{data.referral_form.condition_at_referral}</p>
                        </div>
                      )}
                      {data.referral_form.treatment_given_before_referral && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Treatment Given</p>
                          <p className="text-sm text-slate-700">{data.referral_form.treatment_given_before_referral}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="vitals" className="space-y-6 mt-4">
                {data.vitals && data.vitals.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-700 font-semibold">
                      <Activity className="h-4 w-4" />
                      <h3>Vital Signs</h3>
                    </div>
                    {data.vitals.map((vital) => (
                      <div key={vital.id} className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-xs text-slate-500 mb-3">Recorded: {formatDate(vital.recorded_at)}</p>
                        <div className="grid grid-cols-3 gap-4">
                          {vital.systolic_bp && vital.diastolic_bp && (
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Blood Pressure</p>
                              <p className="text-sm font-bold text-slate-900">{vital.systolic_bp}/{vital.diastolic_bp} mmHg</p>
                            </div>
                          )}
                          {vital.heart_rate && (
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Heart Rate</p>
                              <p className="text-sm font-bold text-slate-900">{vital.heart_rate} bpm</p>
                            </div>
                          )}
                          {vital.respiratory_rate && (
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Respiratory Rate</p>
                              <p className="text-sm font-bold text-slate-900">{vital.respiratory_rate} /min</p>
                            </div>
                          )}
                          {vital.temperature && (
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Temperature</p>
                              <p className="text-sm font-bold text-slate-900">{vital.temperature}°C</p>
                            </div>
                          )}
                          {vital.sp_o2 && (
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SpO2</p>
                              <p className="text-sm font-bold text-slate-900">{vital.sp_o2}%</p>
                            </div>
                          )}
                          {vital.gcs_score && (
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">GCS Score</p>
                              <p className="text-sm font-bold text-slate-900">{vital.gcs_score}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-400 py-8">No vital signs recorded</p>
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-6 mt-4">
                {/* Redirections */}
                {data.redirections && data.redirections.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-slate-700">Redirection History</h3>
                    <div className="space-y-2">
                      {data.redirections.map((redirection) => (
                        <div key={redirection.id} className="bg-slate-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                            <Calendar className="h-3 w-3" />
                            {formatDate(redirection.created_at)}
                          </div>
                          <p className="text-sm text-slate-700">
                            From: <span className="font-semibold">{redirection.redirected_from_hospital_name}</span>
                          </p>
                          <p className="text-sm text-slate-700">
                            To: <span className="font-semibold">{redirection.redirected_to_hospital_name}</span>
                          </p>
                          {redirection.redirection_reason && (
                            <p className="text-xs text-slate-500 mt-1">Reason: {redirection.redirection_reason}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Emergency Details */}
                {data.emergency_detail && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-slate-700">Emergency Details</h3>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      {data.emergency_detail.emergency_justification && (
                        <p className="text-sm text-slate-700">{data.emergency_detail.emergency_justification}</p>
                      )}
                      {data.emergency_detail.admitted_at && (
                        <p className="text-xs text-slate-500 mt-2">Admitted: {formatDate(data.emergency_detail.admitted_at)}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* ML Severity Score */}
                {data.ml_severity_score !== undefined && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-slate-700">ML Severity Assessment</h3>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Severity Score</p>
                          <p className="text-sm font-bold text-slate-900">{data.ml_severity_score}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ML Status</p>
                          <p className="text-sm font-bold text-slate-900">{data.ml_status || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : null}
        </div>
        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
