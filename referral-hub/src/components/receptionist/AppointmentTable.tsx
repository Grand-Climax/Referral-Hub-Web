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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, MoreHorizontal, Loader2, Calendar } from "lucide-react";
import { useGetScheduleQuery } from "@/features/receptionist/receptionistApi";
import { useState } from "react";

export function AppointmentTable() {
  const { data, isLoading, error } = useGetScheduleQuery();
  const [currentView, setCurrentView] = useState<"list" | "weekly" | "monthly">("list");

  // The schedule endpoint returns scheduled triage records for next 48 hours
  // The response structure is flexible (additionalProp1: {}), so we need to handle it accordingly
  const scheduleItems = data ? Object.values(data).flat() : [];

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return {
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      date: date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    };
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case "CONFIRMED":
      case "SCHEDULED":
        return "bg-blue-500";
      case "ARRIVED":
        return "bg-green-500";
      case "LATE":
      case "MISSED":
        return "bg-red-500";
      case "RESCHEDULED":
        return "bg-slate-400";
      default:
        return "bg-slate-300";
    }
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency?.toUpperCase()) {
      case "CRITICAL":
      case "EMERGENCY":
        return "bg-red-100 text-red-600";
      case "URGENT":
      case "HIGH":
        return "bg-orange-100 text-orange-600";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
        <div className="flex gap-2">
          <Button 
            variant={currentView === "monthly" ? "secondary" : "ghost"} 
            size="sm" 
            className="text-xs font-bold"
            onClick={() => setCurrentView("monthly")}
          >
            Monthly
          </Button>
          <Button 
            variant={currentView === "weekly" ? "secondary" : "ghost"} 
            size="sm" 
            className="text-xs font-bold"
            onClick={() => setCurrentView("weekly")}
          >
            Weekly View
          </Button>
          <Button 
            variant={currentView === "list" ? "secondary" : "ghost"} 
            size="sm" 
            className="text-xs font-bold bg-white text-primary shadow-sm border border-slate-200"
            onClick={() => setCurrentView("list")}
          >
            List View
          </Button>
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
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-center">
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin mb-2" />
                  <p className="text-sm">Loading scheduled appointments...</p>
                </div>
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-center text-red-500">
                Failed to load scheduled appointments.
              </TableCell>
            </TableRow>
          ) : scheduleItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-center">
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <Calendar className="h-8 w-8 mb-2" />
                  <p className="text-sm">No scheduled appointments for the next 48 hours</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            scheduleItems.map((appt: any, index: number) => {
              const initials = `${appt.patient_first_name?.[0] || ""}${appt.patient_last_name?.[0] || ""}`;
              const fullName = `${appt.patient_last_name || ""}, ${appt.patient_first_name || ""}`.toUpperCase();
              const dateTime = formatDateTime(appt.scheduled_time);
              
              return (
                <TableRow key={appt.id || index} className="border-slate-50 hover:bg-slate-50/50 transition-colors group">
                  <TableCell className="py-6 px-8">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10 rounded-lg bg-slate-100">
                        <AvatarFallback className="text-[10px] font-bold text-slate-500 bg-slate-100 rounded-lg">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-primary transition-colors">{fullName}</p>
                        <p className="text-[10px] font-medium text-slate-400">{appt.referral_id || appt.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-bold text-slate-700">{dateTime.time}</p>
                      <p className="text-[10px] font-medium text-slate-400">{dateTime.date}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium text-slate-600">{appt.department || "N/A"}</p>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-tight ${getUrgencyColor(appt.urgency)}`}>
                      {appt.urgency || "ROUTINE"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${getStatusColor(appt.queue_status || appt.arrival_status)}`} />
                      <p className="text-sm font-medium text-slate-600">{appt.queue_status || appt.arrival_status || "Scheduled"}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <div className="p-4 border-t border-slate-50 flex items-center justify-between bg-white text-slate-400">
        <p className="text-xs italic">
          {isLoading ? "Loading..." : `Showing ${scheduleItems.length} appointments for the next 48 hours`}
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 border border-slate-100">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 border border-slate-100">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
