"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Layers,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCreateDepartmentMutation,
  useDeleteDepartmentMutation,
  useGetDepartmentsQuery,
  useUpdateDepartmentMutation,
} from "@/features/department/department";
import type {
  CreateDepartmentRequest,
  Department,
  UpdateDepartmentRequest,
} from "@/types/hospital";

const PAGE_SIZE = 10;

const defaultDepartmentFormValues: CreateDepartmentRequest = {
  name: "",
  description: "",
};

const buildEditValues = (department: Department): UpdateDepartmentRequest => ({
  name: department.name ?? "",
  description: department.description ?? "",
});

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

export function DepartmentManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [departmentForm, setDepartmentForm] = useState<CreateDepartmentRequest>(
    defaultDepartmentFormValues,
  );

  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null,
  );
  const [editForm, setEditForm] = useState<UpdateDepartmentRequest | null>(null);

  const [departmentToDelete, setDepartmentToDelete] =
    useState<Department | null>(null);

  const {
    data: departments = [],
    isFetching: departmentsLoading,
    refetch: refetchDepartments,
  } = useGetDepartmentsQuery();
  const [createDepartment, { isLoading: isCreatingDepartment }] =
    useCreateDepartmentMutation();
  const [updateDepartment, { isLoading: isUpdatingDepartment }] =
    useUpdateDepartmentMutation();
  const [deleteDepartment, { isLoading: isDeletingDepartment }] =
    useDeleteDepartmentMutation();

  useEffect(() => {
    if (editingDepartment) {
      setEditForm(buildEditValues(editingDepartment));
    } else {
      setEditForm(null);
    }
  }, [editingDepartment]);

  const updateDepartmentField = (
    field: keyof CreateDepartmentRequest,
    value: string,
  ) => {
    setDepartmentForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateEditField = (
    field: keyof UpdateDepartmentRequest,
    value: string,
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

  const resetDepartmentForm = () => {
    setDepartmentForm(defaultDepartmentFormValues);
  };

  const handleCreateDialogOpenChange = (open: boolean) => {
    setIsCreateDialogOpen(open);
    if (!open) {
      resetDepartmentForm();
    }
  };

  const handleCreateDepartment = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    try {
      await createDepartment({
        name: departmentForm.name.trim(),
        description: departmentForm.description?.trim() || undefined,
      }).unwrap();
      toast.success("Department created successfully.");
      handleCreateDialogOpenChange(false);
      setCurrentPage(1);
      await refetchDepartments();
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Could not create department. Please try again."));
    }
  };

  const handleEditDepartment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingDepartment || !editForm) return;

    try {
      await updateDepartment({
        id: editingDepartment.id,
        body: {
          name: editForm.name.trim(),
          description: editForm.description?.trim() || undefined,
        },
      }).unwrap();
      toast.success("Department updated successfully.");
      setEditingDepartment(null);
      await refetchDepartments();
    } catch (error) {
      console.error(error);
      toast.error("Could not update department. Please try again.");
    }
  };

  const handleDeleteDepartment = async () => {
    if (!departmentToDelete) return;

    try {
      await deleteDepartment(departmentToDelete.id).unwrap();
      toast.success("Department deleted.");
      setDepartmentToDelete(null);
      await refetchDepartments();
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Could not delete department. Please try again."));
    }
  };

  const filteredDepartments = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return departments.filter((department) => {
      if (keyword.length === 0) return true;
      return `${department.name ?? ""} ${department.description ?? ""} ${department.id}`
        .toLowerCase()
        .includes(keyword);
    });
  }, [departments, searchTerm]);

  const totalDepartments = filteredDepartments.length;
  const totalPages = Math.max(1, Math.ceil(totalDepartments / PAGE_SIZE));

  const paginatedDepartments = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredDepartments.slice(start, start + PAGE_SIZE);
  }, [filteredDepartments, currentPage]);

  const rangeStart =
    totalDepartments === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, totalDepartments);

  return (
    <div className="mx-auto flex w-full max-w-400 flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Department management
          </h1>
          <p className="text-sm text-muted-foreground">
            Create, update, and remove departments available across the
            network.
          </p>
        </div>
        <Button
          type="button"
          className="gap-2 sm:mt-1"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Create department
        </Button>
      </div>

      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={handleCreateDialogOpenChange}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create department</DialogTitle>
            <DialogDescription>
              Add a department so it can be linked to hospitals and assigned to
              users.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreateDepartment}>
            <div className="space-y-2">
              <Label htmlFor="department_name">Department name</Label>
              <Input
                id="department_name"
                value={departmentForm.name}
                onChange={(event) =>
                  updateDepartmentField("name", event.target.value)
                }
                placeholder="Cardiology"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department_description">Description</Label>
              <Textarea
                id="department_description"
                value={departmentForm.description ?? ""}
                onChange={(event) =>
                  updateDepartmentField("description", event.target.value)
                }
                placeholder="Describe what this department handles (optional)."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleCreateDialogOpenChange(false)}
                disabled={isCreatingDepartment}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreatingDepartment}>
                {isCreatingDepartment ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Create department
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editingDepartment !== null}
        onOpenChange={(open) => {
          if (!open) setEditingDepartment(null);
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit department</DialogTitle>
            <DialogDescription>
              Rename a department or update its description.
            </DialogDescription>
          </DialogHeader>
          {editForm ? (
            <form className="space-y-4" onSubmit={handleEditDepartment}>
              <div className="space-y-2">
                <Label htmlFor="edit_department_name">Department name</Label>
                <Input
                  id="edit_department_name"
                  value={editForm.name}
                  onChange={(event) =>
                    updateEditField("name", event.target.value)
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_department_description">
                  Description
                </Label>
                <Textarea
                  id="edit_department_description"
                  value={editForm.description ?? ""}
                  onChange={(event) =>
                    updateEditField("description", event.target.value)
                  }
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingDepartment(null)}
                  disabled={isUpdatingDepartment}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdatingDepartment}>
                  {isUpdatingDepartment ? (
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
        open={departmentToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setDepartmentToDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete department</DialogTitle>
            <DialogDescription>
              This will permanently remove{" "}
              <span className="font-medium text-foreground">
                {departmentToDelete?.name}
              </span>{" "}
              and unlink it from all hospitals. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDepartmentToDelete(null)}
              disabled={isDeletingDepartment}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                void handleDeleteDepartment();
              }}
              disabled={isDeletingDepartment}
            >
              {isDeletingDepartment ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete department
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Departments
            </CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{departments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Filtered
            </CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{totalDepartments}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              With description
            </CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {departments.filter((d) => Boolean(d.description?.trim())).length}
            </p>
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
              placeholder="Search by department name, description, or ID"
              className="h-11 border-border/60 pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-background/80 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 bg-muted/40 hover:bg-muted/40">
                <TableHead className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Department
                </TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Description
                </TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Updated
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
                    colSpan={4}
                    className="px-6 py-10 text-center text-sm text-muted-foreground"
                  >
                    Loading departments...
                  </TableCell>
                </TableRow>
              ) : paginatedDepartments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="px-6 py-10 text-center text-sm text-muted-foreground"
                  >
                    No departments found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDepartments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">
                          {department.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ID: {department.id}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                      <p className="line-clamp-2 max-w-md">
                        {department.description?.trim() || "-"}
                      </p>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                      {formatDateTime(department.updated_at)}
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
                          <DropdownMenuItem
                            onClick={() => setEditingDepartment(department)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDepartmentToDelete(department)}
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

          {totalDepartments > 0 ? (
            <div className="flex flex-col gap-3 border-t border-border/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {rangeStart}-{rangeEnd} of {totalDepartments}{" "}
                departments
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
