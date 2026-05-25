"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { getApiErrorMessage } from "@/lib/apiError";
import { useGetCurrentUserQuery } from "@/features/auth/authApi";
import { useUpdateProfileImageMutation } from "@/features/users/usersApi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { EditProfileForm } from "./edit-profile";
import { UpdateCredentialForm } from "./update-credential";
import {
  Mail,
  CreditCard,
  Building2,
  Shield,
  User2,
  Camera,
  Loader2,
  MapPin,
  Phone,
  Layers,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import { DoctorProfileSkeleton } from "@/components/skeletons/DoctorProfileSkeleton";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp"];

const TIER_LABEL: Record<string, string> = {
  PRIMARY: "Primary",
  SECONDARY: "Secondary",
  TERTIARY: "Tertiary",
  QUATERNARY: "Quaternary",
};

// Role display config: title prefix, role label, verified-badge text
const ROLE_CONFIG: Record<
  string,
  { prefix: string; label: string; verified: string }
> = {
  RECEPTIONIST: { prefix: "", label: "Receptionist", verified: "Verified Staff" },
  HOSPITAL_ADMIN: {
    prefix: "",
    label: "Hospital Administrator",
    verified: "Verified Admin",
  },
  DEPT_HEAD: {
    prefix: "Dr.",
    label: "Department Head",
    verified: "Verified Department Head",
  },
  RECEIVING_SPECIALIST: {
    prefix: "Dr.",
    label: "Receiving Specialist",
    verified: "Verified Specialist",
  },
  REFERRING_DOCTOR: {
    prefix: "Dr.",
    label: "Referring Doctor",
    verified: "Verified Doctor",
  },
};

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-medium text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

export function DoctorProfile() {
  const {
    data: user,
    isLoading: userLoading,
    refetch: refetchCurrentUser,
  } = useGetCurrentUserQuery();

  const [updateProfileImage, { isLoading: isUploadingImage }] =
    useUpdateProfileImageMutation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isEditOpen, setEditOpen] = useState(false);

  const handleAvatarClick = () => {
    if (isUploadingImage) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const fileNameLower = file.name.toLowerCase();
    const hasAllowedExt = ALLOWED_IMAGE_EXTS.some((ext) =>
      fileNameLower.endsWith(ext),
    );
    const hasAllowedType = file.type
      ? ALLOWED_IMAGE_TYPES.includes(file.type)
      : hasAllowedExt;
    if (!hasAllowedType) {
      toast.error("Image must be JPEG, PNG, or WEBP.");
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image must be 5 MB or smaller.");
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    try {
      await updateProfileImage({ file, filename: file.name }).unwrap();
      toast.success("Profile photo updated.");
      await refetchCurrentUser();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to update profile photo."));
      setPreviewUrl(null);
    } finally {
      URL.revokeObjectURL(localUrl);
      setPreviewUrl((current) => (current === localUrl ? null : current));
    }
  };

  if (userLoading) {
    return <DoctorProfileSkeleton />;
  }

  // ─── Derived display values ──────────────────────────────────────────────
  const role = user?.role ?? "";
  const cfg = ROLE_CONFIG[role] ?? {
    prefix: "",
    label: role ? role.replace(/_/g, " ") : "User",
    verified: "Verified User",
  };

  const firstName = user?.first_name ?? "";
  const lastName = user?.last_name ?? "";
  const middleName = user?.middle_name?.trim();

  const nameBody = [firstName, middleName, lastName].filter(Boolean).join(" ");
  const fullName = nameBody
    ? cfg.prefix
      ? `${cfg.prefix} ${nameBody}`
      : nameBody
    : "User";

  const fallback =
    firstName && lastName
      ? `${firstName[0]}${lastName[0]}`.toUpperCase()
      : (firstName[0] ?? "U").toUpperCase();

  const email = user?.email || "—";
  const nationalId = user?.national_id || "—";

  const department = user?.department;
  const hospital = user?.hospital;

  // Subtitle just under the name — uses department name when available
  const subtitle = department?.name
    ? `${cfg.label} — ${department.name}`
    : cfg.label;

  const tierLabel = hospital?.tier_level
    ? (TIER_LABEL[hospital.tier_level] ?? hospital.tier_level)
    : "";

  const memberSince = user?.created_at
    ? format(new Date(user.created_at), "MMMM yyyy")
    : null;

  return (
    <div className="space-y-6">
      {/* ─── Hero card ────────────────────────────────────────────────────── */}
      <Card className="relative overflow-hidden rounded-3xl border bg-card/60 backdrop-blur-xl shadow-sm transition-all hover:shadow-md">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50 pointer-events-none" />
        <CardContent className="relative space-y-6 p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-4 sm:gap-6">
              <div className="relative flex items-center justify-center">
                <Avatar className="h-32 w-32 sm:h-40 sm:w-40 ring-4 ring-primary/10">
                  <AvatarImage
                    src={previewUrl || user?.profile_image_url || "/user.png"}
                    alt={fullName}
                    className="object-cover object-center"
                  />
                  <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                    {fallback}
                  </AvatarFallback>
                </Avatar>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={isUploadingImage}
                  className="bg-primary text-primary-foreground absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-background shadow-md transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70"
                  aria-label="Change profile picture"
                  title="Change profile picture"
                >
                  {isUploadingImage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    {fullName}
                  </h2>
                  {user?.is_active ? (
                    <Badge className="gap-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300 text-[11px]">
                      <ShieldCheck className="h-3 w-3" />
                      {cfg.verified}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[11px]">
                      Inactive
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-semibold text-primary">{subtitle}</p>
                {hospital?.name && (
                  <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>{hospital.name}</span>
                    {tierLabel && (
                      <Badge
                        variant="outline"
                        className="text-[10px] font-medium"
                      >
                        {tierLabel} Hospital
                      </Badge>
                    )}
                  </p>
                )}
                {memberSince && (
                  <p className="flex items-center gap-1.5 pt-1 text-[11px] text-muted-foreground">
                    <Calendar className="h-3 w-3" /> Joined {memberSince}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:items-end" />
          </div>

          <div className="mt-2 grid grid-cols-1 gap-4 border-t border-border/50 pt-6 sm:grid-cols-2">
            <InfoTile icon={Mail} label="Email" value={email} />
            <InfoTile icon={CreditCard} label="National ID" value={nationalId} />
          </div>
        </CardContent>
      </Card>

      {/* ─── Department card (only when present) ─────────────────────────── */}
      {department && (
        <Card className="overflow-hidden rounded-3xl border bg-card/60 backdrop-blur-xl shadow-sm">
          <CardHeader className="border-b border-border/50 bg-muted/20 pb-4 pt-6 px-8">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              Department
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                {department.name}
              </p>
              {department.description && (
                <p className="text-sm text-foreground leading-relaxed">
                  {department.description}
                </p>
              )}
            </div>
            {department.updated_at && (
              <div className="pt-3 border-t border-border/50 flex justify-between text-xs">
                <span className="text-muted-foreground">Last updated</span>
                <span className="text-foreground">
                  {format(new Date(department.updated_at), "MMM d, yyyy")}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── Hospital card (only when present) ───────────────────────────── */}
      {hospital && (
        <Card className="overflow-hidden rounded-3xl border bg-card/60 backdrop-blur-xl shadow-sm">
          <CardHeader className="border-b border-border/50 bg-muted/20 pb-4 pt-6 px-8">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Hospital
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
              <div>
                <p className="text-lg font-bold text-foreground">
                  {hospital.name}
                </p>
                {hospital.region && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {hospital.region} region
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {tierLabel && (
                  <Badge variant="outline" className="text-[10px]">
                    {tierLabel}
                  </Badge>
                )}
                {hospital.is_active ? (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300 text-[10px]">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px]">
                    Inactive
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {hospital.address && (
                <InfoTile
                  icon={MapPin}
                  label="Address"
                  value={hospital.address}
                />
              )}
              {hospital.contact_phone && (
                <InfoTile
                  icon={Phone}
                  label="Contact Phone"
                  value={hospital.contact_phone}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Account settings ────────────────────────────────────────────── */}
      <Card className="overflow-hidden rounded-3xl border bg-card/60 backdrop-blur-xl shadow-sm transition-all hover:shadow-md">
        <CardHeader className="border-b border-border/50 bg-muted/20 pb-4 pt-6 px-8">
          <CardTitle className="text-base font-semibold">
            Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border/50 p-0">
          <Sheet open={isEditOpen} onOpenChange={setEditOpen}>
            <div className="group flex items-center justify-between px-8 py-5 transition-colors hover:bg-muted/50">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110 shadow-inner">
                  <User2 className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Personal Information
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Update your name, contact details, and profile photo.
                  </p>
                </div>
              </div>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Edit
                </button>
              </SheetTrigger>
            </div>
            <SheetContent side="right" className="w-full sm:max-w-xl p-5 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Edit Profile</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <EditProfileForm
                  onSuccess={() => setEditOpen(false)}
                  onCancel={() => setEditOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>

          <Sheet>
            <div className="group flex items-center justify-between px-8 py-5 transition-colors hover:bg-muted/50">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110 shadow-inner">
                  <Shield className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Security Credentials
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Change your password and manage two-factor authentication.
                  </p>
                </div>
              </div>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Update
                </button>
              </SheetTrigger>
            </div>
            <SheetContent side="right" className="w-full sm:max-w-2xl">
              <SheetHeader>
                <SheetTitle>Update Security Credentials</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <UpdateCredentialForm />
              </div>
            </SheetContent>
          </Sheet>
        </CardContent>
      </Card>
    </div>
  );
}
