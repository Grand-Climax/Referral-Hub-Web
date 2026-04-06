"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { ReferralListItem } from "@/types/referral-list";
import { StatusBadge } from "@/components/StatusBadge";

interface ReferralDashboardTableProps {
  /** Referral data to display */
  data?: ReferralListItem[];
  /** Total count of records (for pagination) */
  total?: number;
  /** Initial loading state */
  isLoading?: boolean;
  /** Background re-fetching state */
  isFetching?: boolean;
  /** Current 0-based page index */
  page: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Override the page size (default 10) */
  pageSize?: number;
  /** Link structure for the detail page. Defaults to doctor dashboard path. */
  detailHrefPrefix?: string;
}

/**
 * A compact version of the ReferralTable designed specifically for dashboard views.
 * It omits less critical columns like Department, ID, and Condition to save space.
 */
export function ReferralDashboardTable({
  data = [],
  total = 0,
  isLoading = false,
  isFetching = false,
  page,
  onPageChange,
  pageSize = 10,
  detailHrefPrefix = "/referring-doctor"
}: ReferralDashboardTableProps) {
  const rows       = data;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const loading    = isLoading || isFetching;

  return (
    <div className="flex flex-col h-[450px] min-h-0">
      {/* ── Scrollable table area ─────────────────────────────────────── */}
      <div className="flex-1 overflow-auto min-h-0">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted/40 backdrop-blur-sm border-b border-border/40">
            <TableRow className="hover:bg-transparent border-b-0">
              <TableHead className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Patient
              </TableHead>
              <TableHead className="hidden sm:table-cell px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">
                Status
              </TableHead>
              <TableHead className="hidden md:table-cell px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right mr-4">
                Date
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading
              ? Array.from({ length: pageSize }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-4 py-3"><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="hidden sm:table-cell px-4 py-3 text-center"><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                    <TableCell className="hidden md:table-cell px-4 py-3 text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              : rows.length === 0
              ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground opacity-50">
                        <FileText className="h-6 w-6" />
                        <p className="text-xs">No referrals found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              : rows.map((ref) => {
                  const fullName = [ref.patient_first_name, ref.patient_last_name].filter(Boolean).join(" ");
                  const dateStr  = ref.date
                    ? formatDistanceToNow(new Date(ref.date), { addSuffix: true })
                    : "—";

                  return (
                    <TableRow
                      key={ref.id}
                      className="group border-b border-border/30 transition-colors hover:bg-muted/40"
                    >
                      <TableCell className="p-0">
                        <Link href={`${detailHrefPrefix}/${ref.id}`} className="flex flex-col px-4 py-2.5 h-full gap-0.5 min-w-0">
                          <span className="text-[13px] font-medium text-foreground truncate max-w-[140px] md:max-w-none">
                            {fullName || "Unknown"}
                          </span>
                          <span className="text-[10px] text-muted-foreground truncate opacity-70">
                            {ref.diagnosis || "No diagnosis"}
                          </span>
                        </Link>
                      </TableCell>

                      <TableCell className="hidden sm:table-cell p-0 text-center">
                        <Link href={`${detailHrefPrefix}/${ref.id}`} className="flex items-center justify-center px-4 py-2.5 h-full">
                          <StatusBadge status={ref.status} />
                        </Link>
                      </TableCell>

                      <TableCell className="hidden md:table-cell p-0 text-right">
                        <Link href={`${detailHrefPrefix}/${ref.id}`} className="flex items-center justify-end px-4 py-2.5 h-full text-[11px] text-muted-foreground tabular-nums whitespace-nowrap">
                          {dateStr}
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>
      </div>

      {/* ── Minimal Pagination footer ─────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between border-t border-border/50 px-4 py-2 bg-muted/10">
        <span className="text-[10px] text-muted-foreground tabular-nums">
          Page {page + 1} of {totalPages}
        </span>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30"
            onClick={() => onPageChange(Math.max(0, page - 1))}
            disabled={page === 0 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30"
            onClick={() => onPageChange(page + 1)}
            disabled={page + 1 >= totalPages || loading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
