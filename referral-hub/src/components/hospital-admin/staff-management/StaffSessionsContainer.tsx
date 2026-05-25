"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, LogOut, Monitor } from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/apiError";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useForceLogoutStaffMutation,
  useGetStaffSessionsQuery,
} from "@/features/hospitalAdmin/hospitalAdminApi";

export function StaffSessionsContainer() {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const { data, isLoading } = useGetStaffSessionsQuery({ page, page_size: pageSize });
  const [forceLogout, { isLoading: forcing }] = useForceLogoutStaffMutation();
  const [forcingId, setForcingId] = useState<string | null>(null);

  const sessions = data?.data ?? [];
  const total = data?.total ?? sessions.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleForceLogout = async (userId: string) => {
    setForcingId(userId);
    try {
      await forceLogout(userId).unwrap();
      toast.success("Staff session terminated.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not force logout."));
    } finally {
      setForcingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Active staff sessions</h1>
        <p className="mt-1 text-sm text-slate-500">
          Monitor signed-in staff and force logout when needed.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Monitor className="h-4 w-4" />
            {total} active session{total === 1 ? "" : "s"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Last active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300" />
                  </TableCell>
                </TableRow>
              ) : sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                    No active sessions.
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((session) => {
                  const name =
                    session.user_name ||
                    [session.first_name, session.last_name].filter(Boolean).join(" ") ||
                    session.user_email ||
                    session.user_id;
                  return (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{name}</p>
                          {session.user_email ? (
                            <p className="text-xs text-muted-foreground">{session.user_email}</p>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>{session.role ?? "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {session.ip_address ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {session.last_active_at
                          ? new Date(session.last_active_at).toLocaleString()
                          : session.created_at
                            ? new Date(session.created_at).toLocaleString()
                            : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/hospital-admin/staff-management/${session.user_id}`}>
                            <Button variant="outline" size="sm">
                              Profile
                            </Button>
                          </Link>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="gap-1"
                            disabled={forcing && forcingId === session.user_id}
                            onClick={() => void handleForceLogout(session.user_id)}
                          >
                            {forcing && forcingId === session.user_id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <LogOut className="h-4 w-4" />
                            )}
                            Force logout
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          {total > pageSize ? (
            <div className="flex items-center justify-between border-t px-6 py-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
