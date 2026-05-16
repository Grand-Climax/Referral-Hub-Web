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
import { AssignDoctorModal } from "./AssignDoctorModal";
import { ReferralDetailsModal } from "./ReferralDetailsModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function ExpectedPatientsTable() {
  const [page, setPage] = useState(1);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const { data, isLoading, error } = useGetReferralsQuery({ page, limit: 10 });
  const [markArrival, { isLoading: isMarking }] = useMarkPatientArrivalMutation();
  const [markMissed] = useMarkMissedMutation();

  // Debug: Log the response to see the actual structure
  console.log('Receptionist API Response:', data);
  console.log('Is Loading:', isLoading);
  console.log('Error:', error);

  const handleCheckIn = async (id: string) => {
    try {
      await markArrival(id).unwrap();
      toast.success("Patient arrival marked successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to mark patient arrival");
    }
  };

  const handleMarkMissed = async (id: string) => {
    try {
      await markMissed(id).unwrap();
      toast.success("Patient marked as missed");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to mark patient as missed");
    }
  };

  const patients = data?.data || [];
  const totalPages = data?.total ? Math.ceil(data.total / (data.limit || 10)) : 1;
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Expected Patients</h2>
          <p className="text-xs text-slate-500 mt-0.5">Scheduled arrivals for the next 48 hours</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="text-slate-600 border-slate-300 text-xs h-9">
            <Filter className="mr-1.5 h-3.5 w-3.5" />
            All Statuses
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow className="border-b border-slate-200">
            <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wide py-3 px-6">Patient</TableHead>
            <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wide py-3">Department</TableHead>
            <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wide py-3">Arrival</TableHead>
            <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wide py-3">Source</TableHead>
            <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wide py-3 text-center">Urgency</TableHead>
            <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wide py-3 text-right px-6">Actions</TableHead>
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
              const fullName = `${patient.patient_first_name || ""} ${patient.patient_last_name || ""}`;
              
              let urgencyColor = "bg-blue-50 text-blue-600 border-blue-200";
              if (patient.urgency === "HIGH" || patient.urgency === "EMERGENCY") urgencyColor = "bg-red-50 text-red-600 border-red-200";
              if (patient.urgency === "URGENT") urgencyColor = "bg-orange-50 text-orange-600 border-orange-200";
              
              return (
                <TableRow key={patient.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 rounded-full bg-slate-200">
                        <AvatarFallback className="text-xs font-semibold text-slate-600 bg-slate-200">{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{fullName}</p>
                        <p className="text-xs text-slate-500">{patient.referral_id || patient.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-slate-700">{patient.department_name || "N/A"}</p>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{patient.scheduled_time || patient.eta || "Pending"}</p>
                      <p className="text-xs text-slate-500">{patient.scheduled_date || "Not scheduled"}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-slate-700">{patient.source_facility || "Unknown"}</p>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={`text-xs font-medium border ${urgencyColor}`}>
                      {patient.urgency || "ROUTINE"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <div className="flex justify-end items-center gap-2">
                      {patient.arrival_status === "ARRIVED" ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
                          Arrived
                        </Badge>
                      ) : patient.arrival_status === "MISSED" ? (
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-xs">
                          Missed
                        </Badge>
                      ) : (
                        <Button 
                          onClick={() => handleCheckIn(patient.id)}
                          disabled={isMarking}
                          size="sm"
                          className="h-8 text-xs"
                        >
                          Check In
                        </Button>
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
                          {patient.arrival_status === "ARRIVED" && (
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedPatientId(patient.id);
                                setIsAssignModalOpen(true);
                              }}
                            >
                              Assign Doctor
                            </DropdownMenuItem>
                          )}
                          {patient.arrival_status === "PENDING" && (
                            <DropdownMenuItem 
                              onClick={() => handleMarkMissed(patient.id)}
                              className="text-red-600"
                            >
                              Mark as Missed
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <div className="px-6 py-3 border-t border-slate-200 flex items-center justify-between bg-slate-50">
        <p className="text-xs text-slate-500">
          Showing {patients.length > 0 ? ((page - 1) * 10) + 1 : 0} - {Math.min(page * 10, data?.total || 0)} of {data?.total || 0} patients
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
          <div className="flex gap-1">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

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
