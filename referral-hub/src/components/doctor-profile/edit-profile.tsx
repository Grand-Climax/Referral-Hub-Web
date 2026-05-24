"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Mail,
  Phone,
  User,
  Loader2,
  Save,
  X,
  RotateCcw,
  Lock,
  Info,
  CheckCircle2,
  CreditCard,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useGetCurrentUserQuery } from "@/features/auth/authApi";
import { useUpdateMeMutation } from "@/features/users/usersApi";
import { getApiErrorMessage } from "@/lib/apiError";
import type { UpdateMePayload } from "@/types/user";

const schema = z.object({
  first_name: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(60, "Too long"),
  middle_name: z
    .string()
    .trim()
    .max(60, "Too long")
    .optional()
    .or(z.literal("")),
  last_name: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(60, "Too long"),
  phone_number: z
    .string()
    .trim()
    .regex(
      /^[+0-9 ()-]{0,30}$/,
      "Only digits, spaces, +, -, ( ) are allowed",
    )
    .max(30, "Too long")
    .optional()
    .or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

interface EditProfileFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ─── Field with leading icon ────────────────────────────────────────────────

function IconField({
  id,
  icon: Icon,
  placeholder,
  disabled,
  error,
  registerProps,
}: {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  registerProps: ReturnType<ReturnType<typeof useForm<FormValues>>["register"]>;
}) {
  return (
    <div className="space-y-1.5">
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted-foreground/70">
          <Icon className="h-4 w-4" />
        </span>
        <Input
          id={id}
          disabled={disabled}
          placeholder={placeholder}
          className={`h-11 pl-10 rounded-xl bg-muted/40 border-border/50 transition-all focus:bg-background focus:border-primary/40 focus:ring-2 focus:ring-primary/10 ${
            error ? "border-destructive focus:border-destructive focus:ring-destructive/10" : ""
          }`}
          {...registerProps}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ─── Read-only field (locked) ───────────────────────────────────────────────

function LockedField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </Label>
        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
          <Lock className="h-2.5 w-2.5" />
          Locked
        </span>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-dashed border-border/60 bg-muted/30 px-3.5 py-2.5 text-sm text-muted-foreground">
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{value}</span>
      </div>
    </div>
  );
}

// ─── Main form ──────────────────────────────────────────────────────────────

export function EditProfileForm({ onSuccess, onCancel }: EditProfileFormProps = {}) {
  const { data: user, isLoading: isUserLoading } = useGetCurrentUserQuery();
  const [updateMe, { isLoading: isSaving }] = useUpdateMeMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: "",
      middle_name: "",
      last_name: "",
      phone_number: "",
    },
  });

  const watched = watch();
  const previewName =
    [watched.first_name, watched.middle_name, watched.last_name]
      .map((s) => s?.trim())
      .filter(Boolean)
      .join(" ") || "—";

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name ?? "",
        middle_name: user.middle_name ?? "",
        last_name: user.last_name ?? "",
        phone_number: user.phone_number ?? "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (values: FormValues) => {
    // Only these 4 fields are updatable on PUT /users/me
    const payload: UpdateMePayload = {
      first_name: values.first_name.trim(),
      middle_name: values.middle_name?.trim() ?? "",
      last_name: values.last_name.trim(),
      phone_number: values.phone_number?.trim() ?? "",
    };

    try {
      await updateMe(payload).unwrap();
      toast.success("Profile updated successfully.", {
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
      });
      onSuccess?.();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to update profile."));
    }
  };

  const handleResetForm = () => {
    if (user) {
      reset({
        first_name: user.first_name ?? "",
        middle_name: user.middle_name ?? "",
        last_name: user.last_name ?? "",
        phone_number: user.phone_number ?? "",
      });
    }
  };

  const initials =
    (user?.first_name?.[0] ?? "") + (user?.last_name?.[0] ?? "");
  const fallback = initials.trim() ? initials.toUpperCase() : "U";

  return (
    <Card className="border-0 bg-transparent shadow-none">
      <CardContent className="space-y-6 p-2">
        {/* Header preview */}
        <div className="flex items-center gap-4 rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 via-muted/30 to-transparent p-4">
          <Avatar className="h-14 w-14 ring-2 ring-background shadow-sm">
            <AvatarImage src={user?.profile_image_url ?? "/user.png"} alt={previewName} />
            <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
              {fallback}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Live preview
            </p>
            <p className="text-base font-bold text-foreground truncate">
              {previewName}
            </p>
            {watched.phone_number?.trim() && (
              <p className="text-xs text-muted-foreground truncate">
                {watched.phone_number.trim()}
              </p>
            )}
          </div>
          {isDirty && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/40 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
              Unsaved
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Editable fields */}
          <fieldset
            disabled={isUserLoading || isSaving}
            className="space-y-4 disabled:opacity-60"
          >
            <legend className="sr-only">Editable personal information</legend>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="first_name"
                  className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  First Name <span className="text-destructive">*</span>
                </Label>
                <IconField
                  id="first_name"
                  icon={User}
                  disabled={isUserLoading}
                  error={errors.first_name?.message}
                  registerProps={register("first_name")}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="middle_name"
                  className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Middle Name
                </Label>
                <IconField
                  id="middle_name"
                  icon={User}
                  disabled={isUserLoading}
                  placeholder="Optional"
                  error={errors.middle_name?.message}
                  registerProps={register("middle_name")}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="last_name"
                  className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <IconField
                  id="last_name"
                  icon={User}
                  disabled={isUserLoading}
                  error={errors.last_name?.message}
                  registerProps={register("last_name")}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="phone_number"
                  className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Phone Number
                </Label>
                <IconField
                  id="phone_number"
                  icon={Phone}
                  disabled={isUserLoading}
                  placeholder="+251 9XX XXX XXX"
                  error={errors.phone_number?.message}
                  registerProps={register("phone_number")}
                />
              </div>
            </div>
          </fieldset>

          {/* Locked fields */}
          <div className="space-y-3">
            <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 px-3 py-2">
              <Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Email and national ID are managed by your hospital administrator.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <LockedField icon={Mail} label="Email" value={user?.email ?? "—"} />
              <LockedField
                icon={CreditCard}
                label="National ID"
                value={user?.national_id ?? "—"}
              />
            </div>
          </div>

          {/* Sticky action bar */}
          <div className="sticky bottom-0 -mx-2 flex items-center justify-between gap-3 border-t border-border/60 bg-background/95 px-2 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="text-xs text-muted-foreground">
              {isDirty ? (
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                  You have unsaved changes
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  All changes saved
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isDirty ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-10 gap-1.5 rounded-xl"
                  disabled={isSaving}
                  onClick={handleResetForm}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </Button>
              ) : (
                onCancel && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-10 gap-1.5 rounded-xl"
                    onClick={onCancel}
                  >
                    <X className="h-3.5 w-3.5" />
                    Close
                  </Button>
                )
              )}

              <Button
                type="submit"
                className="h-10 px-5 rounded-xl font-semibold shadow-sm gap-2"
                disabled={!isDirty || isSaving || isUserLoading}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
