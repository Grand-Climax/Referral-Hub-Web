"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  ChevronRight,
  Filter,
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
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-slate-100", className)}>
    <div 
      className={cn("h-full transition-all duration-500", color)}
      style={{ width: `${value}%` }}
    />
  </div>
);

// --- Sub-components ---

export function AnalyticsHeader({ 
  onRegionChange, 
  onTimeframeChange 
}: { 
  onRegionChange: (region: string) => void;
  onTimeframeChange: (timeframe: string) => void;
}) {
  return (
    <div className="flex flex-col space-y-6 md:flex-row md:items-center md:justify-between md:space-y-0 pb-2">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase">
          <span>MOH Analytics</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-primary/80">National Dashboard</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">National Healthcare Overview</h1>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-muted-foreground/60 uppercase px-1">Region</span>
          <Select defaultValue="all" onValueChange={onRegionChange}>
            <SelectTrigger className="w-[130px] h-9 bg-card border-border/50 shadow-sm focus:ring-1 focus:ring-primary/30">
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="Addis Ababa">Addis Ababa</SelectItem>
                <SelectItem value="Amhara">Amhara</SelectItem>
                <SelectItem value="Oromia">Oromia</SelectItem>
                <SelectItem value="Tigray">Tigray</SelectItem>
                <SelectItem value="SNNPR">SNNPR</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-muted-foreground/60 uppercase px-1">Timeframe</span>
          <Select defaultValue="30days" onValueChange={onTimeframeChange}>
            <SelectTrigger className="w-[130px] h-9 bg-card border-border/50 shadow-sm focus:ring-1 focus:ring-primary/30">
              <SelectValue placeholder="Select Time" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mt-5">
          <button className="flex h-9 w-9 items-center justify-center rounded-md border border-border/50 bg-black text-white hover:bg-black/80 transition-colors shadow-sm">
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>
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
          <div className="h-3 bg-slate-200 rounded w-20 mb-2"></div>
          <div className="h-8 bg-slate-200 rounded w-24"></div>
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
            trendType === "up" && "bg-green-50 text-green-600 border border-green-100",
            trendType === "down" && "bg-red-50 text-red-600 border border-red-100",
            trendType === "stable" && "bg-gray-50 text-gray-500 border border-gray-100"
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
  const { data: summary, isLoading } = useGetDashboardSummaryQuery(queryParams);

  const metrics = [
    { 
      title: "Total Referrals", 
      value: summary?.total_referrals?.toLocaleString() || "0", 
      icon: BarChart3, 
      iconBg: "bg-blue-50/50", 
      iconColor: "text-blue-500" 
    },
    { 
      title: "Accepted Rate", 
      value: `${summary?.acceptance_rate_percentage?.toFixed(1) || 0}%`, 
      icon: CheckCircle2, 
      iconBg: "bg-green-50/50", 
      iconColor: "text-green-500" 
    },
    { 
      title: "Rejected", 
      value: summary?.total_rejected?.toLocaleString() || "0", 
      icon: XCircle, 
      iconBg: "bg-red-50/50", 
      iconColor: "text-red-500" 
    },
    { 
      title: "Admitted", 
      value: summary?.total_admitted?.toLocaleString() || "0", 
      icon: Building2, 
      iconBg: "bg-indigo-50/50", 
      iconColor: "text-indigo-500" 
    },
    { 
      title: "Avg. Processing", 
      value: `${summary?.average_turnaround_hours?.toFixed(1) || 0} hrs`, 
      icon: Clock, 
      iconBg: "bg-orange-50/50", 
      iconColor: "text-orange-500" 
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {metrics.map((metric, i) => (
        <KPICard key={i} {...metric} isLoading={isLoading} />
      ))}
    </div>
  );
}

export function ReferralTrends({ queryParams }: { queryParams: MohQueryParams }) {
  const { data: trendsData, isLoading } = useGetReferralTrendsQuery({ 
    ...queryParams, 
    granularity: 'month' 
  });

  const chartData = trendsData?.data?.map(item => ({
    month: item.period,
    referrals: item.total_referrals,
  })) || [];

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border/40 shadow-sm h-full animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-48 mb-4"></div>
        <div className="h-[280px] bg-slate-100 rounded"></div>
      </div>
    );
  }
  return (
    <div className="bg-card rounded-xl p-6 border border-border/40 shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-bold text-foreground">National Referral Trends</h2>
          <p className="text-[10px] text-muted-foreground/60 font-medium">Volume tracking across primary care network</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">Referrals</span>
        </div>
      </div>
      <div className="h-[280px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: "#94a3b8" }} dy={10} />
            <YAxis hide />
            <Tooltip
              cursor={{ fill: '#f8fafc', radius: 4 }}
              content={({ active, payload }) => {
                if (active && payload?.length) {
                  return (
                    <div className="bg-white p-2 border border-slate-100 shadow-xl rounded-lg">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{payload[0].payload.month}</p>
                      <p className="text-sm font-bold text-slate-900">{payload[0].value?.toLocaleString()} Referrals</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="referrals" radius={[4, 4, 0, 0]} barSize={32} fill="oklch(0.50 0.12 200)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function DiseaseHeatmap({ queryParams }: { queryParams: MohQueryParams }) {
  const { data: hotspotsData, isLoading } = useGetDiseaseHotspotsQuery(queryParams);

  const topHotspots = hotspotsData?.data?.slice(0, 5) || [];
  const maxReferrals = Math.max(...topHotspots.map(h => h.referral_count), 1);

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border/40 shadow-sm h-full flex flex-col overflow-hidden animate-pulse">
        <div className="p-6">
          <div className="h-6 bg-slate-200 rounded w-48"></div>
        </div>
        <div className="px-6 pb-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-2 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
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
                          idx === 0 && "bg-red-100 text-red-600",
                          idx === 1 && "bg-orange-100 text-orange-600",
                          idx === 2 && "bg-yellow-100 text-yellow-600",
                          idx > 2 && "bg-slate-100 text-slate-600"
                        )}>
                          {idx + 1}
                        </span>
                        <h3 className="text-xs font-bold text-slate-800 truncate">{hotspot.region}</h3>
                      </div>
                      <p className="text-[10px] text-muted-foreground/70 font-medium pl-7">
                        {hotspot.department_name}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-slate-900">{hotspot.referral_count}</p>
                      <p className="text-[9px] text-muted-foreground/60 font-bold uppercase">Cases</p>
                    </div>
                  </div>
                  
                  <div className="pl-7 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground/60 font-medium">Intensity</span>
                      <span className="font-bold text-slate-700">{intensity.toFixed(0)}%</span>
                    </div>
                    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
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
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
                <Activity className="h-6 w-6 text-slate-400" />
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
  const { data: hospitalLoadData, isLoading } = useGetHospitalLoadQuery(queryParams);

  // Group by region and calculate capacity
  const regionData = hospitalLoadData?.data?.reduce((acc: any, hospital) => {
    if (!acc[hospital.region]) {
      acc[hospital.region] = { total: 0, accepted: 0 };
    }
    acc[hospital.region].total += hospital.total_referrals_received;
    acc[hospital.region].accepted += hospital.total_accepted;
    return acc;
  }, {});

  const regions = Object.entries(regionData || {}).slice(0, 3).map(([name, data]: [string, any]) => ({
    name,
    capacity: Math.min(100, Math.round((data.accepted / data.total) * 100) || 0),
    color: data.accepted / data.total > 0.9 ? "bg-red-500" : data.accepted / data.total > 0.7 ? "bg-orange-500" : "bg-green-500"
  }));

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border/40 shadow-sm h-full animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-48 mb-6"></div>
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 bg-slate-200 rounded w-32"></div>
              <div className="h-2 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="bg-card rounded-xl p-6 border border-border/40 shadow-sm h-full">
      <h2 className="text-sm font-bold text-foreground mb-6">Regional Workload vs Capacity</h2>
      <div className="space-y-8">
        {regions.map((region) => (
          <div key={region.name} className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">{region.name}</span>
              <span className="text-xs font-bold text-slate-500">{region.capacity}% Capacity</span>
            </div>
            <DashboardProgress value={region.capacity} className="h-2" color={region.color} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SeverityDistribution({ queryParams }: { queryParams: MohQueryParams }) {
  const { data: severityData, isLoading } = useGetSeverityDistributionQuery(queryParams);

  const totalReferrals = severityData?.data?.reduce((sum, item) => sum + item.total_referrals, 0) || 0;
  const totalCritical = severityData?.data?.reduce((sum, item) => sum + item.critical_count, 0) || 0;
  const totalUrgent = severityData?.data?.reduce((sum, item) => sum + item.urgent_count, 0) || 0;
  const totalRoutine = severityData?.data?.reduce((sum, item) => sum + item.routine_count, 0) || 0;

  const chartData = [
    { name: "Critical", value: Math.round((totalCritical / totalReferrals) * 100) || 0, color: "#ef4444", count: totalCritical },
    { name: "Urgent", value: Math.round((totalUrgent / totalReferrals) * 100) || 0, color: "#f97316", count: totalUrgent },
    { name: "Routine", value: Math.round((totalRoutine / totalReferrals) * 100) || 0, color: "#22c55e", count: totalRoutine },
  ];

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border/40 shadow-sm h-full animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-48 mb-6"></div>
        <div className="h-[220px] bg-slate-100 rounded"></div>
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
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip content={({ active, payload }) => {
                if (active && payload?.length) {
                  return (
                    <div className="bg-white p-2 border border-slate-100 shadow-xl rounded-lg text-xs font-bold text-slate-900">
                      {payload[0].name}: {payload[0].value}%
                    </div>
                  );
                }
                return null;
              }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-2xl font-bold text-slate-900">{(totalReferrals / 1000).toFixed(1)}k</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 w-full md:w-auto">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs font-bold text-slate-600">{item.name} ({item.value}%)</span>
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
  const highCapacityHospitals = hospitalLoadData?.data?.filter(h => 
    (h.total_accepted / h.total_referrals_received) > 0.95
  ) || [];
  
  if (highCapacityHospitals.length > 0) {
    const hospital = highCapacityHospitals[0];
    const capacityRate = ((hospital.total_accepted / hospital.total_referrals_received) * 100).toFixed(0);
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
  const totalCritical = severityData?.data?.reduce((sum, item) => sum + item.critical_count, 0) || 0;
  const totalReferrals = severityData?.data?.reduce((sum, item) => sum + item.total_referrals, 0) || 1;
  const criticalPercentage = ((totalCritical / totalReferrals) * 100).toFixed(1);
  
  if (parseFloat(criticalPercentage) > 15) {
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
          <div key={alert.id} className={cn("p-4 rounded-xl border flex gap-4 transition-all hover:translate-x-1 duration-200", alert.priority === "critical" && "bg-red-50/50 border-red-100", alert.priority === "warning" && "bg-orange-50/50 border-orange-100", alert.priority === "info" && "bg-blue-50/50 border-blue-100")}>
            <div className={cn("h-10 w-10 shrink-0 rounded-lg flex items-center justify-center bg-white shadow-sm", alert.priority === "critical" && "text-red-500", alert.priority === "warning" && "text-orange-500", alert.priority === "info" && "text-blue-500")}>
              <alert.icon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-800">{alert.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{alert.description}</p>
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
  const { data: hospitalLoadData, isLoading } = useGetHospitalLoadQuery(queryParams);

  const topHospitals = hospitalLoadData?.data?.slice(0, 5) || [];

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden h-full animate-pulse">
        <div className="p-6">
          <div className="h-6 bg-slate-200 rounded w-48"></div>
        </div>
        <div className="h-64 bg-slate-100"></div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden h-full">
      <div className="p-6 pb-2">
        <h2 className="text-sm font-bold text-foreground">Hospital Performance Matrix</h2>
      </div>
      <div className="px-1 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-none text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
              <TableHead className="py-4 pl-4">Hospital</TableHead>
              <TableHead className="text-center">Total Referrals</TableHead>
              <TableHead className="text-center">Acceptance Rate</TableHead>
              <TableHead className="text-center">Avg. Severity</TableHead>
              <TableHead className="text-center">Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topHospitals.map((hospital, idx) => {
              const acceptanceRate = ((hospital.total_accepted / hospital.total_referrals_received) * 100).toFixed(1);
              const isGoodRate = parseFloat(acceptanceRate) > 80;
              
              return (
                <TableRow key={hospital.hospital_id} className="border-slate-100 group">
                  <TableCell className="py-4 pl-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded flex items-center justify-center text-[10px] font-black bg-blue-100 text-blue-600">
                        {idx + 1}
                      </div>
                      <span className="text-xs font-bold text-slate-700">{hospital.hospital_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-xs font-bold text-slate-500">
                    {hospital.total_referrals_received.toLocaleString()}
                  </TableCell>
                  <TableCell className={cn("text-center text-xs font-black", isGoodRate ? "text-green-500" : "text-orange-500")}>
                    {acceptanceRate}%
                  </TableCell>
                  <TableCell className="text-center text-xs font-bold text-slate-500">
                    {hospital.average_severity_score.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      {isGoodRate ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function UtilizationLeaderboard({ queryParams }: { queryParams: MohQueryParams }) {
  const { data: hospitalLoadData, isLoading } = useGetHospitalLoadQuery(queryParams);

  // Calculate utilization based on acceptance rate and sort by performance
  const hospitals = hospitalLoadData?.data
    ?.map((hospital, idx) => {
      const acceptanceRate = hospital.total_referrals_received > 0 
        ? ((hospital.total_accepted / hospital.total_referrals_received) * 100)
        : 0;
      
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
        <div className="h-6 bg-slate-200 rounded w-48 mb-6"></div>
        <div className="space-y-6 flex-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-2 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-6 border border-border/40 shadow-sm h-full flex flex-col">
      <h2 className="text-sm font-bold text-foreground mb-6">Utilization Leaderboard</h2>
      <div className="space-y-6 flex-1">
        {hospitals.length > 0 ? (
          hospitals.map((hospital) => (
            <div key={hospital.id} className="flex items-center gap-4">
              <span className="text-xs font-black text-slate-300 w-5">{hospital.id}</span>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">{hospital.name}</span>
                  <span className="text-xs font-black text-slate-900">{hospital.utilization}%</span>
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
        <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50">View All Rankings</Button>
      </div>
    </div>
  );
}

export function AnalyticsDashboard() {
  const [region, setRegion] = useState<string>("");
  const [timeframe, setTimeframe] = useState<string>("30days");

  // Calculate date range based on timeframe
  const getDateRange = () => {
    const to = new Date().toISOString().split('T')[0];
    const from = new Date();
    
    switch (timeframe) {
      case '7days':
        from.setDate(from.getDate() - 7);
        break;
      case '30days':
        from.setDate(from.getDate() - 30);
        break;
      case '90days':
        from.setDate(from.getDate() - 90);
        break;
      case 'year':
        from.setFullYear(from.getFullYear() - 1);
        break;
      default:
        from.setDate(from.getDate() - 30);
    }
    
    return { from: from.toISOString().split('T')[0], to };
  };

  const { from, to } = getDateRange();
  const queryParams: MohQueryParams = {
    from,
    to,
    ...(region && region !== 'all' ? { region } : {}),
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 space-y-8 select-none">
      <AnalyticsHeader 
        onRegionChange={setRegion}
        onTimeframeChange={setTimeframe}
      />
      <KPICards queryParams={queryParams} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="h-[420px]"><ReferralTrends queryParams={queryParams} /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[320px]">
            <RegionalWorkload queryParams={queryParams} />
            <SeverityDistribution queryParams={queryParams} />
          </div>
          <div><PerformanceMatrix queryParams={queryParams} /></div>
        </div>
        <div className="lg:col-span-4 space-y-6">
          <div className="h-[420px]"><DiseaseHeatmap queryParams={queryParams} /></div>
          <div className="space-y-6">
            <CriticalAlerts queryParams={queryParams} />
            <UtilizationLeaderboard queryParams={queryParams} />
          </div>
        </div>
      </div>
    </div>
  );
}
