"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Lock, Loader2, KeyRound, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/passwordinput";

import { useUpdatePasswordMutation } from "@/features/users/usersApi";
import { getApiErrorMessage } from "@/lib/apiError";

const schema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(72, "Password is too long")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirm_password: z.string().min(1, "Please confirm your new password"),
  })
  .refine((values) => values.new_password === values.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  })
  .refine((values) => values.new_password !== values.current_password, {
    message: "New password must be different from the current one",
    path: ["new_password"],
  });

type FormValues = z.infer<typeof schema>;

export function UpdateCredentialForm() {
  const [updatePassword, { isLoading }] = useUpdatePasswordMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await updatePassword({
        current_password: values.current_password,
        new_password: values.new_password,
      }).unwrap();
      toast.success("Password changed. Use the new password next time you sign in.");
      reset();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to change password."));
    }
  };

  return (
    <Card className="border-0 bg-transparent shadow-none">
      <CardHeader className="px-2 pb-4 pt-0">
        <CardTitle className="text-xl font-bold tracking-tight">
          Security Credentials
        </CardTitle>
        <p className="text-sm font-medium text-muted-foreground">
          Choose a strong password to keep your account secure.
        </p>
      </CardHeader>

      <CardContent className="space-y-6 p-2">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 rounded-2xl border border-border/50 bg-muted/30 p-5 md:p-7"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
              <Lock className="h-5 w-5" />
            </span>
            <div>
              <p className="text-base font-semibold text-foreground">
                Update Password
              </p>
              <p className="text-xs text-muted-foreground">
                You&apos;ll stay signed in on this device after changing it.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="space-y-1">
              <PasswordInput
                label="Current Password"
                autoComplete="current-password"
                {...register("current_password")}
              />
              {errors.current_password && (
                <p className="text-xs text-destructive">
                  {errors.current_password.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <PasswordInput
                label="New Password"
                autoComplete="new-password"
                {...register("new_password")}
              />
              {errors.new_password && (
                <p className="text-xs text-destructive">
                  {errors.new_password.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <PasswordInput
                label="Confirm New Password"
                autoComplete="new-password"
                {...register("confirm_password")}
              />
              {errors.confirm_password && (
                <p className="text-xs text-destructive">
                  {errors.confirm_password.message}
                </p>
              )}
            </div>
          </div>

          <ul className="space-y-1 text-xs text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <KeyRound className="h-3 w-3" /> At least 8 characters
            </li>
            <li className="flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3" />
              Include uppercase, lowercase, and a number
            </li>
          </ul>

          <div className="flex justify-end gap-3 border-t border-border/50 pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              className="h-11 px-6 rounded-xl font-medium border-border/50"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-11 px-6 rounded-xl font-medium shadow-md gap-2"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
