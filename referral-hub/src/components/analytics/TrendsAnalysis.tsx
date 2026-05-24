"use client";

import React, { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Calendar,
  ChevronRight,
  AlertTriangle,
  TrendingUp,
  Activity,
  Zap,
  FlaskConical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetReferralTrendsQuery,
  useGetDashboardSummaryQuery,
  useGetDiseaseHotspotsQuery,
} from "@/features/analytics/mohAnalyticsApi";
import {
  buildMohQueryParams,
  getMohDateRange,
  mergeRegionOptions,
  safePercent,
  uniqueDepartmentsFromHotspots,
  type MohGranularity,
} from "@/lib/mohAnalytics";
import {
  mohCard,
  mohCardPad,
  mohChartGridStroke,
  mohChartTickFill,
  mohHeading,
  mohMetricTile,
  mohPageShell,
  mohSubheading,
} from "@/lib/mohAnalyticsUi";
import { MohAnalyticsFilters } from "@/components/analytics/MohAnalyticsFilters";
import { MohQueryState } from "@/components/analytics/MohAnalyticsStates";
import type { MohDashboardSummary } from "@/types/moh-analytics";

const months = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

const MetricCard = ({
  label,
  value,
  isLoading,
}: {
  label: string;
  value: string;
  isLoading?: boolean;
}) => {
  if (isLoading) {
    return (
      <div className={cn(mohMetricTile, "animate-pulse")}>
        <div className="h-3 bg-muted rounded w-20 mb-2" />
        <div className="h-6 bg-muted rounded w-16" />
      </div>
    );
  }

  return (
    <div className={cn(mohMetricTile)}>
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-xl font-black text-foreground">{value}</p>
    </div>
  );
};

const AlertsList = ({ summaryData }: { summaryData?: MohDashboardSummary }) => (
  <div className="space-y-3">
    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex gap-3 items-start">
      <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
      <p className="text-xs font-bold text-foreground leading-tight">
        Referral volume is{" "}
        {(summaryData?.total_referrals ?? 0) > 1000 ? "elevated" : "within typical range"}{" "}
        for the selected period.
      </p>
    </div>
    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex gap-3 items-start">
      <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
      <p className="text-xs font-bold text-foreground leading-tight">
        Acceptance rate at {summaryData?.acceptance_rate_percentage?.toFixed(1) || 0}%
        nationally.
      </p>
    </div>
  </div>
);

