"use client";

import React, { useState } from "react";
import {
  ChevronRight,
  History,
  Plus,
  FileText,
  Calendar,
  MoreVertical,
  Mail,
  CloudUpload,
  Settings,
  X,
  Play,
  Download,
  RotateCcw,
  RefreshCw,
  MoreHorizontal,
  LayoutTemplate,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

const ReportCard = ({ title, schedule, icon: Icon, color }: any) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between group hover:shadow-md transition-all duration-300">
    <div className="flex gap-4">
      <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center shrink-0", color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-slate-800 leading-tight pr-4">{title}</h3>
        <p className="text-[10px] text-slate-400 font-medium">Next run: {schedule}</p>
      </div>
    </div>
    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 group-hover:text-slate-500">
      <MoreVertical className="h-4 w-4" />
    </Button>
  </div>
);

const MetricItem = ({ label }: { label: string }) => (
  <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-center gap-3 cursor-grab active:cursor-grabbing hover:border-primary/30 hover:shadow-sm transition-all group">
    <GripVertical className="h-4 w-4 text-slate-300 group-hover:text-primary/50 transition-colors" />
    <span className="text-xs font-bold text-slate-600">{label}</span>
  </div>
);

// --- Main Component ---

export function ReportingHub() {
  const [emailDelivery, setEmailDelivery] = useState(true);
  const [sftpUpload, setSftpUpload] = useState(false);

  const automatedReports = [
    { title: "Weekly Epidemiological Bulletin", schedule: "Mon, 08:00 AM", icon: RefreshCw, color: "bg-blue-50 text-blue-500" },
    { title: "Monthly Facility Capacity", schedule: "1st of month", icon: Plus, color: "bg-indigo-50 text-indigo-500" },
    { title: "Vaccine Cold Chain Report", schedule: "Daily at 23:00", icon: LayoutTemplate, color: "bg-cyan-50 text-cyan-500" },
  ];

  const recentExports = [
    { name: "Epi_Bulletin_W24_National.pdf", format: "PDF Document", time: "Today, 09:12 AM", author: "System (Auto)", status: "READY", action: "DOWNLOAD" },
    { name: "Facility_Utilization_Q2_Final.xlsx", format: "Excel Sheet", time: "Yesterday, 04:45 PM", author: "A. Thorne", status: "READY", action: "DOWNLOAD" },
    { name: "Region_7_Malaria_Snapshot.pdf", format: "PDF Document", time: "12 Oct 2023, 11:02 AM", author: "L. Vasquez", status: "EXPIRED", action: "REGENERATE" },
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
            Official document generation center for epidemiological trends, facility capacities, and localized health initiatives.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl font-bold h-11 px-6 border-slate-200 bg-white">
            <History className="h-4 w-4 mr-2 text-slate-400" />
            Audit Logs
          </Button>
          <Button className="rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white font-bold h-11 px-6">
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Automated Reports & Settings (4/12) */}
        <div className="lg:col-span-4 space-y-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Automated Reports</h2>
              <Badge variant="secondary" className="bg-blue-100 text-blue-600 border-none font-bold text-[9px] uppercase tracking-widest">Recurring</Badge>
            </div>
            <div className="space-y-3">
              {automatedReports.map((report, idx) => (
                <ReportCard key={idx} {...report} />
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 text-white space-y-8 relative overflow-hidden group shadow-2xl shadow-slate-900/10">
            <div className="absolute bottom-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                <Calendar className="h-32 w-32" />
            </div>
            
            <div>
                <h2 className="text-sm font-bold uppercase tracking-widest mb-2">Schedule Settings</h2>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Manage distribution lists and automated delivery protocols.</p>
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
                        <span className="text-xs font-bold">SFTP Upload</span>
                    </div>
                    <CustomSwitch checked={sftpUpload} onChange={() => setSftpUpload(!sftpUpload)} />
                </div>
            </div>

            <Button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl py-6 font-bold uppercase tracking-widest text-[10px] relative z-10">
                Configure Nodes
            </Button>
          </div>
        </div>

        {/* Right Column: Master Report Builder (8/12) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[580px]">
          <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
            <div className="space-y-1">
                <h2 className="text-lg font-black text-slate-900">Custom Report Builder</h2>
                <p className="text-xs text-slate-400 font-medium">Drag metrics from the shelf onto the canvas to generate ad-hoc reports.</p>
            </div>
            <div className="flex items-center gap-3">
                <Button variant="ghost" className="text-[10px] font-black uppercase text-slate-400 hover:text-red-500">Clear Canvas</Button>
                <Button className="bg-primary hover:bg-primary/90 rounded-xl px-6 py-5 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/10">Run Generator</Button>
            </div>
          </div>

          <div className="flex-1 flex flex-col md:flex-row divide-x divide-slate-100">
            {/* Shelf */}
            <div className="w-full md:w-56 p-6 space-y-6 shrink-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Available Metrics</p>
                <div className="space-y-2">
                    <MetricItem label="Mortality Rate" />
                    <MetricItem label="Bed Occupancy" />
                    <MetricItem label="Stock Out Index" />
                    <MetricItem label="Avg Recovery" />
                    <MetricItem label="Lab TAT" />
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 p-12 bg-slate-50/20 flex flex-col items-center justify-center relative group">
                <div className="max-w-md w-full border-2 border-dashed border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-6 bg-white shadow-inner transition-all hover:border-primary/20 hover:bg-slate-50/50">
                    <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                        <LayoutTemplate className="h-8 w-8 text-slate-300 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-black text-slate-800">Drag items here to begin</p>
                        <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">Create a composite report by selecting multiple data points from the left sidebar.</p>
                    </div>

                    <div className="pt-6 flex flex-col md:flex-row items-center gap-4 w-full">
                        <Select defaultValue="pdf">
                            <SelectTrigger className="w-full h-11 bg-slate-50 border-slate-200 rounded-xl text-xs font-bold text-slate-700">
                                <SelectValue placeholder="Format" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pdf">PDF Format</SelectItem>
                                <SelectItem value="xlsx">Excel Sheet</SelectItem>
                                <SelectItem value="csv">CSV Data</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-[10px] font-bold text-slate-300 uppercase shrink-0">or</p>
                        <Button variant="ghost" className="w-full h-11 text-blue-500 hover:text-blue-600 hover:bg-blue-50/50 font-bold text-xs rounded-xl">Upload Template</Button>
                    </div>
                </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Table: Recent Exports */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 pb-4 flex items-center justify-between border-b border-slate-50">
            <h2 className="text-base font-black text-slate-900 uppercase">Recent Exports & Archives</h2>
            <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-slate-400">Showing last 48 hours</span>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:bg-blue-50 rounded-lg">
                    <RotateCcw className="h-4 w-4" />
                </Button>
            </div>
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
                        <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right pr-8 py-5 text-transparent">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentExports.map((row, idx) => (
                        <TableRow key={idx} className="border-slate-50 group hover:bg-slate-50/30 transition-colors">
                            <TableCell className="pl-8 py-5">
                                <div className="flex items-center gap-3">
                                    <div className={cn("p-2 rounded-lg bg-red-50 text-red-500", row.name.endsWith('.xlsx') && "bg-green-50 text-green-500", row.name.includes('Malaria') && "bg-blue-50 text-blue-500")}>
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <span className="text-[13px] font-bold text-slate-700">{row.name}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-[13px] font-medium text-slate-500">{row.format}</TableCell>
                            <TableCell className="text-[13px] font-medium text-slate-500">{row.time}</TableCell>
                            <TableCell className="py-5">
                                <div className="flex items-center gap-2">
                                    <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                        {row.author.charAt(0)}
                                    </div>
                                    <span className="text-[13px] font-bold text-slate-600">{row.author}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-center py-5">
                                <Badge variant="secondary" className={cn(
                                    "font-black text-[9px] uppercase tracking-wider px-3",
                                    row.status === "READY" ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"
                                )}>
                                    <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", row.status === "READY" ? "bg-green-500" : "bg-slate-400")} />
                                    {row.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right pr-8 py-5">
                                <Button variant="ghost" className={cn(
                                    "text-[11px] font-black uppercase tracking-widest hover:bg-transparent px-0",
                                    row.action === "DOWNLOAD" ? "text-blue-500 hover:text-blue-600" : "text-slate-400 hover:text-slate-500"
                                )}>
                                    {row.action}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
      </div>

    </div>
  );
}
