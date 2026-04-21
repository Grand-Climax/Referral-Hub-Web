"use client";

import React from "react";
import Image from "next/image";
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

// --- Sub-component Types & Mock Data ---

interface KPICardProps {
  title: string;
  value: string;
  trend?: string;
  trendType?: "up" | "down" | "stable";
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

const trendData = [
  { month: "JUL 23", referrals: 2100 },
  { month: "AUG 23", referrals: 2400 },
  { month: "SEP 23", referrals: 2800 },
  { month: "OCT 23", referrals: 2300 },
  { month: "NOV 23", referrals: 3800 },
  { month: "DEC 23", referrals: 3500 },
  { month: "JAN 24", referrals: 4500 },
  { month: "FEB 24", referrals: 4200 },
  { month: "MAR 24", referrals: 5100 },
  { month: "APR 24", referrals: 4800 },
  { month: "MAY 24", referrals: 5800 },
  { month: "JUN 24", referrals: 5300 },
  { month: "JUL 24", referrals: 5500 },
];

const severityData = [
  { name: "Critical", value: 12, color: "#ef4444" },
  { name: "Moderate", value: 35, color: "#f97316" },
  { name: "Low", value: 53, color: "#22c55e" },
];

const performanceData = [
  { id: "AM", region: "Amhara Region", total: "42,880", acceptance: "88.2%", waitTime: "14.2 hrs", trend: "up", badgeColor: "bg-blue-100 text-blue-600", rateColor: "text-green-500" },
  { id: "OR", region: "Oromia Region", total: "68,120", acceptance: "76.4%", waitTime: "22.8 hrs", trend: "down", badgeColor: "bg-orange-100 text-orange-600", rateColor: "text-orange-500" },
  { id: "NZ", region: "Northern Zone", total: "18,440", acceptance: "91.1%", waitTime: "9.5 hrs", trend: "up", badgeColor: "bg-cyan-100 text-cyan-600", rateColor: "text-green-500" },
];

const DashboardProgress = ({ value, className, color }: { value: number; className?: string; color: string }) => (
  <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-slate-100", className)}>
    <div 
      className={cn("h-full transition-all duration-500", color)}
      style={{ width: `${value}%` }}
    />
  </div>
);

// --- Sub-components ---

export function AnalyticsHeader() {
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
          <Select defaultValue="all">
            <SelectTrigger className="w-[130px] h-9 bg-card border-border/50 shadow-sm focus:ring-1 focus:ring-primary/30">
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="north">Northern Region</SelectItem>
                <SelectItem value="central">Central District</SelectItem>
                <SelectItem value="west">Western Zone</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-muted-foreground/60 uppercase px-1">Timeframe</span>
          <Select defaultValue="30days">
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

function KPICard({ title, value, trend, trendType, icon: Icon, iconBg, iconColor }: KPICardProps) {
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

export function KPICards() {
  const metrics = [
    { title: "Total Referrals", value: "245,670", trend: "+12.4%", trendType: "up", icon: BarChart3, iconBg: "bg-blue-50/50", iconColor: "text-blue-500" },
    { title: "Accepted Rate", value: "82.4%", trend: "Stable", trendType: "stable", icon: CheckCircle2, iconBg: "bg-green-50/50", iconColor: "text-green-500" },
    { title: "Rejected Rate", value: "12.1%", trend: "-2.1%", trendType: "down", icon: XCircle, iconBg: "bg-red-50/50", iconColor: "text-red-500" },
    { title: "Active Hospitals", value: "1,240", icon: Building2, iconBg: "bg-indigo-50/50", iconColor: "text-indigo-500" },
    { title: "Avg. Processing", value: "18.4 hrs", icon: Clock, iconBg: "bg-orange-50/50", iconColor: "text-orange-500" },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {metrics.map((metric, i) => (
        <KPICard key={i} {...(metric as any)} />
      ))}
    </div>
  );
}

export function ReferralTrends() {
  return (
    <div className="bg-card rounded-xl p-6 border border-border/40 shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-bold text-foreground">National Referral Trends</h2>
          <p className="text-[10px] text-muted-foreground/60 font-medium">Volume tracking across primary care network (12mo)</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">Referrals</span>
        </div>
      </div>
      <div className="h-[280px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: "#94a3b8" }} interval={2} dy={10} />
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
            <Bar dataKey="referrals" radius={[4, 4, 0, 0]} barSize={32}>
              {trendData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={index < 4 ? "oklch(0.50 0.12 200 / 0.2)" : "oklch(0.50 0.12 200)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function DiseaseHeatmap() {
  return (
    <div className="bg-card rounded-xl border border-border/40 shadow-sm h-full flex flex-col overflow-hidden">
      <div className="p-6 flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">Disease Hotspot Heatmap</h2>
        <div className="flex items-center gap-2">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </div>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Live Update</span>
        </div>
      </div>
      <div className="relative flex-1 min-h-[220px] mx-6 mb-6 rounded-xl overflow-hidden bg-slate-100/50">
        <div className="absolute inset-0 grayscale opacity-20 bg-[url('https://images.unsplash.com/photo-1589519160732-57fc498494f8?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
          <div className="absolute top-[30%] left-[20%] w-12 h-12 bg-red-400/20 rounded-full blur-xl animate-pulse" />
          <div className="absolute top-[40%] left-[25%] w-8 h-8 bg-red-500/30 rounded-full blur-lg" />
          <div className="absolute top-[60%] left-[50%] w-16 h-16 bg-red-400/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-[55%] left-[55%] w-10 h-10 bg-red-500/30 rounded-full blur-lg" />
          <div className="absolute top-[45%] left-[80%] w-14 h-14 bg-blue-400/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-px bg-border/20 border-t border-border/20">
        <div className="p-4 bg-card">
          <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-1">Primary Concern</p>
          <p className="text-sm font-bold text-foreground">Respiratory Viral</p>
        </div>
        <div className="p-4 bg-card">
          <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-1">Growth Index</p>
          <p className="text-sm font-bold text-red-500">+4.2% / Day</p>
        </div>
      </div>
    </div>
  );
}

export function RegionalWorkload() {
  const regions = [
    { name: "Northern Region", capacity: 92, color: "bg-red-500" },
    { name: "Central District", capacity: 74, color: "bg-orange-500" },
    { name: "Western Zone", capacity: 58, color: "bg-green-500" },
  ];
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

export function SeverityDistribution() {
  return (
    <div className="bg-card rounded-xl p-6 border border-border/40 shadow-sm h-full">
      <h2 className="text-sm font-bold text-foreground mb-6">Severity Distribution</h2>
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 h-[220px]">
        <div className="relative w-full h-full max-w-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={severityData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                {severityData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
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
            <p className="text-2xl font-bold text-slate-900">24k</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 w-full md:w-auto">
          {severityData.map((item) => (
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

export function CriticalAlerts() {
  const alerts = [
    { id: "1", title: "Capacity Overload", description: "Amhara Referral Hospital reaching 98% bed capacity.", status: "Critical Priority", priority: "critical", icon: AlertOctagon },
    { id: "2", title: "Outbreak Detection", description: "Cholera cluster identified in Northern Zone. Screening initiated.", status: "Active Investigation", priority: "warning", icon: ShieldAlert },
    { id: "3", title: "Referral Spike", description: "20% increase in Respiratory referrals in Addis Central.", status: "Monitoring", priority: "info", icon: Activity },
  ];
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold text-foreground px-1">Critical Alerts</h2>
      <div className="space-y-3">
        {alerts.map((alert) => (
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

export function PerformanceMatrix() {
  return (
    <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden h-full">
      <div className="p-6 pb-2">
        <h2 className="text-sm font-bold text-foreground">Regional Performance Matrix</h2>
      </div>
      <div className="px-1 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-none text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
              <TableHead className="py-4 pl-4">Region</TableHead>
              <TableHead className="text-center">Total Referrals</TableHead>
              <TableHead className="text-center">Acceptance Rate</TableHead>
              <TableHead className="text-center">Avg. Wait Time</TableHead>
              <TableHead className="text-center">Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {performanceData.map((row) => (
              <TableRow key={row.id} className="border-slate-100 group">
                <TableCell className="py-4 pl-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("h-8 w-8 rounded flex items-center justify-center text-[10px] font-black", row.badgeColor)}>{row.id}</div>
                    <span className="text-xs font-bold text-slate-700">{row.region}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center text-xs font-bold text-slate-500">{row.total}</TableCell>
                <TableCell className={cn("text-center text-xs font-black", row.rateColor)}>{row.acceptance}</TableCell>
                <TableCell className="text-center text-xs font-bold text-slate-500">{row.waitTime}</TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">{row.trend === "up" ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}</div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function UtilizationLeaderboard() {
  const hospitals = [
    { id: "01", name: "Black Lion Specialized", utilization: 98 },
    { id: "02", name: "St. Paul's Millenium", utilization: 89 },
    { id: "03", name: "Tibebe Ghion Hospital", utilization: 82 },
    { id: "04", name: "Jimma Med. Center", utilization: 76 },
  ];
  return (
    <div className="bg-card rounded-xl p-6 border border-border/40 shadow-sm h-full flex flex-col">
      <h2 className="text-sm font-bold text-foreground mb-6">Utilization Leaderboard</h2>
      <div className="space-y-6 flex-1">
        {hospitals.map((hospital) => (
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
        ))}
      </div>
      <div className="pt-6 mt-6 border-t border-border/20">
        <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50">View All Rankings</Button>
      </div>
    </div>
  );
}

export function AnalyticsDashboard() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8 space-y-8 select-none">
      <AnalyticsHeader />
      <KPICards />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="h-[420px]"><ReferralTrends /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[320px]">
            <RegionalWorkload />
            <SeverityDistribution />
          </div>
          <div><PerformanceMatrix /></div>
        </div>
        <div className="lg:col-span-4 space-y-6">
          <div className="h-[420px]"><DiseaseHeatmap /></div>
          <div className="space-y-6">
            <CriticalAlerts />
            <UtilizationLeaderboard />
          </div>
        </div>
      </div>
    </div>
  );
}