function HeatmapGrid({
  seasonalityMatrix,
}: {
  seasonalityMatrix: { year: string; data: number[] }[];
}) {
  if (seasonalityMatrix.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">
        Insufficient monthly data for seasonality (use monthly granularity).
      </div>
    );
  }

  const maxValue = Math.max(...seasonalityMatrix.flatMap((row) => row.data), 1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-13 gap-1">
        <div className="col-span-1" />
        {months.map((m) => (
          <div key={m} className="text-[9px] font-bold text-muted-foreground text-center">
            {m}
          </div>
        ))}
      </div>
      {seasonalityMatrix.map((row) => (
        <div key={row.year} className="grid grid-cols-13 gap-1 h-8 items-center">
          <div className="text-[10px] font-bold text-muted-foreground">{row.year}</div>
          {row.data.map((val, i) => {
            const intensity = safePercent(val, maxValue);
            let color = "bg-blue-500/15";
            if (intensity > 25) color = "bg-blue-500/35";
            if (intensity > 50) color = "bg-blue-500/60";
            if (intensity > 75) color = "bg-blue-500/90";

            return (
              <div
                key={`${row.year}-${i}`}
                className={cn(
                  "h-full rounded-sm transition-all hover:ring-2 hover:ring-primary/20 cursor-help relative group",
                  color,
                )}
                title={`${months[i]} ${row.year}: ${val} referrals`}
              >
                <div className="absolute hidden group-hover:block bg-popover text-popover-foreground border border-border text-[9px] px-2 py-1 rounded shadow-lg -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap z-50">
                  {val} referrals
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function TrendsAnalysis() {
  const [granularity, setGranularity] = useState<MohGranularity>("month");
  const [region, setRegion] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const range = getMohDateRange("year");
  const queryParams = buildMohQueryParams({
    from: range.from,
    to: range.to,
    region,
    granularity,
  });

  const monthlyParams = buildMohQueryParams({
    from: range.from,
    to: range.to,
    region,
    granularity: "month",
  });

  const {
    data: trendsData,
    isLoading: trendsLoading,
    isError: trendsError,
    refetch: refetchTrends,
  } = useGetReferralTrendsQuery(queryParams);

  const { data: monthlyTrendsData } = useGetReferralTrendsQuery(monthlyParams);

  const {
    data: summaryData,
    isLoading: summaryLoading,
    isError: summaryError,
    refetch: refetchSummary,
  } = useGetDashboardSummaryQuery(queryParams);

  const { data: hotspotsData } = useGetDiseaseHotspotsQuery(queryParams);

  const departmentOptions = useMemo(() => {
    const all = hotspotsData?.data?.map((h) => h.department_name) ?? [];
    return uniqueDepartmentsFromHotspots(all);
  }, [hotspotsData]);

  const regionOptions = useMemo(
    () =>
      mergeRegionOptions(hotspotsData?.data?.map((h) => h.region) ?? []),
    [hotspotsData],
  );

  const filteredHotspots = useMemo(() => {
    const rows = hotspotsData?.data ?? [];
    if (departmentFilter === "all") return rows;
    return rows.filter((h) => h.department_name === departmentFilter);
  }, [hotspotsData, departmentFilter]);

  const longitudinalData =
    trendsData?.data?.map((item) => ({
      name: item.period,
      total: item.total_referrals,
      accepted: item.accepted_referrals,
      rejected: item.rejected_referrals,
      emergency: item.emergency_referrals,
    })) ?? [];

  const totalReferrals = summaryData?.total_referrals || 0;
  const peakVolume = Math.max(
    ...(trendsData?.data?.map((d) => d.total_referrals) || [0]),
  );
  const avgTurnaround = summaryData?.average_turnaround_hours || 0;

  const seasonalityMatrix = useMemo(() => {
    const source = monthlyTrendsData?.data ?? [];
    if (source.length === 0) return [];

    const monthlyData: Record<string, number[]> = {};

    source.forEach((item) => {
      const date = new Date(item.period);
      if (Number.isNaN(date.getTime())) return;
      const month = date.getMonth();
      const year = String(date.getFullYear());
      if (!monthlyData[year]) {
        monthlyData[year] = new Array(12).fill(0);
      }
      monthlyData[year][month] += item.total_referrals;
    });

    return Object.entries(monthlyData)
      .map(([year, data]) => ({ year, data }))
      .sort((a, b) => parseInt(b.year, 10) - parseInt(a.year, 10))
      .slice(0, 2);
  }, [monthlyTrendsData]);

  const calculateProjection = () => {
    const data = trendsData?.data ?? [];
    if (data.length < 3) {
      return { projected: totalReferrals, growthRate: 0, confidence: 0 };
    }

    const recentData = data.slice(-3);
    const avgRecent =
      recentData.reduce((sum, d) => sum + d.total_referrals, 0) / recentData.length;
    const trend = recentData[2].total_referrals - recentData[0].total_referrals;
    const growthRate = safePercent(
      recentData[2].total_referrals - recentData[0].total_referrals,
      recentData[0].total_referrals,
    );

    return {
      projected: Math.round(avgRecent + trend / 2),
      growthRate: growthRate / 2,
      confidence: Math.min(95, 70 + recentData.length * 5),
    };
  };

  const projection = calculateProjection();

  return (
    <div className={mohPageShell}>
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 lg:gap-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase mb-1">
            <span>Analytics</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary/80">Trends Analysis</span>
          </div>
          <h1 className={cn(mohHeading, "font-black uppercase")}>
            Health Indicator Longitudinal Study
          </h1>
          <p className={cn(mohSubheading, "max-w-2xl mt-1")}>
            National referral trends from aggregated API data (last 12 months).
          </p>
        </div>
        <div className="flex flex-col items-stretch sm:items-end gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-3 px-4 py-2 bg-card rounded-xl border border-border shadow-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-black text-foreground">Last 12 Months</span>
          </div>
          <MohAnalyticsFilters
            regionOptions={regionOptions}
            values={{
              timeframe: "year",
              region,
              tierLevel: "all",
              hospitalId: "all",
              granularity,
            }}
            onTimeframeChange={() => {}}
            onRegionChange={setRegion}
            showTimeframe={false}
            showGranularity
            onGranularityChange={setGranularity}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-6">
        <div className="xl:col-span-8 flex flex-col gap-4 lg:gap-6 min-w-0">
          <div className={cn(mohCard, mohCardPad, "flex flex-col min-w-0")}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-black text-foreground">
                  Total Referrals Longitudinal
                </h2>
                <p className="text-xs text-muted-foreground">
                  Nationwide volume with accepted, rejected, and emergency breakdown
                </p>
              </div>
            </div>

            <MohQueryState
              isLoading={trendsLoading}
              isError={trendsError}
              isEmpty={!trendsLoading && !trendsError && longitudinalData.length === 0}
              onRetry={() => refetchTrends()}
              loadingClassName="h-[320px]"
              className="h-[320px] mb-8"
            >
              <div className="h-[320px] w-full mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={longitudinalData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={mohChartGridStroke} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 9, fill: mohChartTickFill, fontWeight: 700 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: mohChartTickFill, fontWeight: 700 }}
                    />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Area
                      type="monotone"
                      dataKey="total"
                      name="Total"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fill="url(#colorTotal)"
                    />
                    <Area
                      type="monotone"
                      dataKey="accepted"
                      name="Accepted"
                      stroke="#22c55e"
                      strokeWidth={2}
                      fill="transparent"
                    />
                    <Area
                      type="monotone"
                      dataKey="rejected"
                      name="Rejected"
                      stroke="#ef4444"
                      strokeWidth={2}
                      fill="transparent"
                    />
                    <Area
                      type="monotone"
                      dataKey="emergency"
                      name="Emergency"
                      stroke="#f97316"
                      strokeWidth={2}
                      fill="transparent"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </MohQueryState>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                label="Total Referrals"
                value={totalReferrals.toLocaleString()}
                isLoading={summaryLoading}
              />
              <MetricCard
                label="Peak Volume"
                value={peakVolume.toLocaleString()}
                isLoading={trendsLoading}
              />
              <div className={cn(mohMetricTile, "overflow-hidden")}>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                  Acceptance Rate
                </p>
                <div className="flex items-end justify-between gap-4">
                  <p className="text-xl font-black text-foreground">
                    {summaryData?.acceptance_rate_percentage?.toFixed(1) || 0}%
                  </p>
                  <Progress
                    value={summaryData?.acceptance_rate_percentage || 0}
                    className="h-1.5 flex-1"
                  />
                </div>
              </div>
              <MetricCard
                label="Mean Wait"
                value={`${avgTurnaround.toFixed(1)} hrs`}
                isLoading={summaryLoading}
              />
            </div>
          </div>

          <div className={cn(mohCard, mohCardPad, "flex flex-col flex-1 min-w-0")}>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4">
              <div>
                <h2 className="text-lg font-black text-foreground">
                  Referral Concentration by Department
                </h2>
                <p className="text-xs text-muted-foreground">
                  From disease hotspots API (region × department)
                </p>
              </div>
              {departmentOptions.length > 0 && (
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] bg-card border-border rounded-lg h-9 text-xs font-bold">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All departments</SelectItem>
                    {departmentOptions.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            {granularity !== "month" && (
              <p className="text-[10px] text-amber-800 dark:text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 mb-4">
                Seasonality heatmap below uses monthly aggregates regardless of chart
                granularity.
              </p>
            )}
            <div className="mb-6 max-h-40 overflow-y-auto space-y-2">
              {filteredHotspots.slice(0, 8).map((row, idx) => (
                <div
                  key={`${row.region}-${row.department_name}-${idx}`}
                  className="flex justify-between text-xs border-b border-border pb-1 gap-2"
                >
                  <span className="font-medium text-foreground truncate">
                    {row.region} · {row.department_name}
                  </span>
                  <span className="font-bold">{row.referral_count} referrals</span>
                </div>
              ))}
              {filteredHotspots.length === 0 && (
                <p className="text-xs text-muted-foreground">No hotspot rows for current filters.</p>
              )}
            </div>
            <HeatmapGrid seasonalityMatrix={seasonalityMatrix} />
          </div>
        </div>

        <div className="xl:col-span-4 flex flex-col gap-4 lg:gap-6 min-w-0">
          <div className="bg-muted rounded-2xl p-6 sm:p-8 text-foreground flex flex-col shadow-lg relative overflow-hidden border border-border">
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Period projection (estimated)
              </h2>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-[10px] text-muted-foreground mb-4 relative z-10">
              Simple estimate from the last three periods in referral-trends data—not a
              separate ML service.
            </p>
            <div className="space-y-6 relative z-10">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                  Projected next period
                </p>
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-black tracking-tighter">
                    {projection.projected.toLocaleString()}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-bold pb-1.5",
                      projection.growthRate > 0 ? "text-blue-400" : "text-red-400",
                    )}
                  >
                    {projection.growthRate > 0 ? "+" : ""}
                    {projection.growthRate.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">
                    Estimate confidence
                  </span>
                  <span className="text-[10px] font-black">
                    {projection.confidence.toFixed(1)}%
                  </span>
                </div>
                <Progress value={projection.confidence} className="h-1.5" />
              </div>
            </div>
          </div>

          <div className={cn(mohCard, "p-4 sm:p-6 flex flex-col")}>
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="h-4 w-4 text-blue-500" />
              <h2 className="text-sm font-black text-foreground uppercase">
                Strategic Insights
              </h2>
            </div>
            {summaryError ? (
              <MohQueryState
                isLoading={false}
                isError
                onRetry={() => refetchSummary()}
              />
            ) : (
              <AlertsList summaryData={summaryData} />
            )}
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className={cn(mohCard, "p-4 sm:p-6 flex items-center gap-4 sm:gap-6")}>
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
            <Activity className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h3 className="text-xs font-black text-foreground uppercase mb-1">
              Total Accepted
            </h3>
            <p className="text-2xl font-black text-foreground">
              {summaryData?.total_accepted?.toLocaleString() || 0}
            </p>
          </div>
        </div>
        <div className={cn(mohCard, "p-4 sm:p-6 flex items-center gap-4 sm:gap-6")}>
          <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
            <Zap className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <h3 className="text-xs font-black text-foreground uppercase mb-1">
              Admitted Patients
            </h3>
            <p className="text-2xl font-black text-foreground">
              {summaryData?.total_admitted?.toLocaleString() || 0}
            </p>
          </div>
        </div>
        <div className={cn(mohCard, "p-4 sm:p-6 flex items-center gap-4 sm:gap-6")}>
          <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
            <FlaskConical className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <h3 className="text-xs font-black text-foreground uppercase mb-1">
              Avg Severity
            </h3>
            <p className="text-2xl font-black text-foreground">
              {summaryData?.average_ml_severity_score?.toFixed(1) || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
