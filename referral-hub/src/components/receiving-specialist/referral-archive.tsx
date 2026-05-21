"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, Filter, Download, Search, AlertCircle } from "lucide-react";
import { ReferralTable } from "@/components/referral/ReferralTable";
import Link from "next/link";
import { ReferralListItem } from "@/types/referral-list";
import { useGetArchiveReferralsQuery } from "@/features/specialist/specialistApi";
import { ReferralHistorySkeleton } from "@/components/skeletons/ReferralHistorySkeleton";

type SortField = "time" | "name" | "status";
type SortOrder = "asc" | "desc";
type FilterStatus = "all" | "ACCEPTED" | "REJECTED" | "COMPLETED";

function filterStatusToListType(
  status: FilterStatus,
): "all" | "approved" | "rejected" | "completed" {
  switch (status) {
    case "ACCEPTED":
      return "approved";
    case "REJECTED":
      return "rejected";
    case "COMPLETED":
      return "completed";
    default:
      return "all";
  }
}

const getPatientFullName = (ref: ReferralListItem) => {
  const first = ref.patient_first_name ?? "";
  const middle = ref.patient_middle_name ?? "";
  const last = ref.patient_last_name ?? "";
  return [first, middle, last].filter(Boolean).join(" ").trim();
};

export function ReferralArchive() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("time");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [page, setPage] = useState(0);
  const pageSize = 8;

  const listType = filterStatusToListType(statusFilter);

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
  } = useGetArchiveReferralsQuery({
    page: page + 1,
    limit: pageSize,
    listType,
  });

  useEffect(() => {
    setPage(0);
  }, [searchQuery, sortField, sortOrder, statusFilter]);

  const referrals = response?.data ?? [];
  const totalCount = response?.total ?? 0;

  const filteredAndSortedReferrals = useMemo(() => {
    let result = [...referrals];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (ref) =>
          getPatientFullName(ref).toLowerCase().includes(query) ||
          ref.id.toLowerCase().includes(query) ||
          (ref.diagnosis ?? "").toLowerCase().includes(query) ||
          (ref.patient_region ?? "").toLowerCase().includes(query),
      );
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "time":
          comparison =
            new Date(a.updated_at ?? a.created_at ?? 0).getTime() -
            new Date(b.updated_at ?? b.created_at ?? 0).getTime();
          break;
        case "name":
          comparison = getPatientFullName(a).localeCompare(getPatientFullName(b));
          break;
        case "status":
          comparison = (a.status ?? "").localeCompare(b.status ?? "");
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [referrals, searchQuery, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  if (isLoading) {
    return <ReferralHistorySkeleton />;
  }

  if (isError) {
    return (
      <div className="mx-auto flex flex-col items-center justify-center gap-4 py-20">
        <AlertCircle className="h-10 w-10 text-destructive opacity-50" />
        <div className="text-center">
          <h2 className="text-lg font-semibold">Failed to load referral history</h2>
          <p className="text-muted-foreground">
            Please check your connection and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mx-auto pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          Referral History
        </h1>
        <p className="text-muted-foreground">
          Log of past referral decisions and outcomes.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("all")}
        >
          All
        </Button>
        <Button
          variant={statusFilter === "ACCEPTED" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("ACCEPTED")}
          className={
            statusFilter === "ACCEPTED"
              ? "bg-emerald-600 hover:bg-emerald-700"
              : "text-emerald-700 hover:text-emerald-800"
          }
        >
          Accepted
        </Button>
        <Button
          variant={statusFilter === "REJECTED" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("REJECTED")}
          className={
            statusFilter === "REJECTED"
              ? "bg-rose-600 hover:bg-rose-700"
              : "text-rose-700 hover:text-rose-800"
          }
        >
          Rejected
        </Button>
        <Button
          variant={statusFilter === "COMPLETED" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("COMPLETED")}
          className={
            statusFilter === "COMPLETED"
              ? "bg-blue-600 hover:bg-blue-700"
              : "text-blue-700 hover:text-blue-800"
          }
        >
          Completed
        </Button>
      </div>

      <Card className="border bg-card shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 px-6 border-b border-border">
          <div>
            <CardTitle className="text-lg font-bold">
              Processed Referrals ({totalCount})
            </CardTitle>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search patient, diagnosis..."
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
                  Sort By
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => handleSort("time")}
                  className="font-medium"
                >
                  Decision Date{" "}
                  {sortField === "time" && (sortOrder === "asc" ? "↑" : "↓")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("name")}>
                  Patient Name{" "}
                  {sortField === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("status")}>
                  Status{" "}
                  {sortField === "status" && (sortOrder === "asc" ? "↑" : "↓")}
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
            data={filteredAndSortedReferrals}
            total={totalCount}
            isLoading={isLoading}
            isFetching={isFetching}
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
                  className="text-foreground hover:bg-muted font-medium gap-2 px-3 w-auto"
                  aria-label={`View history ${ref.id}`}
                >
                  <Eye className="h-4 w-4" />
                  <span className="text-xs hidden md:inline">View</span>
                </Button>
              </Link>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
