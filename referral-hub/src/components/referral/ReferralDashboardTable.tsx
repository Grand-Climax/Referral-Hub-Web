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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import {
  formatReferralPatientName,
  humanizeReferralValue,
  type ReferralListItem,
} from "@/types/referral-list";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";

interface ReferralDashboardTableProps {
  data?: ReferralListItem[];
  total?: number;
  isLoading?: boolean;
  isFetching?: boolean;
  page: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  detailHrefPrefix?: string;
}

function ConditionBadge({ condition }: { condition?: string }) {
  if (!condition) return <span className="text-xs text-muted-foreground">—</span>;
  const normalized = condition.toUpperCase();
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] font-medium capitalize",
        normalized === "CRITICAL" &&
          "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200",
        normalized === "UNSTABLE" &&
          "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
        normalized === "STABLE" &&
          "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200",
      )}
    >
      {humanizeReferralValue(condition)}
    </Badge>
  );
}

export function ReferralDashboardTable({
  data = [],
  total = 0,
  isLoading = false,
  isFetching = false,
  page,
  onPageChange,
  pageSize = 10,
  detailHrefPrefix = "/referring-doctor",
}: ReferralDashboardTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const loading = isLoading || isFetching;
  const colSpan = 5;

  return (
    // Fill the parent Card vertically (which is itself `flex-1` inside the
    // dashboard grid) so the pagination row anchors to the true bottom
    // edge — not 450px down with empty space below it. `min-h-[420px]`
    // keeps the table usable when the parent collapses on small screens.
    <div className="flex h-full min-h-[420px] flex-col">
      <div className="min-h-0 flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 border-b border-border/40 bg-muted/40 backdrop-blur-sm">
            <TableRow className="border-b-0 hover:bg-transparent">
              <TableHead className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Patient
              </TableHead>
              <TableHead className="hidden px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground md:table-cell">
                Diagnosis
              </TableHead>
              <TableHead className="hidden px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:table-cell">
                Condition
              </TableHead>
              <TableHead className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="hidden px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground lg:table-cell">
                Submitted
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading
              ? Array.from({ length: pageSize }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-4 py-3">
                      <Skeleton className="h-4 w-36" />
                    </TableCell>
                    <TableCell className="hidden px-4 py-3 md:table-cell">
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell className="hidden px-4 py-3 text-center sm:table-cell">
                      <Skeleton className="mx-auto h-5 w-16" />
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      <Skeleton className="mx-auto h-5 w-20" />
                    </TableCell>
                    <TableCell className="hidden px-4 py-3 text-right lg:table-cell">
                      <Skeleton className="ml-auto h-4 w-20" />
                    </TableCell>
                  </TableRow>
                ))
              : data.length === 0
                ? (
                    <TableRow>
                      <TableCell colSpan={colSpan} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground opacity-50">
                          <FileText className="h-6 w-6" />
                          <p className="text-xs">No referrals found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                : data.map((ref) => {
                    const patientName = formatReferralPatientName(ref);
                    const submittedAt = ref.created_at
                      ? formatDistanceToNow(new Date(ref.created_at), {
                          addSuffix: true,
                        })
                      : "—";
                    const detailHref = `${detailHrefPrefix}/${ref.id}`;

                    return (
                      <TableRow
                        key={ref.id}
                        className="group border-b border-border/30 transition-colors hover:bg-muted/40"
                      >
                        <TableCell className="p-0">
                          <Link
                            href={detailHref}
                            className="flex min-w-0 flex-col gap-0.5 px-4 py-2.5"
                          >
                            <span className="truncate text-[13px] font-medium text-foreground">
                              {patientName || "Unknown patient"}
                            </span>
                            <span className="truncate text-[10px] text-muted-foreground">
                              {ref.patient_region || "Region not recorded"}
                            </span>
                            <span className="truncate text-[10px] text-muted-foreground md:hidden">
                              {ref.icd_code
                                ? `${ref.icd_code} · ${ref.diagnosis || "No diagnosis"}`
                                : ref.diagnosis || "No diagnosis"}
                            </span>
                          </Link>
                        </TableCell>

                        <TableCell className="hidden p-0 md:table-cell">
                          <Link
                            href={detailHref}
                            className="flex min-w-0 flex-col gap-1 px-4 py-2.5"
                          >
                            {ref.icd_code && (
                              <Badge
                                variant="secondary"
                                className="w-fit font-mono text-[10px]"
                              >
                                {ref.icd_code}
                              </Badge>
                            )}
                            <span className="line-clamp-2 text-xs text-muted-foreground">
                              {ref.diagnosis || "No diagnosis recorded"}
                            </span>
                          </Link>
                        </TableCell>

                        <TableCell className="hidden p-0 sm:table-cell">
                          <Link
                            href={detailHref}
                            className="flex items-center justify-center px-4 py-2.5"
                          >
                            <ConditionBadge condition={ref.condition_at_referral} />
                          </Link>
                        </TableCell>

                        <TableCell className="p-0">
                          <Link
                            href={detailHref}
                            className="flex items-center justify-center px-4 py-2.5"
                          >
                            <StatusBadge status={ref.status} />
                          </Link>
                        </TableCell>

                        <TableCell className="hidden p-0 lg:table-cell">
                          <Link
                            href={detailHref}
                            className="flex items-center justify-end px-4 py-2.5 text-[11px] tabular-nums whitespace-nowrap text-muted-foreground"
                          >
                            {submittedAt}
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
          </TableBody>
        </Table>
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-border/50 bg-muted/10 px-4 py-2">
        <span className="text-[10px] tabular-nums text-muted-foreground">
          {total} referral{total === 1 ? "" : "s"} · Page {page + 1} of{" "}
          {totalPages}
        </span>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 rounded-md p-0 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
            onClick={() => onPageChange(Math.max(0, page - 1))}
            disabled={page === 0 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 rounded-md p-0 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
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
