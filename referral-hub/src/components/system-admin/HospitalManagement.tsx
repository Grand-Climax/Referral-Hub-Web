"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Eye,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCreateHospitalMutation,
  useDeleteHospitalMutation,
  useGetHospitalsQuery,
  useUpdateHospitalMutation,
} from "@/features/hospitals/hospitalsApi";
import { useGetSystemAdminUsersQuery } from "@/features/systemAdmin/systemAdminApi";
import type {
  CreateHospitalRequest,
  Hospital,
  UpdateHospitalRequest,
} from "@/types/hospital";

const PAGE_SIZE = 8;
const TIER_LEVEL_OPTIONS = ["PRIMARY", "GENERAL", "SPECIALIZED"] as const;

const defaultHospitalFormValues: CreateHospitalRequest = {
  address: "",
  contact_phone: "",
  name: "",
  region: "",
  tier_level: "SPECIALIZED",
};

const buildEditValues = (hospital: Hospital): UpdateHospitalRequest => ({
  address: hospital.address ?? "",
  contact_phone: hospital.contact_phone ?? "",
  is_active: hospital.is_active,
  name: hospital.name ?? "",
  region: hospital.region ?? "",
  tier_level: hospital.tier_level ?? "SPECIALIZED",
});

export function HospitalManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [hospitalForm, setHospitalForm] = useState<CreateHospitalRequest>(
    defaultHospitalFormValues,
  );

  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [editForm, setEditForm] = useState<UpdateHospitalRequest | null>(null);

  const [hospitalToDelete, setHospitalToDelete] = useState<Hospital | null>(
    null,
  );

  const {
    data: hospitals = [],
    isFetching: hospitalsLoading,
    refetch: refetchHospitals,
  } = useGetHospitalsQuery();
  const { data: users = [] } = useGetSystemAdminUsersQuery({
    page: 1,
    page_size: 500,
  });
  const [createHospital, { isLoading: isCreatingHospital }] =
    useCreateHospitalMutation();
  const [updateHospital, { isLoading: isUpdatingHospital }] =
    useUpdateHospitalMutation();
  const [deleteHospital, { isLoading: isDeletingHospital }] =
    useDeleteHospitalMutation();

  useEffect(() => {
    if (editingHospital) {
      setEditForm(buildEditValues(editingHospital));
    } else {
      setEditForm(null);
    }
  }, [editingHospital]);

  const updateHospitalField = (
    field: keyof CreateHospitalRequest,
    value: string,
  ) => {
    setHospitalForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateEditField = <K extends keyof UpdateHospitalRequest>(
    field: K,
    value: UpdateHospitalRequest[K],
  ) => {
    setEditForm((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current,
    );
  };

  const resetHospitalForm = () => {
    setHospitalForm(defaultHospitalFormValues);
  };

  const handleCreateDialogOpenChange = (open: boolean) => {
    setIsCreateDialogOpen(open);
    if (!open) {
      resetHospitalForm();
    }
  };

  const handleCreateHospital = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await createHospital({
        address: hospitalForm.address.trim(),
        contact_phone: hospitalForm.contact_phone.trim(),
        name: hospitalForm.name.trim(),
        region: hospitalForm.region.trim(),
        tier_level: hospitalForm.tier_level,
      }).unwrap();
      toast.success("Hospital created successfully.");
      handleCreateDialogOpenChange(false);
      setCurrentPage(1);
      await refetchHospitals();
    } catch (error) {
      console.error(error);
      toast.error("Could not create hospital. Please try again.");
    }
  };

  const handleEditHospital = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingHospital || !editForm) return;

    try {
      await updateHospital({
        id: editingHospital.id,
        body: {
          address: editForm.address.trim(),
          contact_phone: editForm.contact_phone.trim(),
          is_active: editForm.is_active,
          name: editForm.name.trim(),
          region: editForm.region.trim(),
          tier_level: editForm.tier_level,
        },
      }).unwrap();
      toast.success("Hospital updated successfully.");
      setEditingHospital(null);
      await refetchHospitals();
    } catch (error) {
      console.error(error);
      toast.error("Could not update hospital. Please try again.");
    }
  };

  const handleDeleteHospital = async () => {
    if (!hospitalToDelete) return;

    try {
      await deleteHospital(hospitalToDelete.id).unwrap();
      toast.success("Hospital deleted.");
      setHospitalToDelete(null);
      await refetchHospitals();
    } catch (error) {
      console.error(error);
      toast.error("Could not delete hospital. Please try again.");
    }
  };

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Hospital management
          </h1>
          <p className="text-sm text-muted-foreground">
            Create, update, and manage hospitals plus their linked departments.
          </p>
        </div>
        <Button
          type="button"
          className="gap-2 sm:mt-1"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Create hospital
        </Button>
      </div>

      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={handleCreateDialogOpenChange}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create hospital</DialogTitle>
            <DialogDescription>
              Add a hospital to the network so admins can assign users and
              departments to it.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreateHospital}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hospital_name">Hospital name</Label>
                <Input
                  id="hospital_name"
                  value={hospitalForm.name}
                  onChange={(event) =>
                    updateHospitalField("name", event.target.value)
                  }
                  placeholder="Tikur Anbessa Specialized Hospital"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hospital_region">Region</Label>
                <Input
                  id="hospital_region"
                  value={hospitalForm.region}
                  onChange={(event) =>
                    updateHospitalField("region", event.target.value)
                  }
                  placeholder="Addis Ababa"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hospital_phone">Contact phone</Label>
                <Input
                  id="hospital_phone"
                  value={hospitalForm.contact_phone}
                  onChange={(event) =>
                    updateHospitalField("contact_phone", event.target.value)
                  }
                  placeholder="+251 11 111 2233"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hospital_tier">Tier level</Label>
                <Select
                  value={hospitalForm.tier_level}
                  onValueChange={(value) =>
                    updateHospitalField("tier_level", value)
                  }
                >
                  <SelectTrigger id="hospital_tier" className="w-full">
                    <SelectValue placeholder="Select tier level" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIER_LEVEL_OPTIONS.map((tierLevel) => (
                      <SelectItem key={tierLevel} value={tierLevel}>
                        {tierLevel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hospital_address">Address</Label>
              <Input
                id="hospital_address"
                value={hospitalForm.address}
                onChange={(event) =>
                  updateHospitalField("address", event.target.value)
                }
                placeholder="Churchill Road, Addis Ababa, Ethiopia"
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleCreateDialogOpenChange(false)}
                disabled={isCreatingHospital}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreatingHospital}>
                {isCreatingHospital ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Create hospital
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editingHospital !== null}
        onOpenChange={(open) => {
          if (!open) setEditingHospital(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit hospital</DialogTitle>
            <DialogDescription>
              Update hospital information and activation status.
            </DialogDescription>
          </DialogHeader>
          {editForm ? (
            <form className="space-y-4" onSubmit={handleEditHospital}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit_hospital_name">Hospital name</Label>
                  <Input
                    id="edit_hospital_name"
                    value={editForm.name}
                    onChange={(event) =>
                      updateEditField("name", event.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_hospital_region">Region</Label>
                  <Input
                    id="edit_hospital_region"
                    value={editForm.region}
                    onChange={(event) =>
                      updateEditField("region", event.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit_hospital_phone">Contact phone</Label>
                  <Input
                    id="edit_hospital_phone"
                    value={editForm.contact_phone}
                    onChange={(event) =>
                      updateEditField("contact_phone", event.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_hospital_tier">Tier level</Label>
                  <Select
                    value={editForm.tier_level}
                    onValueChange={(value) =>
                      updateEditField("tier_level", value)
                    }
                  >
                    <SelectTrigger id="edit_hospital_tier" className="w-full">
                      <SelectValue placeholder="Select tier level" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIER_LEVEL_OPTIONS.map((tierLevel) => (
                        <SelectItem key={tierLevel} value={tierLevel}>
                          {tierLevel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_hospital_address">Address</Label>
                <Input
                  id="edit_hospital_address"
                  value={editForm.address}
                  onChange={(event) =>
                    updateEditField("address", event.target.value)
                  }
                  required
                />
              </div>

              <div className="flex items-center justify-between rounded-md border border-border/60 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Active</p>
                  <p className="text-xs text-muted-foreground">
                    Inactive hospitals will be hidden from selection menus.
                  </p>
                </div>
                <Switch
                  checked={editForm.is_active}
                  onCheckedChange={(checked) =>
                    updateEditField("is_active", checked)
                  }
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingHospital(null)}
                  disabled={isUpdatingHospital}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdatingHospital}>
                  {isUpdatingHospital ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Save changes
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={hospitalToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setHospitalToDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete hospital</DialogTitle>
            <DialogDescription>
              This will permanently remove{" "}
              <span className="font-medium text-foreground">
                {hospitalToDelete?.name}
              </span>{" "}
              and all of its associations. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setHospitalToDelete(null)}
              disabled={isDeletingHospital}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                void handleDeleteHospital();
              }}
              disabled={isDeletingHospital}
            >
              {isDeletingHospital ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete hospital
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                <TableHead className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hospitalsLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="px-6 py-10 text-center text-sm text-muted-foreground"
                  >
                    Loading hospitals...
                  </TableCell>
                </TableRow>
              ) : paginatedHospitals.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
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
                        <Link
                          href={`/systemAdmin/hospitals/${hospital.id}`}
                          className="font-medium text-foreground hover:underline"
                        >
                          {hospital.name}
                        </Link>
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
                    <TableCell className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/systemAdmin/hospitals/${hospital.id}`}
                              className="flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setEditingHospital(hospital)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setHospitalToDelete(hospital)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
