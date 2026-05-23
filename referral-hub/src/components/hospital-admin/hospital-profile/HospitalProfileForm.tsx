"use client";

import { FormEvent, useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Building2,
  Loader2,
  MapPin,
  Pencil,
  Phone,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/apiError";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  useGetHospitalProfileQuery,
  useUpdateHospitalProfileMutation,
} from "@/features/hospitalAdmin/hospitalAdminApi";
import type { HospitalAdminProfile } from "@/types/hospital-admin";

type ProfileFormState = {
  name: string;
  tier_level: string;
  region: string;
  address: string;
  contact_phone: string;
};

function profileToForm(profile: HospitalAdminProfile): ProfileFormState {
  return {
    name: profile.name ?? "",
    tier_level: profile.tier_level ?? "",
    region: profile.region ?? "",
    address: profile.address ?? "",
    contact_phone: profile.contact_phone ?? "",
  };
}

const emptyForm: ProfileFormState = {
  name: "",
  tier_level: "",
  region: "",
  address: "",
  contact_phone: "",
};

function formatDateTime(value?: string) {
  if (!value) return "—";
  try {
    const normalized = value.includes("T") ? value : value.replace(" ", "T");
    return format(new Date(normalized), "MMM d, yyyy · h:mm a");
  } catch {
    return value;
  }
}

function ProfileField({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="flex items-start gap-2">
        {Icon ? (
          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        ) : null}
        <p className="text-sm font-medium text-foreground">{value || "—"}</p>
      </div>
    </div>
  );
}

export function HospitalProfileForm() {
  const { data: profile, isLoading, isError, refetch } = useGetHospitalProfileQuery();
  const [updateProfile, { isLoading: isSaving }] = useUpdateHospitalProfileMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<ProfileFormState>(emptyForm);

  useEffect(() => {
    if (!profile || isEditing) return;
    setForm(profileToForm(profile));
  }, [profile, isEditing]);

  const handleStartEdit = () => {
    if (profile) setForm(profileToForm(profile));
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (profile) setForm(profileToForm(profile));
    setIsEditing(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await updateProfile({
        name: form.name.trim(),
        tier_level: form.tier_level.trim(),
        region: form.region.trim(),
        address: form.address.trim(),
        contact_phone: form.contact_phone.trim(),
      }).unwrap();
      toast.success("Hospital profile updated.");
      setIsEditing(false);
      refetch();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update hospital profile."));
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="mx-auto max-w-3xl p-8 text-center">
        <p className="text-red-600 dark:text-red-400">
          Could not load hospital profile.
        </p>
        <Button variant="outline" className="mt-4" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Hospital profile
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Your hospital&apos;s registered information on the referral network.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isEditing ? (
            <Button className="gap-2 rounded-xl" onClick={handleStartEdit}>
              <Pencil className="h-4 w-4" />
              Edit profile
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                className="gap-2 rounded-xl"
                onClick={handleCancelEdit}
                disabled={isSaving}
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                type="submit"
                form="hospital-profile-form"
                className="gap-2 rounded-xl"
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save changes
              </Button>
            </>
          )}
        </div>
      </div>

      <Card className="overflow-hidden border-slate-200/80 shadow-lg rounded-2xl dark:border-slate-800 p-0">
        <div className="relative h-36 overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 px-6 pb-16 pt-6 sm:px-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.22),transparent_45%)]" />
          <div className="relative flex items-start gap-4 sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-white/30 bg-white/15 text-white shadow-lg backdrop-blur-sm">
              <Building2 className="h-8 w-8" />
            </div>
            <div className="min-w-0 flex-1 space-y-2.5">
              <h2 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
                {profile.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                {profile.tier_level ? (
                  <Badge className="border-white/25 bg-white/15 text-[10px] font-bold uppercase tracking-wide text-white hover:bg-white/20">
                    {profile.tier_level}
                  </Badge>
                ) : null}
                <Badge
                  className={
                    profile.is_active
                      ? "border-emerald-300/40 bg-emerald-500/25 text-[10px] font-semibold text-emerald-50"
                      : "border-white/20 bg-white/10 text-[10px] font-semibold text-white/80"
                  }
                >
                  {profile.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="px-6 pb-8 pt-6 sm:px-8">
          {!isEditing ? (
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <ProfileField label="Hospital name" value={profile.name} icon={Building2} />
                <ProfileField label="Tier level" value={profile.tier_level} />
                <ProfileField label="Region" value={profile.region} icon={MapPin} />
                <ProfileField label="Contact phone" value={profile.contact_phone} icon={Phone} />
              </div>
              <Separator />
              <ProfileField label="Address" value={profile.address} icon={MapPin} />
              <Separator />
              <div className="grid gap-4 sm:grid-cols-2 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">Created: </span>
                  {formatDateTime(profile.created_at)}
                </div>
                <div>
                  <span className="font-medium text-foreground">Last updated: </span>
                  {formatDateTime(profile.updated_at)}
                </div>
              </div>
            </div>
          ) : (
            <form
              id="hospital-profile-form"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="hospital_name">Hospital name</Label>
                  <Input
                    id="hospital_name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tier_level">Tier level</Label>
                  <Input
                    id="tier_level"
                    value={form.tier_level}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, tier_level: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Input
                    id="region"
                    value={form.region}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, region: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Contact phone</Label>
                  <Input
                    id="contact_phone"
                    value={form.contact_phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, contact_phone: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                />
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
