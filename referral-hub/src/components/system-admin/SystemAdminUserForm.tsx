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
import { useGetRegionsQuery } from "@/features/reference/regionsApi";
import type {
  CreateSystemAdminUserRequest,
  SystemAdminUser,
  UpdateSystemAdminUserRequest,
} from "@/types/system-admin";
import {
  SYSTEM_ADMIN_ROLE_LABELS,
  SYSTEM_ADMIN_ROLE_OPTIONS,
  normalizeSystemAdminRole,
  systemAdminRoleRequiresDepartment,
} from "@/types/system-admin";

export interface SystemAdminUserFormValues {
  email: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  national_id: string;
  hospital_id: string;
  department_id: string;
  region: string;
  role: string;
  password: string;
  is_active: boolean;
}

const defaultValues: SystemAdminUserFormValues = {
  email: "",
  first_name: "",
  middle_name: "",
  last_name: "",
  national_id: "",
  hospital_id: "",
  department_id: "",
  region: "",
  role: "HOSPITAL_ADMIN",
  password: "",
  is_active: true,
};

function buildFormValues(
  selectedUser: SystemAdminUser | null,
  defaultHospitalId?: string,
): SystemAdminUserFormValues {
  if (selectedUser) {
    return {
      email: selectedUser.email ?? "",
      first_name: selectedUser.first_name ?? "",
      middle_name: selectedUser.middle_name ?? "",
      last_name: selectedUser.last_name ?? "",
      national_id: selectedUser.national_id ?? "",
      hospital_id: selectedUser.hospital_id ?? "",
      department_id: selectedUser.department_id ?? "",
      region: selectedUser.region ?? "",
      role: normalizeSystemAdminRole(selectedUser.role) || defaultValues.role,
      password: "",
      is_active: selectedUser.is_active !== false,
    };
  }
  return {
    ...defaultValues,
    hospital_id: defaultHospitalId ?? defaultValues.hospital_id,
  };
}

interface SystemAdminUserFormProps {
  selectedUser: SystemAdminUser | null;
  onSubmitCreate: (payload: CreateSystemAdminUserRequest) => Promise<void>;
  onSubmitUpdate: (
    id: string,
    payload: UpdateSystemAdminUserRequest,
  ) => Promise<void>;
  submitting: boolean;
  defaultHospitalId?: string;
}

