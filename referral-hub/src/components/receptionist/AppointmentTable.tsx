"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

const appointments = [
  {
    name: "Sarah Jenkins",
    id: "REF-9823-X",
    time: "09:15 AM",
    date: "Monday, Oct 24",
    department: "Cardiology",
    urgency: "CRITICAL",
    status: "Confirmed",
    statusColor: "bg-blue-500",
    urgencyColor: "bg-red-100 text-red-600",
  },
  {
    name: "Marcus Thorne",
    id: "REF-1142-A",
    time: "10:30 AM",
    date: "Monday, Oct 24",
    department: "Neurology",
    urgency: "URGENT",
    status: "Arrived",
    statusColor: "bg-orange-500",
    urgencyColor: "bg-orange-100 text-orange-600",
  },
  {
    name: "Emily Zhang",
    id: "REF-4490-K",
    time: "11:00 AM",
    date: "Monday, Oct 24",
    department: "Pediatrics",
    urgency: "ROUTINE",
    status: "Late",
    statusColor: "bg-red-500",
    urgencyColor: "bg-slate-100 text-slate-600",
  },
  {
    name: "Robert Miller",
    id: "REF-2231-M",
    time: "11:45 AM",
    date: "02:30 PM (New)",
    department: "Orthopedics",
    urgency: "ROUTINE",
    status: "Rescheduled",
    statusColor: "bg-slate-400",
    urgencyColor: "bg-slate-100 text-slate-600",
  },
];

export function AppointmentTable() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="text-xs font-bold text-slate-500">Monthly</Button>
          <Button variant="ghost" size="sm" className="text-xs font-bold text-slate-500">Weekly View</Button>
          <Button variant="secondary" size="sm" className="text-xs font-bold bg-white text-primary shadow-sm border border-slate-200">List View</Button>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quick Filters:</span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-xs font-bold text-slate-500">Today</Button>
            <Button variant="default" size="sm" className="text-xs font-bold bg-primary hover:bg-primary/90">Next 2 Days</Button>
            <Button variant="ghost" size="sm" className="text-xs font-bold text-slate-500">Next 3 Days</Button>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow className="border-none">
            <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-6 px-8">Patient Details</TableHead>
            <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-6">Appointment</TableHead>
            <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-6">Department</TableHead>
            <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-6 text-center">Urgency</TableHead>
            <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-6">Status</TableHead>
            <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-6 text-right px-8">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((appt) => (
            <TableRow key={appt.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors group">
              <TableCell className="py-6 px-8">
                <div>
                  <p className="font-bold text-slate-900 group-hover:text-primary transition-colors">{appt.name}</p>
                  <p className="text-[10px] font-medium text-slate-400">{appt.id}</p>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-bold text-slate-700">{appt.time}</p>
                  <p className="text-[10px] font-medium text-slate-400">{appt.date}</p>
                </div>
              </TableCell>
              <TableCell>
                <p className="text-sm font-medium text-slate-600">{appt.department}</p>
              </TableCell>
              <TableCell className="text-center">
                <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-tight ${appt.urgencyColor}`}>
                  {appt.urgency}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${appt.status === "Confirmed" ? "bg-primary" : appt.statusColor}`} />
                  <p className="text-sm font-medium text-slate-600">{appt.status}</p>
                </div>
              </TableCell>
              <TableCell className="text-right px-8">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="p-4 border-t border-slate-50 flex items-center justify-between bg-white text-slate-400">
        <p className="text-xs italic">Showing 14 appointments for the next 2 days</p>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 border border-slate-100"><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 border border-slate-100"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
}
