"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  CalendarCheck,
  Eye,
  Filter,
  Download,
  Search,
} from "lucide-react";
import { ReferralTable } from "@/components/referral/ReferralTable";
import { ReferralListItem } from "@/types/referral-list";
import { useGetReferralsQuery } from "@/features/specialist/specialistApi";
import Link from "next/link";
import { SpecialistDashboardSkeleton } from "@/components/skeletons/SpecialistDashboardSkeleton";

const statConfig = [
  {
    label: "Total Incoming",
    key: "total",
    icon: FileText,
    accent: "bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-200",
    delta: "+12%",
    trendUp: true,
  },
  {
    label: "High Severity",
    key: "high",
    icon: AlertTriangle,
    accent: "bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-200",
    delta: "-5%",
    trendUp: false,
  },
  {
    label: "Pending Reviews",
    key: "pending",
    icon: Clock,
    accent:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/20 dark:text-amber-200",
    delta: "+8%",
    trendUp: true,
  },
  {
    label: "Accepted",
    key: "accepted",
    icon: CheckCircle2,
    accent:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200",
    delta: "+15%",
    trendUp: true,
  },
  {
    label: "Rejected",
    key: "rejected",
    icon: XCircle,
    accent: "bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-200",
    delta: "-2%",
    trendUp: false,
  },
  {
    label: "Today's Scheduled",
    key: "scheduled",
    icon: CalendarCheck,
    accent:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-200",
    delta: "+4%",
    trendUp: true,
  },
];

type SortField =
  | "time"
  | "name"
  | "specialty"
  | "status"
  | "diagnosis"
  | "priority";
type SortOrder = "asc" | "desc";

// Helper functions removed as they are now handled by the API response structure

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("time");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(0);
  const pageSize = 8;
  const {
    data: response,
    isLoading,
    isError,
  } = useGetReferralsQuery({
    page: page + 1,
    limit: pageSize,
  });

  const referrals = response?.data ?? [];
  const totalCount = response?.total ?? 0;

  const total = totalCount;
  const high = referrals.filter(
    (r) =>
      r.condition_at_referral === "UNSTABLE" ||
      r.condition_at_referral === "CRITICAL",
  ).length;
  const pending = referrals.filter((r) => r.status === "PENDING").length;
  const accepted = referrals.filter((r) => r.status === "ACCEPTED").length;
  const rejected = referrals.filter(
    (r) => String(r.status) === "REJECTED_BY_SPECIALIST" || String(r.status) === "REJECTED",
  ).length;
  const scheduled = referrals.filter((r) => r.status === "ACCEPTED").length;

  const counts: Record<string, number> = {
    total,
    high,
    pending,
    accepted,
    rejected,
    scheduled,
  };

  const tableData = referrals;

  useEffect(() => {
    setPage(0);
  }, [searchQuery, sortField, sortOrder]);

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(tableData.length / pageSize) - 1);
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [page, pageSize, tableData.length]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  if (isLoading) {
    return <SpecialistDashboardSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-rose-500 font-semibold text-lg">
          Failed to load referrals. Please try again later.
        </p>
      </div >
    );
  }

  return (
    <div className="space-y-6 mx-auto">
      {/* Stat row */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {statConfig.map((stat) => {
          // In the design, icons are not present in these cards, only numbers, labels and trends.
          return (
            <Card key={stat.label} className="border bg-card shadow-sm">
              <CardContent className="p-4 flex flex-col justify-between h-full">
                <span className="text-xs font-semibold text-muted-foreground mb-2">
                  {stat.label}
                </span>
                <div className="flex items-end justify-between mt-1">
                  <p className="text-2xl font-bold tracking-tight text-foreground">
                    {counts[stat.key]}
                  </p>
                  <div
                    className={`flex items-center text-xs font-semibold ${stat.trendUp ? "text-emerald-500" : "text-rose-500"}`}
                  >
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {stat.trendUp ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"
                        />
                      )}
                    </svg>
                    {stat.delta}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Incoming Referral Queue */}
      <Card className="border bg-card shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 px-6 border-b border-border">
          <div>
            <CardTitle className="text-lg font-bold">
              Incoming Referral Queue
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Prioritized by Machine Learning triage scores
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search patient, specialty, diagnosis..."
                className="pl-8 h-9 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2 text-sm font-medium border-border"
                >
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleSort("time")}>
                  Sort by Time{" "}
                  {sortField === "time" && (sortOrder === "asc" ? "↑" : "↓")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("name")}>
                  Sort by Patient Name{" "}
                  {sortField === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("specialty")}>
                  Sort by Specialty{" "}
                  {sortField === "specialty" &&
                    (sortOrder === "asc" ? "↑" : "↓")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("status")}>
                  Sort by Status{" "}
                  {sortField === "status" && (sortOrder === "asc" ? "↑" : "↓")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("diagnosis")}>
                  Sort by Diagnosis{" "}
                  {sortField === "diagnosis" &&
                    (sortOrder === "asc" ? "↑" : "↓")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("priority")}>
                  Sort by Priority{" "}
                  {sortField === "priority" &&
                    (sortOrder === "asc" ? "↑" : "↓")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="sm"
              className="h-9 gap-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ReferralTable
            data={referrals}
            total={totalCount}
            page={page}
            onPageChange={setPage}
            pageSize={pageSize}
            detailHrefPrefix="/receiving-specialist"
            actionSlot={(ref) => (
              <Link href={`/receiving-specialist/${ref.id}`}>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="text-foreground hover:bg-muted"
                  aria-label={`View referral ${ref.id}`}
                >
                  <Eye className="h-5 w-5" />
                </Button>
              </Link>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
