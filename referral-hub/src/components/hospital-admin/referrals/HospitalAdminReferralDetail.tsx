"use client";

import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useGetReferralByIdQuery,
  useGetReferralStatusHistoryQuery,
} from "@/features/hospitalAdmin/hospitalAdminApi";

export function HospitalAdminReferralDetail({ referralId }: { referralId: string }) {
  const { data: referral, isLoading, error } = useGetReferralByIdQuery(referralId);
  const { data: history = [], isLoading: historyLoading } =
    useGetReferralStatusHistoryQuery(referralId);

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
      </div>
    );
  }

  if (error || !referral) {
    return (
      <div className="mx-auto max-w-2xl p-8 text-center">
        <p className="text-red-600">Could not load referral details.</p>
        <Link href="/hospital-admin/referrals" className="mt-4 inline-block">
          <Button variant="outline">Back to referrals</Button>
        </Link>
      </div>
    );
  }

  const patient = referral.patient;
  const patientName = patient
    ? [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean).join(" ")
    : "Unknown patient";

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-8">
      <div className="flex items-start gap-3">
        <Link href="/hospital-admin/referrals">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Referral details</h1>
          <p className="text-sm text-muted-foreground">ID: {referral.id}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <span>{patientName}</span>
            <Badge>{referral.status}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
          <div>
            <p className="text-muted-foreground">Created</p>
            <p className="font-medium">
              {referral.created_at
                ? new Date(referral.created_at).toLocaleString()
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Updated</p>
            <p className="font-medium">
              {referral.updated_at
                ? new Date(referral.updated_at).toLocaleString()
                : "—"}
            </p>
          </div>
          {referral.referral_form?.clinical_summary && (
            <div className="sm:col-span-2">
              <p className="text-muted-foreground">Clinical summary</p>
              <p className="font-medium whitespace-pre-wrap">
                {referral.referral_form.clinical_summary}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status history</CardTitle>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
          ) : history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No status history recorded.</p>
          ) : (
            <div className="space-y-3">
              {history.map((item, idx) => (
                <div key={item.history_id ?? idx} className="rounded-lg border p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px]">
                        {item.from_status.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-muted-foreground">→</span>
                      <Badge className="text-[10px]">
                        {item.to_status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {item.created_at.includes("T")
                        ? new Date(item.created_at).toLocaleString()
                        : new Date(item.created_at.replace(" ", "T")).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    Changed by: <span className="font-mono">{item.changed_by_id}</span>
                    {item.role ? ` (${item.role})` : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
