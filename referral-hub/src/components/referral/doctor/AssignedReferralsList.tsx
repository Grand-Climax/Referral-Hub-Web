"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetAssignedReferralsQuery } from "@/features/doctor/doctorReferralApi";
import type { AssignedReferralRow } from "@/types/clinical";

type AccessTab = "treating" | "consulting" | "all";

function AssignedReferralCard({
  row,
  onOpen,
}: {
  row: AssignedReferralRow;
  onOpen: () => void;
}) {
  const revoked = !!row.access_revoked_at;
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-foreground truncate">
            {row.patient_name}
          </p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {row.target_department}
          </p>
        </div>
        <Badge variant="outline" className="text-[10px] capitalize shrink-0">
          {row.status?.toLowerCase()}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        {row.access_type?.replace(/_/g, " ")}
        {revoked && " · Revoked"}
      </p>
      <Button
        size="sm"
        variant="outline"
        className="w-full"
        disabled={revoked}
        onClick={onOpen}
      >
        Open workspace
      </Button>
    </div>
  );
}

export function AssignedReferralsList() {
  const router = useRouter();
  const [tab, setTab] = useState<AccessTab>("treating");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [includeRevoked, setIncludeRevoked] = useState(false);

  const accessType =
    tab === "all" ? undefined : tab === "treating" ? "treating" : "consulting";

  const { data, isLoading, isFetching } = useGetAssignedReferralsQuery({
    page,
    limit: 20,
    access_type: accessType,
    include_revoked: includeRevoked,
  });

  const rows = data?.data ?? [];
  const filtered = search.trim()
    ? rows.filter((r) =>
        r.patient_name?.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : rows;
  const totalPages = data?.total
    ? Math.max(1, Math.ceil(data.total / (data.limit || 20)))
    : 1;

  const openRow = (row: AssignedReferralRow) => {
    const hat =
      row.access_type === "TREATING_DOCTOR" ? "treating" : "consulting";
    router.push(`/referring-doctor/assigned/${row.id}?hat=${hat}`);
  };

  return (
    <div className="min-w-0 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">
          Assigned referrals
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Patients you are treating or consulting on at the receiving hospital.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "treating" as const, label: "Treating" },
              { id: "consulting" as const, label: "Consulting" },
              { id: "all" as const, label: "All" },
            ] as const
          ).map((t) => (
            <Button
              key={t.id}
              size="sm"
              variant={tab === t.id ? "default" : "outline"}
              className="flex-1 sm:flex-none min-w-[5.5rem]"
              onClick={() => {
                setTab(t.id);
                setPage(1);
              }}
            >
              {t.label}
            </Button>
          ))}
        </div>
        <Button
          size="sm"
          variant={includeRevoked ? "secondary" : "outline"}
          className="w-full sm:w-auto sm:ml-auto"
          onClick={() => setIncludeRevoked((v) => !v)}
        >
          {includeRevoked ? "Including revoked" : "Active only"}
        </Button>
      </div>

      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9 w-full"
          placeholder="Search patient name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Mobile: card list */}
      <div className="space-y-3 md:hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-12">
            No assigned referrals in this view.
          </p>
        ) : (
          filtered.map((row) => (
            <AssignedReferralCard
              key={`${row.id}-${row.access_granted_at}`}
              row={row}
              onOpen={() => openRow(row)}
            />
          ))
        )}
      </div>

      {/* Tablet/desktop: table */}
      <div className="hidden md:block rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[640px]">
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Access</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-12 text-center text-muted-foreground"
                  >
                    No assigned referrals in this view.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((row) => {
                  const revoked = !!row.access_revoked_at;
                  return (
                    <TableRow key={`${row.id}-${row.access_granted_at}`}>
                      <TableCell className="font-medium max-w-[180px] truncate">
                        {row.patient_name}
                      </TableCell>
                      <TableCell className="max-w-[140px] truncate">
                        {row.target_department}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {row.status?.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[160px]">
                        <span className="line-clamp-2">
                          {row.access_type?.replace(/_/g, " ")}
                          {revoked && " (revoked)"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={revoked}
                          onClick={() => openRow(row)}
                        >
                          Open
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
        <span className="text-center sm:text-left">
          Page {page} of {totalPages}
          {isFetching && !isLoading ? " · Updating…" : ""}
        </span>
        <div className="flex gap-2 justify-center sm:justify-end">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 sm:flex-none"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 sm:flex-none"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
