"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  Building2,
  Loader2,
  Plus,
  Search,
  UserCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/apiError";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAddHospitalDepartmentMutation,
  useAssignDepartmentHeadMutation,
  useGetHospitalDepartmentsQuery,
  useGetStaffQuery,
  useUpdateDepartmentActivationMutation,
} from "@/features/hospitalAdmin/hospitalAdminApi";
import { useGetDepartmentsQuery } from "@/features/department/department";
import type { HospitalAdminDepartment } from "@/types/hospital-admin";

function deptLinkId(dept: HospitalAdminDepartment) {
  return dept.id;
}

export function DepartmentManagement() {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [selectedGlobalDeptId, setSelectedGlobalDeptId] = useState("");
  const [headDialogDept, setHeadDialogDept] =
    useState<HospitalAdminDepartment | null>(null);
  const [selectedHeadId, setSelectedHeadId] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { data: departments = [], isLoading, refetch } =
    useGetHospitalDepartmentsQuery();
  const { data: globalDepartments = [], isLoading: isLoadingGlobalDepartments } =
    useGetDepartmentsQuery({ page: 1, page_size: 100 });
  const { data: staffData } = useGetStaffQuery({ page: 1, page_size: 200 });
  const [addDepartment, { isLoading: isAdding }] = useAddHospitalDepartmentMutation();
  const [updateActivation] = useUpdateDepartmentActivationMutation();
  const [assignHead, { isLoading: isAssigningHead }] =
    useAssignDepartmentHeadMutation();

  const linkedIds = useMemo(
    () =>
      new Set(
        departments
          .map((d) => d.department_id)
          .filter(Boolean),
      ),
    [departments],
  );

  const availableGlobalDepartments = useMemo(
    () => globalDepartments.filter((d) => !linkedIds.has(d.id)),
    [globalDepartments, linkedIds],
  );

  const deptHeadCandidates = useMemo(() => {
    const staff = staffData?.data ?? [];
    return staff.filter(
      (s) =>
        s.is_active &&
        (s.role === "DEPT_HEAD" || s.role === "DEPARTMENT_HEAD"),
    );
  }, [staffData?.data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return departments;
    return departments.filter((d) => {
      const name = d.department?.name ?? "";
      const description = d.department?.description ?? "";
      const headName = d.department_head?.full_name ?? "";
      return `${name} ${description} ${headName}`
        .toLowerCase()
        .includes(q);
    });
  }, [departments, search]);

  const activeCount = departments.filter((d) => d.is_active !== false).length;
  const withHeadCount = departments.filter(
    (d) => d.department_head?.id != null,
  ).length;

  const resetAddForm = () => {
    setSelectedGlobalDeptId("");
  };

  const handleAdd = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedGlobalDeptId) {
      toast.error("Select a department to link.");
      return;
    }
    try {
      await addDepartment({ department_id: selectedGlobalDeptId }).unwrap();
      toast.success("Department added to your hospital.");
      setAddOpen(false);
      resetAddForm();
      refetch();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not add department."));
    }
  };

  const handleToggleActive = async (
    dept: HospitalAdminDepartment,
    checked: boolean,
  ) => {
    // Activation endpoint is keyed by the global department (catalog) id,
    // not the hospital-department link id.
    const deptId = dept.department_id;
    if (!deptId) return;
    setTogglingId(deptId);
    try {
      await updateActivation({ deptId, is_active: checked }).unwrap();
      toast.success(checked ? "Department activated" : "Department deactivated");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update department status."));
    } finally {
      setTogglingId(null);
    }
  };

  const handleAssignHead = async (event: FormEvent) => {
    event.preventDefault();
    if (!headDialogDept || !selectedHeadId) return;
    const linkId = deptLinkId(headDialogDept);
    if (!linkId) return;
    try {
      await assignHead({ deptId: linkId, head_user_id: selectedHeadId }).unwrap();
      toast.success("Department head assigned.");
      setHeadDialogDept(null);
      setSelectedHeadId("");
      refetch();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not assign department head."));
    }
  };

  return (
    <div className="mx-auto flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Department management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage departments linked to your hospital, assign heads, and control activation.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Link department
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total departments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{departments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              With assigned head
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{withHeadCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search departments..."
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department</TableHead>
              <TableHead>Daily limit</TableHead>
              <TableHead>Head</TableHead>
              <TableHead>Status</TableHead>
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
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                  No departments found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((dept, idx) => {
                const linkId = deptLinkId(dept);
                // Guarantee a unique, stable React key even if the API
                // ever omits or duplicates `id` — otherwise React reuses
                // DOM nodes/state across rows and clicks/toggles end up
                // routed to the wrong row.
                const key = linkId || dept.department_id || `dept-${idx}`;
                const displayName =
                  dept.department?.name ?? "Unknown department";
                const displayDescription = dept.department?.description;
                const headId = dept.department_head?.id ?? null;
                const headName = dept.department_head?.full_name ?? null;
                const hasHead = headId != null;
                const isActive = dept.is_active !== false;

                return (
                  <TableRow key={key}>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <Building2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{displayName}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {displayDescription?.trim() || "No description"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium tabular-nums">
                        {dept.standard_daily_limit ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {hasHead ? (
                        <div>
                          <p className="text-sm font-medium">
                            {headName ?? "—"}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Unassigned
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={isActive}
                          disabled={togglingId === dept.department_id}
                          onCheckedChange={(checked) =>
                            void handleToggleActive(dept, checked)
                          }
                        />
                        <span className="text-xs text-muted-foreground">
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setHeadDialogDept(dept);
                          setSelectedHeadId(headId ?? "");
                        }}
                      >
                        <UserCircle2 className="h-4 w-4" />
                        {hasHead ? "Change head" : "Assign head"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open);
          if (!open) resetAddForm();
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Link department</DialogTitle>
            <DialogDescription>
              Link an existing network department to your hospital.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={selectedGlobalDeptId}
                onValueChange={setSelectedGlobalDeptId}
                disabled={isLoadingGlobalDepartments}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isLoadingGlobalDepartments
                        ? "Loading departments..."
                        : "Select department"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableGlobalDepartments.length === 0 ? (
                    <SelectItem value="__none" disabled>
                      No available departments
                    </SelectItem>
                  ) : (
                    availableGlobalDepartments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isAdding || !selectedGlobalDeptId}
              >
                {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Link department
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={headDialogDept !== null}
        onOpenChange={(open) => {
          if (!open) {
            setHeadDialogDept(null);
            setSelectedHeadId("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign department head</DialogTitle>
            <DialogDescription>
              Choose a staff member to lead{" "}
              <span className="font-medium">{headDialogDept?.department?.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignHead} className="space-y-4">
            <div className="space-y-2">
              <Label>Department head</Label>
              <Select value={selectedHeadId} onValueChange={setSelectedHeadId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {deptHeadCandidates.length === 0 ? (
                    <SelectItem value="__none" disabled>
                      No eligible dept heads found
                    </SelectItem>
                  ) : (
                    deptHeadCandidates.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {[s.first_name, s.last_name].filter(Boolean).join(" ")} ({s.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setHeadDialogDept(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!selectedHeadId || isAssigningHead}>
                Assign
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
