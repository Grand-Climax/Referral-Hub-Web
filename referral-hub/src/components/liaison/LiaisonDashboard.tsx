"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Inbox,
  ArrowRight,
  ClipboardList,
  Search,
  X,
} from "lucide-react";
import {
  useGetLiaisonDashboardStatsQuery,
  useGetReferralsQuery,
} from "@/features/liaison/liaisonApi";
import type {
  LiaisonDashboardStatItem,
  LiaisonDashboardStats,
} from "@/types/liaison";
import type { ReferralListItem } from "@/types/referral-list";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useDepartmentNameMap } from "@/hooks/useDepartmentNameMap";

type StatTone = "default" | "warning" | "success" | "destructive";

const STAT_CARD_DEFINITIONS: Array<{
  key: keyof LiaisonDashboardStats;
  label: string;
  description: string;
  icon: typeof FileText;
  accent: string;
  tone: StatTone;
}> = [
  {
    key: "total_referrals",
    label: "Total referrals",
    description: "All cases in your queue",
    icon: FileText,
    accent: "bg-blue-500/10 text-blue-600 dark:text-blue-300",
    tone: "default",
  },
  {
    key: "pending_review",
    label: "Pending review",
    description: "Awaiting liaison decision",
    icon: Clock,
    accent: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
    tone: "warning",
  },
  {
    key: "approved_today",
    label: "Approved today",
    description: "Cleared for dispatch today",
    icon: CheckCircle2,
    accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    tone: "success",
  },
  {
    key: "rejected",
    label: "Rejected",
    description: "Declined or returned",
    icon: XCircle,
    accent: "bg-rose-500/10 text-rose-600 dark:text-rose-300",
    tone: "destructive",
  },
];

const EMPTY_STAT: LiaisonDashboardStatItem = { count: 0, change: 0 };

const DASHBOARD_QUEUE_LIMIT = 5;

type QueueFilter = "all" | "approved" | "rejected";

const QUEUE_FILTER_TABS: Array<{ value: QueueFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const VIEW_ALL_HREF: Record<QueueFilter, string> = {
  all: "/liaison-officer/referrals",
  approved: "/liaison-officer/referrals/approved",
  rejected: "/liaison-officer/referrals/rejected",
};

const STATUS_STYLES: Record<string, string> = {
  SUBMITTED:
    "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-200",
  UNDER_LIAISON_REVIEW:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200",
  FORWARDED:
    "border-purple-200 bg-purple-50 text-purple-800 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-200",
  UNDER_SPECIALIST_REVIEW:
    "border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200",
  ACCEPTED:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200",
  SCHEDULED:
    "border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-800 dark:bg-teal-950/50 dark:text-teal-200",
  REJECTED_BY_LIAISON:
    "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-200",
  REJECTED_BY_SPECIALIST:
    "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-200",
  REJECTED_AFTER_SEND:
    "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-200",
  NEED_REVISION:
    "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-200",
  COMPLETED:
    "border-border bg-muted text-muted-foreground",
};

function formatDelta(change: number) {
  if (!Number.isFinite(change) || change === 0) return "No change";
  const sign = change > 0 ? "+" : "";
  return `${sign}${change}% vs prior period`;
}

function getDeltaPillClasses(change: number, tone: StatTone) {
  if (!Number.isFinite(change) || change === 0) {
    return "text-muted-foreground";
  }
  const isImprovement = tone === "destructive" ? change < 0 : change > 0;
  return isImprovement
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-rose-600 dark:text-rose-400";
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatStatus(status: string) {
  return status.replace(/_/g, " ");
}

function formatPatientName(referral: ReferralListItem) {
  return [
    referral.patient_first_name,
    referral.patient_middle_name,
    referral.patient_last_name,
  ]
    .filter(Boolean)
    .join(" ");
}

function StatCardSkeleton() {
  return (
    <Card className="border bg-card shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="mt-4 h-9 w-16 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-3 w-32 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  );
}

function matchesSearch(
  referral: ReferralListItem,
  query: string,
  getDepartmentName: (id: string | null | undefined, fallback?: string) => string,
) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const patient = formatPatientName(referral).toLowerCase();
  const departmentId = (referral.department ?? "").toLowerCase();
  const departmentName = getDepartmentName(referral.department, "").toLowerCase();
  const diagnosis = (referral.diagnosis ?? "").toLowerCase();
  const status = referral.status.replace(/_/g, " ").toLowerCase();
  return (
    patient.includes(q) ||
    departmentId.includes(q) ||
    departmentName.includes(q) ||
    diagnosis.includes(q) ||
    status.includes(q)
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-2 p-1">
      {Array.from({ length: DASHBOARD_QUEUE_LIMIT }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse items-center gap-4 rounded-lg border border-transparent bg-muted/30 px-4 py-3"
        >
          <div className="h-4 w-36 rounded bg-muted" />
          <div className="hidden h-4 w-24 rounded bg-muted sm:block" />
          <div className="hidden h-4 flex-1 rounded bg-muted md:block" />
          <div className="h-6 w-20 rounded-full bg-muted" />
        </div>
      ))}
    </div>
  );
}

