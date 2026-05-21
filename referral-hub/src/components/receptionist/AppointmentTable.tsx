"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreVertical, Loader2 } from "lucide-react";
import { useGetScheduleQuery, useMarkPatientArrivalMutation, useMarkMissedMutation } from "@/features/receptionist/receptionistApi";
import { useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/apiError";
import { AssignDoctorModal } from "./AssignDoctorModal";
import { ReferralDetailsModal } from "./ReferralDetailsModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function AppointmentTable() {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const { data: schedule, isLoading, error } = useGetScheduleQuery();
  const [markArrival, { isLoading: isMarking }] = useMarkPatientArrivalMutation();
  const [markMissed] = useMarkMissedMutation();

  const handleCheckIn = async (id: string) => {
    try {
      await markArrival(id).unwrap();
      toast.success("Patient arrival marked successfully");
    } catch (err: any) {
      toast.error(getApiErrorMessage(err, "Failed to mark patient arrival"));
    }
  };

  const handleMarkMissed = async (id: string) => {
    try {
      await markMissed(id).unwrap();
      toast.success("Patient marked as missed");
    } catch (err: any) {
      toast.error(getApiErrorMessage(err, "Failed to mark patient as missed"));
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Safely handle schedule data - ensure it's always an array
  const appointments = Array.isArray(schedule) ? schedule : [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-8 border-b border-slate-50">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Scheduled Patients</h2>
          <p className="text-sm text-slate-500 font-medium font-inter">Operational schedule for the next 48 hours</p>
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
                  <p className="text-sm">Loading schedule...</p>
                </div>
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-center text-red-500">
                Failed to load scheduled patients.
              </TableCell>
            </TableRow>
          ) : appointments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-center text-slate-400">
                No scheduled patients found for the next 48 hours.
              </TableCell>
            </TableRow>
          ) : (
            appointments.map((appt) => {
              const initials = `${appt.patient_first_name?.[0] || ""}${appt.patient_last_name?.[0] || ""}`;
              const fullName = `${appt.patient_last_name || ""}, ${appt.patient_first_name || ""}`.toUpperCase();
              
              let urgencyColor = "bg-blue-50 text-blue-500";
              if (appt.urgency === "HIGH" || appt.urgency === "EMERGENCY") urgencyColor = "bg-red-50 text-red-500";
              if (appt.urgency === "URGENT") urgencyColor = "bg-orange-50 text-orange-500";
              
              let statusColor = "bg-blue-500";
              let statusText = "Pending";
              if (appt.arrival_status === "ARRIVED") {
                statusColor = "bg-green-500";
                statusText = "Arrived";
              } else if (appt.arrival_status === "MISSED") {
                statusColor = "bg-red-500";
                statusText = "Missed";
              }
              
              return (
                <TableRow key={appt.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors group">
                  <TableCell className="py-6 px-8">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10 rounded-lg bg-slate-100">
                        <AvatarFallback className="text-[10px] font-bold text-slate-500 bg-slate-100 rounded-lg">{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{fullName}</p>
                        <p className="text-[10px] font-medium text-slate-400">{appt.referral_id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-bold text-slate-700">{appt.scheduled_time || "N/A"}</p>
                      <p className="text-[10px] font-medium text-slate-400">{formatDate(appt.scheduled_date)}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium text-slate-600">{appt.department_name || "N/A"}</p>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-tight ${urgencyColor}`}>
                      {appt.urgency || "ROUTINE"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${statusColor}`} />
                      <p className="text-sm font-medium text-slate-600">{statusText}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-8 flex justify-end items-center gap-2">
                    {appt.arrival_status === "ARRIVED" ? (
                      <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">
                        ARRIVED
                      </span>
                    ) : appt.arrival_status === "MISSED" ? (
                      <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
                        MISSED
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleCheckIn(appt.id)}
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
                            setSelectedPatientId(appt.id);
                            setIsDetailsModalOpen(true);
                          }}
                        >
                          View Details
                        </DropdownMenuItem>
                        {appt.arrival_status === "ARRIVED" && (
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedPatientId(appt.id);
                              setIsAssignModalOpen(true);
                            }}
                          >
                            Assign Doctor
                          </DropdownMenuItem>
                        )}
                        {appt.arrival_status === "PENDING" && (
                          <DropdownMenuItem 
                            onClick={() => handleMarkMissed(appt.id)}
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
        <p className="text-[10px] font-medium">Showing {appointments.length} scheduled patients • Next 48 hours</p>
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
