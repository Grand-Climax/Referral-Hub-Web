"use client";

import React, { useState } from "react";
import {
  ChevronRight,
  FileText,
  Calendar,
  Mail,
  CloudUpload,
  Download,
  RotateCcw,
  RefreshCw,
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
import { toast } from "sonner";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Sub-components (Local) ---

const CustomSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={cn(
      "relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
      checked ? "bg-blue-500" : "bg-slate-700"
    )}
  >
    <span
      className={cn(
        "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform",
        checked ? "translate-x-5" : "translate-x-1"
      )}
    />
  </button>
);

const ReportCard = ({ title, schedule, icon: Icon, color, enabled, onToggle }: any) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between group hover:shadow-md transition-all duration-300">
    <div className="flex gap-4 flex-1">
      <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center shrink-0", color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="space-y-1 flex-1">
        <h3 className="text-sm font-bold text-slate-800 leading-tight pr-4">{title}</h3>
        <p className="text-[10px] text-slate-400 font-medium">Next run: {schedule}</p>
      </div>
    </div>
    <CustomSwitch checked={enabled} onChange={onToggle} />
  </div>
);

const MetricItem = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
  <div 
    onClick={onClick}
    className={cn(
      "bg-white p-3 rounded-xl border flex items-center gap-3 cursor-pointer hover:shadow-sm transition-all group",
      selected ? "border-primary bg-primary/5" : "border-slate-100 hover:border-primary/30"
    )}
  >
    <GripVertical className={cn(
      "h-4 w-4 transition-colors",
      selected ? "text-primary" : "text-slate-300 group-hover:text-primary/50"
    )} />
    <span className={cn(
      "text-xs font-bold",
      selected ? "text-primary" : "text-slate-600"
    )}>{label}</span>
  </div>
);

// --- Main Component ---

