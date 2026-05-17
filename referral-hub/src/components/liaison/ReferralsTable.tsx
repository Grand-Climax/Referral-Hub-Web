"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { useGetReferralsQuery } from "@/features/liaison/liaisonApi";
import { useRouter } from "next/navigation";
import type { ReferralListItem } from "@/types/referral-list";

interface ReferralsTableProps {
  listType?: "all" | "approved" | "rejected" | "incoming";
  title?: string;
}

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

export function ReferralsTable({ listType = "all", title }: ReferralsTableProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading, isError } = useGetReferralsQuery({
    page,
    page_size: pageSize,
    listType,
  });

  const referrals = data?.data || [];
  const totalPages = Math.ceil((data?.total || 0) / pageSize);

  const handleViewDetails = (id: string) => {
    router.push(`/liaison-officer/referrals/${id}`);
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-xl">{title || "Referrals"}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : isError ? (
          <div className="py-12 text-center text-destructive">
            Failed to load referrals. Please try again.
          </div>
        ) : referrals.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            No referrals found.
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.map((referral: ReferralListItem) => (
                    <TableRow key={referral.id}>
                      <TableCell className="font-medium">
                        {referral.patient_first_name} {referral.patient_middle_name}{" "}
                        {referral.patient_last_name}
                      </TableCell>
                      <TableCell>{referral.department || "N/A"}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {referral.diagnosis || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={STATUS_COLORS[referral.status] || ""}
                        >
                          {formatStatus(referral.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{referral.patient_region || "N/A"}</TableCell>
                      <TableCell>{formatDate(referral.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(referral.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages} ({data?.total} total)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
