"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SPECIALTIES, HOSPITALS } from "@/data/mock";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const CreateReferral = () => {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Referral submitted successfully!", {
      description: "Your referral has been sent for admin approval.",
    });
    router.push("/referrals");
  };

  return (
    <div className="mx-auto space-y-6">
      <div className="flex space-x-3 items-center">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Create New Referral
          </h1>
          <p className="text-sm text-muted-foreground">
            Fill in patient details and referral information
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input placeholder="Patient full name" required />
              </div>
              <div className="space-y-2">
                <Label>MRN</Label>
                <Input placeholder="Medical Record Number" required />
              </div>
              <div className="space-y-2">
                <Label>Age</Label>
                <Input type="number" placeholder="Age" required />
              </div>
              <div className="space-y-2">
                <Label>Sex</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Phone</Label>
                <Input placeholder="+251..." />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vitals */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Vitals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Blood Pressure</Label>
                <Input placeholder="e.g. 120/80" />
              </div>
              <div className="space-y-2">
                <Label>Heart Rate</Label>
                <Input type="number" placeholder="bpm" />
              </div>
              <div className="space-y-2">
                <Label>Temperature</Label>
                <Input type="number" step="0.1" placeholder="°C" />
              </div>
              <div className="space-y-2">
                <Label>Respiratory Rate</Label>
                <Input type="number" placeholder="/min" />
              </div>
              <div className="space-y-2">
                <Label>O₂ Saturation</Label>
                <Input type="number" placeholder="%" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clinical Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Clinical Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Reason for Referral</Label>
              <Textarea
                placeholder="Describe why this patient needs referral..."
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Clinical History</Label>
              <Textarea
                placeholder="Relevant past medical history..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Provisional Diagnosis</Label>
              <Input placeholder="e.g. Acute Coronary Syndrome" required />
            </div>
          </CardContent>
        </Card>

        {/* Referral Destination */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Referral Destination</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Required Specialty</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALTIES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Receiving Hospital</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    {HOSPITALS.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit">Submit Referral</Button>
        </div>
      </form>
    </div>
  );
};

export default CreateReferral;
