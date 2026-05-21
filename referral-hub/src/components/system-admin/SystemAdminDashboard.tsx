"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AtSign,
  Loader2,
  RefreshCcw,
  Search,
  ShieldAlert,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/apiError";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { SystemAdminHeader } from "./SystemAdminHeader";
import { SystemAdminStats } from "./SystemAdminStats";
import { SystemAdminUserForm } from "./SystemAdminUserForm";
import { SystemAdminUsersTable } from "./SystemAdminUsersTable";
import {
  useAssignSystemAdminRoleMutation,
  useCreateSystemAdminUserMutation,
  useDeleteSystemAdminUserMutation,
  useGetSystemAdminUsersQuery,
  useModerateSystemAdminProfileImageMutation,
  useUpdateSystemAdminUserMutation,
} from "@/features/systemAdmin/systemAdminApi";
import {
  useGetDepartmentsQuery,
  useGetHospitalsQuery,
} from "@/features/hospitals/hospitalsApi";
import type {
  AssignSystemAdminRoleRequest,
  CreateSystemAdminUserRequest,
  SystemAdminUser,
  SystemAdminUsersQueryParams,
  UpdateSystemAdminUserRequest,
} from "@/types/system-admin";
import { normalizeSystemAdminRole } from "@/types/system-admin";

const PAGE_SIZE = 10;

