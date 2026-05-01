"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useGetDepartmentsQuery,
  useGetHospitalsQuery,
} from "@/features/hospitals/hospitalsApi";
import type {
  AssignSystemAdminRoleRequest,
  CreateSystemAdminUserRequest,
  SystemAdminUser,
  UpdateSystemAdminUserRequest,
} from "@/types/system-admin";
import {
  SYSTEM_ADMIN_ROLE_LABELS,
  SYSTEM_ADMIN_ROLE_OPTIONS,
  normalizeSystemAdminRole,
} from "@/types/system-admin";

export interface SystemAdminUserFormValues {
  email: string;
  first_name: string;
  last_name: string;
  national_id: string;
  hospital_id: string;
  department_id: string;
  role: string;
  password: string;
  is_active: boolean;
}

const defaultValues: SystemAdminUserFormValues = {
  email: "",
  first_name: "",
  last_name: "",
  national_id: "",
  hospital_id: "",
  department_id: "",
  role: "hospital_admin",
  password: "",
  is_active: true,
};

interface SystemAdminUserFormProps {
  selectedUser: SystemAdminUser | null;
  onSubmitCreate: (payload: CreateSystemAdminUserRequest) => Promise<void>;
  onSubmitUpdate: (
    id: string,
    payload: UpdateSystemAdminUserRequest,
  ) => Promise<void>;
  onAssignRole: (
    id: string,
    payload: AssignSystemAdminRoleRequest,
  ) => Promise<void>;
  onModerateImage: (id: string) => Promise<void>;
  submitting: boolean;
}

export function SystemAdminUserForm({
  selectedUser,
  onSubmitCreate,
  onSubmitUpdate,
  onAssignRole,
  onModerateImage,
  submitting,
}: SystemAdminUserFormProps) {
  const [formValues, setFormValues] =
    useState<SystemAdminUserFormValues>(defaultValues);
  const { data: hospitals = [], isLoading: isHospitalsLoading } =
    useGetHospitalsQuery();
  const { data: departments = [], isLoading: isDepartmentsLoading } =
    useGetDepartmentsQuery(formValues.hospital_id, {
      skip: !formValues.hospital_id,
    });

  useEffect(() => {
    if (selectedUser) {
      setFormValues({
        email: selectedUser.email,
        first_name: selectedUser.first_name,
        last_name: selectedUser.last_name,
        national_id: selectedUser.national_id ?? "",
        hospital_id: selectedUser.hospital_id,
        department_id: selectedUser.department_id ?? "",
        role: normalizeSystemAdminRole(selectedUser.role),
        password: "",
        is_active: selectedUser.is_active !== false,
      });
      return;
    }

    setFormValues(defaultValues);
  }, [selectedUser]);

  const updateField = (
    field: keyof SystemAdminUserFormValues,
    value: string | boolean,
  ) => {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      email: formValues.email,
      first_name: formValues.first_name,
      last_name: formValues.last_name,
      national_id: formValues.national_id || undefined,
      hospital_id: formValues.hospital_id,
      department_id: formValues.department_id || undefined,
      role: formValues.role,
      password: formValues.password || undefined,
      is_active: formValues.is_active,
    };

    if (selectedUser) {
      await onSubmitUpdate(selectedUser.id, payload);
      return;
    }

    await onSubmitCreate(payload);
  };

  const handleAssignRole = async () => {
    if (!selectedUser) {
      return;
    }

    await onAssignRole(selectedUser.id, { role: formValues.role });
  };

  const handleModerateImage = async () => {
    if (!selectedUser) {
      return;
    }

    await onModerateImage(selectedUser.id);
  };

  return (
    <Card className="border-border/60 bg-background/80 shadow-sm">
      <CardHeader className="space-y-2 border-b border-border/60 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl text-foreground">
              {selectedUser ? "Update user" : "Create user"}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedUser
                ? "Edit account details, reassign roles, and moderate the selected profile."
                : "Add a new user account and grant the right access level from day one."}
            </p>
          </div>
          <div className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            {selectedUser ? `Editing ${selectedUser.id}` : "New account"}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first_name">First name</Label>
              <Input
                id="first_name"
                value={formValues.first_name}
                onChange={(event) =>
                  updateField("first_name", event.target.value)
                }
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last name</Label>
              <Input
                id="last_name"
                value={formValues.last_name}
                onChange={(event) =>
                  updateField("last_name", event.target.value)
                }
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formValues.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="user@hospital.org"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="national_id">National ID</Label>
              <Input
                id="national_id"
                value={formValues.national_id}
                onChange={(event) =>
                  updateField("national_id", event.target.value)
                }
                placeholder="Enter national ID"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hospital_id">Hospital</Label>
              <Select
                value={formValues.hospital_id}
                onValueChange={(value) =>
                  setFormValues((current) => ({
                    ...current,
                    hospital_id: value,
                    department_id: "",
                  }))
                }
                disabled={isHospitalsLoading}
              >
                <SelectTrigger id="hospital_id" className="w-full">
                  <SelectValue
                    placeholder={
                      isHospitalsLoading
                        ? "Loading hospitals..."
                        : "Select hospital"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {hospitals.map((hospital) => (
                    <SelectItem key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department_id">Department</Label>
              <Select
                value={formValues.department_id}
                onValueChange={(value) => updateField("department_id", value)}
                disabled={!formValues.hospital_id || isDepartmentsLoading}
              >
                <SelectTrigger id="department_id" className="w-full">
                  <SelectValue
                    placeholder={
                      !formValues.hospital_id
                        ? "Select hospital first"
                        : isDepartmentsLoading
                          ? "Loading departments..."
                          : "Select department"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formValues.role}
                onValueChange={(value) => updateField("role", value)}
              >
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {SYSTEM_ADMIN_ROLE_OPTIONS.map((role) => (
                    <SelectItem key={role} value={role}>
                      {SYSTEM_ADMIN_ROLE_LABELS[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                Password {selectedUser ? "(optional)" : ""}
              </Label>
              <Input
                id="password"
                type="password"
                value={formValues.password}
                onChange={(event) =>
                  updateField("password", event.target.value)
                }
                placeholder={
                  selectedUser
                    ? "Leave blank to keep current password"
                    : "Temporary password"
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Account notes</Label>
            <Textarea
              id="notes"
              value={`Status: ${formValues.is_active ? "Active" : "Inactive"}`}
              readOnly
              className="min-h-20 resize-none bg-muted/40"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="is_active">Account status</Label>
            <Select
              value={formValues.is_active ? "active" : "inactive"}
              onValueChange={(value) =>
                updateField("is_active", value === "active")
              }
            >
              <SelectTrigger id="is_active" className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button type="submit" className="gap-2" disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : selectedUser ? (
                <Save className="h-4 w-4" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {selectedUser ? "Save changes" : "Create user"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleAssignRole}
              disabled={!selectedUser || submitting}
            >
              Assign role now
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleModerateImage}
              disabled={!selectedUser || submitting}
            >
              Moderate profile image
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
