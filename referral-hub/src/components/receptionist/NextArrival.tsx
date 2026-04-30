"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetScheduleQuery } from "@/features/receptionist/receptionistApi";
import { Loader2 } from "lucide-react";

export function NextArrival() {
  const { data: schedule, isLoading } = useGetScheduleQuery();

  if (isLoading) {
    return (
      <Card className="border-none shadow-md overflow-hidden bg-white">
        <CardHeader className="py-6 px-6 pb-2">
          <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Next Arrival</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-8 flex flex-col items-center text-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
        </CardContent>
      </Card>
    );
  }

  const nextArrival = schedule && schedule.length > 0 ? schedule[0] : null;
  return (
    <Card className="border-none shadow-md overflow-hidden bg-white">
      <CardHeader className="py-6 px-6 pb-2">
        <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Next Arrival</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-8 flex flex-col items-center text-center">
        <div className="relative mb-4">
          <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 p-2">
            <Avatar className="h-12 w-12 rounded-lg">
              <AvatarImage src="/placeholder-doctor.png" alt="Doctor" />
              <AvatarFallback className="bg-primary/20 text-primary font-bold rounded-lg group-hover:scale-110 transition-transform">HV</AvatarFallback>
            </Avatar>
          </div>
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full border-2 border-white shadow-sm" />
        </div>

        <div className="space-y-1 mb-6">
          <p className="text-base font-bold text-slate-900 tracking-tight">
            {nextArrival ? nextArrival.patient_name : "No Scheduled Arrivals"}
          </p>
          <p className="text-[11px] font-medium text-slate-400">
            {nextArrival ? `Scheduled for ${nextArrival.time}` : "All clear for now"}
          </p>
        </div>

        <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-[10px] tracking-widest py-5 h-auto rounded-lg shadow-sm">
          NOTIFY DOCTOR
        </Button>
      </CardContent>
    </Card>
  );
}
