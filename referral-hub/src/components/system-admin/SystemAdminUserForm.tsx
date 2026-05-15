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
import {
  useGetDepartmentsQuery,
  useGetHospitalsQuery,
} from "@/features/hospitals/hospitalsApi";
import type {
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
  middle_name: string;
  middle_name: string;
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
  middle_name: "",
  middle_name: "",
  last_name: "",
  national_id: "",
  hospital_id: "",
  department_id: "",
  role: "HOSPITAL_ADMIN",
  role: "HOSPITAL_ADMIN",
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
  submitting: boolean;
}

export function SystemAdminUserForm({
  selectedUser,
  onSubmitCreate,
  onSubmitUpdate,
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
        middle_name: selectedUser.middle_name ?? "",
        middle_name: selectedUser.middle_name ?? "",
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

    const profilePayload: UpdateSystemAdminUserRequest = {
      department_id: formValues.department_id,
      email: formValues.email.trim(),
      first_name: formValues.first_name.trim(),
      middle_name: formValues.middle_name.trim(),
      hospital_id: formValues.hospital_id,
      last_name: formValues.last_name.trim(),
      national_id: formValues.national_id.trim(),
      role: formValues.role,
      is_active: formValues.is_active,
    };

    if (selectedUser) {
      await onSubmitUpdate(selectedUser.id, profilePayload);
      return;
    }

    await onSubmitCreate({
      department_id: profilePayload.department_id,
      email: profilePayload.email,
      first_name: profilePayload.first_name,
      hospital_id: profilePayload.hospital_id,
      last_name: profilePayload.last_name,
      middle_name: profilePayload.middle_name,
      national_id: profilePayload.national_id,
      password: formValues.password,
      role: profilePayload.role,
    });
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
                ? "Edit account profile and access details."
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
                required
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="middle_name">Middle name</Label>
              <Input
                id="middle_name"
                value={formValues.middle_name}
                onChange={(event) =>
                  updateField("middle_name", event.target.value)
                }
                placeholder="Kebede"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="middle_name">Middle name</Label>
              <Input
                id="middle_name"
                value={formValues.middle_name}
                onChange={(event) =>
                  updateField("middle_name", event.target.value)
                }
                placeholder="Kebede"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="last_name">Last name</Label>
              <Input
                id="last_name"
                value={formValues.last_name}
                onChange={(event) =>
                  updateField("last_name", event.target.value)
                }
                placeholder="Doe"
                required
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formValues.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="user@hospital.org"
                required
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="national_id">National ID</Label>
              <Input
                id="national_id"
                value={formValues.national_id}
                onChange={(event) =>
                  updateField("national_id", event.target.value)
                }
                placeholder="Enter national ID"
                required
              />
            </div>
            {!selectedUser && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formValues.password}
                  onChange={(event) =>
                    updateField("password", event.target.value)
                  }
                  placeholder="password123"
                  required
                />
              </div>
            )}
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
          </div>

          {selectedUser && (
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
          )}

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
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
