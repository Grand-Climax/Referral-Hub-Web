"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Loader2,
  MapPin,
  Phone,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  useDeleteHospitalMutation,
  useGetHospitalByIdQuery,
  useGetHospitalDepartmentsQuery,
  useLinkHospitalDepartmentMutation,
  useUnlinkHospitalDepartmentMutation,
  useUpdateHospitalMutation,
} from "@/features/hospitals/hospitalsApi";
import { useGetDepartmentsQuery } from "@/features/department/department";
import type { UpdateHospitalRequest } from "@/types/hospital";

const TIER_LEVEL_OPTIONS = ["PRIMARY", "GENERAL", "SPECIALIZED"] as const;

interface HospitalDetailProps {
  hospitalId: string;
}

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

export function HospitalDetail({ hospitalId }: HospitalDetailProps) {
  const router = useRouter();

  const {
    data: hospital,
    isLoading: hospitalLoading,
    isError: hospitalError,
    refetch: refetchHospital,
  } = useGetHospitalByIdQuery(hospitalId);

  const {
    data: linkedDepartments = [],
    isFetching: departmentsLoading,
    refetch: refetchLinkedDepartments,
  } = useGetHospitalDepartmentsQuery(hospitalId);

  const { data: allDepartments = [] } = useGetDepartmentsQuery();

  const [updateHospital, { isLoading: isUpdatingHospital }] =
    useUpdateHospitalMutation();
  const [deleteHospital, { isLoading: isDeletingHospital }] =
    useDeleteHospitalMutation();
  const [linkDepartment, { isLoading: isLinkingDepartment }] =
    useLinkHospitalDepartmentMutation();
  const [unlinkDepartment, { isLoading: isUnlinkingDepartment }] =
    useUnlinkHospitalDepartmentMutation();

  const [editForm, setEditForm] = useState<UpdateHospitalRequest | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [linkDepartmentId, setLinkDepartmentId] = useState("");
  const [linkDailyLimit, setLinkDailyLimit] = useState<number>(10);
  const [departmentToUnlink, setDepartmentToUnlink] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (hospital) {
      setEditForm({
        address: hospital.address ?? "",
        contact_phone: hospital.contact_phone ?? "",
        is_active: hospital.is_active,
        name: hospital.name ?? "",
        region: hospital.region ?? "",
        tier_level: hospital.tier_level ?? "SPECIALIZED",
      });
    }
  }, [hospital]);

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

  const departmentNameById = useMemo(() => {
    return allDepartments.reduce<Record<string, string>>(
      (accumulator, department) => {
        accumulator[department.id] = department.name;
        return accumulator;
      },
      {},
    );
  }, [allDepartments]);

  const linkedDepartmentIdSet = useMemo(
    () => new Set(linkedDepartments.map((d) => d.department_id)),
    [linkedDepartments],
  );

  const availableDepartments = useMemo(
    () =>
      allDepartments.filter(
        (department) => !linkedDepartmentIdSet.has(department.id),
      ),
    [allDepartments, linkedDepartmentIdSet],
  );

  const handleSaveHospital = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editForm) return;

    try {
      await updateHospital({
        id: hospitalId,
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
      await refetchHospital();
    } catch (error) {
      console.error(error);
      toast.error("Could not update hospital. Please try again.");
    }
  };

  const handleDeleteHospital = async () => {
    try {
      await deleteHospital(hospitalId).unwrap();
      toast.success("Hospital deleted.");
      setIsDeleteOpen(false);
      router.push("/systemAdmin/hospitals");
    } catch (error) {
      console.error(error);
      toast.error("Could not delete hospital. Please try again.");
    }
  };

  const resetLinkForm = () => {
    setLinkDepartmentId("");
    setLinkDailyLimit(10);
  };

  const handleLinkDepartment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!linkDepartmentId) {
      toast.error("Please choose a department to link.");
      return;
    }

    try {
      await linkDepartment({
        id: hospitalId,
        body: {
          department_id: linkDepartmentId,
          daily_limit: Number.isFinite(linkDailyLimit) ? linkDailyLimit : 0,
        },
      }).unwrap();
      toast.success("Department linked to hospital.");
      setIsLinkOpen(false);
      resetLinkForm();
      await refetchLinkedDepartments();
    } catch (error) {
      console.error(error);
      toast.error("Could not link department. Please try again.");
    }
  };

  const handleUnlinkDepartment = async (deptId: string) => {
    try {
      await unlinkDepartment({ id: hospitalId, deptId }).unwrap();
      toast.success("Department unlinked from hospital.");
      setDepartmentToUnlink(null);
      await refetchLinkedDepartments();
    } catch (error) {
      console.error(error);
      toast.error("Could not unlink department. Please try again.");
    }
  };

  if (hospitalLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading hospital...
      </div>
    );
  }

  if (hospitalError || !hospital) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-start gap-4">
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link href="/systemAdmin/hospitals">
            <ArrowLeft className="h-4 w-4" />
            Back to hospitals
          </Link>
        </Button>
        <Card className="w-full">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Hospital could not be loaded.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link href="/systemAdmin/hospitals">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {hospital.name}
            </h1>
            <p className="text-xs text-muted-foreground">ID: {hospital.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="gap-2"
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Card className="border-border/60 bg-background/80 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4" />
            Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Address
              </p>
              <p className="text-foreground">{hospital.address || "-"}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Contact phone
              </p>
              <p className="text-foreground">{hospital.contact_phone || "-"}</p>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Region
            </p>
            <p className="text-foreground">{hospital.region || "-"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Tier level
            </p>
            <p className="text-foreground">{hospital.tier_level || "-"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Created at
            </p>
            <p className="text-foreground">
              {formatDateTime(hospital.created_at)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Updated at
            </p>
            <p className="text-foreground">
              {formatDateTime(hospital.updated_at)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-background/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Edit hospital</CardTitle>
        </CardHeader>
        <CardContent>
          {editForm ? (
            <form className="space-y-4" onSubmit={handleSaveHospital}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="detail_name">Hospital name</Label>
                  <Input
                    id="detail_name"
                    value={editForm.name}
                    onChange={(event) =>
                      updateEditField("name", event.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="detail_region">Region</Label>
                  <Input
                    id="detail_region"
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
                  <Label htmlFor="detail_phone">Contact phone</Label>
                  <Input
                    id="detail_phone"
                    value={editForm.contact_phone}
                    onChange={(event) =>
                      updateEditField("contact_phone", event.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="detail_tier">Tier level</Label>
                  <Select
                    value={editForm.tier_level}
                    onValueChange={(value) =>
                      updateEditField("tier_level", value)
                    }
                  >
                    <SelectTrigger id="detail_tier" className="w-full">
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
                <Label htmlFor="detail_address">Address</Label>
                <Input
                  id="detail_address"
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

              <div className="flex justify-end">
                <Button type="submit" disabled={isUpdatingHospital}>
                  {isUpdatingHospital ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Save changes
                </Button>
              </div>
            </form>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-background/80 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Linked departments</CardTitle>
            <p className="text-xs text-muted-foreground">
              Manage which departments operate at this hospital.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            className="gap-2"
            onClick={() => setIsLinkOpen(true)}
            disabled={availableDepartments.length === 0}
          >
            <Plus className="h-4 w-4" />
            Link department
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 bg-muted/40 hover:bg-muted/40">
                <TableHead className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Department
                </TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Daily limit
                </TableHead>
                <TableHead className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departmentsLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="px-6 py-10 text-center text-sm text-muted-foreground"
                  >
                    Loading departments...
                  </TableCell>
                </TableRow>
              ) : linkedDepartments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="px-6 py-10 text-center text-sm text-muted-foreground"
                  >
                    No departments linked to this hospital yet.
                  </TableCell>
                </TableRow>
              ) : (
                linkedDepartments.map((department) => (
                  <TableRow key={department.department_id}>
                    <TableCell className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">
                          {departmentNameById[department.department_id] ??
                            "Department"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ID: {department.department_id}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                      {department.daily_limit}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() =>
                          setDepartmentToUnlink(department.department_id)
                        }
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Unlink
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isLinkOpen} onOpenChange={setIsLinkOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Link department</DialogTitle>
            <DialogDescription>
              Connect an existing department to this hospital with a daily
              referral capacity.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleLinkDepartment}>
            <div className="space-y-2">
              <Label htmlFor="link_department">Department</Label>
              <Select
                value={linkDepartmentId}
                onValueChange={(value) => setLinkDepartmentId(value)}
              >
                <SelectTrigger id="link_department" className="w-full">
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {availableDepartments.length === 0 ? (
                    <SelectItem value="__none__" disabled>
                      No departments available
                    </SelectItem>
                  ) : (
                    availableDepartments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="link_daily_limit">Daily limit</Label>
              <Input
                id="link_daily_limit"
                type="number"
                min={0}
                value={linkDailyLimit}
                onChange={(event) =>
                  setLinkDailyLimit(Number(event.target.value))
                }
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsLinkOpen(false);
                  resetLinkForm();
                }}
                disabled={isLinkingDepartment}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLinkingDepartment}>
                {isLinkingDepartment ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Link department
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={departmentToUnlink !== null}
        onOpenChange={(open) => {
          if (!open) setDepartmentToUnlink(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Unlink department</DialogTitle>
            <DialogDescription>
              The department will no longer be associated with this hospital.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDepartmentToUnlink(null)}
              disabled={isUnlinkingDepartment}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (departmentToUnlink) {
                  void handleUnlinkDepartment(departmentToUnlink);
                }
              }}
              disabled={isUnlinkingDepartment}
            >
              {isUnlinkingDepartment ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Unlink
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete hospital</DialogTitle>
            <DialogDescription>
              This will permanently remove{" "}
              <span className="font-medium text-foreground">
                {hospital.name}
              </span>
              . This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
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
    </div>
  );
}