export function SystemAdminUserForm({
  selectedUser,
  onSubmitCreate,
  onSubmitUpdate,
  submitting,
  defaultHospitalId,
}: SystemAdminUserFormProps) {
  const [formValues, setFormValues] = useState<SystemAdminUserFormValues>(() =>
    buildFormValues(selectedUser, defaultHospitalId),
  );
  const { data: hospitals = [], isLoading: isHospitalsLoading } =
    useGetHospitalsQuery();
  const { data: departments = [], isLoading: isDepartmentsLoading } =
    useGetDepartmentsQuery(formValues.hospital_id, {
      skip: !formValues.hospital_id,
    });
  const { data: regions = [], isLoading: isRegionsLoading } =
    useGetRegionsQuery();

  useEffect(() => {
    setFormValues(buildFormValues(selectedUser, defaultHospitalId));
  }, [selectedUser, defaultHospitalId]);

  const updateField = (
    field: keyof SystemAdminUserFormValues,
    value: string | boolean,
  ) => {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleRoleChange = (value: string) => {
    setFormValues((current) => ({
      ...current,
      role: value,
      department_id: systemAdminRoleRequiresDepartment(value)
        ? current.department_id
        : "",
    }));
  };

  const roleNeedsDepartment = systemAdminRoleRequiresDepartment(
    formValues.role,
  );

  const selectedHospitalInOptions = hospitals.some(
    (hospital) => hospital.id === formValues.hospital_id,
  );
  const fallbackHospitalLabel =
    selectedUser?.hospital?.name ??
    selectedUser?.hospital_id ??
    formValues.hospital_id;

  const selectedDepartmentInOptions = departments.some(
    (department) => department.id === formValues.department_id,
  );
  const fallbackDepartmentLabel =
    selectedUser?.department?.name ??
    selectedUser?.department_id ??
    formValues.department_id;

  const selectedRegionInOptions = regions.some(
    (region) => region === formValues.region,
  );

  const isKnownRole = SYSTEM_ADMIN_ROLE_OPTIONS.some(
    (role) => role === formValues.role,
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const includeDepartment = systemAdminRoleRequiresDepartment(
      formValues.role,
    );

    const trimmedRegion = formValues.region.trim();

    const profilePayload: UpdateSystemAdminUserRequest = {
      email: formValues.email.trim(),
      first_name: formValues.first_name.trim(),
      middle_name: formValues.middle_name.trim(),
      hospital_id: formValues.hospital_id,
      last_name: formValues.last_name.trim(),
      national_id: formValues.national_id.trim(),
      role: formValues.role,
      is_active: formValues.is_active,
      ...(includeDepartment
        ? { department_id: formValues.department_id }
        : {}),
      ...(trimmedRegion ? { region: trimmedRegion } : {}),
    };

    if (selectedUser) {
      await onSubmitUpdate(selectedUser.id, profilePayload);
      return;
    }

    await onSubmitCreate({
      email: profilePayload.email,
      first_name: profilePayload.first_name,
      hospital_id: profilePayload.hospital_id,
      last_name: profilePayload.last_name,
      middle_name: profilePayload.middle_name,
      national_id: profilePayload.national_id,
      password: formValues.password,
      role: profilePayload.role,
      ...(includeDepartment
        ? { department_id: formValues.department_id }
        : {}),
      ...(trimmedRegion ? { region: trimmedRegion } : {}),
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
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Identity */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Identity
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
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
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formValues.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="user@hospital.org"
                  required
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
                    placeholder="At least 8 characters"
                    required
                  />
                </div>
              )}
            </div>
          </section>

          {/* Access & assignment */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Access &amp; assignment
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formValues.role}
                  onValueChange={handleRoleChange}
                >
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {!isKnownRole && formValues.role ? (
                      <SelectItem value={formValues.role}>
                        {SYSTEM_ADMIN_ROLE_LABELS[formValues.role] ??
                          formValues.role}
                      </SelectItem>
                    ) : null}
                    {SYSTEM_ADMIN_ROLE_OPTIONS.map((role) => (
                      <SelectItem key={role} value={role}>
                        {SYSTEM_ADMIN_ROLE_LABELS[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Select
                  value={formValues.region}
                  onValueChange={(value) => updateField("region", value)}
                  disabled={isRegionsLoading && regions.length === 0}
                >
                  <SelectTrigger id="region" className="w-full">
                    <SelectValue
                      placeholder={
                        isRegionsLoading
                          ? "Loading regions..."
                          : "Select region"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {!selectedRegionInOptions && formValues.region ? (
                      <SelectItem value={formValues.region}>
                        {formValues.region}
                      </SelectItem>
                    ) : null}
                    {regions.length === 0 && !formValues.region ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        {isRegionsLoading
                          ? "Loading regions..."
                          : "No regions available"}
                      </div>
                    ) : (
                      regions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
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
                  disabled={isHospitalsLoading && hospitals.length === 0}
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
                    {!selectedHospitalInOptions && formValues.hospital_id ? (
                      <SelectItem value={formValues.hospital_id}>
                        {fallbackHospitalLabel}
                      </SelectItem>
                    ) : null}
                    {hospitals.map((hospital) => (
                      <SelectItem key={hospital.id} value={hospital.id}>
                        {hospital.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {roleNeedsDepartment && (
                <div className="space-y-2">
                  <Label htmlFor="department_id">Department</Label>
                  <Select
                    value={formValues.department_id}
                    onValueChange={(value) =>
                      updateField("department_id", value)
                    }
                    disabled={
                      !formValues.hospital_id ||
                      (isDepartmentsLoading && departments.length === 0)
                    }
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
                      {!selectedDepartmentInOptions &&
                      formValues.department_id ? (
                        <SelectItem value={formValues.department_id}>
                          {fallbackDepartmentLabel}
                        </SelectItem>
                      ) : null}
                      {departments.map((department) => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {selectedUser && (
              <div className="grid gap-4 md:grid-cols-2">
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
              </div>
            )}
          </section>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-border/60">
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
