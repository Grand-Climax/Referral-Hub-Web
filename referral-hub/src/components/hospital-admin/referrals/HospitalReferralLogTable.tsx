"use client";

import Link from "next/link";
import {
  type OnChangeFn,
  type PaginationState,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetReferralsLogQuery } from "@/features/hospitalAdmin/hospitalAdminApi";
import type { HospitalReferralLogEntry } from "@/types/hospital-admin";

function formatStatus(status: string) {
  return status.replace(/_/g, " ");
}

function formatLogTimestamp(value: string) {
  if (!value) return "—";
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

interface HospitalReferralLogTableProps {
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
}

export function HospitalReferralLogTable({
  pagination,
  onPaginationChange,
}: HospitalReferralLogTableProps) {
  const queryArgs = {
    page: pagination.pageIndex + 1,
    page_size: pagination.pageSize,
  };

  const { data, isLoading, isFetching } = useGetReferralsLogQuery(queryArgs);
  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pagination.pageSize));
  const tableBusy = isLoading || (isFetching && data == null);

  const goToPage = (pageIndex: number) => {
    onPaginationChange((old) => ({ ...old, pageIndex }));
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Referral</TableHead>
              <TableHead>Status change</TableHead>
              <TableHead>Changed by</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableBusy ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300" />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                  No referral log entries found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((entry: HospitalReferralLogEntry) => (
                <TableRow key={entry.history_id}>
                  <TableCell>
                    <Link
                      href={`/hospital-admin/referrals/${entry.referral_id}`}
                      className="font-mono text-xs text-primary hover:underline"
                    >
                      {entry.referral_id.slice(0, 8)}…
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px]">
                        {formatStatus(entry.from_status)}
                      </Badge>
                      <span className="text-muted-foreground">→</span>
                      <Badge className="text-[10px]">{formatStatus(entry.to_status)}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {entry.changed_by_id.slice(0, 8)}…
                  </TableCell>
                  <TableCell>{entry.role || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatLogTimestamp(entry.created_at)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {total > 0 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {pagination.pageIndex * pagination.pageSize + 1}–
            {Math.min((pagination.pageIndex + 1) * pagination.pageSize, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pagination.pageIndex === 0}
              onClick={() => goToPage(Math.max(0, pagination.pageIndex - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="px-2 text-sm text-muted-foreground">
              Page {pagination.pageIndex + 1} of {pageCount}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pagination.pageIndex + 1 >= pageCount}
              onClick={() => goToPage(pagination.pageIndex + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
