"use client";

import { useMemo, useState } from "react";
import {
  RegionalWorkload,
  PerformanceMatrix,
  DiseaseHeatmap,
} from "@/components/analytics/AnalyticsDashboard";
import {
  useGetHospitalLoadQuery,
  useGetSeverityDistributionQuery,
} from "@/features/analytics/mohAnalyticsApi";
import {
  buildMohQueryParams,
  hospitalsFromLoad,
  mergeRegionOptions,
  safePercent,
  type MohTimeframe,
} from "@/lib/mohAnalytics";
import {
  mohIconBlue,
  mohIconGreen,
  mohIconIndigo,
  mohIconOrange,
  mohPageShell,
} from "@/lib/mohAnalyticsUi";
import { MohAnalyticsFilters } from "@/components/analytics/MohAnalyticsFilters";
import { MohQueryState } from "@/components/analytics/MohAnalyticsStates";
import {
  MapPin,
  Building2,
  Users,
  CheckCircle2,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export default function RegionalPage() {
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [timeframe, setTimeframe] = useState<MohTimeframe>("30days");
  const [tierLevel, setTierLevel] = useState("all");
  const [hospitalId, setHospitalId] = useState("all");

  const queryParams = useMemo(
    () =>
      buildMohQueryParams({
        timeframe,
        region: selectedRegion,
        tierLevel,
        hospitalId,
      }),
    [timeframe, selectedRegion, tierLevel, hospitalId],
  );

  const {
    data: hospitalLoadData,
    isLoading: loadLoading,
    isError: loadError,
    refetch: refetchLoad,
  } = useGetHospitalLoadQuery(queryParams);

  const {
    data: severityData,
    isLoading: severityLoading,
    isError: severityError,
    refetch: refetchSeverity,
  } = useGetSeverityDistributionQuery(queryParams);

  const regionOptions = useMemo(
    () =>
      mergeRegionOptions(
        hospitalLoadData?.data?.map((h) => h.region) ?? [],
      ),
    [hospitalLoadData],
  );

  const hospitalOptions = useMemo(
    () => hospitalsFromLoad(hospitalLoadData?.data ?? []),
    [hospitalLoadData],
  );

  const regionalStats = hospitalLoadData?.data?.reduce(
    (
      acc: Record<
        string,
        {
          hospitals: number;
          totalReferrals: number;
          totalAccepted: number;
          totalRejected: number;
          avgSeverity: number;
          acceptanceRate?: number;
        }
      >,
      hospital,
    ) => {
      if (!acc[hospital.region]) {
        acc[hospital.region] = {
          hospitals: 0,
          totalReferrals: 0,
          totalAccepted: 0,
          totalRejected: 0,
          avgSeverity: 0,
        };
      }
      acc[hospital.region].hospitals += 1;
      acc[hospital.region].totalReferrals += hospital.total_referrals_received;
      acc[hospital.region].totalAccepted += hospital.total_accepted;
      acc[hospital.region].totalRejected += hospital.total_rejected;
      acc[hospital.region].avgSeverity += hospital.average_severity_score;
      return acc;
    },
    {},
  );

  Object.keys(regionalStats || {}).forEach((region) => {
    const row = regionalStats![region];
    row.avgSeverity = row.avgSeverity / row.hospitals;
    row.acceptanceRate = safePercent(row.totalAccepted, row.totalReferrals);
  });

  const regions = Object.keys(regionalStats || {});
  const selectedRegionData =
    selectedRegion !== "all" && regionalStats?.[selectedRegion]
      ? regionalStats[selectedRegion]
      : null;

  return (
    <div className={mohPageShell}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Regional Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Regional healthcare performance and capacity distribution
          </p>
        </div>
        <MohAnalyticsFilters
          regionOptions={regionOptions}
          hospitalOptions={hospitalOptions}
          values={{
            timeframe,
            region: selectedRegion,
            tierLevel,
            hospitalId,
          }}
          onTimeframeChange={setTimeframe}
          onRegionChange={setSelectedRegion}
          onTierLevelChange={setTierLevel}
          onHospitalChange={setHospitalId}
          showTierLevel
          showHospital={hospitalOptions.length > 0}
        />
      </div>

      {selectedRegion !== "all" && selectedRegionData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-5 border border-border/40 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("p-2 rounded-lg", mohIconBlue)}>
                <Building2 className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase">
                Hospitals
              </p>
            </div>
            <p className="text-2xl font-bold">{selectedRegionData.hospitals}</p>
          </div>

          <div className="bg-card rounded-xl p-5 border border-border/40 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("p-2 rounded-lg", mohIconGreen)}>
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase">
                Total Referrals
              </p>
            </div>
            <p className="text-2xl font-bold">
              {selectedRegionData.totalReferrals.toLocaleString()}
            </p>
          </div>

          <div className="bg-card rounded-xl p-5 border border-border/40 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("p-2 rounded-lg", mohIconIndigo)}>
                <CheckCircle2 className="h-5 w-5 text-indigo-500" />
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase">
                Acceptance Rate
              </p>
            </div>
            <p className="text-2xl font-bold">
              {selectedRegionData.acceptanceRate?.toFixed(1) ?? 0}%
            </p>
          </div>

          <div className="bg-card rounded-xl p-5 border border-border/40 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("p-2 rounded-lg", mohIconOrange)}>
                <Activity className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase">
                Avg Severity
              </p>
            </div>
            <p className="text-2xl font-bold">
              {selectedRegionData.avgSeverity.toFixed(1)}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-6">
        <div className="xl:col-span-4 space-y-4 lg:space-y-6 min-w-0">
          <div className="min-h-[320px] lg:h-[400px]">
            <RegionalWorkload queryParams={queryParams} />
          </div>

          <div className="bg-card rounded-xl p-6 border border-border/40 shadow-sm">
            <h2 className="text-sm font-bold mb-6">Regional Comparison</h2>
            <MohQueryState
              isLoading={loadLoading}
              isError={loadError}
              isEmpty={!loadLoading && !loadError && regions.length === 0}
              onRetry={() => refetchLoad()}
            >
              <div className="space-y-4">
                {Object.entries(regionalStats || {})
                  .sort((a, b) => b[1].totalReferrals - a[1].totalReferrals)
                  .slice(0, 5)
                  .map(([region, stats]) => (
                    <div key={region} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-bold text-foreground">
                            {region}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-muted-foreground">
                          {stats.totalReferrals.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={stats.acceptanceRate ?? 0}
                          className="h-1.5 flex-1"
                        />
                        <span
                          className={cn(
                            "text-[10px] font-bold w-12 text-right",
                            (stats.acceptanceRate ?? 0) > 80
                              ? "text-green-500"
                              : (stats.acceptanceRate ?? 0) > 60
                                ? "text-orange-500"
                                : "text-red-500",
                          )}
                        >
                          {(stats.acceptanceRate ?? 0).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </MohQueryState>
          </div>
        </div>

        <div className="xl:col-span-5 min-w-0">
          <div className="min-h-[400px] lg:min-h-full">
            <PerformanceMatrix queryParams={queryParams} />
          </div>
        </div>

        <div className="xl:col-span-3 min-w-0">
          <div className="min-h-[400px] lg:h-[600px]">
            <DiseaseHeatmap queryParams={queryParams} />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 border border-border/40 shadow-sm">
        <h2 className="text-sm font-bold mb-6">Severity Distribution by Region</h2>
        <MohQueryState
          isLoading={severityLoading}
          isError={severityError}
          isEmpty={
            !severityLoading &&
            !severityError &&
            (severityData?.data?.length ?? 0) === 0
          }
          onRetry={() => refetchSeverity()}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {severityData?.data?.slice(0, 6).map((item) => {
              const total = item.total_referrals;
              const criticalPct = safePercent(item.critical_count, total);
              const urgentPct = safePercent(item.urgent_count, total);
              const routinePct = safePercent(item.routine_count, total);

              return (
                <div key={item.region} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-foreground">
                      {item.region}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {total} cases
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">Critical</span>
                      <span className="font-bold text-red-500">
                        {criticalPct.toFixed(0)}%
                      </span>
                    </div>
                    <Progress
                      value={criticalPct}
                      className="h-1.5 [&>div]:bg-red-500"
                    />

                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">Urgent</span>
                      <span className="font-bold text-orange-500">
                        {urgentPct.toFixed(0)}%
                      </span>
                    </div>
                    <Progress
                      value={urgentPct}
                      className="h-1.5 [&>div]:bg-orange-500"
                    />

                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">Routine</span>
                      <span className="font-bold text-green-500">
                        {routinePct.toFixed(0)}%
                      </span>
                    </div>
                    <Progress
                      value={routinePct}
                      className="h-1.5 [&>div]:bg-green-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </MohQueryState>
      </div>
    </div>
  );
}
