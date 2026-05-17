"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  ChevronRight,
  Loader2,
  MapPin,
  RefreshCcw,
  Search,
  ShieldAlert,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SystemAdminUserForm } from "./SystemAdminUserForm";
import { SystemAdminUsersTable } from "./SystemAdminUsersTable";
import { useGetHospitalsQuery } from "@/features/hospitals/hospitalsApi";
import {
  useCreateSystemAdminUserMutation,
  useDeleteSystemAdminUserMutation,
  useGetSystemAdminUsersQuery,
  useModerateSystemAdminProfileImageMutation,
  useUpdateSystemAdminUserMutation,
} from "@/features/systemAdmin/systemAdminApi";
import type {
  CreateSystemAdminUserRequest,
  SystemAdminUser,
  SystemAdminUsersQueryParams,
  UpdateSystemAdminUserRequest,
} from "@/types/system-admin";
import type { Hospital } from "@/types/hospital";

export function HospitalStaffManagement() {
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>("");
  const [hospitalSearchTerm, setHospitalSearchTerm] = useState("");

  const [selectedUser, setSelectedUser] = useState<SystemAdminUser | null>(
    null,
  );
  const [pendingDeleteUser, setPendingDeleteUser] =
    useState<SystemAdminUser | null>(null);
  const [formRevision, setFormRevision] = useState(0);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  const {
    data: hospitals = [],
    isFetching: isHospitalsLoading,
    refetch: refetchHospitals,
  } = useGetHospitalsQuery();

  const selectedHospital = useMemo(
    () => hospitals.find((hospital) => hospital.id === selectedHospitalId),
    [hospitals, selectedHospitalId],
  );

  const filteredHospitals = useMemo(() => {
    const keyword = hospitalSearchTerm.trim().toLowerCase();
    if (!keyword) return hospitals;
    return hospitals.filter((hospital) =>
      `${hospital.name} ${hospital.region} ${hospital.tier_level} ${hospital.id}`
        .toLowerCase()
        .includes(keyword),
    );
  }, [hospitals, hospitalSearchTerm]);

  const backendQueryParams = useMemo<SystemAdminUsersQueryParams>(
    () => ({
      page: 1,
      page_size: 100,
      hospital_id: selectedHospitalId || undefined,
    }),
    [selectedHospitalId],
  );

  const {
    data: users = [],
    isFetching: isUsersFetching,
    refetch: refetchUsers,
  } = useGetSystemAdminUsersQuery(backendQueryParams, {
    skip: !selectedHospitalId,
  });

  const [createUser, { isLoading: isCreating }] =
    useCreateSystemAdminUserMutation();
  const [updateUser, { isLoading: isUpdating }] =
    useUpdateSystemAdminUserMutation();
  const [deleteUser, { isLoading: isDeleting }] =
    useDeleteSystemAdminUserMutation();
  const [moderateProfileImage, { isLoading: isModerating }] =
    useModerateSystemAdminProfileImageMutation();

  useEffect(() => {
    setSelectedUser(null);
  }, [selectedHospitalId]);

  const filteredUsers = useMemo(() => {
    if (!selectedHospitalId) return [] as SystemAdminUser[];
    return users.filter(
      (user) => !user.hospital_id || user.hospital_id === selectedHospitalId,
    );
  }, [users, selectedHospitalId]);

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

  const busy = isCreating || isUpdating || isDeleting || isModerating;

  const runMutation = async (
    userId: string,
    action: () => Promise<unknown>,
  ) => {
    try {
      setLoadingUserId(userId);
      await action();
      await refetchUsers();
    } catch (error) {
      console.error(error);
      toast.error("Action failed. Please try again.");
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleCreate = async (payload: CreateSystemAdminUserRequest) => {
    try {
      await createUser({
        ...payload,
        hospital_id: payload.hospital_id || selectedHospitalId,
      }).unwrap();
      toast.success("Staff member created successfully.");
      setSelectedUser(null);
      setFormRevision((current) => current + 1);
      setIsUserDialogOpen(false);
      await refetchUsers();
    } catch (error) {
      console.error(error);
      toast.error("Could not create staff member.");
    }
  };

  const handleUpdate = async (
    id: string,
    payload: UpdateSystemAdminUserRequest,
  ) => {
    try {
      await updateUser({ id, body: payload }).unwrap();
      toast.success("Staff member updated successfully.");
      setSelectedUser(null);
      setFormRevision((current) => current + 1);
      setIsUserDialogOpen(false);
      await refetchUsers();
    } catch (error) {
      console.error(error);
      toast.error("Could not update staff member.");
    }
  };

  const handleModerateImage = async (id: string) => {
    await runMutation(id, async () => {
      await moderateProfileImage(id).unwrap();
      toast.success("Profile image moderated.");
    });
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteUser) return;
    await runMutation(pendingDeleteUser.id, async () => {
      await deleteUser(pendingDeleteUser.id).unwrap();
      toast.success("Staff member deleted.");
      if (selectedUser?.id === pendingDeleteUser.id) {
        setSelectedUser(null);
      }
    });
    setPendingDeleteUser(null);
  };

  // ── HOSPITAL PICKER VIEW ──────────────────────────────────────────────
  if (!selectedHospitalId) {
    return (
      <div className="mx-auto flex w-full max-w-400 flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Hospital staff
            </h1>
            <p className="text-sm text-muted-foreground">
              Select a hospital to view and manage its staff.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => refetchHospitals()}
            className="gap-2"
            disabled={isHospitalsLoading}
          >
            {isHospitalsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>

        <Card className="border-border/60 bg-background/80 shadow-sm">
          <CardContent className="p-4">
            <div className="relative w-full max-w-xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={hospitalSearchTerm}
                onChange={(event) => setHospitalSearchTerm(event.target.value)}
                placeholder="Search hospitals by name, region, tier, or ID"
                className="h-11 border-border/60 pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {isHospitalsLoading ? (
          <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading hospitals...
          </div>
        ) : filteredHospitals.length === 0 ? (
          <Card className="border-dashed border-border/60 bg-muted/20">
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <Building2 className="h-10 w-10 text-muted-foreground" />
              <p className="text-base font-medium text-foreground">
                No hospitals found
              </p>
              <p className="max-w-md text-sm text-muted-foreground">
                Try a different search term or add a hospital from the Hospital
                Management page.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredHospitals.map((hospital) => (
              <HospitalCard
                key={hospital.id}
                hospital={hospital}
                onSelect={() => setSelectedHospitalId(hospital.id)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── HOSPITAL STAFF VIEW ───────────────────────────────────────────────
  return (
    <div className="mx-auto flex w-full max-w-400 flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => setSelectedHospitalId("")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {selectedHospital?.name ?? "Hospital staff"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {selectedHospital?.region
                ? `${selectedHospital.region} • `
                : ""}
              ID: {selectedHospitalId}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" onClick={openCreateDialog} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add staff
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => refetchUsers()}
            className="gap-2"
            disabled={isUsersFetching}
          >
            {isUsersFetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredUsers.length} staff member
          {filteredUsers.length === 1 ? "" : "s"}
        </p>
      </div>

      <SystemAdminUsersTable
        users={filteredUsers}
        selectedUserId={selectedUser?.id ?? null}
        loadingUserId={loadingUserId}
        onEdit={openEditDialog}
        onDelete={(user: SystemAdminUser) => setPendingDeleteUser(user)}
        onModerateImage={(user: string | SystemAdminUser) => {
          void handleModerateImage(typeof user === "string" ? user : user.id);
        }}
      />

      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? "Update staff member" : "Add new staff member"}
            </DialogTitle>
            <DialogDescription>
              {selectedUser
                ? "Edit details for the selected staff member."
                : `Create a new account for ${selectedHospital?.name ?? "this hospital"}.`}
            </DialogDescription>
          </DialogHeader>

          <SystemAdminUserForm
            key={`${selectedUser?.id ?? "new"}-${formRevision}`}
            selectedUser={selectedUser}
            onSubmitCreate={handleCreate}
            onSubmitUpdate={handleUpdate}
            submitting={busy}
            defaultHospitalId={selectedHospitalId}
          />

          <DialogFooter>
            <Button
              type="button"
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
          if (!open) setPendingDeleteUser(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              Confirm staff deletion
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
              Delete staff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface HospitalCardProps {
  hospital: Hospital;
  onSelect: () => void;
}

function HospitalCard({ hospital, onSelect }: HospitalCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex h-full w-full flex-col gap-3 rounded-xl border border-border/60 bg-background p-5 text-left shadow-sm transition-all hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Building2 className="h-5 w-5" />
        </div>
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
      </div>

      <div className="space-y-1">
        <p className="font-semibold leading-snug text-foreground">
          {hospital.name}
        </p>
        {hospital.region ? (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {hospital.region}
          </p>
        ) : null}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-3">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {hospital.tier_level || "—"}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:underline">
          <UsersRound className="h-3.5 w-3.5" />
          View staff
          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  );
}
