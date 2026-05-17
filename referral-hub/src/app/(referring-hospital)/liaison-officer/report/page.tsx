"use client";

import React, { useState } from "react";
import {
  ChevronRight,
  FileText,
  Download,
  BarChart3,
  Clock,
  CheckCircle2,
  XCircle,
  LayoutTemplate,
  FileJson,
  FileSpreadsheet,
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
import { useGetLiaisonDashboardStatsQuery, useGetReferralsQuery } from "@/features/liaison/liaisonApi";
import type { ReferralListItem } from "@/types/referral-list";
import { toast } from "sonner";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatStatus = (status: string) => {
  return status.replace(/_/g, " ");
};

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: "bg-blue-100 text-blue-800",
  UNDER_LIAISON_REVIEW: "bg-yellow-100 text-yellow-800",
  FORWARDED: "bg-purple-100 text-purple-800",
  UNDER_SPECIALIST_REVIEW: "bg-indigo-100 text-indigo-800",
  ACCEPTED: "bg-green-100 text-green-800",
  SCHEDULED: "bg-teal-100 text-teal-800",
  REJECTED_BY_LIAISON: "bg-red-100 text-red-800",
  REJECTED_BY_SPECIALIST: "bg-red-100 text-red-800",
  REJECTED_AFTER_SEND: "bg-red-100 text-red-800",
  NEED_REVISION: "bg-orange-100 text-orange-800",
  COMPLETED: "bg-gray-100 text-gray-800",
};

