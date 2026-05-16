"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useGetReferralsQuery } from "@/features/receptionist/receptionistApi";
import { useMemo } from "react";

export function DeptCapacity() {
  // Fetch all referrals to calculate today's summary
  const { data: referralsData, isLoading } = useGetReferralsQuery({ 
    page: 1, 
    limit: 1000,
  });

  // Calculate today's statistics
  const todayStats = useMemo(() => {
    if (!referralsData?.data || referralsData.data.length === 0) {
      return {
        total: 0,
        pending: 0,
        arrived: 0,
        missed: 0,
        urgent: 0,
      };
    }

    const today = new Date().toISOString().split('T')[0];
    
    const stats = {
      total: 0,
      pending: 0,
      arrived: 0,
      missed: 0,
      urgent: 0,
    };

    referralsData.data.forEach((referral) => {
      // Count all referrals
      stats.total += 1;
      
      // Count by arrival status
      if (referral.arrival_status === 'PENDING') stats.pending += 1;
      if (referral.arrival_status === 'ARRIVED') stats.arrived += 1;
      if (referral.arrival_status === 'MISSED') stats.missed += 1;
      
      // Count urgent cases
      if (referral.urgency === 'URGENT' || referral.urgency === 'HIGH' || referral.urgency === 'EMERGENCY') {
        stats.urgent += 1;
      }
    });

    return stats;
  }, [referralsData]);

  return (
    <Card className="border-none shadow-md overflow-hidden bg-white mb-6">
      <CardHeader className="flex flex-row items-center justify-between py-6 px-6 pb-2">
        <CardTitle className="text-sm font-bold text-slate-700 tracking-tight">Today's Summary</CardTitle>
        <ClipboardList className="h-4 w-4 text-slate-400" />
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin mb-2" />
            <p className="text-xs">Loading summary...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Total Patients */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ClipboardList className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Total Patients</p>
                  <p className="text-xl font-bold text-slate-900">{todayStats.total}</p>
                </div>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="space-y-3">
              {/* Pending */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-xs font-medium text-slate-600">Pending</span>
                </div>
                <span className="text-sm font-bold text-blue-600">{todayStats.pending}</span>
              </div>

              {/* Arrived */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-xs font-medium text-slate-600">Arrived</span>
                </div>
                <span className="text-sm font-bold text-green-600">{todayStats.arrived}</span>
              </div>

              {/* Missed */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-xs font-medium text-slate-600">Missed</span>
                </div>
                <span className="text-sm font-bold text-red-600">{todayStats.missed}</span>
              </div>
            </div>

            {/* Urgent Cases Alert */}
            {todayStats.urgent > 0 && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse" />
                  <p className="text-xs font-bold text-orange-700">
                    {todayStats.urgent} Urgent {todayStats.urgent === 1 ? 'Case' : 'Cases'}
                  </p>
                </div>
                <p className="text-[10px] text-orange-600 mt-1">
                  Requires immediate attention
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