export function SystemAdminDashboard() {
  const [nameSearch, setNameSearch] = useState("");
  const [emailSearch, setEmailSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [hospitalFilter, setHospitalFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const backendQueryParams = useMemo<SystemAdminUsersQueryParams>(() => {
    const name = nameSearch.trim();
    const email = emailSearch.trim();

    return {
      page,
      page_size: PAGE_SIZE,
      name: name || undefined,
      email: email || undefined,
      hospital_id: hospitalFilter !== "all" ? hospitalFilter : undefined,
      dept_id: departmentFilter !== "all" ? departmentFilter : undefined,
      role:
        roleFilter !== "all" ? normalizeSystemAdminRole(roleFilter) : undefined,
      is_active: statusFilter === "all" ? undefined : statusFilter === "active",
    };
  }, [
    page,
    nameSearch,
    emailSearch,
    hospitalFilter,
    departmentFilter,
    roleFilter,
    statusFilter,
  ]);

  const {
    data: usersPage,
    isFetching,
    refetch,
  } = useGetSystemAdminUsersQuery(backendQueryParams);
  const users = usersPage?.users ?? [];
  const total = usersPage?.total;
  const { data: hospitals = [] } = useGetHospitalsQuery();
  const { data: departments = [] } = useGetDepartmentsQuery(hospitalFilter, {
    skip: hospitalFilter === "all",
  });
  const [createUser, { isLoading: isCreating }] =
    useCreateSystemAdminUserMutation();
  const [updateUser, { isLoading: isUpdating }] =
    useUpdateSystemAdminUserMutation();
  const [deleteUser, { isLoading: isDeleting }] =
    useDeleteSystemAdminUserMutation();
  const [moderateProfileImage, { isLoading: isModerating }] =
    useModerateSystemAdminProfileImageMutation();
  const [assignRole, { isLoading: isAssigning }] =
    useAssignSystemAdminRoleMutation();

  const [selectedUser, setSelectedUser] = useState<SystemAdminUser | null>(
    null,
  );
  const [pendingDeleteUser, setPendingDeleteUser] =
    useState<SystemAdminUser | null>(null);
  const [formRevision, setFormRevision] = useState(0);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  useEffect(() => {
    setDepartmentFilter("all");
  }, [hospitalFilter]);

  // Whenever a filter or search changes, jump back to the first page so we
  // don't accidentally request page N of a smaller result set.
  useEffect(() => {
    setPage(1);
  }, [
    nameSearch,
    emailSearch,
    roleFilter,
    hospitalFilter,
    departmentFilter,
    statusFilter,
  ]);

  const handleReset = () => {
    setSelectedUser(null);
    setFormRevision((current) => current + 1);
    setIsUserDialogOpen(false);
  };

  const openCreateDialog = () => {
    setSelectedUser(null);
    setFormRevision((current) => current + 1);
    setIsUserDialogOpen(true);
  };

  const openEditDialog = (user: SystemAdminUser) => {
    setSelectedUser(user);
    setFormRevision((current) => current + 1);
    setIsUserDialogOpen(true);
  };

  // Backend already returns server-filtered users for the current page.
  const filteredUsers = users;
  const resultsLabel =
    total !== undefined
      ? `${total} result${total === 1 ? "" : "s"}`
      : `${users.length} result${users.length === 1 ? "" : "s"}`;

  const busy =
    isCreating || isUpdating || isDeleting || isModerating || isAssigning;

  const runMutation = async (
    userId: string,
    action: () => Promise<unknown>,
  ) => {
    try {
      setLoadingUserId(userId);
      await action();
      await refetch();
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "System admin action failed."));
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleCreate = async (payload: CreateSystemAdminUserRequest) => {
    try {
      await createUser(payload).unwrap();
      toast.success("User created successfully.");
      setSelectedUser(null);
      setFormRevision((current) => current + 1);
      setIsUserDialogOpen(false);
      await refetch();
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Could not create the user."));
    }
  };

  const handleUpdate = async (
    id: string,
    payload: UpdateSystemAdminUserRequest,
  ) => {
    try {
      await updateUser({ id, body: payload }).unwrap();
      toast.success("User updated successfully.");
      setSelectedUser(null);
      setFormRevision((current) => current + 1);
      setIsUserDialogOpen(false);
      await refetch();
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Could not update the user."));
    }
  };

  const handleAssignRole = async (
    id: string,
    payload: AssignSystemAdminRoleRequest,
  ) => {
    try {
      await assignRole({ id, body: payload }).unwrap();
      toast.success("Role assigned successfully.");
      await refetch();
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Could not assign the role."));
    }
  };

  const handleModerateImage = async (id: string) => {
    await runMutation(id, async () => {
      await moderateProfileImage(id).unwrap();
      toast.success("Profile image moderated.");
    });
  };

  const handleDelete = (user: SystemAdminUser) => {
    setPendingDeleteUser(user);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteUser) {
      return;
    }

    await runMutation(pendingDeleteUser.id, async () => {
      await deleteUser(pendingDeleteUser.id).unwrap();
      toast.success("User deleted successfully.");
      if (selectedUser?.id === pendingDeleteUser.id) {
        setSelectedUser(null);
      }
    });

    setPendingDeleteUser(null);
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-400 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <SystemAdminHeader onReset={handleReset} />

      <SystemAdminStats users={users} filteredUsers={filteredUsers} />

      <Card className="border-border/60 bg-background/80 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={nameSearch}
                onChange={(event) => setNameSearch(event.target.value)}
                placeholder="Search by name"
                className="h-11 border-border/60 pl-9"
              />
            </div>
            <div className="relative w-full sm:max-w-xs">
              <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={emailSearch}
                onChange={(event) => setEmailSearch(event.target.value)}
                placeholder="Filter by email"
                className="h-11 border-border/60 pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="h-11 w-full sm:w-55">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="HOSPITAL_ADMIN">Hospital Admin</SelectItem>
                <SelectItem value="REFERRING_DOCTOR">
                  Referring Doctor
                </SelectItem>
                <SelectItem value="LIAISON_OFFICER">Liaison Officer</SelectItem>
                <SelectItem value="RECEIVING_SPECIALIST">
                  Receiving Specialist
                </SelectItem>
                <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
                <SelectItem value="DEPT_HEAD">Dept Head</SelectItem>
                <SelectItem value="MOH_ANALYST">MoH Analyst</SelectItem>
                <SelectItem value="SYSTEM_SUPER_ADMIN">
                  System Super Admin
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={hospitalFilter} onValueChange={setHospitalFilter}>
              <SelectTrigger className="h-11 w-full sm:w-55">
                <SelectValue placeholder="All hospitals" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All hospitals</SelectItem>
                {hospitals.map((hospital) => (
                  <SelectItem key={hospital.id} value={hospital.id}>
                    {hospital.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
              disabled={hospitalFilter === "all"}
            >
              <SelectTrigger className="h-11 w-full sm:w-55">
                <SelectValue placeholder="All departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All departments</SelectItem>
                {departments.map((department) => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-11 w-full sm:w-45">
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={openCreateDialog} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add new user
            </Button>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="gap-2"
              disabled={isFetching}
            >
              {isFetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              Refresh
            </Button>
            <div className="rounded-full border border-border/60 bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
              {filteredUsers.length} results
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="">
        <SystemAdminUsersTable
          users={filteredUsers}
          selectedUserId={selectedUser?.id ?? null}
          loadingUserId={loadingUserId}
          onEdit={openEditDialog}
          onDelete={handleDelete}
          onModerateImage={(user: string | SystemAdminUser) => {
            void handleModerateImage(typeof user === "string" ? user : user.id);
          }}
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          isFetching={isFetching}
          onPageChange={setPage}
        />
      </div>

      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? "Update user" : "Add new user"}
            </DialogTitle>
            <DialogDescription>
              {selectedUser
                ? "Edit the selected account and update the user role or access details."
                : "Create a new account for the system admin directory."}
            </DialogDescription>
          </DialogHeader>

          <SystemAdminUserForm
            key={`${selectedUser?.id ?? "new"}-${formRevision}`}
            selectedUser={selectedUser}
            onSubmitCreate={handleCreate}
            onSubmitUpdate={handleUpdate}
            submitting={busy}
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUserDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(pendingDeleteUser)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDeleteUser(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              Confirm user deletion
            </DialogTitle>
            <DialogDescription>
              {pendingDeleteUser
                ? `Delete ${pendingDeleteUser.first_name} ${pendingDeleteUser.last_name}? This action cannot be undone.`
                : "This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingDeleteUser(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                void handleConfirmDelete();
              }}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Delete user
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
