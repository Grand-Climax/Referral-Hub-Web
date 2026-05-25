"use client";

import React, { useMemo, useState } from "react";
import {
  ChevronRight,
  FileText,
  Download,
  RotateCcw,
  LayoutTemplate,
  GripVertical,
  FileSpreadsheet,
  FileJson,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useLazyExportReportQuery,
  useGetDashboardSummaryQuery,
  useGetHospitalLoadQuery,
} from "@/features/analytics/mohAnalyticsApi";
import {
  buildMohQueryParams,
  hospitalsFromLoad,
  mergeRegionOptions,
  type MohTimeframe,
} from "@/lib/mohAnalytics";
import { MohAnalyticsFilters } from "@/components/analytics/MohAnalyticsFilters";
import { MohQueryState } from "@/components/analytics/MohAnalyticsStates";
import type { ExportReportResponse, MohDashboardSummary } from "@/types/moh-analytics";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { addMohPdfWatermark } from "@/lib/mohPdfExport";
import {
  mohCard,
  mohCardPad,
  mohHeading,
  mohPageShell,
  mohSubheading,
  mohTableWrap,
} from "@/lib/mohAnalyticsUi";

// --- Sub-components (Local) ---

const MetricItem = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
  <div 
    onClick={onClick}
    className={cn(
      "bg-card p-3 rounded-xl border flex items-center gap-3 cursor-pointer hover:shadow-sm transition-all group",
      selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
    )}
  >
    <GripVertical className={cn(
      "h-4 w-4 transition-colors",
      selected ? "text-primary" : "text-muted-foreground/50 group-hover:text-primary/50"
    )} />
    <span className={cn(
      "text-xs font-bold",
      selected ? "text-primary" : "text-muted-foreground"
    )}>{label}</span>
  </div>
);

type ReportPreview = {
  summary: Partial<MohDashboardSummary>;
  hospital_load: ExportReportResponse["hospital_load"];
};

// --- Main Component ---

