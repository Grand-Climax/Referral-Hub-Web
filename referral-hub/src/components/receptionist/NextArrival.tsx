"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetScheduleQuery, useMarkPatientArrivalMutation } from "@/features/receptionist/receptionistApi";
import { Loader2, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";
import { getReceptionistErrorMessage } from "@/lib/receptionistScopeError";
import { filterOperationalReferrals } from "@/lib/receptionistOperational";
import { useState } from "react";

export function NextArrival() {
  const { data: schedule, isLoading } = useGetScheduleQuery();
  const [markArrival, { isLoading: isMarking }] = useMarkPatientArrivalMutation();
  const [checkedInId, setCheckedInId] = useState<string | null>(null);

  const handleCheckIn = async (id: string) => {
    try {
      await markArrival(id).unwrap();
      setCheckedInId(id);
      toast.success("Patient checked in successfully");
    } catch (err: any) {
      toast.error(getReceptionistErrorMessage(err, "Failed to check in patient"));
    }
  };

  if (isLoading) {
    return (
      <Card className="border-none shadow-md overflow-hidden bg-white">
        <CardHeader className="py-5 sm:py-6 px-4 sm:px-6 pb-2">
          <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Next Arrival</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-6 sm:pb-8 flex flex-col items-center text-center justify-center min-h-[180px] sm:min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
        </CardContent>
      </Card>
    );
  }

  // Safely handle schedule data - ensure it's always an array
  const scheduleArray = filterOperationalReferrals(
    Array.isArray(schedule) ? schedule : [],
  );
  const pending = scheduleArray.filter((a) => a.arrival_status === "PENDING");
  const nextArrival = pending.length > 0 ? pending[0] : null;
  const nextId = nextArrival
    ? nextArrival.referral_id || nextArrival.id
    : null;
  const isCheckedIn = nextId != null && checkedInId === nextId;
  
  return (
    <Card className="border-none shadow-md overflow-hidden bg-white">
      <CardHeader className="py-5 sm:py-6 px-4 sm:px-6 pb-2">
        <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Next Arrival</CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-6 sm:pb-8 flex flex-col items-center text-center">
        {nextArrival ? (
          <>
            <div className="relative mb-4">
              <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 p-2">
                <Avatar className="h-12 w-12 rounded-lg">
                  <AvatarImage src="/placeholder-patient.png" alt="Patient" />
                  <AvatarFallback className="bg-primary/20 text-primary font-bold rounded-lg group-hover:scale-110 transition-transform">
                    {nextArrival.patient_first_name?.[0]}{nextArrival.patient_last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
              {!isCheckedIn && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full border-2 border-white shadow-sm animate-pulse" />
              )}
            </div>

            <div className="space-y-1 mb-4">
              <p className="text-base font-bold text-slate-900 tracking-tight">
                {nextArrival.patient_first_name} {nextArrival.patient_last_name}
              </p>
              <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-slate-400">
                <Clock className="h-3 w-3" />
                <span>{nextArrival.scheduled_time || "N/A"}</span>
              </div>
              {nextArrival.department_name && (
                <div className="flex items-center justify-center gap-1 text-[10px] font-medium text-slate-500">
                  <MapPin className="h-3 w-3" />
                  <span>{nextArrival.department_name}</span>
                </div>
              )}
            </div>

            {isCheckedIn ? (
              <div className="w-full p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs font-bold text-green-700">✓ Checked In</p>
                <p className="text-[10px] text-green-600 mt-1">Patient has arrived</p>
              </div>
            ) : nextArrival.arrival_status === "ARRIVED" || nextArrival.arrival_status === "ADMITTED" ? (
              <div className="w-full p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs font-bold text-green-700">
                  ✓ {nextArrival.arrival_status === "ADMITTED" ? "Already Admitted" : "Already Arrived"}
                </p>
              </div>
            ) : (
              <Button 
                onClick={() => nextId && handleCheckIn(nextId)}
                disabled={isMarking}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-[10px] tracking-widest py-5 h-auto rounded-lg shadow-sm disabled:opacity-50"
              >
                {isMarking ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin mr-2" />
                    CHECKING IN...
                  </>
                ) : (
                  "CHECK IN PATIENT"
                )}
              </Button>
            )}
          </>
        ) : (
          <>
            <div className="h-16 w-16 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-slate-300" />
            </div>
            <div className="space-y-1 mb-6">
              <p className="text-base font-bold text-slate-900 tracking-tight">
                No Scheduled Arrivals
              </p>
              <p className="text-[11px] font-medium text-slate-400">
                All clear for now
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
