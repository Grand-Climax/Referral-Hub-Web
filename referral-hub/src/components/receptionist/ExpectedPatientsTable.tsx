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
import { Filter, ChevronLeft, ChevronRight, Loader2, MoreVertical } from "lucide-react";
import {
  useGetMissedReferralsQuery,
  useGetReferralsQuery,
  useGetTriageQueueQuery,
  useMarkPatientArrivalMutation,
  useMarkMissedMutation,
  useRevokeDoctorMutation,
  useReturnToTriageMutation,
} from "@/features/receptionist/receptionistApi";
import { useState } from "react";
import { toast } from "sonner";
import { getReceptionistErrorMessage } from "@/lib/receptionistScopeError";
import { filterOperationalReferrals } from "@/lib/receptionistOperational";
import { AssignDoctorModal } from "./AssignDoctorModal";
import { ReferralDetailsModal } from "./ReferralDetailsModal";
import { MarkMissedDialog } from "./MarkMissedDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ReceptionistMissReason } from "@/types/receptionist";
import { useReceptionistDepartmentScope } from "@/lib/useReceptionistDepartmentScope";

export function ExpectedPatientsTable() {
  const [page, setPage] = useState(1);
  const [arrivalFilter, setArrivalFilter] =
    useState<"ALL" | "PENDING" | "ARRIVED" | "MISSED">("ALL");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [missDialogOpen, setMissDialogOpen] = useState(false);
  const [missTarget, setMissTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { departmentName: myDepartmentName } = useReceptionistDepartmentScope();

  const shouldUseMissedEndpoint = arrivalFilter === "MISSED";
  const triageQueue = useGetTriageQueueQuery(
    {
      page,
      limit: 10,
      ...(arrivalFilter !== "ALL"
        ? { arrival_status: [arrivalFilter] }
        : {}),
    },
    { skip: shouldUseMissedEndpoint },
  );
  const triageEmpty =
    !triageQueue.isLoading &&
    !triageQueue.isFetching &&
    (triageQueue.data?.data?.length ?? 0) === 0;
  const referralsList = useGetReferralsQuery(
    {
      page,
      limit: 10,
      ...(arrivalFilter !== "ALL" ? { arrival_status: arrivalFilter } : {}),
    },
    { skip: shouldUseMissedEndpoint || !triageEmpty },
  );
  const missedReferrals = useGetMissedReferralsQuery(
    {
      page,
      limit: 10,
    },
    { skip: !shouldUseMissedEndpoint },
  );

  const data = shouldUseMissedEndpoint
    ? missedReferrals.data
    : triageEmpty
      ? referralsList.data
      : triageQueue.data;
  const isLoading = shouldUseMissedEndpoint
    ? missedReferrals.isLoading
    : triageQueue.isLoading || (triageEmpty && referralsList.isLoading);
  const error = shouldUseMissedEndpoint
    ? missedReferrals.error
    : triageQueue.error ?? referralsList.error;

  const [markArrival, { isLoading: isMarking }] = useMarkPatientArrivalMutation();
  const [markMissed, { isLoading: isMarkingMissed }] = useMarkMissedMutation();
  const [revokeDoctor, { isLoading: isRevokingDoctor }] = useRevokeDoctorMutation();
  const [returnToTriage, { isLoading: isReturning }] = useReturnToTriageMutation();

  const referralIdFor = (patient: { id: string; referral_id?: string }) =>
    patient.referral_id || patient.id;

  const handleCheckIn = async (id: string) => {
    try {
      await markArrival(id).unwrap();
      toast.success("Patient arrival marked successfully");
    } catch (err: unknown) {
      const message = getReceptionistErrorMessage(
        err,
        "Failed to mark patient arrival",
      );
      if (/already arrived/i.test(message)) {
        toast.info(message);
        return;
      }
      toast.error(message);
    }
  };

  const handleMarkMissed = async (reason: ReceptionistMissReason) => {
    if (!missTarget) return;
    try {
      await markMissed({ id: missTarget.id, miss_reason: reason }).unwrap();
      toast.success("Patient marked as missed");
      setMissTarget(null);
    } catch (err: unknown) {
      toast.error(
        getReceptionistErrorMessage(err, "Failed to mark patient as missed"),
      );
    }
  };

  const handleRevokeDoctor = async (id: string) => {
    try {
      await revokeDoctor({
        id,
        reason: "Reassigned by receptionist",
      }).unwrap();
      toast.success("Doctor assignment revoked");
    } catch (err: unknown) {
      toast.error(
        getReceptionistErrorMessage(err, "Failed to revoke doctor assignment"),
      );
    }
  };

  const handleReturnToTriage = async (id: string) => {
    try {
      await returnToTriage(id).unwrap();
      toast.success("Patient returned to triage queue");
    } catch (err: unknown) {
      toast.error(
        getReceptionistErrorMessage(err, "Failed to return patient to triage"),
      );
    }
  };

  const patients = filterOperationalReferrals(data?.data || []);
  const totalPages = data?.total ? Math.ceil(data.total / (data.limit || 10)) : 1;

  const filterLabel =
    arrivalFilter === "ALL"
      ? "All Statuses"
      : `${arrivalFilter[0]}${arrivalFilter.slice(1).toLowerCase()}`;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-4 py-4 sm:px-6 border-b border-slate-200 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-slate-50">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Expected Patients</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Scheduled arrivals for the next 48 hours
            {myDepartmentName ? ` · actions limited to ${myDepartmentName}` : ""}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-slate-600 border-slate-300 text-xs h-9"
            >
              <Filter className="mr-1.5 h-3.5 w-3.5" />
              {filterLabel}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setPage(1);
                setArrivalFilter("ALL");
              }}
            >
              All Statuses
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setPage(1);
                setArrivalFilter("PENDING");
              }}
            >
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setPage(1);
                setArrivalFilter("ARRIVED");
              }}
            >
              Arrived
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setPage(1);
                setArrivalFilter("MISSED");
              }}
            >
              Missed
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-[760px]">
          <TableHeader className="bg-slate-50">
            <TableRow className="border-b border-slate-200">
              <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wide py-3 px-4 sm:px-6">
                Patient
              </TableHead>
              <TableHead className="hidden md:table-cell text-xs font-semibold text-slate-600 uppercase tracking-wide py-3">
                Department
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wide py-3">
                Arrival
              </TableHead>
              <TableHead className="hidden lg:table-cell text-xs font-semibold text-slate-600 uppercase tracking-wide py-3">
                Source
              </TableHead>
              <TableHead className="hidden sm:table-cell text-xs font-semibold text-slate-600 uppercase tracking-wide py-3 text-center">
                Urgency
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wide py-3 text-right px-4 sm:px-6">
                Actions
              </TableHead>
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
                if (patient.urgency === "HIGH" || patient.urgency === "EMERGENCY")
                  urgencyColor = "bg-red-50 text-red-600 border-red-200";
                if (patient.urgency === "URGENT")
                  urgencyColor = "bg-orange-50 text-orange-600 border-orange-200";

                return (
                  <TableRow
                    key={patient.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <TableCell className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 rounded-full bg-slate-200">
                          <AvatarFallback className="text-xs font-semibold text-slate-600 bg-slate-200">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">
                            {fullName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {patient.referral_id || patient.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <p className="text-sm text-slate-700">
                        {patient.department_name || "N/A"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-900">
                          {patient.scheduled_time ||
                            (patient.appointment_date
                              ? new Date(patient.appointment_date).toLocaleTimeString(
                                  "en-US",
                                  { hour: "2-digit", minute: "2-digit" },
                                )
                              : "—")}
                        </p>
                        <p className="text-xs text-slate-500">
                          {patient.scheduled_date ||
                            (patient.appointment_date
                              ? patient.appointment_date.slice(0, 10)
                              : "Not scheduled")}
                        </p>
                        {patient.arrival_status === "ARRIVED" ||
                        patient.arrival_status === "ADMITTED" ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px]">
                            Checked in
                          </Badge>
                        ) : patient.arrival_status === "MISSED" ? (
                          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-[10px]">
                            Missed
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] text-slate-600"
                          >
                            Awaiting arrival
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <p className="text-sm text-slate-700">
                        {patient.source_facility || "Unknown"}
                      </p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-center">
                      <Badge
                        variant="outline"
                        className={`text-xs font-medium border ${urgencyColor}`}
                      >
                        {patient.urgency || "ROUTINE"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-4 sm:px-6">
                      <div className="flex justify-end items-center gap-2">
                        {patient.arrival_status === "ARRIVED" ||
                        patient.arrival_status === "ADMITTED" ? (
                          <Button
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => {
                              setSelectedPatientId(referralIdFor(patient));
                              setIsAssignModalOpen(true);
                            }}
                            disabled={isMarking || isRevokingDoctor || isReturning}
                          >
                            {patient.assigned_doctor_id
                              ? "Reassign Doctor"
                              : "Assign Doctor"}
                          </Button>
                        ) : patient.arrival_status === "MISSED" ? (
                          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-xs">
                            Missed
                          </Badge>
                        ) : (
                          <Button
                            onClick={() => handleCheckIn(referralIdFor(patient))}
                            disabled={isMarking || isRevokingDoctor || isReturning}
                            size="sm"
                            className="h-8 text-xs"
                          >
                            Check In
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-slate-900"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPatientId(referralIdFor(patient));
                                setIsDetailsModalOpen(true);
                              }}
                            >
                              View Details
                            </DropdownMenuItem>
                            {patient.arrival_status === "ARRIVED" &&
                              patient.assigned_doctor_id && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleRevokeDoctor(referralIdFor(patient))
                                  }
                                  className="text-amber-600"
                                >
                                  Revoke Doctor
                                </DropdownMenuItem>
                              )}
                            {patient.arrival_status === "PENDING" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setMissTarget({
                                    id: referralIdFor(patient),
                                    name: fullName,
                                  });
                                  setMissDialogOpen(true);
                                }}
                                className="text-red-600"
                              >
                                Mark as Missed
                              </DropdownMenuItem>
                            )}
                            {patient.arrival_status === "MISSED" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleReturnToTriage(referralIdFor(patient))
                                }
                              >
                                Return to triage
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
      </div>

      <div className="px-4 sm:px-6 py-3 border-t border-slate-200 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-slate-50">
        <p className="text-xs text-slate-500 text-center sm:text-left">
          Showing {patients.length > 0 ? (page - 1) * 10 + 1 : 0} -{" "}
          {Math.min(page * 10, data?.total || 0)} of {data?.total || 0} patients
        </p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs text-slate-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
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
      <MarkMissedDialog
        open={missDialogOpen}
        onOpenChange={setMissDialogOpen}
        patientName={missTarget?.name}
        onConfirm={handleMarkMissed}
        isLoading={isMarkingMissed}
      />
    </div>
  );
}
