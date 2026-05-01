"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Check, AlertCircle, Loader2 } from "lucide-react";
import { useGetReferralsQuery } from "@/features/receptionist/receptionistApi";

export function StatsCards() {
  const { data, isLoading } = useGetReferralsQuery({ limit: 100 });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden border-none shadow-md bg-white">
            <CardContent className="p-6 flex items-center justify-center min-h-[104px]">
              <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const referrals = data?.data || [];
  const expectedToday = referrals.length;
  const admitted = referrals.filter(r => r.status === "ARRIVED").length;
  const missed = referrals.filter(r => r.status === "MISSED").length;
  return (
    <div className="flex flex-col gap-4">
      {/* Total Expected Card */}
      <Card className="overflow-hidden border-none shadow-md bg-primary">
        <CardContent className="p-6">
          <div className="space-y-4">
            <p className="text-[10px] font-bold tracking-widest text-primary-foreground/80 uppercase">
              TOTAL EXPECTED TODAY
            </p>
            <h2 className="text-4xl font-bold text-primary-foreground">{expectedToday.toString().padStart(2, '0')}</h2>
          </div>
        </CardContent>
      </Card>

      {/* Admitted Card */}
      <Card className="overflow-hidden border-none shadow-md bg-white">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              ADMITTED
            </p>
            <h2 className="text-2xl font-bold text-slate-900">{admitted.toString().padStart(2, '0')}</h2>
          </div>
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="h-6 w-6 text-green-600" />
          </div>
        </CardContent>
      </Card>

      {/* Missed Arrivals Card */}
      <Card className="overflow-hidden border-none shadow-md bg-white">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              MISSED ARRIVALS
            </p>
            <h2 className="text-2xl font-bold text-slate-900">{missed.toString().padStart(2, '0')}</h2>
          </div>
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
