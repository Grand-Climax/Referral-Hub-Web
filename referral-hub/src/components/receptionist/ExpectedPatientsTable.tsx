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
import { Filter, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

const patients = [
  {
    initials: "AM",
    name: "ARTHUR, MARGARET",
    dob: "12/04/1954",
    refId: "REF-882-X9",
    arrival: "Today, 14:30",
    eta: "ETA: 45m",
    facility: "Northside Trauma Center",
    urgency: "HIGH",
    urgencyColor: "bg-red-50 text-red-500",
  },
  {
    initials: "JS",
    name: "SMITH, JONATHAN",
    dob: "22/09/1988",
    refId: "REF-104-B2",
    arrival: "Today, 16:15",
    eta: "ETA: 2h 30m",
    facility: "East Park Cardiology",
    urgency: "ROUTINE",
    urgencyColor: "bg-blue-50 text-blue-500",
  },
  {
    initials: "DL",
    name: "LOPEZ, DAVID",
    dob: "05/11/1971",
    refId: "REF-449-Y7",
    arrival: "Tomorrow, 09:00",
    eta: "Scheduled",
    facility: "St. Jude Medical Group",
    urgency: "URGENT",
    urgencyColor: "bg-orange-50 text-orange-500",
  },
  {
    initials: "KN",
    name: "NGUYEN, KEVIN",
    dob: "30/01/2002",
    refId: "REF-002-K3",
    arrival: "Yesterday, 18:00",
    eta: "MISSED ARRIVAL",
    etaColor: "text-red-500 font-bold",
    facility: "West Community Clinic",
    urgency: "ROUTINE",
    urgencyColor: "bg-blue-50 text-blue-500",
    showMore: true,
  },
];

export function ExpectedPatientsTable() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Expected Patients</h2>
          <p className="text-sm text-slate-500 font-medium font-inter">Scheduled arrivals for the next 48 hours</p>
        </div>
        
        <div className="flex gap-4">
          <Button variant="outline" className="text-slate-600 border-slate-200 font-bold text-xs h-10">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white font-bold text-xs h-10 px-6 uppercase tracking-wider shadow-sm">
            ADMIT PATIENT
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader className="bg-slate-50/30">
          <TableRow className="border-none">
            <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-6 px-8">Patient Name</TableHead>
            <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-6">Referral ID</TableHead>
            <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-6">Arrival Window</TableHead>
            <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-6">Source Facility</TableHead>
            <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-6 text-center">Urgency</TableHead>
            <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-6 text-right px-8">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient, index) => (
            <TableRow key={index} className="border-slate-50 hover:bg-slate-50/50 transition-colors group">
              <TableCell className="py-6 px-8">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10 rounded-lg bg-slate-100">
                    <AvatarFallback className="text-[10px] font-bold text-slate-500 bg-slate-100 rounded-lg">{patient.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{patient.name}</p>
                    <p className="text-[10px] font-medium text-slate-400">DOB: {patient.dob}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <p className="text-[10px] font-bold text-slate-400 tracking-wider font-mono">{patient.refId}</p>
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-sm font-bold text-slate-900">{patient.arrival}</p>
                  <p className={`text-[10px] font-medium ${patient.etaColor || "text-slate-400"}`}>{patient.eta}</p>
                </div>
              </TableCell>
              <TableCell>
                <p className="text-xs font-medium text-slate-500">{patient.facility}</p>
              </TableCell>
              <TableCell className="text-center">
                <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-tight ${patient.urgencyColor}`}>
                  {patient.urgency}
                </span>
              </TableCell>
              <TableCell className="text-right px-8">
                {patient.showMore ? (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                ) : (
                  <button className="text-[10px] font-bold text-primary hover:text-primary/80 uppercase tracking-widest transition-colors">
                    CHECK-IN
                  </button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="p-4 border-t border-slate-50 flex items-center justify-between bg-white px-8 text-slate-400">
        <p className="text-[10px] font-medium">Page 1 of 4 • Synchronized 2 mins ago</p>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-900"><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-900"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
}
