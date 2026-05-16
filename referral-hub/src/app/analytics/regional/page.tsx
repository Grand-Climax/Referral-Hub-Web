"use client";

import { useState } from "react";
import { RegionalWorkload, PerformanceMatrix, DiseaseHeatmap } from "@/components/analytics/AnalyticsDashboard";
import { 
  useGetHospitalLoadQuery, 
  useGetDiseaseHotspotsQuery,
  useGetSeverityDistributionQuery 
} from "@/features/analytics/mohAnalyticsApi";
import type { MohQueryParams } from "@/types/moh-analytics";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  MapPin, 
  Building2, 
  Users, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export default function RegionalPage() {
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [timeframe, setTimeframe] = useState<string>("30days");

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
      default:
        from.setDate(from.getDate() - 30);
    }
    
    return { from: from.toISOString().split('T')[0], to };
  };

  const { from, to } = getDateRange();
  const queryParams: MohQueryParams = { 
    from, 
    to,
    ...(selectedRegion !== 'all' ? { region: selectedRegion } : {})
  };

  const { data: hospitalLoadData } = useGetHospitalLoadQuery(queryParams);
  const { data: hotspotsData } = useGetDiseaseHotspotsQuery(queryParams);
  const { data: severityData } = useGetSeverityDistributionQuery(queryParams);

  // Calculate regional statistics
  const regionalStats = hospitalLoadData?.data?.reduce((acc: any, hospital) => {
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
  }, {});

  // Calculate averages
  Object.keys(regionalStats || {}).forEach(region => {
    regionalStats[region].avgSeverity = regionalStats[region].avgSeverity / regionalStats[region].hospitals;
    regionalStats[region].acceptanceRate = regionalStats[region].totalReferrals > 0 
      ? (regionalStats[region].totalAccepted / regionalStats[region].totalReferrals) * 100 
      : 0;
  });

  const regions = Object.keys(regionalStats || {});
  const selectedRegionData = selectedRegion !== 'all' && regionalStats?.[selectedRegion] 
    ? regionalStats[selectedRegion] 
    : null;

  return (
    <div className="min-h-screen bg-background p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Regional Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Deep dive into regional healthcare performance and capacity distribution
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-[160px] bg-card border-border/50 shadow-sm">
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regions.map(region => (
                <SelectItem key={region} value={region}>{region}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[140px] bg-card border-border/50 shadow-sm">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Regional Overview Cards */}
      {selectedRegion !== 'all' && selectedRegionData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-5 border border-border/40 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Building2 className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Hospitals</p>
            </div>
            <p className="text-2xl font-bold">{selectedRegionData.hospitals}</p>
          </div>

          <div className="bg-card rounded-xl p-5 border border-border/40 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-green-50">
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Total Referrals</p>
            </div>
            <p className="text-2xl font-bold">{selectedRegionData.totalReferrals.toLocaleString()}</p>
          </div>

          <div className="bg-card rounded-xl p-5 border border-border/40 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-indigo-50">
                <CheckCircle2 className="h-5 w-5 text-indigo-500" />
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Acceptance Rate</p>
            </div>
            <p className="text-2xl font-bold">{selectedRegionData.acceptanceRate.toFixed(1)}%</p>
          </div>

          <div className="bg-card rounded-xl p-5 border border-border/40 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-orange-50">
                <Activity className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Avg Severity</p>
            </div>
            <p className="text-2xl font-bold">{selectedRegionData.avgSeverity.toFixed(1)}</p>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="h-[400px]">
            <RegionalWorkload queryParams={queryParams} />
          </div>
          
          {/* Regional Comparison */}
          <div className="bg-card rounded-xl p-6 border border-border/40 shadow-sm">
            <h2 className="text-sm font-bold mb-6">Regional Comparison</h2>
            <div className="space-y-4">
              {Object.entries(regionalStats || {})
                .sort((a: any, b: any) => b[1].totalReferrals - a[1].totalReferrals)
                .slice(0, 5)
                .map(([region, stats]: [string, any]) => (
                  <div key={region} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-bold text-foreground">{region}</span>
                      </div>
                      <span className="text-xs font-bold text-muted-foreground">
                        {stats.totalReferrals.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={stats.acceptanceRate} 
                        className="h-1.5 flex-1" 
                      />
                      <span className={cn(
                        "text-[10px] font-bold w-12 text-right",
                        stats.acceptanceRate > 80 ? "text-green-500" : 
                        stats.acceptanceRate > 60 ? "text-orange-500" : "text-red-500"
                      )}>
                        {stats.acceptanceRate.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Middle Column */}
        <div className="lg:col-span-5">
          <div className="h-full">
            <PerformanceMatrix queryParams={queryParams} />
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-3">
          <div className="h-[600px]">
            <DiseaseHeatmap queryParams={queryParams} />
          </div>
        </div>
      </div>

      {/* Regional Severity Distribution */}
      <div className="bg-card rounded-xl p-6 border border-border/40 shadow-sm">
        <h2 className="text-sm font-bold mb-6">Severity Distribution by Region</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {severityData?.data?.slice(0, 6).map((item) => {
            const total = item.total_referrals;
            const criticalPct = (item.critical_count / total) * 100;
            const urgentPct = (item.urgent_count / total) * 100;
            const routinePct = (item.routine_count / total) * 100;

            return (
              <div key={item.region} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-foreground">{item.region}</h3>
                  <span className="text-xs text-muted-foreground">{total} cases</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">Critical</span>
                    <span className="font-bold text-red-500">{criticalPct.toFixed(0)}%</span>
                  </div>
                  <Progress value={criticalPct} className="h-1.5 [&>div]:bg-red-500" />
                  
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">Urgent</span>
                    <span className="font-bold text-orange-500">{urgentPct.toFixed(0)}%</span>
                  </div>
                  <Progress value={urgentPct} className="h-1.5 [&>div]:bg-orange-500" />
                  
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">Routine</span>
                    <span className="font-bold text-green-500">{routinePct.toFixed(0)}%</span>
                  </div>
                  <Progress value={routinePct} className="h-1.5 [&>div]:bg-green-500" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
