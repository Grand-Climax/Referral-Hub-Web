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
import { Filter, ChevronLeft, ChevronRight, MoreHorizontal, Loader2, MoreVertical } from "lucide-react";
import { useGetReferralsQuery, useMarkPatientArrivalMutation, useMarkMissedMutation } from "@/features/receptionist/receptionistApi";
import { useState } from "react";
import { toast } from "sonner";
import { WalkInModal } from "./WalkInModal";
import { AssignDoctorModal } from "./AssignDoctorModal";
import { ReferralDetailsModal } from "./ReferralDetailsModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function ExpectedPatientsTable() {
  const [page, setPage] = useState(1);
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const { data, isLoading, error } = useGetReferralsQuery({ page, limit: 10 });
  const [markArrival, { isLoading: isMarking }] = useMarkPatientArrivalMutation();
  const [markMissed] = useMarkMissedMutation();

  const handleCheckIn = async (id: string) => {
    try {
      await markArrival(id).unwrap();
      toast.success("Patient arrival marked successfully");
    } catch (err) {
      toast.error("Failed to mark patient arrival");
    }
  };

  const handleMarkMissed = async (id: string) => {
    try {
      await markMissed(id).unwrap();
      toast.success("Patient marked as missed");
    } catch (err) {
      toast.error("Failed to mark patient as missed");
    }
  };

  const patients = data?.data || [];
  const totalPages = data?.total ? Math.ceil(data.total / (data.limit || 10)) : 1;
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
          <Button 
            onClick={() => setIsWalkInModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white font-bold text-xs h-10 px-6 uppercase tracking-wider shadow-sm"
          >
            REGISTER WALK-IN
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
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-center">
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin mb-2" />
                  <p className="text-sm">Loading patients...</p>
                </div>
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-center text-red-500">
                Failed to load expected patients.
              </TableCell>
            </TableRow>
          ) : patients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-center text-slate-400">
                No expected patients found.
              </TableCell>
            </TableRow>
          ) : (
            patients.map((patient) => {
              const initials = `${patient.patient_first_name?.[0] || ""}${patient.patient_last_name?.[0] || ""}`;
              const fullName = `${patient.patient_last_name || ""}, ${patient.patient_first_name || ""}`.toUpperCase();
              
              let urgencyColor = "bg-blue-50 text-blue-500";
              if (patient.urgency === "HIGH" || patient.urgency === "EMERGENCY") urgencyColor = "bg-red-50 text-red-500";
              if (patient.urgency === "URGENT") urgencyColor = "bg-orange-50 text-orange-500";
              
              return (
                <TableRow key={patient.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors group">
                  <TableCell className="py-6 px-8">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10 rounded-lg bg-slate-100">
                        <AvatarFallback className="text-[10px] font-bold text-slate-500 bg-slate-100 rounded-lg">{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{fullName}</p>
                        <p className="text-[10px] font-medium text-slate-400">DOB: {patient.dob || "N/A"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-[10px] font-bold text-slate-400 tracking-wider font-mono">{patient.referral_id || patient.id}</p>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{patient.arrival_time || "Scheduled"}</p>
                      <p className={`text-[10px] font-medium text-slate-400`}>{patient.eta || "Unknown ETA"}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-medium text-slate-500">{patient.source_facility || "Unknown Facility"}</p>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-tight ${urgencyColor}`}>
                      {patient.urgency || "ROUTINE"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right px-8 flex justify-end items-center gap-2">
                    {patient.status === "ARRIVED" ? (
                      <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">
                        ARRIVED
                      </span>
                    ) : patient.status === "MISSED" ? (
                      <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
                        MISSED
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleCheckIn(patient.id)}
                        disabled={isMarking}
                        className="text-[10px] font-bold text-primary hover:text-primary/80 uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        CHECK-IN
                      </button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedPatientId(patient.id);
                            setIsDetailsModalOpen(true);
                          }}
                        >
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedPatientId(patient.id);
                            setIsAssignModalOpen(true);
                          }}
                        >
                          Assign Doctor
                        </DropdownMenuItem>
                        {patient.status !== "ARRIVED" && patient.status !== "MISSED" && (
                          <DropdownMenuItem 
                            onClick={() => handleMarkMissed(patient.id)}
                            className="text-red-600"
                          >
                            Mark as Missed
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <div className="p-4 border-t border-slate-50 flex items-center justify-between bg-white px-8 text-slate-400">
        <p className="text-[10px] font-medium">Page {page} of {totalPages || 1} • Synchronized just now</p>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-slate-900"
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-slate-900"
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <WalkInModal open={isWalkInModalOpen} onOpenChange={setIsWalkInModalOpen} />
      <AssignDoctorModal 
        open={isAssignModalOpen} 
        onOpenChange={setIsAssignModalOpen} 
        referralId={selectedPatientId} 
      />
      <ReferralDetailsModal 
        open={isDetailsModalOpen} 
        onOpenChange={setIsDetailsModalOpen} 
        referralId={selectedPatientId} 
      />
    </div>
  );
}
