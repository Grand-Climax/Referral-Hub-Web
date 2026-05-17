"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Send,
  FileEdit,
  Loader2,
} from "lucide-react";
import {
  useGetReferralByIdQuery,
  useForwardReferralMutation,
  useRejectReferralMutation,
  useReviseReferralMutation,
  useRejectAfterSendMutation,
  useGetReviewChecklistQuery,
  useUpdateReviewChecklistMutation,
} from "@/features/liaison/liaisonApi";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: "bg-blue-100 text-blue-800",
  UNDER_LIAISON_REVIEW: "bg-yellow-100 text-yellow-800",
  FORWARDED: "bg-purple-100 text-purple-800",
  UNDER_SPECIALIST_REVIEW: "bg-indigo-100 text-indigo-800",
  ACCEPTED: "bg-green-100 text-green-800",
  SCHEDULED: "bg-teal-100 text-teal-800",
  REJECTED_BY_LIAISON: "bg-red-100 text-red-800",
  REJECTED_BY_SPECIALIST: "bg-red-100 text-red-800",
  REJECTED_AFTER_SEND: "bg-red-100 text-red-800",
  NEED_REVISION: "bg-orange-100 text-orange-800",
  COMPLETED: "bg-gray-100 text-gray-800",
};

const formatStatus = (status: string) => {
  return status.replace(/_/g, " ");
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ReferralDetailPage() {
  const params = useParams();
  const router = useRouter();
  const referralId = params.id as string;

  const [actionDialog, setActionDialog] = useState<{
    type: "forward" | "reject" | "revise" | "reject-after-send" | null;
    reason: string;
  }>({ type: null, reason: "" });

  const { data: referral, isLoading, isError } = useGetReferralByIdQuery(referralId);
  const { data: checklist } = useGetReviewChecklistQuery(referralId);
  
  const [forwardReferral, { isLoading: isForwarding }] = useForwardReferralMutation();
  const [rejectReferral, { isLoading: isRejecting }] = useRejectReferralMutation();
  const [reviseReferral, { isLoading: isRevising }] = useReviseReferralMutation();
  const [rejectAfterSend, { isLoading: isRejectingAfterSend }] = useRejectAfterSendMutation();
  const [updateChecklist] = useUpdateReviewChecklistMutation();

  const handleAction = async () => {
    if (!actionDialog.type) return;

    try {
      switch (actionDialog.type) {
        case "forward":
          await forwardReferral({ id: referralId }).unwrap();
          toast.success("Referral Approved and Dispatched", {
            description: "The referral has been cryptographically signed and transmitted to the receiving hospital.",
          });
          break;
        case "reject":
          await rejectReferral({ id: referralId, reason: actionDialog.reason }).unwrap();
          toast.error("Referral Rejected", {
            description: "The referral has been rejected.",
          });
          break;
        case "revise":
          await reviseReferral({ id: referralId, reason: actionDialog.reason }).unwrap();
          toast.success("Revision Requested", {
            description: "The referral has been sent back for revision.",
          });
          break;
        case "reject-after-send":
          await rejectAfterSend({ id: referralId, reason: actionDialog.reason }).unwrap();
          toast.error("Referral Cancelled", {
            description: "The referral has been cancelled.",
          });
          break;
      }
      setActionDialog({ type: null, reason: "" });
      router.push("/liaison-officer");
    } catch (error: any) {
      toast.error("Error", {
        description: error?.data?.error || "Failed to perform action",
      });
    }
  };

  const handleChecklistChange = async (field: string, value: boolean) => {
    if (!checklist) return;
    try {
      await updateChecklist({
        id: referralId,
        body: { ...checklist, [field]: value },
      }).unwrap();
    } catch (error) {
      toast.error("Error", {
        description: "Failed to update checklist",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !referral) {
    return (
      <div className="container mx-auto max-w-[1400px] py-12">
        <Card className="border-2 border-destructive">
          <CardContent className="p-12 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Referral Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The referral you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => router.push("/liaison-officer")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canTakeAction = ["SUBMITTED", "UNDER_LIAISON_REVIEW"].includes(referral.status);
  const canRejectAfterSend = ["SUBMITTED", "UNDER_LIAISON_REVIEW", "FORWARDED", "UNDER_SPECIALIST_REVIEW", "ACCEPTED"].includes(referral.status);

  return (
    <div className="container mx-auto max-w-[1400px] py-12 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Referral Details</h1>
            <p className="text-muted-foreground">Review and manage this referral</p>
          </div>
        </div>
        <Badge variant="secondary" className={`${STATUS_COLORS[referral.status]} text-sm px-4 py-2`}>
          {formatStatus(referral.status)}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Information */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">Full Name</Label>
                <p className="font-semibold">
                  {referral.patient?.first_name} {referral.patient?.middle_name} {referral.patient?.last_name}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">National ID</Label>
                <p className="font-semibold">{referral.patient?.national_id || "N/A"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Date of Birth</Label>
                <p className="font-semibold">{referral.patient?.date_of_birth || "N/A"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Sex</Label>
                <p className="font-semibold">{referral.patient?.sex || "N/A"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Region</Label>
                <p className="font-semibold">{referral.patient?.home_region || "N/A"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Phone</Label>
                <p className="font-semibold">{referral.patient?.phone_number || "N/A"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Clinical Information */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Clinical Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Target Department</Label>
                <p className="font-semibold">{referral.target_department?.name || "N/A"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Receiving Hospital</Label>
                <p className="font-semibold">{referral.receiver_hospital?.name || "N/A"}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {referral.receiver_hospital?.region || "N/A"} • {referral.receiver_hospital?.tier_level || "N/A"}
                </p>
              </div>
              {referral.patient?.home_region && referral.receiver_hospital?.region && (
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <Label className="text-blue-900 font-semibold">Catchment Area Policy</Label>
                  <p className="text-sm text-blue-700 mt-1">
                    Patient Region: <span className="font-semibold">{referral.patient.home_region}</span>
                    {" → "}
                    Hospital Region: <span className="font-semibold">{referral.receiver_hospital.region}</span>
                  </p>
                  {referral.patient.home_region === referral.receiver_hospital.region ? (
                    <p className="text-xs text-emerald-700 mt-2 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Within catchment area
                    </p>
                  ) : (
                    <p className="text-xs text-amber-700 mt-2 flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      Cross-regional referral
                    </p>
                  )}
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">Diagnoses</Label>
                <div className="space-y-2 mt-2">
                  {referral.diagnoses && referral.diagnoses.length > 0 ? (
                    referral.diagnoses.map((diagnosis: any, index: number) => (
                      <div key={index} className="p-3 bg-muted rounded-lg">
                        <p className="font-semibold">{diagnosis.icd_code}</p>
                        <p className="text-sm text-muted-foreground">
                          {diagnosis.code_info?.description || "No description"}
                        </p>
                        {diagnosis.is_primary && (
                          <Badge variant="outline" className="mt-1">Primary</Badge>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No diagnoses recorded</p>
                  )}
                </div>
              </div>
              {referral.referral_form && (
                <>
                  <div>
                    <Label className="text-muted-foreground">Reason for Referral</Label>
                    <p className="mt-1">{referral.referral_form.reason_of_referral || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Clinical Summary</Label>
                    <p className="mt-1">{referral.referral_form.clinical_summary || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Condition at Referral</Label>
                    <p className="mt-1">{referral.referral_form.condition_at_referral || "N/A"}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Review Checklist */}
          {canTakeAction && checklist && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Review Checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="patient_identity"
                    checked={checklist.patient_identity_verified}
                    onCheckedChange={(checked) =>
                      handleChecklistChange("patient_identity_verified", checked as boolean)
                    }
                  />
                  <label htmlFor="patient_identity" className="text-sm font-medium cursor-pointer">
                    Patient Identity Verified
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="clinical_history"
                    checked={checklist.clinical_history_attached}
                    onCheckedChange={(checked) =>
                      handleChecklistChange("clinical_history_attached", checked as boolean)
                    }
                  />
                  <label htmlFor="clinical_history" className="text-sm font-medium cursor-pointer">
                    Clinical History Attached
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="vitals"
                    checked={checklist.vitals_included}
                    onCheckedChange={(checked) =>
                      handleChecklistChange("vitals_included", checked as boolean)
                    }
                  />
                  <label htmlFor="vitals" className="text-sm font-medium cursor-pointer">
                    Vitals Included
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="attachments"
                    checked={checklist.attachments_included}
                    onCheckedChange={(checked) =>
                      handleChecklistChange("attachments_included", checked as boolean)
                    }
                  />
                  <label htmlFor="attachments" className="text-sm font-medium cursor-pointer">
                    Attachments Included
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {canTakeAction && (
                <>
                  <Button
                    className="w-full"
                    onClick={() => setActionDialog({ type: "forward", reason: "" })}
                    disabled={isForwarding}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Approve and Dispatch
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setActionDialog({ type: "revise", reason: "" })}
                    disabled={isRevising}
                  >
                    <FileEdit className="h-4 w-4 mr-2" />
                    Request Revision
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setActionDialog({ type: "reject", reason: "" })}
                    disabled={isRejecting}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Referral
                  </Button>
                </>
              )}
              {canRejectAfterSend && !canTakeAction && (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setActionDialog({ type: "reject-after-send", reason: "" })}
                  disabled={isRejectingAfterSend}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Referral
                </Button>
              )}
              {!canTakeAction && !canRejectAfterSend && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No actions available for this referral status
                </p>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <Label className="text-muted-foreground">Created</Label>
                <p>{formatDate(referral.created_at)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Last Updated</Label>
                <p>{formatDate(referral.updated_at)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Referral ID</Label>
                <p className="font-mono text-xs">{referral.id}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Dialog */}
      <AlertDialog open={actionDialog.type !== null} onOpenChange={() => setActionDialog({ type: null, reason: "" })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog.type === "forward" && "Approve and Dispatch Referral"}
              {actionDialog.type === "reject" && "Reject Referral"}
              {actionDialog.type === "revise" && "Request Revision"}
              {actionDialog.type === "reject-after-send" && "Cancel Referral"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog.type === "forward" && "This will approve the referral and dispatch it to the receiving hospital. The referral will be cryptographically signed and transmitted securely."}
              {actionDialog.type === "reject" && "This will reject the referral and send it back to the referring doctor."}
              {actionDialog.type === "revise" && "This will send the referral back to the doctor for additional information."}
              {actionDialog.type === "reject-after-send" && "This will cancel the referral that has already been sent."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {(actionDialog.type === "reject" || actionDialog.type === "revise" || actionDialog.type === "reject-after-send") && (
            <div className="space-y-2">
              <Label htmlFor="reason">Reason {actionDialog.type === "reject" || actionDialog.type === "reject-after-send" ? "(Required)" : "(Optional)"}</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason..."
                value={actionDialog.reason}
                onChange={(e) => setActionDialog({ ...actionDialog, reason: e.target.value })}
                rows={4}
              />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              disabled={
                (actionDialog.type === "reject" || actionDialog.type === "reject-after-send") && !actionDialog.reason.trim()
              }
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
