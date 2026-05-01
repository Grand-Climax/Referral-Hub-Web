"use client";

import { useMemo, useState } from "react";
import { Building2, Search, UsersRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useGetHospitalsQuery } from "@/features/hospitals/hospitalsApi";
import { useGetSystemAdminUsersQuery } from "@/features/systemAdmin/systemAdminApi";

const PAGE_SIZE = 8;

export function HospitalManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: hospitals = [], isFetching: hospitalsLoading } =
    useGetHospitalsQuery();
  const { data: users = [] } = useGetSystemAdminUsersQuery({
    page: 1,
    page_size: 500,
  });

  const usersByHospital = useMemo(
    () =>
      users.reduce<Record<string, number>>((accumulator, user) => {
        const hospitalId = user.hospital_id;
        if (!hospitalId) {
          return accumulator;
        }
        accumulator[hospitalId] = (accumulator[hospitalId] ?? 0) + 1;
        return accumulator;
      }, {}),
    [users],
  );

  const filteredHospitals = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return hospitals.filter((hospital) => {
      const matchesKeyword =
        keyword.length === 0 ||
        `${hospital.name} ${hospital.region} ${hospital.id}`
          .toLowerCase()
          .includes(keyword);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && hospital.is_active) ||
        (statusFilter === "inactive" && !hospital.is_active);

      return matchesKeyword && matchesStatus;
    });
  }, [hospitals, searchTerm, statusFilter]);

  const totalHospitals = filteredHospitals.length;
  const totalPages = Math.max(1, Math.ceil(totalHospitals / PAGE_SIZE));

  const paginatedHospitals = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredHospitals.slice(start, start + PAGE_SIZE);
  }, [filteredHospitals, currentPage]);

  const totalAssignedUsers = useMemo(
    () => Object.values(usersByHospital).reduce((sum, count) => sum + count, 0),
    [usersByHospital],
  );

  const rangeStart =
    totalHospitals === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, totalHospitals);

  return (
    <div className="mx-auto flex w-full max-w-400 flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Hospital management
        </h1>
        <p className="text-sm text-muted-foreground">
          Review active and inactive hospitals and monitor how many users are
          assigned per hospital.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Hospitals
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{hospitals.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Filtered hospitals
            </CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{totalHospitals}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Assigned users
            </CardTitle>
            <UsersRound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{totalAssignedUsers}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 bg-background/80 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by hospital name, region, or ID"
              className="h-11 border-border/60 pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-11 w-full sm:w-48">
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-background/80 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 bg-muted/40 hover:bg-muted/40">
                <TableHead className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Hospital
                </TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Region
                </TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Tier
                </TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Users
                </TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hospitalsLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="px-6 py-10 text-center text-sm text-muted-foreground"
                  >
                    Loading hospitals...
                  </TableCell>
                </TableRow>
              ) : paginatedHospitals.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="px-6 py-10 text-center text-sm text-muted-foreground"
                  >
                    No hospitals found for the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedHospitals.map((hospital) => (
                  <TableRow key={hospital.id}>
                    <TableCell className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">
                          {hospital.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ID: {hospital.id}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                      {hospital.region || "-"}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                      {hospital.tier_level || "-"}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                      {usersByHospital[hospital.id] ?? 0}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={
                          hospital.is_active
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
                        }
                      >
                        {hospital.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalHospitals > 0 ? (
            <div className="flex flex-col gap-3 border-t border-border/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {rangeStart}-{rangeEnd} of {totalHospitals} hospitals
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="px-2 text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