export function ReportingHub() {
  const [emailDelivery, setEmailDelivery] = useState(true);
  const [sftpUpload, setSftpUpload] = useState(false);
  const [exportFormat, setExportFormat] = useState("pdf");
  const [timeRange, setTimeRange] = useState("30days");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [exportHistory, setExportHistory] = useState<any[]>([]);
  const [reportPreview, setReportPreview] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [automatedReports, setAutomatedReports] = useState([
    { id: 1, title: "Weekly Referral Summary", schedule: "Mon, 08:00 AM", icon: RefreshCw, color: "bg-blue-50 text-blue-500", enabled: true },
    { id: 2, title: "Monthly Hospital Capacity", schedule: "1st of month", icon: LayoutTemplate, color: "bg-indigo-50 text-indigo-500", enabled: true },
    { id: 3, title: "Daily Critical Alerts", schedule: "Daily at 23:00", icon: Mail, color: "bg-cyan-50 text-cyan-500", enabled: false },
  ]);
  
  const [triggerExport, { isLoading: isExporting }] = useLazyExportReportQuery();
  
  const getDateRange = () => {
    const to = new Date().toISOString().split('T')[0];
    const from = new Date();
    
    switch (timeRange) {
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
  const { data: summaryData } = useGetDashboardSummaryQuery({ from, to });
  const { data: hospitalData } = useGetHospitalLoadQuery({ from, to });

  const handleGeneratePreview = async (useAllMetrics = false) => {
    if (!useAllMetrics && selectedMetrics.length === 0) {
      toast.error("Please select at least one metric");
      return;
    }
    
    setIsGenerating(true);
    try {
      const result = await triggerExport({ from, to }).unwrap();
      
      // If generating from top button or all metrics selected, use full report
      if (useAllMetrics || selectedMetrics.length === 0 || selectedMetrics.length >= 4) {
        setReportPreview(result);
        toast.success("Report preview generated!");
        setIsGenerating(false);
        return;
      }
      
      // Filter the report based on selected metrics
      const filteredReport: any = {
        summary: {},
        hospital_load: result.hospital_load,
      };
      
      // Only include selected summary metrics
      if (selectedMetrics.includes("Total Referrals")) {
        filteredReport.summary.total_referrals = result.summary.total_referrals;
      }
      if (selectedMetrics.includes("Acceptance Rate")) {
        filteredReport.summary.acceptance_rate_percentage = result.summary.acceptance_rate_percentage;
        filteredReport.summary.total_accepted = result.summary.total_accepted;
        filteredReport.summary.total_rejected = result.summary.total_rejected;
      }
      if (selectedMetrics.includes("Avg Severity Score")) {
        filteredReport.summary.average_ml_severity_score = result.summary.average_ml_severity_score;
      }
      if (selectedMetrics.includes("Hospital Load")) {
        // Keep hospital load data
        filteredReport.summary.total_admitted = result.summary.total_admitted;
        filteredReport.summary.average_turnaround_hours = result.summary.average_turnaround_hours;
      }
      if (selectedMetrics.includes("Regional Distribution")) {
        // Keep all data for regional analysis
        filteredReport.summary = { ...result.summary };
      }
      
      // If no metrics in filtered report, use full report
      if (Object.keys(filteredReport.summary).length === 0) {
        filteredReport.summary = result.summary;
      }
      
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
        // Generate PDF directly using jsPDF
        const doc = new jsPDF();
        const summary = reportPreview.summary;
        
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
        if (selectedMetrics.includes("Hospital Load") || selectedMetrics.includes("Regional Distribution")) {
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Hospital Load Analysis', 20, currentY);
          
          const hospitalData = reportPreview.hospital_load.slice(0, 15).map((hospital: any) => [
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
            body: hospitalData,
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
        
        // Footer
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.text(
            'Ministry of Health - National Referral System | Aggregate data only, no patient PII',
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
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
        const summary = reportPreview.summary;
        const csvRows = [
          ['=== MOH Analytics Report ==='],
          ['Generated:', new Date().toLocaleString()],
          ['Period:', `${from} to ${to}`],
          [''],
          ['=== Summary Metrics ==='],
          ['Metric', 'Value'],
          ['Total Referrals', summary.total_referrals],
          ['Total Accepted', summary.total_accepted],
          ['Total Rejected', summary.total_rejected],
          ['Total Admitted', summary.total_admitted],
          ['Acceptance Rate %', summary.acceptance_rate_percentage.toFixed(2)],
          ['Avg Severity Score', summary.average_ml_severity_score.toFixed(2)],
          ['Avg Turnaround Hours', summary.average_turnaround_hours.toFixed(2)],
          [''],
          ['=== Hospital Load Data ==='],
          ['Hospital Name', 'Region', 'Total Referrals', 'Accepted', 'Rejected', 'Rejection Rate %', 'Avg Severity'],
        ];
        
        reportPreview.hospital_load.forEach((hospital: any) => {
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
  const toggleAutomatedReport = (id: number) => {
    setAutomatedReports(reports => 
      reports.map(report => 
        report.id === id ? { ...report, enabled: !report.enabled } : report
      )
    );
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
    <div className="min-h-screen bg-slate-50/30 p-8 space-y-8 select-none">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase mb-1">
            <span>Analytics</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary/80">Reports Hub</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">National Health Reporting Hub</h1>
          <p className="text-sm text-slate-500 max-w-2xl mt-1">
            Generate comprehensive reports with real-time data from the national referral system.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px] bg-white border-slate-200 rounded-xl h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase mb-2">Total Referrals</p>
          <p className="text-2xl font-bold text-slate-900">{summaryData?.total_referrals?.toLocaleString() || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase mb-2">Acceptance Rate</p>
          <p className="text-2xl font-bold text-green-500">{summaryData?.acceptance_rate_percentage?.toFixed(1) || 0}%</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase mb-2">Hospitals Tracked</p>
          <p className="text-2xl font-bold text-slate-900">{hospitalData?.data?.length || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase mb-2">Avg Turnaround</p>
          <p className="text-2xl font-bold text-blue-500">{summaryData?.average_turnaround_hours?.toFixed(1) || 0}h</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Automated Reports & Settings (4/12) */}
        <div className="lg:col-span-4 space-y-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Automated Reports</h2>
              <Badge variant="secondary" className="bg-blue-100 text-blue-600 border-none font-bold text-[9px] uppercase tracking-widest">
                {automatedReports.filter(r => r.enabled).length} Active
              </Badge>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-3">
              <p className="text-[10px] text-yellow-800 font-medium">
                <strong>Note:</strong> Automated reports are scheduled configurations. Toggle to enable/disable. Actual scheduling requires backend setup.
              </p>
            </div>
            <div className="space-y-3">
              {automatedReports.map((report) => (
                <ReportCard 
                  key={report.id} 
                  {...report} 
                  onToggle={() => toggleAutomatedReport(report.id)}
                />
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 text-white space-y-8 relative overflow-hidden group shadow-2xl shadow-slate-900/10">
            <div className="absolute bottom-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                <Calendar className="h-32 w-32" />
            </div>
            
            <div>
                <h2 className="text-sm font-bold uppercase tracking-widest mb-2">Delivery Settings</h2>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Configure how reports are distributed</p>
            </div>

            <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-slate-500" />
                        <span className="text-xs font-bold">Email Delivery</span>
                    </div>
                    <CustomSwitch checked={emailDelivery} onChange={() => setEmailDelivery(!emailDelivery)} />
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <CloudUpload className="h-4 w-4 text-slate-500" />
                        <span className="text-xs font-bold">Cloud Storage</span>
                    </div>
                    <CustomSwitch checked={sftpUpload} onChange={() => setSftpUpload(!sftpUpload)} />
                </div>
            </div>
          </div>
        </div>

        {/* Right Column: Report Builder (8/12) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[580px]">
          <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
            <div className="space-y-1">
                <h2 className="text-lg font-black text-slate-900">Custom Report Builder</h2>
                <p className="text-xs text-slate-400 font-medium">Select metrics to include in your custom report</p>
            </div>
            <div className="flex items-center gap-3">
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger className="w-[140px] bg-white border-slate-200 rounded-xl h-10">
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

          <div className="flex-1 flex flex-col md:flex-row divide-x divide-slate-100">
            {/* Shelf */}
            <div className="w-full md:w-56 p-6 space-y-6 shrink-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Available Metrics</p>
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
            <div className="flex-1 p-12 bg-slate-50/20 flex flex-col items-center justify-center relative group">
                {reportPreview ? (
                  <div className="max-w-2xl w-full space-y-4">
                    <div className="bg-white border-2 border-green-200 rounded-2xl p-6 max-h-[400px] overflow-y-auto">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Report Preview</h3>
                          <p className="text-[10px] text-slate-500 mt-1">
                            {selectedMetrics.length} metric{selectedMetrics.length !== 1 ? 's' : ''} selected
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-600 border-none">Ready</Badge>
                      </div>
                      
                      <div className="space-y-4">
                        {Object.keys(reportPreview.summary).length > 0 && (
                          <div className="grid grid-cols-2 gap-3">
                            {reportPreview.summary.total_referrals !== undefined && (
                              <div className="bg-slate-50 p-3 rounded-lg">
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Total Referrals</p>
                                <p className="text-lg font-bold text-slate-900">{reportPreview.summary.total_referrals.toLocaleString()}</p>
                              </div>
                            )}
                            {reportPreview.summary.acceptance_rate_percentage !== undefined && (
                              <div className="bg-slate-50 p-3 rounded-lg">
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Acceptance Rate</p>
                                <p className="text-lg font-bold text-green-600">{reportPreview.summary.acceptance_rate_percentage.toFixed(1)}%</p>
                              </div>
                            )}
                            {reportPreview.summary.average_ml_severity_score !== undefined && (
                              <div className="bg-slate-50 p-3 rounded-lg">
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Avg Severity</p>
                                <p className="text-lg font-bold text-orange-600">{reportPreview.summary.average_ml_severity_score.toFixed(2)}</p>
                              </div>
                            )}
                            {reportPreview.summary.average_turnaround_hours !== undefined && (
                              <div className="bg-slate-50 p-3 rounded-lg">
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Avg Turnaround</p>
                                <p className="text-lg font-bold text-blue-600">{reportPreview.summary.average_turnaround_hours.toFixed(1)}h</p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {(selectedMetrics.includes("Hospital Load") || selectedMetrics.includes("Regional Distribution")) && (
                          <div className="pt-4 border-t">
                            <p className="text-xs text-slate-500 mb-2 font-medium">Top 3 Hospitals by Volume:</p>
                            <div className="space-y-2">
                              {reportPreview.hospital_load.slice(0, 3).map((hospital: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between text-xs">
                                  <span className="font-medium text-slate-700">{hospital.hospital_name}</span>
                                  <span className="font-bold text-slate-900">{hospital.total_referrals_received}</span>
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
                    <div className="bg-white border-2 border-primary/20 rounded-2xl p-6">
                      <h3 className="text-sm font-bold text-slate-900 mb-4">Selected Metrics ({selectedMetrics.length})</h3>
                      <div className="space-y-2">
                        {selectedMetrics.map(metric => (
                          <div key={metric} className="flex items-center justify-between p-2 bg-primary/5 rounded-lg">
                            <span className="text-xs font-bold text-slate-700">{metric}</span>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-6 w-6 p-0 text-slate-400 hover:text-red-500"
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
                  <div className="max-w-md w-full border-2 border-dashed border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-6 bg-white shadow-inner">
                      <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center">
                          <LayoutTemplate className="h-8 w-8 text-slate-300" />
                      </div>
                      <div className="space-y-1">
                          <p className="text-sm font-black text-slate-800">Select metrics to begin</p>
                          <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">Choose data points from the left sidebar to create your custom report.</p>
                      </div>
                  </div>
                )}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Table: Recent Exports */}
      {exportHistory.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 pb-4 flex items-center justify-between border-b border-slate-50">
              <h2 className="text-base font-black text-slate-900 uppercase">Recent Exports</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-blue-500 hover:bg-blue-50 rounded-lg"
                onClick={() => setExportHistory([])}
              >
                  <RotateCcw className="h-4 w-4" />
              </Button>
          </div>

          <div className="overflow-x-auto">
              <Table>
                  <TableHeader className="bg-slate-50/50">
                      <TableRow className="border-none">
                          <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-8 py-5">Report Name</TableHead>
                          <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-5">Format</TableHead>
                          <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-5">Timestamp</TableHead>
                          <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-5">Generated By</TableHead>
                          <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center py-5">Status</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {exportHistory.map((row, idx) => (
                          <TableRow key={idx} className="border-slate-50 group hover:bg-slate-50/30 transition-colors">
                              <TableCell className="pl-8 py-5">
                                  <div className="flex items-center gap-3">
                                      <div className={cn(
                                        "p-2 rounded-lg",
                                        row.format === 'JSON' && "bg-blue-50 text-blue-500",
                                        row.format === 'CSV' && "bg-green-50 text-green-500",
                                        row.format === 'XLSX' && "bg-indigo-50 text-indigo-500"
                                      )}>
                                          {row.format === 'JSON' && <FileJson className="h-4 w-4" />}
                                          {row.format === 'CSV' && <FileText className="h-4 w-4" />}
                                          {row.format === 'XLSX' && <FileSpreadsheet className="h-4 w-4" />}
                                      </div>
                                      <span className="text-[13px] font-bold text-slate-700">{row.name}</span>
                                  </div>
                              </TableCell>
                              <TableCell className="text-[13px] font-medium text-slate-500">{row.format}</TableCell>
                              <TableCell className="text-[13px] font-medium text-slate-500">{row.time}</TableCell>
                              <TableCell className="py-5">
                                  <span className="text-[13px] font-bold text-slate-600">{row.author}</span>
                              </TableCell>
                              <TableCell className="text-center py-5">
                                  <Badge variant="secondary" className="bg-green-100 text-green-600 font-black text-[9px] uppercase tracking-wider px-3">
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