export function ReportingHub() {
  const [exportFormat, setExportFormat] = useState("pdf");
  const [timeRange, setTimeRange] = useState<MohTimeframe>("30days");
  const [region, setRegion] = useState("all");
  const [tierLevel, setTierLevel] = useState("all");
  const [hospitalId, setHospitalId] = useState("all");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [exportHistory, setExportHistory] = useState<any[]>([]);
  const [reportPreview, setReportPreview] = useState<ReportPreview | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [triggerExport] = useLazyExportReportQuery();
  
  const queryParams = useMemo(
    () =>
      buildMohQueryParams({
        timeframe: timeRange,
        region,
        tierLevel,
        hospitalId,
      }),
    [timeRange, region, tierLevel, hospitalId],
  );

  const { from, to } = queryParams;

  const { data: summaryData, isError: summaryError, refetch: refetchSummary } =
    useGetDashboardSummaryQuery(queryParams);

  const { data: hospitalData, isError: hospitalError, refetch: refetchHospital } =
    useGetHospitalLoadQuery(queryParams);

  const regionOptions = useMemo(
    () => mergeRegionOptions(hospitalData?.data?.map((h) => h.region) ?? []),
    [hospitalData],
  );

  const hospitalOptions = useMemo(
    () => hospitalsFromLoad(hospitalData?.data ?? []),
    [hospitalData],
  );

  const handleGeneratePreview = async (useAllMetrics = false) => {
    if (!useAllMetrics && selectedMetrics.length === 0) {
      toast.error("Please select at least one metric");
      return;
    }
    
    setIsGenerating(true);
    try {
      const result = await triggerExport(queryParams).unwrap();
      
      // If generating from top button or all metrics selected, use full report
      if (useAllMetrics || selectedMetrics.length === 0 || selectedMetrics.length >= 4) {
        setReportPreview(result);
        toast.success("Report preview generated!");
        setIsGenerating(false);
        return;
      }
      
      const filteredReport = filterExportPreview(
        result,
        selectedMetrics,
      );

      setReportPreview(filteredReport);
      toast.success("Report preview generated!");
    } catch (error) {
      toast.error("Failed to generate preview");
      console.error("Preview error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = () => {
    if (!reportPreview) {
      toast.error("Please generate a preview first");
      return;
    }

    try {
      let filename: string;
      
      if (exportFormat === 'pdf') {
        const doc = new jsPDF();
        const summary = reportPreview.summary as Partial<MohDashboardSummary>;
        const hospitalRows = reportPreview.hospital_load ?? [];

        // Header
        doc.setFillColor(30, 64, 175);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('MOH Analytics Report', 20, 20);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 28);
        doc.text(`Period: ${from} to ${to}`, 20, 34);
        
        let currentY = 55;
        
        // Summary Metrics - only show selected ones
        if (Object.keys(summary).length > 0) {
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Summary Metrics', 20, currentY);
          
          const metrics: any[] = [];
          if (summary.total_referrals !== undefined) {
            metrics.push(['Total Referrals', summary.total_referrals.toLocaleString()]);
          }
          if (summary.total_accepted !== undefined) {
            metrics.push(['Total Accepted', summary.total_accepted.toLocaleString()]);
          }
          if (summary.total_rejected !== undefined) {
            metrics.push(['Total Rejected', summary.total_rejected.toLocaleString()]);
          }
          if (summary.total_admitted !== undefined) {
            metrics.push(['Total Admitted', summary.total_admitted.toLocaleString()]);
          }
          if (summary.acceptance_rate_percentage !== undefined) {
            metrics.push(['Acceptance Rate', `${summary.acceptance_rate_percentage.toFixed(1)}%`]);
          }
          if (summary.average_ml_severity_score !== undefined) {
            metrics.push(['Avg Severity Score', summary.average_ml_severity_score.toFixed(2)]);
          }
          if (summary.average_turnaround_hours !== undefined) {
            metrics.push(['Avg Turnaround', `${summary.average_turnaround_hours.toFixed(1)} hours`]);
          }
          
          if (metrics.length > 0) {
            autoTable(doc, {
              startY: currentY + 10,
              head: [['Metric', 'Value']],
              body: metrics,
              theme: 'grid',
              headStyles: { fillColor: [59, 130, 246], fontSize: 10, fontStyle: 'bold' },
              styles: { fontSize: 9 },
              columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 80 },
                1: { halign: 'right', cellWidth: 80 }
              }
            });
            currentY = (doc as any).lastAutoTable.finalY + 15;
          }
        }
        
        // Hospital Load Analysis - only if Hospital Load metric is selected
        if (
          hospitalRows.length > 0 &&
          (selectedMetrics.length === 0 ||
            selectedMetrics.includes("Hospital Load") ||
            selectedMetrics.includes("Regional Distribution"))
        ) {
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Hospital Load Analysis', 20, currentY);
          
          const hospitalTableRows = hospitalRows.slice(0, 15).map((hospital) => [
            hospital.hospital_name,
            hospital.region,
            hospital.total_referrals_received.toString(),
            hospital.total_accepted.toString(),
            hospital.total_rejected.toString(),
            `${hospital.rejection_rate_percentage.toFixed(1)}%`,
            hospital.average_severity_score.toFixed(2),
          ]);
          
          autoTable(doc, {
            startY: currentY + 5,
            head: [['Hospital', 'Region', 'Referrals', 'Accepted', 'Rejected', 'Rej. Rate', 'Avg Severity']],
            body: hospitalTableRows,
            theme: 'striped',
            headStyles: { fillColor: [30, 64, 175], fontSize: 8, fontStyle: 'bold' },
            styles: { fontSize: 7 },
            columnStyles: {
              0: { cellWidth: 50 },
              1: { cellWidth: 30 },
              2: { halign: 'center', cellWidth: 20 },
              3: { halign: 'center', cellWidth: 20 },
              4: { halign: 'center', cellWidth: 20 },
              5: { halign: 'center', cellWidth: 20 },
              6: { halign: 'center', cellWidth: 25 },
            }
          });
        }
        
        addMohPdfWatermark(doc);

        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.text(
            "Ministry of Health - National Referral System | Aggregate data only, no patient PII",
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: "center" },
          );
        }
        
        filename = `moh-analytics-report-${to}.pdf`;
        doc.save(filename);
        
      } else if (exportFormat === 'json') {
        const dataStr = JSON.stringify(reportPreview, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        filename = `moh-analytics-report-${to}.json`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
      } else if (exportFormat === 'csv') {
        const summary = reportPreview.summary as Partial<MohDashboardSummary>;
        const hospitalRows = reportPreview.hospital_load ?? [];
        const csvRows: (string | number)[][] = [
          ['=== MOH Analytics Report ==='],
          ['Generated:', new Date().toLocaleString()],
          ['Period:', `${from} to ${to}`],
          [''],
          ['=== Summary Metrics ==='],
          ['Metric', 'Value'],
        ];

        if (summary.total_referrals !== undefined) {
          csvRows.push(['Total Referrals', summary.total_referrals]);
        }
        if (summary.total_accepted !== undefined) {
          csvRows.push(['Total Accepted', summary.total_accepted]);
        }
        if (summary.total_rejected !== undefined) {
          csvRows.push(['Total Rejected', summary.total_rejected]);
        }
        if (summary.total_admitted !== undefined) {
          csvRows.push(['Total Admitted', summary.total_admitted]);
        }
        if (summary.acceptance_rate_percentage !== undefined) {
          csvRows.push([
            'Acceptance Rate %',
            summary.acceptance_rate_percentage.toFixed(2),
          ]);
        }
        if (summary.average_ml_severity_score !== undefined) {
          csvRows.push([
            'Avg Severity Score',
            summary.average_ml_severity_score.toFixed(2),
          ]);
        }
        if (summary.average_turnaround_hours !== undefined) {
          csvRows.push([
            'Avg Turnaround Hours',
            summary.average_turnaround_hours.toFixed(2),
          ]);
        }

        if (hospitalRows.length > 0) {
          csvRows.push(
            [''],
            ['=== Hospital Load Data ==='],
            [
              'Hospital Name',
              'Region',
              'Total Referrals',
              'Accepted',
              'Rejected',
              'Rejection Rate %',
              'Avg Severity',
            ],
          );

          hospitalRows.forEach((hospital) => {
            csvRows.push([
              hospital.hospital_name,
              hospital.region,
              hospital.total_referrals_received,
              hospital.total_accepted,
              hospital.total_rejected,
              hospital.rejection_rate_percentage.toFixed(2),
              hospital.average_severity_score.toFixed(2),
            ]);
          });
        }
        
        const dataStr = csvRows.map(row => row.join(',')).join('\n');
        const dataBlob = new Blob([dataStr], { type: 'text/csv' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        filename = `moh-analytics-report-${to}.csv`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        toast.error("Unsupported format");
        return;
      }
      
      // Add to export history
      const newExport = {
        name: filename!,
        format: exportFormat.toUpperCase(),
        time: new Date().toLocaleString(),
        author: "Current User",
        status: "READY",
      };
      setExportHistory([newExport, ...exportHistory]);
      
      toast.success(`Report downloaded as ${exportFormat.toUpperCase()} successfully!`);
    } catch (error) {
      toast.error("Failed to download report");
      console.error("Download error:", error);
    }
  };
  const toggleMetric = (metric: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  const availableMetrics = [
    "Total Referrals",
    "Acceptance Rate",
    "Avg Severity Score",
    "Hospital Load",
    "Regional Distribution",
  ];

  return (
    <div className={mohPageShell}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase mb-1">
            <span>Analytics</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary/80">Reports Hub</span>
          </div>
          <h1 className={cn(mohHeading, "uppercase font-black")}>
            National Health Reporting Hub
          </h1>
          <p className={cn(mohSubheading, "max-w-2xl mt-1")}>
            Export on-demand reports from live MoH analytics data (summary and hospital load).
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <MohAnalyticsFilters
            regionOptions={regionOptions}
            hospitalOptions={hospitalOptions}
            values={{
              timeframe: timeRange,
              region,
              tierLevel,
              hospitalId,
            }}
            onTimeframeChange={setTimeRange}
            onRegionChange={setRegion}
            onTierLevelChange={setTierLevel}
            onHospitalChange={setHospitalId}
            showTierLevel
            showHospital={hospitalOptions.length > 0}
          />
          {!reportPreview ? (
            <Button 
              className="rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white font-bold h-11 px-6"
              onClick={() => handleGeneratePreview(true)}
              disabled={isGenerating}
            >
              <LayoutTemplate className="h-4 w-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate Preview"}
            </Button>
          ) : (
            <Button 
              className="rounded-xl shadow-lg shadow-green-500/20 bg-green-600 hover:bg-green-700 text-white font-bold h-11 px-6"
              onClick={handleDownloadReport}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <MohQueryState
        isLoading={false}
        isError={summaryError || hospitalError}
        onRetry={() => {
          refetchSummary();
          refetchHospital();
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className={cn(mohCard, "p-5")}>
            <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Total Referrals</p>
            <p className="text-2xl font-bold text-foreground">
              {summaryData?.total_referrals?.toLocaleString() || 0}
            </p>
          </div>
          <div className={cn(mohCard, "p-5")}>
            <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Acceptance Rate</p>
            <p className="text-2xl font-bold text-green-500">
              {summaryData?.acceptance_rate_percentage?.toFixed(1) || 0}%
            </p>
          </div>
          <div className={cn(mohCard, "p-5")}>
            <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Hospitals Tracked</p>
            <p className="text-2xl font-bold text-foreground">
              {hospitalData?.data?.length || 0}
            </p>
          </div>
          <div className={cn(mohCard, "p-5")}>
            <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Avg Turnaround</p>
            <p className="text-2xl font-bold text-blue-500">
              {summaryData?.average_turnaround_hours?.toFixed(1) || 0}h
            </p>
          </div>
        </div>
      </MohQueryState>

      <div className={cn(mohCard, "overflow-hidden flex flex-col min-h-[480px] lg:min-h-[580px]")}>
          <div className={cn(mohCardPad, "border-b border-border bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4")}>
            <div className="space-y-1">
                <h2 className="text-lg font-black text-foreground">Custom Report Builder</h2>
                <p className="text-xs text-muted-foreground font-medium">Select metrics to include in your custom report</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger className="w-full sm:w-[140px] bg-card border-border rounded-xl h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Format</SelectItem>
                    <SelectItem value="csv">CSV Format</SelectItem>
                    <SelectItem value="json">JSON Format</SelectItem>
                  </SelectContent>
                </Select>
            </div>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row lg:divide-x divide-border">
            <div className="w-full lg:w-56 p-4 sm:p-6 space-y-4 shrink-0 border-b lg:border-b-0 border-border max-h-[220px] lg:max-h-none overflow-y-auto">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Available Metrics</p>
                <div className="space-y-2">
                    {availableMetrics.map(metric => (
                      <MetricItem 
                        key={metric}
                        label={metric} 
                        selected={selectedMetrics.includes(metric)}
                        onClick={() => toggleMetric(metric)}
                      />
                    ))}
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 p-4 sm:p-8 lg:p-12 bg-muted/20 flex flex-col items-center justify-center relative min-h-[320px]">
                {reportPreview ? (
                  <div className="max-w-2xl w-full space-y-4">
                    <div className="bg-card border-2 border-green-200 rounded-2xl p-6 max-h-[400px] overflow-y-auto">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-sm font-bold text-foreground">Report Preview</h3>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {selectedMetrics.length} metric{selectedMetrics.length !== 1 ? 's' : ''} selected
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-600 border-none">Ready</Badge>
                      </div>
                      
                      <div className="space-y-4">
                        {Object.keys(reportPreview.summary).length > 0 && (
                          <div className="grid grid-cols-2 gap-3">
                            {reportPreview.summary.total_referrals !== undefined && (
                              <div className="bg-muted/50 p-3 rounded-lg">
                                <p className="text-[10px] text-muted-foreground font-bold uppercase">Total Referrals</p>
                                <p className="text-lg font-bold text-foreground">{reportPreview.summary.total_referrals.toLocaleString()}</p>
                              </div>
                            )}
                            {reportPreview.summary.acceptance_rate_percentage !== undefined && (
                              <div className="bg-muted/50 p-3 rounded-lg">
                                <p className="text-[10px] text-muted-foreground font-bold uppercase">Acceptance Rate</p>
                                <p className="text-lg font-bold text-green-600">{reportPreview.summary.acceptance_rate_percentage.toFixed(1)}%</p>
                              </div>
                            )}
                            {reportPreview.summary.average_ml_severity_score !== undefined && (
                              <div className="bg-muted/50 p-3 rounded-lg">
                                <p className="text-[10px] text-muted-foreground font-bold uppercase">Avg Severity</p>
                                <p className="text-lg font-bold text-orange-600">{reportPreview.summary.average_ml_severity_score.toFixed(2)}</p>
                              </div>
                            )}
                            {reportPreview.summary.average_turnaround_hours !== undefined && (
                              <div className="bg-muted/50 p-3 rounded-lg">
                                <p className="text-[10px] text-muted-foreground font-bold uppercase">Avg Turnaround</p>
                                <p className="text-lg font-bold text-blue-600">{reportPreview.summary.average_turnaround_hours.toFixed(1)}h</p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {(selectedMetrics.includes("Hospital Load") || selectedMetrics.includes("Regional Distribution")) && (
                          <div className="pt-4 border-t">
                            <p className="text-xs text-muted-foreground mb-2 font-medium">Top 3 Hospitals by Volume:</p>
                            <div className="space-y-2">
                              {(reportPreview.hospital_load ?? []).slice(0, 3).map((hospital, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs">
                                  <span className="font-medium text-foreground">{hospital.hospital_name}</span>
                                  <span className="font-bold text-foreground">{hospital.total_referrals_received}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        variant="outline"
                        className="flex-1 rounded-xl py-6 font-bold"
                        onClick={() => setReportPreview(null)}
                      >
                        Generate New
                      </Button>
                      <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl py-6 font-bold"
                        onClick={handleDownloadReport}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download {exportFormat.toUpperCase()}
                      </Button>
                    </div>
                  </div>
                ) : selectedMetrics.length > 0 ? (
                  <div className="max-w-md w-full space-y-4">
                    <div className="bg-card border-2 border-primary/20 rounded-2xl p-6">
                      <h3 className="text-sm font-bold text-foreground mb-4">Selected Metrics ({selectedMetrics.length})</h3>
                      <div className="space-y-2">
                        {selectedMetrics.map(metric => (
                          <div key={metric} className="flex items-center justify-between p-2 bg-primary/5 rounded-lg">
                            <span className="text-xs font-bold text-foreground">{metric}</span>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500"
                              onClick={() => toggleMetric(metric)}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90 rounded-xl py-6 font-bold"
                      onClick={() => handleGeneratePreview(false)}
                      disabled={isGenerating}
                    >
                      {isGenerating ? "Generating..." : "Generate Preview"}
                    </Button>
                  </div>
                ) : (
                  <div className="max-w-md w-full border-2 border-dashed border-border rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-6 bg-card shadow-inner">
                      <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                          <LayoutTemplate className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                          <p className="text-sm font-black text-foreground">Select metrics to begin</p>
                          <p className="text-xs text-muted-foreground font-medium max-w-xs mx-auto">Choose data points from the left sidebar to create your custom report.</p>
                      </div>
                  </div>
                )}
            </div>
          </div>
      </div>

      {/* Session download history (browser only) */}
      {exportHistory.length > 0 && (
        <div className={cn(mohCard, "overflow-hidden")}>
          <div className={cn(mohCardPad, "pb-4 flex items-center justify-between border-b border-border")}>
              <h2 className="text-base font-black text-foreground uppercase">Recent Exports</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-blue-500 hover:bg-blue-500/10 rounded-lg"
                onClick={() => setExportHistory([])}
              >
                  <RotateCcw className="h-4 w-4" />
              </Button>
          </div>

          <div className={mohTableWrap}>
              <Table>
                  <TableHeader className="bg-muted/50">
                      <TableRow className="border-none">
                          <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-4 sm:pl-8 py-5 min-w-[140px]">Report Name</TableHead>
                          <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest py-5">Format</TableHead>
                          <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest py-5">Timestamp</TableHead>
                          <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest py-5">Generated By</TableHead>
                          <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center py-5">Status</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {exportHistory.map((row, idx) => (
                          <TableRow key={idx} className="border-border group hover:bg-muted/30 transition-colors">
                              <TableCell className="pl-8 py-5">
                                  <div className="flex items-center gap-3">
                                      <div className={cn(
                                        "p-2 rounded-lg",
                                        row.format === "JSON" && "bg-blue-500/10 text-blue-500",
                                        row.format === "CSV" && "bg-green-500/10 text-green-500",
                                        row.format === "PDF" && "bg-red-500/10 text-red-500",
                                        row.format === "XLSX" && "bg-indigo-500/10 text-indigo-500",
                                      )}>
                                          {row.format === "JSON" && <FileJson className="h-4 w-4" />}
                                          {row.format === "CSV" && <FileText className="h-4 w-4" />}
                                          {row.format === "PDF" && <FileText className="h-4 w-4" />}
                                          {row.format === "XLSX" && <FileSpreadsheet className="h-4 w-4" />}
                                      </div>
                                      <span className="text-[13px] font-bold text-foreground">{row.name}</span>
                                  </div>
                              </TableCell>
                              <TableCell className="text-[13px] font-medium text-muted-foreground">{row.format}</TableCell>
                              <TableCell className="text-[13px] font-medium text-muted-foreground">{row.time}</TableCell>
                              <TableCell className="py-5">
                                  <span className="text-[13px] font-bold text-muted-foreground">{row.author}</span>
                              </TableCell>
                              <TableCell className="text-center py-5">
                                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400 font-black text-[9px] uppercase tracking-wider px-3">
                                      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-500" />
                                      {row.status}
                                  </Badge>
                              </TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
          </div>
        </div>
      )}

    </div>
  );
}

function filterExportPreview(
  result: ExportReportResponse,
  selectedMetrics: string[],
): ReportPreview {
  if (selectedMetrics.includes("Regional Distribution")) {
    return {
      summary: result.summary,
      hospital_load: result.hospital_load,
    };
  }

  const summary: Partial<MohDashboardSummary> = {};

  if (selectedMetrics.includes("Total Referrals")) {
    summary.total_referrals = result.summary.total_referrals;
  }
  if (selectedMetrics.includes("Acceptance Rate")) {
    summary.acceptance_rate_percentage = result.summary.acceptance_rate_percentage;
    summary.total_accepted = result.summary.total_accepted;
    summary.total_rejected = result.summary.total_rejected;
  }
  if (selectedMetrics.includes("Avg Severity Score")) {
    summary.average_ml_severity_score = result.summary.average_ml_severity_score;
  }
  if (selectedMetrics.includes("Hospital Load")) {
    summary.total_admitted = result.summary.total_admitted;
    summary.average_turnaround_hours = result.summary.average_turnaround_hours;
  }

  const showHospitals = selectedMetrics.includes("Hospital Load");

  return {
    summary:
      Object.keys(summary).length > 0 ? summary : result.summary,
    hospital_load: showHospitals ? result.hospital_load : [],
  };
}
