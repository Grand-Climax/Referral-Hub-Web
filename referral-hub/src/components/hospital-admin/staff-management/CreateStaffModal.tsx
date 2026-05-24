import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetCurrentUserQuery } from "@/features/auth/authApi";
import { useCreateStaffMutation } from "@/features/hospitalAdmin/hospitalAdminApi";
import { useGetDepartmentsQuery } from "@/features/hospitals/hospitalsApi";
import { useGetRegionsQuery } from "@/features/reference/regionsApi";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/apiError";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  HOSPITAL_STAFF_ROLE_OPTIONS,
  HOSPITAL_STAFF_ROLE_LABELS,
  hospitalStaffRoleRequiresDepartment,
} from "@/types/hospital-admin";
import type { CreateStaffPayload } from "@/types/hospital-admin";

const defaultFormData: CreateStaffPayload = {
  department_id: "",
  email: "",
  first_name: "",
  last_name: "",
  middle_name: "",
  national_id: "",
  password: "",
  phone_number: "",
  region: "",
  role: "LIAISON_OFFICER",
};

export function CreateStaffModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [createStaff, { isLoading }] = useCreateStaffMutation();
  const { data: currentUser, isLoading: isLoadingCurrentUser } =
    useGetCurrentUserQuery();
  const hospitalId = currentUser?.hospital_id;
  const { data: departments = [], isLoading: isLoadingDepartments } =
    useGetDepartmentsQuery(hospitalId ?? "", {
      skip: !hospitalId,
    });
  const { data: regions = [], isLoading: isLoadingRegions } =
    useGetRegionsQuery();
  const [formData, setFormData] =
    useState<CreateStaffPayload>(defaultFormData);

  const selectedRegionInOptions = regions.some(
    (region) => region === formData.region,
  );

  const roleNeedsDepartment = hospitalStaffRoleRequiresDepartment(formData.role);

  const handleChange = (field: keyof CreateStaffPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      role: value,
      // Clear department whenever the new role doesn't need one so we don't
      // send a stale id from a previous selection.
      department_id: hospitalStaffRoleRequiresDepartment(value)
        ? prev.department_id
        : "",
    }));
  };

  const resetForm = () => {
    setFormData(defaultFormData);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (roleNeedsDepartment && !formData.department_id) {
      toast.error("Please select a department.");
      return;
    }
    if (!formData.region.trim()) {
      toast.error("Please select a region.");
      return;
    }
    if (!formData.phone_number.trim()) {
      toast.error("Please enter a phone number.");
      return;
    }
    if (!hospitalId) {
      toast.error("Could not determine your hospital. Please refresh and try again.");
      return;
    }

    const payload: CreateStaffPayload = {
      email: formData.email.trim(),
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      middle_name: formData.middle_name.trim(),
      national_id: formData.national_id.trim(),
      password: formData.password,
      phone_number: formData.phone_number.trim(),
      region: formData.region.trim(),
      role: formData.role,
      ...(roleNeedsDepartment && formData.department_id
        ? { department_id: formData.department_id }
        : {}),
    };

    try {
      await createStaff(payload).unwrap();
      toast.success("Staff created successfully");
      handleOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error(getApiErrorMessage(err, "Failed to create staff"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create staff</DialogTitle>
          <DialogDescription>
            Add a staff member and assign them to a department in your hospital.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="staff_first_name">First name</Label>
              <Input
                id="staff_first_name"
                required
                value={formData.first_name}
                onChange={(e) => handleChange("first_name", e.target.value)}
                placeholder="Abebe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff_middle_name">Middle name</Label>
              <Input
                id="staff_middle_name"
                required
                value={formData.middle_name}
                onChange={(e) => handleChange("middle_name", e.target.value)}
                placeholder="Kebede"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="staff_last_name">Last name</Label>
              <Input
                id="staff_last_name"
                required
                value={formData.last_name}
                onChange={(e) => handleChange("last_name", e.target.value)}
                placeholder="Molla"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff_email">Email</Label>
              <Input
                id="staff_email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="staff@hospital.et"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="staff_phone_number">Phone number</Label>
              <Input
                id="staff_phone_number"
                type="tel"
                required
                value={formData.phone_number}
                onChange={(e) => handleChange("phone_number", e.target.value)}
                placeholder="+251922334455"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff_national_id">National ID</Label>
              <Input
                id="staff_national_id"
                required
                value={formData.national_id}
                onChange={(e) => handleChange("national_id", e.target.value)}
                placeholder="ETH-0001"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="staff_password">Password</Label>
              <Input
                id="staff_password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="password123"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="staff_region">Region</Label>
              <Select
                value={formData.region}
                onValueChange={(val) => handleChange("region", val)}
                disabled={isLoadingRegions && regions.length === 0}
                required
              >
                <SelectTrigger id="staff_region" className="w-full">
                  <SelectValue
                    placeholder={
                      isLoadingRegions ? "Loading regions..." : "Select region"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {!selectedRegionInOptions && formData.region ? (
                    <SelectItem value={formData.region}>
                      {formData.region}
                    </SelectItem>
                  ) : null}
                  {regions.length === 0 && !formData.region ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      {isLoadingRegions
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
            <div className="space-y-2">
              <Label htmlFor="staff_role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={handleRoleChange}
              >
                <SelectTrigger id="staff_role" className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {HOSPITAL_STAFF_ROLE_OPTIONS.map((role) => (
                    <SelectItem key={role} value={role}>
                      {HOSPITAL_STAFF_ROLE_LABELS[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {roleNeedsDepartment && (
              <div className="space-y-2">
                <Label htmlFor="staff_department_id">Department</Label>
                <Select
                  value={formData.department_id ?? ""}
                  onValueChange={(val) => handleChange("department_id", val)}
                  disabled={!hospitalId || isLoadingCurrentUser || isLoadingDepartments}
                  required
                >
                  <SelectTrigger id="staff_department_id" className="w-full">
                    <SelectValue
                      placeholder={
                        isLoadingCurrentUser || isLoadingDepartments
                          ? "Loading departments..."
                          : !hospitalId
                            ? "Hospital unavailable"
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
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading ||
                isLoadingCurrentUser ||
                isLoadingDepartments ||
                isLoadingRegions ||
                !hospitalId ||
                !formData.region ||
                !formData.phone_number.trim()
              }
            >
              {isLoading ? "Creating..." : "Create staff"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
