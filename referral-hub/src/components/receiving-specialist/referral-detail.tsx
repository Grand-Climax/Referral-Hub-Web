'use client'

import React from "react";
import { Referral } from "@/types/referral";
import { MOCK_REFERRALS } from "@/data/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow, format } from "date-fns";
import {
  ChevronRight,
  Printer,
  Share2,
  User,
  Activity,
  FileText,
  Download,
  AlertCircle,
  BrainCircuit,
  CheckCircle2,
  XCircle,
  CornerUpRight,
  Clock,
  Plus,
  ChevronLeft
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";


const ReferralDetail = ({ referralId }: { referralId: string }) => {
  console.log(referralId);
  const referral = MOCK_REFERRALS.find((r) => r.id === referralId);

  if (!referral) {
    return <div className="p-6 text-center text-muted-foreground">Referral not found.</div>;
  }

  const { patient, vitals } = referral;

  // Fake DOB based on age
  const currentYear = new Date().getFullYear();
  const dobYear = currentYear - patient.age;
  const fakeDob = `May 14, ${dobYear}`;

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-12">
      {/* Top Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Link href="/receiving-specialist" className="flex items-center text-sm text-muted-foreground mb-2">
            
            <ChevronLeft className="h-4 w-4 mx-1" />
            <span className="font-medium text-foreground">Review: #{referral.id.replace("REF-", "")}</span>
          </Link>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              Patient #{patient.id.replace("p", "882")}: {patient.fullName}
            </h1>
            <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100 uppercase text-xs">
              {referral.status === "pending" ? "Pending Review" : referral.status}
            </Badge>
          </div>

          <div className="flex items-center text-sm text-muted-foreground mt-2">
            <Clock className="h-4 w-4 mr-1.5" />
            Submitted {formatDistanceToNow(new Date(referral.createdAt))} ago by {referral.referringDoctor} (Primary Care)
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="bg-background">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" className="bg-background">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="xl:col-span-2 space-y-6">
          {/* Patient Information Card */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6 text-lg font-semibold">
                <User className="h-5 w-5 text-blue-600" />
                Patient Information
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    Age / Gender
                  </p>
                  <p className="font-medium">
                    {patient.age} Years / {patient.sex === "M" ? "Male" : "Female"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    DOB
                  </p>
                  <p className="font-medium">{fakeDob}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    Phone
                  </p>
                  <p className="font-medium">{patient.phone || "(555) 123-4567"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    Insurance
                  </p>
                  <p className="font-medium">BlueCross Platinum</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clinical Overview Card */}
          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border bg-muted/20">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Activity className="h-5 w-5 text-blue-600" />
                Clinical Overview
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Referral ID: {referral.id}
              </Badge>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              {/* Vitals */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Latest Vitals (T-0H)
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-muted/40 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">BP</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold">{vitals.bp}</span>
                      {parseInt(vitals.bp.split('/')[0]) > 130 && (
                        <span className="text-xs font-medium text-orange-600">Elevated</span>
                      )}
                    </div>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">Heart Rate</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold">{vitals.heartRate} bpm</span>
                    </div>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">SpO2</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold">{vitals.oxygenSaturation}%</span>
                    </div>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">Temp</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold">{vitals.temperature} &deg;F</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reason for Referral */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Reason for Referral</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {referral.reasonForReferral}
                </p>
              </div>

              {/* Relevant Medical History */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Relevant Medical History</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {referral.clinicalHistory ? (
                    referral.clinicalHistory.split('. ').map((item, idx) => {
                      if (!item) return null;
                      return <li key={idx}>{item.trim()}{item.endsWith('.') ? '' : '.'}</li>;
                    })
                  ) : (
                    <li>No relevant medical history provided.</li>
                  )}
                </ul>
              </div>

              {/* Attached Documentation */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Attached Documentation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-background">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-md shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">Abdominal_Ultrasound_Report.pdf</p>
                        <p className="text-xs text-muted-foreground">2.4 MB &bull; May 12, 2024</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-foreground">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-background">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-md shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">Blood_Panel_Results_Complete.pdf</p>
                        <p className="text-xs text-muted-foreground">1.1 MB &bull; May 10, 2024</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-foreground">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Side Panels */}
        <div className="space-y-6">
          {/* ML Insights Card */}
          <Card className="border-blue-200 shadow-sm overflow-hidden bg-blue-50/30">
            <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold">
                <BrainCircuit className="h-5 w-5" />
                ML Insights
              </div>
              <Badge variant="secondary" className="bg-blue-500/30 hover:bg-blue-500/30 text-white border-0 text-[10px] uppercase tracking-wider">
                V2.4 Engine
              </Badge>
            </div>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                    Triage Severity
                  </p>
                  <p className={`text-3xl font-black ${referral.severityScore >= 80 ? 'text-blue-600' : 'text-blue-600'}`}>
                    {referral.severityScore >= 80 ? 'HIGH' : referral.severityScore >= 50 ? 'MEDIUM' : 'LOW'}
                  </p>
                </div>
                <div className="relative flex items-center justify-center w-16 h-16 rounded-full border-4 border-blue-500 bg-white shadow-sm">
                  <span className="text-xl font-bold text-blue-700">{referral.severityScore}</span>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm mb-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Key Findings
                </div>
                <ul className="text-xs text-slate-600 space-y-2">
                  <li className="flex items-start gap-1.5">
                    <span className="text-red-500 mt-1">&bull;</span>
                    High risk correlation between Ultrasound findings and comorbid Type 2 Diabetes.
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-red-500 mt-1">&bull;</span>
                    Blood panel indicates elevated CRP (12.4 mg/L) suggesting inflammation.
                  </li>
                </ul>
              </div>

              <p className="text-[11px] text-center text-slate-500 font-medium italic">
                AI generated suggestion. Please verify clinically.
              </p>
            </CardContent>
          </Card>

          {/* Decision Panel */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-4 border-b border-border bg-muted/20">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <CheckCircle2 className="h-5 w-5 text-slate-700" />
                Decision Panel
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Assign Department
                </label>
                <Select defaultValue={referral.requiredSpecialty.toLowerCase()}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={referral.requiredSpecialty.toLowerCase()}>
                      {referral.requiredSpecialty} (Recommended)
                    </SelectItem>
                    <SelectItem value="general-surgery">General Surgery</SelectItem>
                    <SelectItem value="internal-medicine">Internal Medicine</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold h-11 gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Accept Referral
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 gap-2">
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
                <Button variant="outline" className="gap-2">
                  <CornerUpRight className="h-4 w-4" />
                  Redirect
                </Button>
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Reason for Rejection / Redirect
                </label>
                <Textarea 
                  placeholder="Provide clinical justification..."
                  className="resize-none h-20 bg-background"
                />
              </div>

              <div className="bg-muted/30 rounded-lg p-3 border border-border">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                  Redirect Destination
                </label>
                <Select>
                  <SelectTrigger className="bg-background">
                    <div className="flex items-center gap-2">
                      <div className="bg-muted text-muted-foreground rounded p-0.5">
                        <Plus className="h-3 w-3" />
                      </div>
                      <span>St. Mary's General Hospital</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="st-marys">St. Mary's General Hospital</SelectItem>
                    <SelectItem value="regional-clinic">Regional Clinic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full bg-blue-400 hover:bg-blue-500 text-white font-medium" disabled>
                Submit Decision
              </Button>
            </CardContent>
          </Card>

          {/* Lifecycle Tracking */}
          <div className="p-6">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-center mb-6">
              Referral Lifecycle
            </h3>
            
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-blue-500 before:to-muted">
              {/* Step 1 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-emerald-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
                <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] pl-3 md:pl-0 md:group-odd:pr-3 md:group-even:pl-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">Referral Submitted</span>
                    <span className="text-[10px] text-muted-foreground">Today, 09:12 AM</span>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <div className="h-2 w-2 bg-white rounded-sm animate-pulse" />
                </div>
                <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] pl-3 md:pl-0 md:group-odd:pr-3 md:group-even:pl-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">Specialist Review</span>
                    <span className="text-[10px] text-muted-foreground italic">In progress...</span>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-muted shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <div className="h-2 w-2 rounded-full border border-muted-foreground" />
                </div>
                <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] pl-3 md:pl-0 md:group-odd:pr-3 md:group-even:pl-3 opacity-50">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">Patient Notified</span>
                    <span className="text-[10px] text-muted-foreground">Pending decision</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ReferralDetail;
