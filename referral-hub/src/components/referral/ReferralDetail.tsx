'use client'
import { MOCK_REFERRALS } from "@/data/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Heart, FileText, Building2, MessageSquare } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ROLE_LABELS } from "@/types/referral";
import { StatusBadge } from "../StatusBadge";
import { PriorityIndicator } from "../PriorityIndicator";
import { ApprovalActions } from "../ApprovalActions";
import { useRouter } from "next/navigation";

const ReferralDetail = ({id}: {id: string}) => {
    const router = useRouter();
  const referral = MOCK_REFERRALS.find((r) => r.id === id);
    console.log(referral, id);
  if (!referral) {
    return (
      <div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Referral not found</p>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>Go back</Button>
        </div>
      </div>
    );
  }

  const showActions = "hospital_admin" 

  return (
    <div>
      <div className="mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-foreground">{referral.id}</h1>
              <StatusBadge status={referral.status} />
              <PriorityIndicator severity={referral.severity} score={referral.severityScore} />
            </div>
            <p className="text-sm text-muted-foreground">{referral.patient.fullName}</p>
          </div>
          {showActions && (
            <ApprovalActions
              onApprove={() => toast.success("Approved")}
              onReject={() => toast.error("Rejected")}
              onForward={() => toast.info("Forwarded")}
            />
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Patient Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4" /> Patient Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{referral.patient.fullName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Age / Sex</span><span>{referral.patient.age} / {referral.patient.sex}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">MRN</span><span className="font-mono">{referral.patient.mrn}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span>{referral.patient.phone}</span></div>
            </CardContent>
          </Card>

          {/* Vitals */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Heart className="h-4 w-4" /> Vitals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">BP</span><span>{referral.vitals.bp}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Heart Rate</span><span>{referral.vitals.heartRate} bpm</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Temperature</span><span>{referral.vitals.temperature}°C</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Resp. Rate</span><span>{referral.vitals.respiratoryRate}/min</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">O₂ Sat</span><span>{referral.vitals.oxygenSaturation}%</span></div>
            </CardContent>
          </Card>

          {/* Clinical Details */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" /> Clinical Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs mb-1">Provisional Diagnosis</p>
                <p className="font-medium">{referral.provisionalDiagnosis}</p>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground text-xs mb-1">Reason for Referral</p>
                <p>{referral.reasonForReferral}</p>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground text-xs mb-1">Clinical History</p>
                <p>{referral.clinicalHistory}</p>
              </div>
            </CardContent>
          </Card>

          {/* Referral Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4" /> Referral Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">From</span><span>{referral.referringHospital}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Doctor</span><span>{referral.referringDoctor}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">To</span><span>{referral.receivingHospital}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Specialty</span><span>{referral.requiredSpecialty}</span></div>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Comments ({referral.comments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {referral.comments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No comments yet</p>
              ) : (
                <div className="space-y-3">
                  {referral.comments.map((c) => (
                    <div key={c.id} className="text-sm border-l-2 border-primary/30 pl-3">
                      <p className="font-medium">{c.author} <span className="text-xs text-muted-foreground font-normal">({ROLE_LABELS[c.role]})</span></p>
                      <p className="text-muted-foreground">{c.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReferralDetail;