const LiaisonDashboard = () => {
  const router = useRouter();
  const [queueFilter, setQueueFilter] = useState<QueueFilter>("all");
  const [search, setSearch] = useState("");
  const { getDepartmentName } = useDepartmentNameMap();

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
  } = useGetLiaisonDashboardStatsQuery();

  const referralsQueryArg = useMemo(() => {
    const base = { page: 1, page_size: DASHBOARD_QUEUE_LIMIT };
    if (queueFilter === "approved") {
      return { ...base, listType: "approved" as const };
    }
    if (queueFilter === "rejected") {
      return { ...base, listType: "rejected" as const };
    }
    return { ...base, listType: "all" as const };
  }, [queueFilter]);

  const { data: referralsData, isLoading: referralsLoading } =
    useGetReferralsQuery(referralsQueryArg);

  useEffect(() => {
    setSearch("");
  }, [queueFilter]);

  const referrals = referralsData?.data ?? [];
  const total = referralsData?.total ?? 0;
  const filteredReferrals = referrals.filter((r) =>
    matchesSearch(r, search, getDepartmentName),
  );
  const hasSearch = search.trim().length > 0;
  const pendingCount = stats?.pending_review?.count ?? 0;

  const handleViewDetails = (id: string) => {
    router.push(`/liaison-officer/referrals/${id}`);
  };

  return (
    <div className="mx-auto space-y-8">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Liaison officer
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Referral review desk
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Monitor incoming referrals, clear pending reviews, and route approved
            cases to receiving hospitals.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="rounded-lg" asChild>
            <Link href="/liaison-officer/referrals/approved">
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              Approved
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="rounded-lg" asChild>
            <Link href="/liaison-officer/referrals/rejected">
              <XCircle className="mr-1.5 h-4 w-4" />
              Rejected
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsLoading
          ? STAT_CARD_DEFINITIONS.map((card) => (
              <StatCardSkeleton key={card.key} />
            ))
          : STAT_CARD_DEFINITIONS.map((card) => {
              const Icon = card.icon;
              const item = stats?.[card.key] ?? EMPTY_STAT;
              const deltaClass = getDeltaPillClasses(item.change, card.tone);

              return (
                <Card
                  key={card.key}
                  className="border bg-card shadow-sm transition-shadow hover:shadow-md"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {card.label}
                        </p>
                        <p className="text-xs text-muted-foreground/80">
                          {card.description}
                        </p>
                      </div>
                      <div
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                          card.accent,
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="mt-4">
                      {statsError ? (
                        <p className="text-sm text-destructive">
                          Unable to load
                        </p>
                      ) : (
                        <p className="text-3xl font-bold tabular-nums tracking-tight">
                          {item.count}
                        </p>
                      )}
                      <p
                        className={cn(
                          "mt-1.5 text-xs font-medium",
                          deltaClass,
                        )}
                      >
                        {formatDelta(item.change)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {/* Referrals table */}
      <Card className="overflow-hidden border bg-card shadow-sm">
        <CardHeader className="border-b bg-muted/20 px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">
                  Referral queue
                </CardTitle>
                <CardDescription className="mt-1 max-w-lg">
                  Review and approve referrals before dispatch.{" "}
                  {pendingCount > 0 && (
                    <span className="font-medium text-amber-600 dark:text-amber-400">
                      {pendingCount} pending review.
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
            {!referralsLoading && total > 0 && (
              <p className="text-sm tabular-nums text-muted-foreground lg:text-right">
                Latest {Math.min(DASHBOARD_QUEUE_LIMIT, referrals.length)} of{" "}
                {total}
              </p>
            )}
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div
              className="flex flex-wrap gap-1 rounded-lg border bg-background p-1"
              role="tablist"
              aria-label="Filter referral queue"
            >
              {QUEUE_FILTER_TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={queueFilter === tab.value}
                  onClick={() => setQueueFilter(tab.value)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    queueFilter === tab.value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by patient, dept…"
                className="h-9 rounded-lg bg-background pl-9 pr-8 text-sm"
                aria-label="Search in preview list"
              />
              {hasSearch && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {referralsLoading ? (
            <TableSkeleton />
          ) : referrals.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Inbox className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {queueFilter === "approved"
                    ? "No approved referrals"
                    : queueFilter === "rejected"
                      ? "No rejected referrals"
                      : "No referrals yet"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try another filter or open the full referrals list.
                </p>
              </div>
              <Button variant="outline" size="sm" className="rounded-lg" asChild>
                <Link href={VIEW_ALL_HREF[queueFilter]}>
                  View full list
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          ) : filteredReferrals.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-foreground">
                No matches in preview
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Adjust your search or open the full list to find more referrals.
              </p>
              <Button
                variant="link"
                size="sm"
                className="mt-2"
                onClick={() => setSearch("")}
              >
                Clear search
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="font-semibold">Patient</TableHead>
                      <TableHead className="font-semibold">Department</TableHead>
                      <TableHead className="hidden font-semibold md:table-cell">
                        Diagnosis
                      </TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="hidden font-semibold sm:table-cell">
                        Submitted
                      </TableHead>
                      <TableHead className="w-[100px] text-right font-semibold">
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReferrals.map((referral: ReferralListItem) => (
                      <TableRow
                        key={referral.id}
                        className="group cursor-pointer transition-colors hover:bg-muted/40"
                        onClick={() => handleViewDetails(referral.id)}
                      >
                        <TableCell>
                          <p className="font-medium text-foreground">
                            {formatPatientName(referral) || "Unknown patient"}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground md:hidden">
                            {getDepartmentName(referral.department, "No department")}
                          </p>
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground sm:table-cell">
                          {getDepartmentName(referral.department)}
                        </TableCell>
                        <TableCell className="hidden max-w-[220px] truncate text-muted-foreground md:table-cell">
                          {referral.diagnosis || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-medium capitalize",
                              STATUS_STYLES[referral.status] ??
                                "border-border bg-muted",
                            )}
                          >
                            {formatStatus(referral.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden text-sm tabular-nums text-muted-foreground sm:table-cell">
                          {formatDate(referral.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-lg opacity-80 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(referral.id);
                            }}
                          >
                            Review
                            <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col gap-2 border-t bg-muted/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {filteredReferrals.length}
                  </span>{" "}
                  of {total} in this category
                  {hasSearch && " (filtered)"}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  asChild
                >
                  <Link href={VIEW_ALL_HREF[queueFilter]}>
                    {total > DASHBOARD_QUEUE_LIMIT
                      ? `View all ${total} referrals`
                      : "Open full referrals list"}
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LiaisonDashboard;
