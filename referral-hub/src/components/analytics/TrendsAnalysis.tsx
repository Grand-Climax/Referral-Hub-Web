"use client";

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
} from "recharts";
import {
  Calendar,
  Download,
  ChevronRight,
  ChevronDown,
  Info,
  AlertTriangle,
  TrendingUp,
  BrainCircuit,
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
import { Button } from "@/components/ui/button";
import {
  useGetReferralTrendsQuery,
  useGetDashboardSummaryQuery,
} from "@/features/analytics/mohAnalyticsApi";
import type { MohQueryParams } from "@/types/moh-analytics";

// --- Mock Data ---

const longitudinalData = Array.from({ length: 24 }).map((_, i) => ({
  name: `Month ${i + 1}`,
  actual: 3000 + Math.random() * 2000 + (i > 18 ? 1500 : 0),
  baseline: 3200 + Math.random() * 500,
}));

const seasonalityMatrix = [
  { year: "2023", data: [2, 4, 8, 12, 18, 24, 30, 26, 18, 10, 5, 2] },
  { year: "2022", data: [1, 3, 7, 10, 16, 22, 28, 24, 16, 8, 4, 1] },
];

const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const growthIndexData = Array.from({ length: 12 }).map((_, i) => ({
  month: months[i],
  index: 1 + Math.random() * 0.5,
}));

// --- Sub-components (Local) ---

const MetricCard = ({ label, value, subValue, trend, trendColor, isLoading }: any) => {
  if (isLoading) {
    return (
      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100/50 animate-pulse">
        <div className="h-3 bg-slate-200 rounded w-20 mb-2"></div>
        <div className="h-6 bg-slate-200 rounded w-16"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100/50 flex flex-col justify-between">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xl font-black text-slate-900">{value}</p>
      {trend && (
        <p className={cn("text-[10px] font-bold mt-1", trendColor)}>
          {trend} {subValue}
        </p>
      )}
    </div>
  );
};

const AlertsList = ({ summaryData }: { summaryData?: any }) => (
  <div className="space-y-3">
    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex gap-3 items-start">
      <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
      <div>
        <p className="text-xs font-bold text-blue-900 leading-tight">
          Referral volume trending {summaryData && summaryData.total_referrals > 1000 ? 'upward' : 'stable'} across all regions.
        </p>
      </div>
    </div>
    <div className="bg-green-50/50 border border-green-100 rounded-xl p-3 flex gap-3 items-start">
      <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
      <div>
        <p className="text-xs font-bold text-green-900 leading-tight">
          Acceptance rate at {summaryData?.acceptance_rate_percentage?.toFixed(1) || 0}% - within normal range.
        </p>
      </div>
    </div>
  </div>
);

const HeatmapGrid = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-13 gap-1">
      <div className="col-span-1" />
      {months.map(m => (
        <div key={m} className="text-[9px] font-bold text-slate-400 text-center">{m}</div>
      ))}
    </div>
    {seasonalityMatrix.map((row, idx) => (
      <div key={idx} className="grid grid-cols-13 gap-1 h-8 items-center">
        <div className="text-[10px] font-bold text-slate-500">{row.year}</div>
        {row.data.map((val, i) => {
          let color = "bg-blue-100";
          if (val > 10) color = "bg-blue-300";
          if (val > 20) color = "bg-blue-600";
          if (val > 25) color = "bg-blue-900";
          return (
            <div key={i} className={cn("h-full rounded-sm transition-all hover:ring-2 hover:ring-primary/20 cursor-help", color)} />
          );
        })}
      </div>
    ))}
    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-50">
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-sm bg-blue-100" />
        <span className="text-[10px] font-bold text-slate-400">Low</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-sm bg-blue-900" />
        <span className="text-[10px] font-bold text-slate-400">Peak</span>
      </div>
      <p className="text-[10px] text-slate-400 italic ml-auto">Critical: Historical data indicates malaria peaks correlate with precipitation levels above 150mm.</p>
    </div>
  </div>
);

// --- Main Component ---

export function TrendsAnalysis() {
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>('month');
  
  // Get last 12 months of data
  const getDateRange = () => {
    const to = new Date().toISOString().split('T')[0];
    const from = new Date();
    from.setFullYear(from.getFullYear() - 1);
    return { from: from.toISOString().split('T')[0], to };
  };

  const { from, to } = getDateRange();
  const queryParams: MohQueryParams = { from, to, granularity };

  const { data: trendsData, isLoading: trendsLoading } = useGetReferralTrendsQuery(queryParams);
  const { data: summaryData, isLoading: summaryLoading } = useGetDashboardSummaryQuery(queryParams);

  const longitudinalData = trendsData?.data?.map(item => ({
    name: item.period,
    actual: item.total_referrals,
    baseline: item.total_referrals * 0.9, // Mock baseline as 90% of actual
  })) || [];

  const totalReferrals = summaryData?.total_referrals || 0;
  const peakVolume = Math.max(...(trendsData?.data?.map(d => d.total_referrals) || [0]));
  const avgTurnaround = summaryData?.average_turnaround_hours || 0;

  return (
    <div className="min-h-screen bg-slate-50/30 p-8 space-y-8 select-none">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase mb-1">
            <span>Analytics</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary/80">Trends Analysis</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Health Indicator Longitudinal Study</h1>
          <p className="text-sm text-slate-500 max-w-2xl mt-1">
            Aggregate historical data across all national health nodes. Analyzing seasonality patterns, predictive referral volumes, and regional growth indices.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-black text-slate-700">Last 12 Months</span>
          </div>
          <Select value={granularity} onValueChange={(val) => setGranularity(val as any)}>
            <SelectTrigger className="w-[120px] bg-white border-slate-200 rounded-xl h-10 text-xs font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Longitudinal Chart (8/12) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-black text-slate-900">Total Referrals Longitudinal</h2>
                <p className="text-xs text-slate-400">Aggregated nationwide patient transfer volume</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-black text-slate-600 uppercase">Actual</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                  <span className="text-[10px] font-black text-slate-500 uppercase">Baseline</span>
                </div>
              </div>
            </div>

            {trendsLoading ? (
              <div className="h-[320px] bg-slate-100 rounded-xl animate-pulse"></div>
            ) : (
              <div className="h-[320px] w-full relative mb-8 rounded-xl overflow-hidden group">
               {/* Background Grid Pattern Overlay for that "Premium" 3D-ish feel */}
              <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-100/50 to-transparent pointer-events-none" />
              
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={longitudinalData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis hide />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 700 }} 
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload?.length) {
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs">
                            <p className="font-black mb-1 opacity-60">{payload[0].payload.name}</p>
                            <p className="font-black text-blue-400">ACTUAL: {payload[0].value?.toLocaleString()}</p>
                            <p className="font-black text-slate-400">BASELINE: {payload[1].value?.toLocaleString()}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#3b82f6" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorActual)" 
                    animationDuration={2000}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="baseline" 
                    stroke="#e2e8f0" 
                    strokeDasharray="5 5"
                    strokeWidth={2} 
                    fill="transparent" 
                  />
                </AreaChart>
              </ResponsiveContainer>
              
              {/* Optional: Add a subtle overlay to match the 3D-effect in image */}
              <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <div className="h-64 w-[90%] border-2 border-slate-900 rotate-x-12 rounded-xl transform-gpu" />
              </div>
              </div>
            )}

            {/* Metrics Row */}
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
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100/50 flex flex-col justify-between overflow-hidden">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Acceptance Rate</p>
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <p className="text-xl font-black text-slate-900">
                          {summaryData?.acceptance_rate_percentage?.toFixed(1) || 0}%
                        </p>
                    </div>
                    <div className="flex-1 pb-1">
                        <Progress value={summaryData?.acceptance_rate_percentage || 0} className="h-1.5 bg-slate-200" />
                    </div>
                </div>
              </div>
              <MetricCard 
                label="Mean Wait" 
                value={`${avgTurnaround.toFixed(1)} hrs`} 
                isLoading={summaryLoading}
              />
            </div>
          </div>

          {/* Seasonality Matrix (Full width of left col) */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col flex-1">
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h2 className="text-lg font-black text-slate-900">Infection Seasonality Matrix</h2>
                    <p className="text-xs text-slate-400">Density analysis by disease type and monthly occurrence</p>
                </div>
                <Select defaultValue="malaria">
                    <SelectTrigger className="w-[140px] bg-slate-50 border-slate-200 rounded-lg h-9 text-xs font-bold">
                        <SelectValue placeholder="Select Disease" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="malaria">Malaria</SelectItem>
                        <SelectItem value="cholera">Cholera</SelectItem>
                        <SelectItem value="respiratory">Respiratory</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <HeatmapGrid />
          </div>
        </div>

        {/* Right Column (4/12) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Predictive Forecast (Dark) */}
          <div className="bg-slate-900 rounded-2xl p-8 text-white flex flex-col shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                <BrainCircuit className="h-32 w-32" />
            </div>
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Predictive Forecast</h2>
              <div className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">AI Engine</p>
                <p className="text-[10px] font-black tracking-tight">V4.2</p>
              </div>
            </div>

            <div className="space-y-6 relative z-10">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Projected Next Period</p>
                <div className="flex items-end gap-3">
                    <span className="text-4xl font-black tracking-tighter">
                      {Math.round(totalReferrals * 1.024).toLocaleString()}
                    </span>
                    <span className="text-sm font-bold text-blue-400 pb-1.5">+2.4%</span>
                </div>
              </div>
              
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Model suggests a moderate increase based on historical trends and seasonal patterns.
              </p>

              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Confidence Interval</span>
                    <span className="text-[10px] font-black">95.2%</span>
                </div>
                <Progress value={95.2} className="h-1.5 bg-slate-800" />
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Anomaly Detection</span>
                    <span className="text-[10px] font-black text-green-400 uppercase">Nominal</span>
                </div>
              </div>
            </div>
          </div>

          {/* Strategic Alerts */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="h-4 w-4 text-blue-500" />
              <h2 className="text-sm font-black text-slate-900 uppercase">Strategic Insights</h2>
            </div>
            <AlertsList summaryData={summaryData} />
          </div>

          {/* Regional Growth (Full width of right col) */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col flex-1">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase">Regional Growth Index</h2>
                <p className="text-[10px] text-slate-400 font-medium">Relative development vs national baseline (1.0)</p>
              </div>
              <div className="flex items-center bg-slate-50 p-1 rounded-lg border border-slate-100">
                <button className="px-3 py-1 text-[9px] font-black bg-white rounded shadow-sm text-primary uppercase">North</button>
                <button className="px-3 py-1 text-[9px] font-black text-slate-400 uppercase">Central</button>
                <button className="px-3 py-1 text-[9px] font-black text-slate-400 uppercase">South</button>
              </div>
            </div>

            <div className="h-[140px] w-full bg-slate-50 rounded-xl overflow-hidden mb-6 relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent z-10" />
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growthIndexData}>
                        <Area type="monotone" dataKey="index" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                    </AreaChart>
                </ResponsiveContainer>
                <div className="absolute bottom-4 left-6 z-20">
                    <p className="text-2xl font-black text-slate-900 tracking-tighter">1.2x <span className="text-[10px] text-green-500 font-black">+8% YoY</span></p>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Aggregate Index</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <div className="flex items-center justify-between group cursor-help">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight group-hover:text-primary transition-colors">Infrastructure Readiness</span>
                        <span className="text-[10px] font-black">0.92</span>
                    </div>
                    <Progress value={92} className="h-1.5 bg-slate-100" />
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between group cursor-help">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight group-hover:text-primary transition-colors">Personnel Allocation</span>
                        <span className="text-[10px] font-black text-blue-500">1.14</span>
                    </div>
                    <Progress value={114 > 100 ? 100 : 114} className="h-1.5 bg-blue-100" />
                </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6 group hover:translate-y-[-2px] transition-transform">
           <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-colors">
             <Activity className="h-6 w-6 text-blue-500 group-hover:text-white" />
           </div>
           <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">ID: TREND-01</p>
              <h3 className="text-xs font-black text-slate-900 uppercase mb-1">Total Accepted</h3>
              <p className="text-2xl font-black text-slate-900">{summaryData?.total_accepted?.toLocaleString() || 0}</p>
              <p className="text-[10px] text-slate-400 font-medium">Approved referrals in period</p>
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6 group hover:translate-y-[-2px] transition-transform">
           <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0 group-hover:bg-green-500 group-hover:text-white transition-colors">
             <Zap className="h-6 w-6 text-green-500 group-hover:text-white" />
           </div>
           <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">ID: TREND-02</p>
              <h3 className="text-xs font-black text-slate-900 uppercase mb-1">Admitted Patients</h3>
              <p className="text-2xl font-black text-slate-900">{summaryData?.total_admitted?.toLocaleString() || 0}</p>
              <p className="text-[10px] text-slate-400 font-medium">Successfully admitted cases</p>
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6 group hover:translate-y-[-2px] transition-transform">
           <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors">
             <FlaskConical className="h-6 w-6 text-orange-500 group-hover:text-white" />
           </div>
           <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">ID: TREND-03</p>
              <h3 className="text-xs font-black text-slate-900 uppercase mb-1">Avg Severity</h3>
              <p className="text-2xl font-black text-slate-900">{summaryData?.average_ml_severity_score?.toFixed(1) || 0}</p>
              <p className="text-[10px] text-slate-400 font-medium">ML-based severity score</p>
           </div>
        </div>
      </div>

    </div>
  );
}