export default function LiaisonReportsPage() {
  const [exportFormat, setExportFormat] = useState("pdf");
  const [exportHistory, setExportHistory] = useState<any[]>([]);
  const [reportPreview, setReportPreview] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: stats, isLoading: statsLoading } = useGetLiaisonDashboardStatsQuery();
  const { data: allReferrals, isLoading: allLoading } = useGetReferralsQuery({ 
    page: 1, 
    page_size: 100, 
    listType: "all" 
  });
  const { data: approvedReferrals, isLoading: approvedLoading } = useGetReferralsQuery({ 
    page: 1, 
    page_size: 100, 
    listType: "approved" 
  });
  const { data: rejectedReferrals, isLoading: rejectedLoading } = useGetReferralsQuery({ 
    page: 1, 
    page_size: 100, 
    listType: "rejected" 
  });

  const totalReferrals = allReferrals?.total || 0;
  const approvedCount = approvedReferrals?.total || 0;
  const rejectedCount = rejectedReferrals?.total || 0;
  const pendingCount = stats?.pending_review?.count || 0;

  const approvalRate = totalReferrals > 0 ? ((approvedCount / totalReferrals) * 100).toFixed(1) : "0";
  const rejectionRate = totalReferrals > 0 ? ((rejectedCount / totalReferrals) * 100).toFixed(1) : "0";

  // Group referrals by status
  const statusCounts: Record<string, number> = {};
  allReferrals?.data?.forEach((referral: ReferralListItem) => {
    statusCounts[referral.status] = (statusCounts[referral.status] || 0) + 1;
  });

  // Group referrals by department
  const departmentCounts: Record<string, number> = {};
  allReferrals?.data?.forEach((referral: ReferralListItem) => {
    const dept = referral.department || "Unknown";
    departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
  });

  const isLoading = statsLoading || allLoading || approvedLoading || rejectedLoading;

  const handleGeneratePreview = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setReportPreview({
        totalReferrals,
        approvedCount,
        rejectedCount,
        pendingCount,
        approvalRate,
        rejectionRate,
        statusCounts,
        departmentCounts,
        referrals: allReferrals?.data || [],
      });
      setIsGenerating(false);
      toast.success("Report preview generated!");
    }, 500);
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
        
        // Header
        doc.setFillColor(30, 64, 175);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('Liaison Officer Report', 20, 20);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 28);
        
        let currentY = 55;
        
        // Summary Metrics
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Summary Metrics', 20, currentY);
        
        const metrics = [
          ['Total Referrals', reportPreview.totalReferrals.toString()],
          ['Approved', reportPreview.approvedCount.toString()],
          ['Rejected', reportPreview.rejectedCount.toString()],
          ['Pending Review', reportPreview.pendingCount.toString()],
          ['Approval Rate', `${reportPreview.approvalRate}%`],
          ['Rejection Rate', `${reportPreview.rejectionRate}%`],
        ];
        
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
        
        // Status Distribution
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Status Distribution', 20, currentY);
        
        const statusData = Object.entries(reportPreview.statusCounts).map(([status, count]) => [
          formatStatus(status),
          (count as number).toString(),
          `${(((count as number) / reportPreview.totalReferrals) * 100).toFixed(1)}%`
        ]);
        
        autoTable(doc, {
          startY: currentY + 5,
          head: [['Status', 'Count', 'Percentage']],
          body: statusData,
          theme: 'striped',
          headStyles: { fillColor: [30, 64, 175], fontSize: 9, fontStyle: 'bold' },
          styles: { fontSize: 8 },
        });
        
        filename = `liaison-report-${new Date().toISOString().split("T")[0]}.pdf`;
        doc.save(filename);
        
      } else if (exportFormat === 'json') {
        const dataStr = JSON.stringify(reportPreview, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        filename = `liaison-report-${new Date().toISOString().split("T")[0]}.json`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
      } else if (exportFormat === 'csv') {
        const csvRows = [
          ['=== Liaison Officer Report ==='],
          ['Generated:', new Date().toLocaleString()],
          [''],
          ['=== Summary Metrics ==='],
          ['Metric', 'Value'],
          ['Total Referrals', reportPreview.totalReferrals],
          ['Approved', reportPreview.approvedCount],
          ['Rejected', reportPreview.rejectedCount],
          ['Pending Review', reportPreview.pendingCount],
          ['Approval Rate %', reportPreview.approvalRate],
          ['Rejection Rate %', reportPreview.rejectionRate],
          [''],
          ['=== Status Distribution ==='],
          ['Status', 'Count', 'Percentage'],
        ];
        
        Object.entries(reportPreview.statusCounts).forEach(([status, count]) => {
          csvRows.push([
            formatStatus(status),
            (count as number).toString(),
            `${(((count as number) / reportPreview.totalReferrals) * 100).toFixed(1)}%`
          ]);
        });
        
        const dataStr = csvRows.map(row => row.join(',')).join('\n');
        const dataBlob = new Blob([dataStr], { type: 'text/csv' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        filename = `liaison-report-${new Date().toISOString().split("T")[0]}.csv`;
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

  return (
    <div className="min-h-screen bg-slate-50/30 p-8 space-y-8 select-none">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase mb-1">
            <span>Liaison Officer</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary/80">Reports Hub</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Referral Reports Hub</h1>
          <p className="text-sm text-slate-500 max-w-2xl mt-1">
            Generate comprehensive reports with real-time data from your hospital's referrals.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!reportPreview ? (
            <Button 
              className="rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white font-bold h-11 px-6"
              onClick={handleGeneratePreview}
              disabled={isGenerating || isLoading}
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
          <p className="text-2xl font-bold text-slate-900">{totalReferrals.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase mb-2">Approval Rate</p>
          <p className="text-2xl font-bold text-green-500">{approvalRate}%</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase mb-2">Rejection Rate</p>
          <p className="text-2xl font-bold text-rose-500">{rejectionRate}%</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase mb-2">Pending Review</p>
          <p className="text-2xl font-bold text-amber-500">{pendingCount}</p>
        </div>
      </div>

      {/* Report Builder */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[580px]">
        <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-900">Report Builder</h2>
            <p className="text-xs text-slate-400 font-medium">Generate and download your referral reports</p>
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

        {/* Canvas Area */}
        <div className="flex-1 p-12 bg-slate-50/20 flex flex-col items-center justify-center relative group">
          {reportPreview ? (
            <div className="max-w-2xl w-full space-y-4">
              <div className="bg-white border-2 border-green-200 rounded-2xl p-6 max-h-[400px] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Report Preview</h3>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Ready to download
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-600 border-none">Ready</Badge>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Total Referrals</p>
                      <p className="text-lg font-bold text-slate-900">{reportPreview.totalReferrals.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Approval Rate</p>
                      <p className="text-lg font-bold text-green-600">{reportPreview.approvalRate}%</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Rejection Rate</p>
                      <p className="text-lg font-bold text-rose-600">{reportPreview.rejectionRate}%</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Pending</p>
                      <p className="text-lg font-bold text-amber-600">{reportPreview.pendingCount}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <p className="text-xs text-slate-500 mb-2 font-medium">Top 3 Departments:</p>
                    <div className="space-y-2">
                      {Object.entries(reportPreview.departmentCounts)
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .slice(0, 3)
                        .map(([dept, count], idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-700">{dept}</span>
                            <span className="font-bold text-slate-900">{count as number}</span>
                          </div>
                        ))}
                    </div>
                  </div>
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
          ) : (
            <div className="max-w-md w-full border-2 border-dashed border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-6 bg-white shadow-inner">
              <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center">
                <LayoutTemplate className="h-8 w-8 text-slate-300" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-slate-800">Click Generate Preview to begin</p>
                <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
                  Generate a preview of your referral report before downloading.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Table: Recent Exports */}
      {exportHistory.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 pb-4 flex items-center justify-between border-b border-slate-50">
            <h2 className="text-base font-black text-slate-900 uppercase">Recent Exports</h2>
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
                          row.format === 'PDF' && "bg-red-50 text-red-500"
                        )}>
                          {row.format === 'JSON' && <FileJson className="h-4 w-4" />}
                          {row.format === 'CSV' && <FileText className="h-4 w-4" />}
                          {row.format === 'PDF' && <FileSpreadsheet className="h-4 w-4" />}
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
