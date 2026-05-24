"use client";

import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  ChevronRight,
  BarChart3,
  CheckCircle2,
  XCircle,
  Building2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  AlertOctagon,
  ShieldAlert,
  Activity,
  FlaskConical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  useGetDashboardSummaryQuery,
  useGetDiseaseHotspotsQuery,
  useGetHospitalLoadQuery,
  useGetReferralTrendsQuery,
  useGetSeverityDistributionQuery,
} from "@/features/analytics/mohAnalyticsApi";
import type { MohQueryParams } from "@/types/moh-analytics";
import {
  buildMohQueryParams,
  hospitalsFromLoad,
  mergeRegionOptions,
  safePercent,
  type MohGranularity,
  type MohTimeframe,
} from "@/lib/mohAnalytics";
import {
  MohAnalyticsEmpty,
  MohQueryState,
} from "@/components/analytics/MohAnalyticsStates";
import { MohAnalyticsFilters } from "@/components/analytics/MohAnalyticsFilters";
import {
  mohChartGridStroke,
  mohChartTickFill,
  mohPageShell,
  mohTableWrap,
} from "@/lib/mohAnalyticsUi";

// --- Sub-component Types ---

interface KPICardProps {
  title: string;
  value: string;
  trend?: string;
  trendType?: "up" | "down" | "stable";
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  isLoading?: boolean;
}

const DashboardProgress = ({ value, className, color }: { value: number; className?: string; color: string }) => (
  <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-muted/50", className)}>
    <div 
      className={cn("h-full transition-all duration-500", color)}
      style={{ width: `${value}%` }}
    />
  </div>
);

// --- Sub-components ---

export function AnalyticsHeader({
  regionOptions,
  hospitalOptions,
  timeframe,
  region,
  tierLevel,
  hospitalId,
  granularity,
  onTimeframeChange,
  onRegionChange,
  onTierLevelChange,
  onHospitalChange,
  onGranularityChange,
}: {
  regionOptions: string[];
  hospitalOptions: { id: string; name: string }[];
  timeframe: MohTimeframe;
  region: string;
  tierLevel: string;
  hospitalId: string;
  granularity: MohGranularity;
  onTimeframeChange: (v: MohTimeframe) => void;
  onRegionChange: (v: string) => void;
  onTierLevelChange: (v: string) => void;
  onHospitalChange: (v: string) => void;
  onGranularityChange: (v: MohGranularity) => void;
}) {
  return (
    <div className="flex flex-col space-y-6 md:flex-row md:items-center md:justify-between md:space-y-0 pb-2">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase">
          <span>MOH Analytics</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-primary/80">National Dashboard</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          National Healthcare Overview
        </h1>
      </div>
      <MohAnalyticsFilters
        regionOptions={regionOptions}
        hospitalOptions={hospitalOptions}
        values={{ timeframe, region, tierLevel, hospitalId, granularity }}
        onTimeframeChange={onTimeframeChange}
        onRegionChange={onRegionChange}
        onTierLevelChange={onTierLevelChange}
        onHospitalChange={onHospitalChange}
        onGranularityChange={onGranularityChange}
        showTierLevel
        showHospital={hospitalOptions.length > 0}
        showGranularity
        compact
      />
    </div>
  );
}

function KPICard({ title, value, trend, trendType, icon: Icon, iconBg, iconColor, isLoading }: KPICardProps) {
  if (isLoading) {
    return (
      <div className="bg-card rounded-xl p-5 border border-border/40 shadow-sm animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("p-2.5 rounded-lg", iconBg)}>
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
        </div>
        <div>
          <div className="h-3 bg-muted rounded w-20 mb-2"></div>
          <div className="h-8 bg-muted rounded w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-5 border border-border/40 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-2.5 rounded-lg", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-0.5 px-2 py-1 rounded-full text-[10px] font-bold",
            trendType === "up" && "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20",
            trendType === "down" && "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
            trendType === "stable" && "bg-muted text-muted-foreground border border-border"
          )}>
            {trendType === "up" && <ArrowUpRight className="h-3 w-3" />}
            {trendType === "down" && <ArrowDownRight className="h-3 w-3" />}
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
      </div>
    </div>
  );
}

