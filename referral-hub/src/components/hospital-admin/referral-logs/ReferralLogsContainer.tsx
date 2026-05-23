'use client';

import React, { useCallback, useMemo } from 'react';
import { ReferralLogsHeader } from './ReferralLogsHeader';
import { ReferralLogsStats } from './ReferralLogsStats';
import { ReferralLogsFilters } from './ReferralLogsFilters';
import { ReferralReportsContent } from './ReferralReportsContent';
import {
  useGetAcceptanceRejectionRateQuery,
  useGetAverageWaitTimeQuery,
  useGetBusiestDepartmentsQuery,
  useGetMissedAppointmentRateQuery,
  useGetMonthlyReferralsQuery,
  useGetTopReferringHospitalsQuery,
} from '@/features/hospitalAdmin/hospitalAdminApi';

export const ReferralLogsContainer = () => {
  const acceptanceRejection = useGetAcceptanceRejectionRateQuery();
  const averageWait = useGetAverageWaitTimeQuery();
  const missedAppointment = useGetMissedAppointmentRateQuery();
  const monthly = useGetMonthlyReferralsQuery();
  const hospitals = useGetTopReferringHospitalsQuery();
  const busiest = useGetBusiestDepartmentsQuery();

  const statsLoading =
    acceptanceRejection.isLoading ||
    averageWait.isLoading ||
    missedAppointment.isLoading;

  const reportsLoading =
    monthly.isLoading || hospitals.isLoading || busiest.isLoading;

  const reportsError = monthly.isError || hospitals.isError || busiest.isError;

  const exportPayload = useMemo(
    () => ({
      acceptance_rejection: acceptanceRejection.data,
      average_wait_time: averageWait.data,
      missed_appointment: missedAppointment.data,
      monthly_referrals: monthly.data,
      top_referring_hospitals: hospitals.data,
      busiest_departments: busiest.data,
      exported_at: new Date().toISOString(),
    }),
    [
      acceptanceRejection.data,
      averageWait.data,
      missedAppointment.data,
      monthly.data,
      hospitals.data,
      busiest.data,
    ],
  );

  const exportReports = useCallback(() => {
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hospital-referral-reports-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportPayload]);

  return (
    <div className="mx-auto min-h-screen bg-slate-50/30 dark:bg-transparent">
      <ReferralLogsHeader
        onExportReports={exportReports}
        disabledExport={statsLoading && reportsLoading}
      />
      <ReferralLogsFilters />
      <ReferralLogsStats
        acceptanceRejection={acceptanceRejection.data}
        averageWait={averageWait.data}
        missedAppointment={missedAppointment.data}
        isLoading={statsLoading}
      />
      <ReferralReportsContent
        monthly={monthly.data}
        hospitals={hospitals.data}
        departments={busiest.data}
        isLoading={reportsLoading}
        isError={reportsError}
      />
    </div>
  );
};
