"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useGetScheduleQuery } from "@/features/receptionist/receptionistApi";

export function StatsCards() {
  const { data: schedule = [], isLoading } = useGetScheduleQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden border border-slate-200 shadow-sm bg-white">
            <CardContent className="p-4 sm:p-6 flex items-center justify-center min-h-[108px] sm:min-h-[120px]">
              <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const expectedToday = schedule.length;
  const admitted = schedule.filter((item) => item.arrival_status === "ARRIVED").length;
  const missed = schedule.filter((item) => item.arrival_status === "MISSED").length;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      {/* Expected Today Card */}
      <Card className="overflow-hidden border border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Expected Today
              </p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">{expectedToday.toString().padStart(2, '0')}</h2>
                <span className="text-sm font-medium text-green-600">Scheduled</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admitted Card */}
      <Card className="overflow-hidden border border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Admitted
              </p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl sm:text-4xl font-bold text-green-600">{admitted.toString().padStart(2, '0')}</h2>
                <span className="text-sm font-medium text-slate-500">Checked In</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Missed Card */}
      <Card className="overflow-hidden border border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Missed
              </p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl sm:text-4xl font-bold text-red-600">{missed.toString().padStart(2, '0')}</h2>
                <span className="text-sm font-medium text-slate-500">No Show</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-red-50 flex items-center justify-center">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
