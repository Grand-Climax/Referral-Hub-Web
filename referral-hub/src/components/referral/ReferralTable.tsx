"use client";

import { useState } from "react";
import Link from "next/link";
import { differenceInYears, formatDistanceToNow } from "date-fns";
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
import { useGetDepartmentByIdQuery } from "@/features/department/department";
import { ReferralListItem } from "@/types/referral-list";

// ── Status badge ──────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  DRAFT:     "bg-slate-100 text-slate-700 border-slate-200",
  SUBMITTED: "bg-blue-100 text-blue-700 border-blue-200",
  PENDING:   "bg-amber-100 text-amber-700 border-amber-200",
  ACCEPTED:  "bg-emerald-100 text-emerald-700 border-emerald-200",
  REJECTED:  "bg-red-100 text-red-700 border-red-200",
  COMPLETED: "bg-gray-100 text-gray-700 border-gray-200",
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_STYLES[status?.toUpperCase()] ?? "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <Badge variant="outline" className={`text-[11px] font-medium capitalize ${cls}`}>
      {status?.toLowerCase()}
    </Badge>
  );
}

// ── Condition chip ────────────────────────────────────────────────────────────
const CONDITION_STYLES: Record<string, string> = {
  CRITICAL:  "bg-red-50 text-red-700 ring-red-100",
  UNSTABLE:  "bg-orange-50 text-orange-700 ring-orange-100",
  STABLE:    "bg-emerald-50 text-emerald-700 ring-emerald-100",
  IMPROVING: "bg-blue-50 text-blue-700 ring-blue-100",
};
function ConditionChip({ value }: { value: string }) {
  const cls = CONDITION_STYLES[value?.toUpperCase()] ?? "bg-gray-50 text-gray-600 ring-gray-100";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 capitalize ${cls}`}>
      {value?.toLowerCase() ?? "—"}
    </span>
  );
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ── Department Resolver ────────────────────────────────────────────────────────
function DepartmentName({ id }: { id?: string | null }) {
  const { data: department, isLoading } = useGetDepartmentByIdQuery(id ?? "", {
    skip: !id,
  });

  if (!id) return <span>—</span>;
  if (isLoading) return <span className="animate-pulse opacity-50">Loading…</span>;

  return (
    <span className="truncate">{department?.name || id.slice(0, 8) + "…"}</span>
  );
}

function ListDepartmentLabel({ referral }: { referral: ReferralListItem }) {
  const departmentValue = referral.department?.trim();
  if (departmentValue && !UUID_RE.test(departmentValue)) {
    return <span className="truncate">{departmentValue}</span>;
  }

  const departmentId = referral.department_id ?? departmentValue ?? "";
  return <DepartmentName id={departmentId} />;
}

// ── Row skeleton ──────────────────────────────────────────────────────────────
function RowSkeleton() {
  return (
    <TableRow>
      {[80, 140, 160, 100, 80, 72, 90].map((w, i) => (
        <TableCell key={i} className="py-3 px-4">
          <Skeleton className="h-4 rounded" style={{ width: w }} />
        </TableCell>
      ))}
    </TableRow>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface ReferralTableProps {
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
  /** Override the page size (default 8) */
  pageSize?: number;
  /** Extra action column rendered per row */
  actionSlot?: (row: ReferralListItem ) => React.ReactNode;
  /** Link structure for the detail page. Defaults to doctor dashboard path. */
  detailHrefPrefix?: string;
}

export function ReferralTable({ 
  data = [] as ReferralListItem[],
  total = 0,
  isLoading = false,
  isFetching = false,
  page,
  onPageChange,
  pageSize = 8, 
  actionSlot,
  detailHrefPrefix = "/referring-doctor"
}: ReferralTableProps) {
  const rows       = data;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const loading    = isLoading || isFetching;

  return (
    <div className="flex flex-col h-full">
      {/* ── Scrollable table area ─────────────────────────────────────── */}
      <div className="flex-1 overflow-auto min-h-0">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted/60 backdrop-blur-sm">
            <TableRow className="hover:bg-transparent border-b border-border/60">
              <TableHead className="w-[90px] px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                ID
              </TableHead>
              <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Patient
              </TableHead>
              <TableHead className="hidden md:table-cell px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Diagnosis
              </TableHead>
              <TableHead className="hidden sm:table-cell px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Department
              </TableHead>
              <TableHead className="hidden md:table-cell px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Condition
              </TableHead>
              <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="hidden lg:table-cell px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Date
              </TableHead>
              {actionSlot && (
                <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading
              ? Array.from({ length: pageSize }).map((_, i) => <RowSkeleton key={i} />)
              : rows.length === 0
              ? (
                <TableRow>
                  <TableCell colSpan={actionSlot ? 8 : 7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileText className="h-8 w-8 opacity-30" />
                      <p className="text-sm">No referrals found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )
              : rows.map((ref) => {
                  const fullName = [ref.patient_first_name, ref.patient_middle_name, ref.patient_last_name]
                    .filter(Boolean).join(" ");
                  const shortId  = ref.id?.slice(0, 8) ?? "—";
                  const dateStr  = ref.created_at
                    ? formatDistanceToNow(new Date(ref.created_at), { addSuffix: true })
                    : "—";

                  return (
                    <TableRow
                      key={ref.id}
                      className="group border-b border-border/40 transition-colors hover:bg-muted/40"
                    >
                      {/* ID — the entire row is navigable via this Link spanning the cell */}
                      <TableCell className="p-0 w-[90px]">
                        <Link
                          href={`${detailHrefPrefix}/${ref.id}`}
                          className="flex items-center px-4 py-3 h-full font-mono text-xs text-muted-foreground group-hover:text-foreground"
                        >
                          {shortId}
                        </Link>
                      </TableCell>

                      <TableCell className="p-0">
                        <Link href={`${detailHrefPrefix}/${ref.id}`} className="flex flex-col px-4 py-3 h-full gap-0.5">
                          <span className="text-sm font-medium text-foreground leading-tight">
                            {fullName || "Unknown Patient"}
                          </span>
                        </Link>
                      </TableCell>

                      <TableCell className="hidden md:table-cell p-0">
                        <Link href={`${detailHrefPrefix}/${ref.id}`} className="flex items-center px-4 py-3 h-full text-sm text-foreground/80">
                          {ref.diagnosis || "—"}
                        </Link>
                      </TableCell>

                      <TableCell className="hidden sm:table-cell p-0">
                        <Link href={`${detailHrefPrefix}/${ref.id}`} className="flex items-center px-4 py-3 h-full text-sm text-foreground/80 max-w-[150px]">
                          <ListDepartmentLabel referral={ref} />
                        </Link>
                      </TableCell>

                      <TableCell className="hidden md:table-cell p-0">
                        <Link href={`${detailHrefPrefix}/${ref.id}`} className="flex items-center px-4 py-3 h-full">
                          <ConditionChip value={ref.condition_at_referral} />
                        </Link>
                      </TableCell>

                      <TableCell className="p-0">
                        <Link href={`${detailHrefPrefix}/${ref.id}`} className="flex items-center px-4 py-3 h-full">
                          <StatusBadge status={ref.status} />
                        </Link>
                      </TableCell>

                      <TableCell className="hidden lg:table-cell p-0">
                        <Link href={`${detailHrefPrefix}/${ref.id}`} className="flex items-center px-4 py-3 h-full text-xs text-muted-foreground whitespace-nowrap">
                          {dateStr}
                        </Link>
                      </TableCell>

                      {actionSlot && (
                        <TableCell className="px-4 py-3">
                          {actionSlot(ref)}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination footer ─────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between border-t border-border/50 px-4 py-2.5 bg-background/80 backdrop-blur-sm">
        {/* Left: record count */}
        <span className="text-xs text-muted-foreground tabular-nums">
          {total === 0
            ? "No records"
            : `${page * pageSize + 1}–${Math.min((page + 1) * pageSize, total)} of ${total}`}
        </span>

        {/* Centre: ← page numbers → */}
        <div className="flex items-center gap-1">
          {/* Prev */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30"
            onClick={() => onPageChange(Math.max(0, page - 1))}
            disabled={page === 0 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page number buttons */}
          {Array.from({ length: totalPages }, (_, i) => {
            // Show first, last, and a window around the current page
            const near = Math.abs(i - page) <= 1;
            const isEdge = i === 0 || i === totalPages - 1;
            if (!near && !isEdge) {
              // Show a single ellipsis when skipping
              if (i === 1 || i === totalPages - 2) {
                return (
                  <span key={`ellipsis-${i}`} className="w-8 text-center text-xs text-muted-foreground select-none">
                    …
                  </span>
                );
              }
              return null;
            }
            return (
              <Button
                key={i}
                variant={i === page ? "default" : "ghost"}
                size="sm"
                className={`h-8 w-8 p-0 rounded-md text-xs font-medium tabular-nums transition-colors
                  ${i === page
                    ? "bg-primary text-primary-foreground shadow-sm pointer-events-none"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                onClick={() => onPageChange(i)}
                disabled={loading}
              >
                {i + 1}
              </Button>
            );
          })}

          {/* Next */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30"
            onClick={() => onPageChange(page + 1)}
            disabled={page + 1 >= totalPages || loading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Right: spacer to keep centre truly centred */}
        <span className="text-xs text-transparent tabular-nums select-none" aria-hidden>
          {total === 0 ? "No records" : `${page * pageSize + 1}–${Math.min((page + 1) * pageSize, total)} of ${total}`}
        </span>
      </div>
    </div>
  );
}
