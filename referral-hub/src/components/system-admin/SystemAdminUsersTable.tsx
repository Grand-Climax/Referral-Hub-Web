"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  SYSTEM_ADMIN_ROLE_LABELS,
  normalizeSystemAdminRole,
} from "@/types/system-admin";
import type { SystemAdminUser } from "@/types/system-admin";
import { ImageMinus, PencilLine, Trash2 } from "lucide-react";
import { useGetHospitalByIdQuery } from "@/features/hospitals/hospitalsApi";

interface SystemAdminUsersTableProps {
  users: SystemAdminUser[];
  selectedUserId: string | null;
  loadingUserId: string | null;
  onEdit: (user: SystemAdminUser) => void;
  onDelete: (user: SystemAdminUser) => void;
  onModerateImage: (userId: string) => void;
}

function getStatusTone(isActive?: boolean) {
  return isActive === false
    ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
    : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300";
}

function HospitalNameCell({ user }: { user: SystemAdminUser }) {
  const shouldFetchHospital = !user.hospital?.name && Boolean(user.hospital_id);
  const { data: hospital } = useGetHospitalByIdQuery(user.hospital_id, {
    skip: !shouldFetchHospital,
  });

  return <p>{user.hospital?.name ?? hospital?.name ?? user.hospital_id}</p>;
}

export function SystemAdminUsersTable({
  users,
  selectedUserId,
  loadingUserId,
  onEdit,
  onDelete,
  onModerateImage,
}: SystemAdminUsersTableProps) {
  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = users.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [users]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return users.slice(startIndex, startIndex + pageSize);
  }, [users, currentPage]);

  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalItems);

  return (
    <Card className="border-border/60 bg-background/80 shadow-sm">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border/60 bg-muted/40 hover:bg-muted/40">
              <TableHead className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                User
              </TableHead>
              <TableHead className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Role
              </TableHead>
              <TableHead className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Hospital
              </TableHead>
              <TableHead className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="px-6 py-10 text-center text-sm text-muted-foreground"
                >
                  No users match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => {
                const isSelected = selectedUserId === user.id;
                const isBusy = loadingUserId === user.id;

                return (
                  <TableRow
                    key={user.id}
                    className={isSelected ? "bg-primary/5" : undefined}
                  >
                    <TableCell className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ID: {user.id}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className="border-border/70 bg-background text-foreground"
                      >
                        {SYSTEM_ADMIN_ROLE_LABELS[
                          normalizeSystemAdminRole(user.role)
                        ] ?? user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                      <div className="space-y-1">
                        <HospitalNameCell user={user} />
                        {user.department?.name ? (
                          <p className="text-xs">{user.department.name}</p>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={getStatusTone(user.is_active)}
                      >
                        {user.is_active === false ? "Inactive" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(user)}
                          className="h-8 w-8"
                        >
                          <PencilLine className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onModerateImage(user.id)}
                          disabled={isBusy}
                          className="h-8 w-8"
                        >
                          <ImageMinus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(user)}
                          disabled={isBusy}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {totalItems > 0 ? (
          <div className="flex flex-col gap-3 border-t border-border/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {rangeStart}-{rangeEnd} of {totalItems} users
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
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
  );
}