export function KPICards({ queryParams }: { queryParams: MohQueryParams }) {
  const { data: summary, isLoading, isError, refetch } =
    useGetDashboardSummaryQuery(queryParams);

  const metrics = [
    {
      title: "Total Referrals",
      value: summary?.total_referrals?.toLocaleString() || "0",
      icon: BarChart3,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500",
    },
    {
      title: "Accepted Rate",
      value: `${summary?.acceptance_rate_percentage?.toFixed(1) || 0}%`,
      icon: CheckCircle2,
      iconBg: "bg-green-500/10",
      iconColor: "text-green-500",
    },
    {
      title: "Rejected",
      value: summary?.total_rejected?.toLocaleString() || "0",
      icon: XCircle,
      iconBg: "bg-red-500/10",
      iconColor: "text-red-500",
    },
    {
      title: "Admitted",
      value: summary?.total_admitted?.toLocaleString() || "0",
      icon: Building2,
      iconBg: "bg-indigo-500/10",
      iconColor: "text-indigo-500",
    },
    {
      title: "Avg. Processing",
      value: `${summary?.average_turnaround_hours?.toFixed(1) || 0} hrs`,
      icon: Clock,
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-500",
    },
    {
      title: "Avg. Severity",
      value: summary?.average_ml_severity_score?.toFixed(1) || "0",
      icon: FlaskConical,
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-500",
    },
  ];

  if (isError) {
    return (
      <MohQueryState isLoading={false} isError onRetry={() => refetch()} />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {metrics.map((metric, i) => (
        <KPICard key={i} {...metric} isLoading={isLoading} />
      ))}
    </div>
  );
}

export function ReferralTrends({ queryParams }: { queryParams: MohQueryParams }) {
  const { data: trendsData, isLoading, isError, refetch } =
    useGetReferralTrendsQuery(queryParams);

  const chartData =
    trendsData?.data?.map((item) => ({
      period: item.period,
      total: item.total_referrals,
      accepted: item.accepted_referrals,
      rejected: item.rejected_referrals,
      emergency: item.emergency_referrals,
    })) || [];

  return (
    <div className="bg-card rounded-xl p-6 border border-border/40 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-bold text-foreground">National Referral Trends</h2>
          <p className="text-[10px] text-muted-foreground/60 font-medium">
            Volume by period ({queryParams.granularity ?? "month"})
          </p>
        </div>
      </div>
      <MohQueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!isLoading && !isError && chartData.length === 0}
        onRetry={() => refetch()}
        loadingClassName="h-[280px]"
        className="h-[280px]"
      >
        <div className="h-[280px] w-full mt-4 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={mohChartGridStroke} />
              <XAxis
                dataKey="period"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fontWeight: 700, fill: mohChartTickFill }}
                dy={10}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))", radius: 4 }}
                content={({ active, payload }) => {
                  if (active && payload?.length && payload[0]?.payload) {
                    const p = payload[0].payload as (typeof chartData)[0];
                    return (
                      <div className="bg-popover text-popover-foreground p-2 border border-border shadow-xl rounded-lg text-xs space-y-0.5">
                        <p className="font-bold text-muted-foreground uppercase">{p.period}</p>
                        <p>Total: {p.total?.toLocaleString()}</p>
                        <p className="text-green-600">Accepted: {p.accepted?.toLocaleString()}</p>
                        <p className="text-red-600">Rejected: {p.rejected?.toLocaleString()}</p>
                        <p className="text-orange-600">Emergency: {p.emergency?.toLocaleString()}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="accepted" name="Accepted" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
              <Bar dataKey="rejected" name="Rejected" stackId="a" fill="#ef4444" />
              <Bar dataKey="emergency" name="Emergency" fill="#f97316" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </MohQueryState>
    </div>
  );
}

export function DiseaseHeatmap({ queryParams }: { queryParams: MohQueryParams }) {
  const { data: hotspotsData, isLoading, isError, refetch } =
    useGetDiseaseHotspotsQuery(queryParams);

  const topHotspots = hotspotsData?.data?.slice(0, 5) || [];
  const maxReferrals = Math.max(...topHotspots.map(h => h.referral_count), 1);

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border/40 shadow-sm h-full flex flex-col overflow-hidden animate-pulse">
        <div className="p-6">
          <div className="h-6 bg-muted rounded w-48"></div>
        </div>
        <div className="px-6 pb-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-2 bg-muted/50 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-card rounded-xl border border-border/40 shadow-sm h-full p-6">
        <MohQueryState isLoading={false} isError onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border/40 shadow-sm h-full flex flex-col overflow-hidden">
      <div className="p-6 pb-4 flex items-center justify-between border-b border-border/20">
        <div>
          <h2 className="text-sm font-bold text-foreground">Top Disease Hotspots</h2>
          <p className="text-[10px] text-muted-foreground/60 font-medium mt-0.5">Regions with highest referral concentration</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </div>
          <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Active</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {topHotspots.length > 0 ? (
          <div className="p-6 space-y-5">
            {topHotspots.map((hotspot, idx) => {
              const intensity = (hotspot.referral_count / maxReferrals) * 100;
              const severityColor = hotspot.average_severity_score > 7 
                ? "bg-red-500" 
                : hotspot.average_severity_score > 4 
                ? "bg-orange-500" 
                : "bg-yellow-500";
              
              return (
                <div key={idx} className="space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] font-black",
                          idx === 0 && "bg-red-500/10 text-red-600 dark:text-red-400",
                          idx === 1 && "bg-orange-500/10 text-orange-600 dark:text-orange-400",
                          idx === 2 && "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
                          idx > 2 && "bg-muted/50 text-muted-foreground"
                        )}>
                          {idx + 1}
                        </span>
                        <h3 className="text-xs font-bold text-foreground truncate">{hotspot.region}</h3>
                      </div>
                      <p className="text-[10px] text-muted-foreground/70 font-medium pl-7">
                        {hotspot.department_name}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-foreground">{hotspot.referral_count}</p>
                      <p className="text-[9px] text-muted-foreground/60 font-bold uppercase">Cases</p>
                    </div>
                  </div>
                  
                  <div className="pl-7 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground/60 font-medium">Intensity</span>
                      <span className="font-bold text-foreground">{intensity.toFixed(0)}%</span>
                    </div>
                    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
                      <div 
                        className={cn("h-full transition-all duration-500", severityColor)}
                        style={{ width: `${intensity}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-1.5 pt-1">
                      <div className={cn("h-1.5 w-1.5 rounded-full", severityColor)} />
                      <span className="text-[9px] font-bold text-muted-foreground/60">
                        Avg Severity: {hotspot.average_severity_score.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full p-6">
            <div className="text-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
                <Activity className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">No hotspot data available</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function RegionalWorkload({ queryParams }: { queryParams: MohQueryParams }) {
  const { data: hospitalLoadData, isLoading, isError, refetch } =
    useGetHospitalLoadQuery(queryParams);

  const regionData = hospitalLoadData?.data?.reduce(
    (acc: Record<string, { total: number; accepted: number }>, hospital) => {
      if (!acc[hospital.region]) {
        acc[hospital.region] = { total: 0, accepted: 0 };
      }
      acc[hospital.region].total += hospital.total_referrals_received;
      acc[hospital.region].accepted += hospital.total_accepted;
      return acc;
    },
    {},
  );

  const regions = Object.entries(regionData || {})
    .slice(0, 3)
    .map(([name, data]) => {
      const rate = safePercent(data.accepted, data.total);
      return {
        name,
        acceptanceRate: Math.round(rate),
        color:
          rate > 90
            ? "bg-red-500"
            : rate > 70
              ? "bg-orange-500"
              : "bg-green-500",
      };
    });

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border/40 shadow-sm h-full animate-pulse">
        <div className="h-6 bg-muted rounded w-48 mb-6"></div>
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 bg-muted rounded w-32"></div>
              <div className="h-2 bg-muted/50 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border/40 shadow-sm h-full">
        <MohQueryState isLoading={false} isError onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-6 border border-border/40 shadow-sm h-full">
      <h2 className="text-sm font-bold text-foreground mb-1">
        Regional Acceptance Load
      </h2>
      <p className="text-[10px] text-muted-foreground/60 mb-6">
        Share of received referrals accepted, by region
      </p>
      <div className="space-y-8">
        {regions.length > 0 ? (
          regions.map((region) => (
            <div key={region.name} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">{region.name}</span>
                <span className="text-xs font-bold text-muted-foreground">
                  {region.acceptanceRate}% accepted
                </span>
              </div>
              <DashboardProgress
                value={region.acceptanceRate}
                className="h-2"
                color={region.color}
              />
            </div>
          ))
        ) : (
          <MohAnalyticsEmpty className="py-4" />
        )}
      </div>
    </div>
  );
}

export function SeverityDistribution({ queryParams }: { queryParams: MohQueryParams }) {
  const { data: severityData, isLoading, isError, refetch } =
    useGetSeverityDistributionQuery(queryParams);

  const totalReferrals =
    severityData?.data?.reduce((sum, item) => sum + item.total_referrals, 0) || 0;
  const totalCritical =
    severityData?.data?.reduce((sum, item) => sum + item.critical_count, 0) || 0;
  const totalUrgent =
    severityData?.data?.reduce((sum, item) => sum + item.urgent_count, 0) || 0;
  const totalRoutine =
    severityData?.data?.reduce((sum, item) => sum + item.routine_count, 0) || 0;

  const chartData = [
    {
      name: "Critical",
      value: Math.round(safePercent(totalCritical, totalReferrals)),
      color: "#ef4444",
      count: totalCritical,
    },
    {
      name: "Urgent",
      value: Math.round(safePercent(totalUrgent, totalReferrals)),
      color: "#f97316",
      count: totalUrgent,
    },
    {
      name: "Routine",
      value: Math.round(safePercent(totalRoutine, totalReferrals)),
      color: "#22c55e",
      count: totalRoutine,
    },
  ];

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border/40 shadow-sm h-full animate-pulse">
        <div className="h-6 bg-muted rounded w-48 mb-6"></div>
        <div className="h-[220px] bg-muted/50 rounded"></div>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border/40 shadow-sm h-full">
        <MohQueryState isLoading={false} isError onRetry={() => refetch()} />
      </div>
    );
  }

  if (totalReferrals === 0) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border/40 shadow-sm h-full">
        <h2 className="text-sm font-bold text-foreground mb-6">Severity Distribution</h2>
        <MohAnalyticsEmpty />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-6 border border-border/40 shadow-sm h-full">
      <h2 className="text-sm font-bold text-foreground mb-6">Severity Distribution</h2>
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 h-[220px]">
        <div className="relative w-full h-full max-w-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload?.length) {
                    return (
                      <div className="bg-popover text-popover-foreground p-2 border border-border shadow-xl rounded-lg text-xs font-bold">
                        {payload[0].name}: {payload[0].value}%
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-2xl font-bold text-foreground">
              {totalReferrals >= 1000
                ? `${(totalReferrals / 1000).toFixed(1)}k`
                : totalReferrals.toLocaleString()}
            </p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Total
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 w-full md:w-auto">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center gap-3">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs font-bold text-muted-foreground">
                {item.name} ({item.value}% · {item.count.toLocaleString()})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CriticalAlerts({ queryParams }: { queryParams: MohQueryParams }) {
  const { data: hospitalLoadData } = useGetHospitalLoadQuery(queryParams);
  const { data: severityData } = useGetSeverityDistributionQuery(queryParams);
  const { data: hotspotsData } = useGetDiseaseHotspotsQuery(queryParams);
  const { data: summary } = useGetDashboardSummaryQuery(queryParams);

  // Generate dynamic alerts based on real data
  const alerts = [];

  // Alert 1: High capacity hospitals
  const highCapacityHospitals =
    hospitalLoadData?.data?.filter(
      (h) =>
        h.total_referrals_received > 0 &&
        h.total_accepted / h.total_referrals_received > 0.95,
    ) || [];

  if (highCapacityHospitals.length > 0) {
    const hospital = highCapacityHospitals[0];
    const capacityRate = safePercent(
      hospital.total_accepted,
      hospital.total_referrals_received,
    ).toFixed(0);
    alerts.push({
      id: "capacity",
      title: "High Capacity Alert",
      description: `${hospital.hospital_name} operating at ${capacityRate}% capacity with ${hospital.total_referrals_received} referrals.`,
      status: "Critical Priority",
      priority: "critical",
      icon: AlertOctagon
    });
  }

  // Alert 2: Disease hotspots
  const topHotspot = hotspotsData?.data?.[0];
  if (topHotspot && topHotspot.referral_count > 50) {
    alerts.push({
      id: "hotspot",
      title: "Disease Hotspot Detected",
      description: `${topHotspot.department_name} cases concentrated in ${topHotspot.region} with ${topHotspot.referral_count} referrals.`,
      status: "Active Monitoring",
      priority: "warning",
      icon: ShieldAlert
    });
  }

  // Alert 3: High rejection rate
  const highRejectionHospitals = hospitalLoadData?.data?.filter(h => 
    h.rejection_rate_percentage > 30
  ) || [];
  
  if (highRejectionHospitals.length > 0) {
    alerts.push({
      id: "rejection",
      title: "High Rejection Rate",
      description: `${highRejectionHospitals.length} hospital(s) with rejection rates above 30%. Review capacity and resources.`,
      status: "Action Required",
      priority: "warning",
      icon: Activity
    });
  }

  // Alert 4: Critical severity cases
  const totalCritical =
    severityData?.data?.reduce((sum, item) => sum + item.critical_count, 0) || 0;
  const totalReferrals =
    severityData?.data?.reduce((sum, item) => sum + item.total_referrals, 0) || 0;
  const criticalPercentage = safePercent(totalCritical, totalReferrals).toFixed(1);
  
  if (totalReferrals > 0 && parseFloat(criticalPercentage) > 15) {
    alerts.push({
      id: "critical",
      title: "High Critical Cases",
      description: `${criticalPercentage}% of referrals are critical severity (${totalCritical} cases). Ensure adequate emergency capacity.`,
      status: "Monitoring",
      priority: "info",
      icon: Activity
    });
  }

  // Alert 5: Low acceptance rate
  if (summary && summary.acceptance_rate_percentage < 70) {
    alerts.push({
      id: "acceptance",
      title: "Low National Acceptance Rate",
      description: `Overall acceptance rate at ${summary.acceptance_rate_percentage.toFixed(1)}%. Consider capacity expansion initiatives.`,
      status: "Strategic Review",
      priority: "info",
      icon: Activity
    });
  }

  // If no alerts, show positive message
  if (alerts.length === 0) {
    alerts.push({
      id: "normal",
      title: "System Operating Normally",
      description: "All metrics within acceptable ranges. No critical alerts at this time.",
      status: "All Clear",
      priority: "info",
      icon: Activity
    });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold text-foreground px-1">Critical Alerts</h2>
      <div className="space-y-3">
        {alerts.slice(0, 3).map((alert) => (
          <div key={alert.id} className={cn("p-4 rounded-xl border flex gap-4 transition-all hover:translate-x-1 duration-200", alert.priority === "critical" && "bg-red-500/10 border-red-500/30", alert.priority === "warning" && "bg-orange-500/10 border-orange-500/30", alert.priority === "info" && "bg-blue-500/10 border-blue-500/30")}>
            <div className={cn("h-10 w-10 shrink-0 rounded-lg flex items-center justify-center bg-card shadow-sm", alert.priority === "critical" && "text-red-500", alert.priority === "warning" && "text-orange-500", alert.priority === "info" && "text-blue-500")}>
              <alert.icon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">{alert.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{alert.description}</p>
              <div className="pt-2 flex items-center gap-1.5">
                <div className={cn("h-1.5 w-1.5 rounded-full", alert.priority === "critical" && "bg-red-500", alert.priority === "warning" && "bg-orange-500", alert.priority === "info" && "bg-blue-500")} />
                <span className={cn("text-[10px] font-bold uppercase tracking-wider", alert.priority === "critical" && "text-red-600", alert.priority === "warning" && "text-orange-600", alert.priority === "info" && "text-blue-600")}>{alert.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PerformanceMatrix({ queryParams }: { queryParams: MohQueryParams }) {
  const { data: hospitalLoadData, isLoading, isError, refetch } =
    useGetHospitalLoadQuery(queryParams);

  const topHospitals = hospitalLoadData?.data?.slice(0, 5) || [];

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden h-full animate-pulse">
        <div className="p-6">
          <div className="h-6 bg-muted rounded w-48"></div>
        </div>
        <div className="h-64 bg-muted/50"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden h-full p-6">
        <MohQueryState isLoading={false} isError onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden h-full">
      <div className="p-6 pb-2">
        <h2 className="text-sm font-bold text-foreground">Hospital Performance Matrix</h2>
      </div>
      <div className={mohTableWrap}>
        {topHospitals.length === 0 ? (
          <MohAnalyticsEmpty className="m-6" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-none text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                <TableHead className="py-4 pl-4">Hospital</TableHead>
                <TableHead className="text-center">Total Referrals</TableHead>
                <TableHead className="text-center">Acceptance Rate</TableHead>
                <TableHead className="text-center">Rejection Rate</TableHead>
                <TableHead className="text-center">Avg. Severity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topHospitals.map((hospital, idx) => {
                const acceptanceRate = safePercent(
                  hospital.total_accepted,
                  hospital.total_referrals_received,
                );
                const isGoodRate = acceptanceRate > 80;

                return (
                  <TableRow key={hospital.hospital_id} className="border-border group">
                    <TableCell className="py-4 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded flex items-center justify-center text-[10px] font-black bg-blue-100 text-blue-600">
                          {idx + 1}
                        </div>
                        <span className="text-xs font-bold text-foreground">
                          {hospital.hospital_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-xs font-bold text-muted-foreground">
                      {hospital.total_referrals_received.toLocaleString()}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-center text-xs font-black",
                        isGoodRate ? "text-green-500" : "text-orange-500",
                      )}
                    >
                      {acceptanceRate.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-center text-xs font-bold text-muted-foreground">
                      {hospital.rejection_rate_percentage.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-center text-xs font-bold text-muted-foreground">
                      {hospital.average_severity_score.toFixed(1)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

export function UtilizationLeaderboard({ queryParams }: { queryParams: MohQueryParams }) {
  const { data: hospitalLoadData, isLoading, isError, refetch } =
    useGetHospitalLoadQuery(queryParams);

  const hospitals = hospitalLoadData?.data
    ?.map((hospital, idx) => {
      const acceptanceRate = safePercent(
        hospital.total_accepted,
        hospital.total_referrals_received,
      );
      
      return {
        id: String(idx + 1).padStart(2, '0'),
        name: hospital.hospital_name,
        utilization: Math.round(acceptanceRate),
        totalReferrals: hospital.total_referrals_received,
      };
    })
    .sort((a, b) => b.utilization - a.utilization)
    .slice(0, 4) || [];

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border/40 shadow-sm h-full flex flex-col animate-pulse">
        <div className="h-6 bg-muted rounded w-48 mb-6"></div>
        <div className="space-y-6 flex-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-2 bg-muted/50 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border/40 shadow-sm h-full">
        <MohQueryState isLoading={false} isError onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-6 border border-border/40 shadow-sm h-full flex flex-col">
      <h2 className="text-sm font-bold text-foreground mb-1">Acceptance Leaderboard</h2>
      <p className="text-[10px] text-muted-foreground/60 mb-6">
        Hospitals ranked by referral acceptance rate
      </p>
      <div className="space-y-6 flex-1">
        {hospitals.length > 0 ? (
          hospitals.map((hospital) => (
            <div key={hospital.id} className="flex items-center gap-4">
              <span className="text-xs font-black text-muted-foreground w-5">{hospital.id}</span>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">{hospital.name}</span>
                  <span className="text-xs font-black text-foreground">{hospital.utilization}%</span>
                </div>
                <DashboardProgress value={hospital.utilization} className="h-1.5" color={hospital.utilization > 90 ? "bg-red-500" : "bg-blue-500"} />
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
            No hospital data available
          </div>
        )}
      </div>
      <div className="pt-6 mt-6 border-t border-border/20">
        <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-muted-foreground hover:bg-muted/50">View All Rankings</Button>
      </div>
    </div>
  );
}

export function AnalyticsDashboard() {
  const [region, setRegion] = useState("all");
  const [timeframe, setTimeframe] = useState<MohTimeframe>("30days");
  const [tierLevel, setTierLevel] = useState("all");
  const [hospitalId, setHospitalId] = useState("all");
  const [granularity, setGranularity] = useState<MohGranularity>("month");

  const filterBootstrapParams = useMemo(
    () =>
      buildMohQueryParams({
        timeframe,
        region,
      }),
    [timeframe, region],
  );

  const { data: hospitalLoadForFilters } =
    useGetHospitalLoadQuery(filterBootstrapParams);

  const regionOptions = useMemo(
    () =>
      mergeRegionOptions(
        hospitalLoadForFilters?.data?.map((h) => h.region) ?? [],
      ),
    [hospitalLoadForFilters],
  );

  const hospitalOptions = useMemo(
    () => hospitalsFromLoad(hospitalLoadForFilters?.data ?? []),
    [hospitalLoadForFilters],
  );

  const queryParams = useMemo(
    () =>
      buildMohQueryParams({
        timeframe,
        region,
        hospitalId,
        tierLevel,
        granularity,
      }),
    [timeframe, region, hospitalId, tierLevel, granularity],
  );

  return (
    <div className={mohPageShell}>
      <AnalyticsHeader
        regionOptions={regionOptions}
        hospitalOptions={hospitalOptions}
        timeframe={timeframe}
        region={region}
        tierLevel={tierLevel}
        hospitalId={hospitalId}
        granularity={granularity}
        onTimeframeChange={setTimeframe}
        onRegionChange={setRegion}
        onTierLevelChange={setTierLevel}
        onHospitalChange={setHospitalId}
        onGranularityChange={setGranularity}
      />
      <KPICards queryParams={queryParams} />
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-6">
        <div className="xl:col-span-8 space-y-4 lg:space-y-6 min-w-0">
          <div className="min-h-[360px] lg:h-[420px]">
            <ReferralTrends queryParams={queryParams} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 min-h-[280px] lg:min-h-[320px]">
            <RegionalWorkload queryParams={queryParams} />
            <SeverityDistribution queryParams={queryParams} />
          </div>
          <div><PerformanceMatrix queryParams={queryParams} /></div>
        </div>
        <div className="xl:col-span-4 space-y-4 lg:space-y-6 min-w-0">
          <div className="min-h-[360px] lg:h-[420px]">
            <DiseaseHeatmap queryParams={queryParams} />
          </div>
          <div className="space-y-6">
            <CriticalAlerts queryParams={queryParams} />
            <UtilizationLeaderboard queryParams={queryParams} />
          </div>
        </div>
      </div>
    </div>
  );
}
