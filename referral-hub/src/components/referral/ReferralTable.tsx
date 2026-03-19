"use client";

import { Referral } from "@/types/referral";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { StatusBadge } from "../StatusBadge";
import { PriorityIndicator } from "../PriorityIndicator";
import Link from "next/link";

interface ReferralTableProps {
  referrals: Referral[];
  onRowClick?: (referral: Referral) => void;
  showActions?: boolean;
  actionSlot?: (referral: Referral) => React.ReactNode;
}

export function ReferralTable({
  referrals,
  onRowClick,
  actionSlot,
}: ReferralTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Patient</TableHead>
          <TableHead className="hidden md:table-cell">Diagnosis</TableHead>
          <TableHead className="hidden sm:table-cell">Specialty</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="hidden lg:table-cell">Time</TableHead>
          {actionSlot && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {referrals.map((ref) => (
            <TableRow
              key={ref.id}
              className="cursor-pointer"
              onClick={() => onRowClick?.(ref)}
            >
              <TableCell className="font-mono text-xs">{ref.id}</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium text-sm">{ref.patient.fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    {ref.patient.age}
                    {ref.patient.sex === "M" ? "M" : "F"} — {ref.patient.mrn}
                  </p>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell text-sm">
                {ref.provisionalDiagnosis}
              </TableCell>
              <TableCell className="hidden sm:table-cell text-sm">
                {ref.requiredSpecialty}
              </TableCell>
              <TableCell>
                <PriorityIndicator
                  severity={ref.severity}
                  score={ref.severityScore}
                  compact
                />
              </TableCell>
              <TableCell>
                <StatusBadge status={ref.status} />
              </TableCell>
              <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(ref.createdAt), {
                  addSuffix: true,
                })}
              </TableCell>
              {actionSlot && (
                <TableCell onClick={(e) => e.stopPropagation()}>
                  {actionSlot(ref)}
                </TableCell>
              )}
            </TableRow>
        ))}
        {referrals.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={8}
              className="text-center py-8 text-muted-foreground"
            >
              No referrals found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
