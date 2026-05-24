"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/passwordinput";

import {
  useForgotPasswordMutation,
  useVerifyForgotPasswordMutation,
  useResetPasswordMutation,
} from "@/features/auth/authApi";
import { getApiErrorMessage } from "@/lib/apiError";

type Step = 1 | 2 | 3 | 4;

const emailSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
});

const codeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(4, "Verification code is too short")
    .max(12, "Verification code is too long"),
});

const passwordSchema = z
  .object({
    new_password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirm_password: z.string().min(1, "Please confirm your new password"),
  })
  .refine((v) => v.new_password === v.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type EmailValues = z.infer<typeof emailSchema>;
type CodeValues = z.infer<typeof codeSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

// ─── Step components ────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: Step }) {
  const steps = [
    { n: 1, label: "Email" },
    { n: 2, label: "Verify" },
    { n: 3, label: "Reset" },
  ];
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, idx) => {
        const done = step > s.n || step === 4;
        const active = step === s.n;
        return (
          <div key={s.n} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                done
                  ? "bg-primary text-primary-foreground"
                  : active
                  ? "bg-primary/15 text-primary border-2 border-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {done ? <CheckCircle2 className="h-4 w-4" /> : s.n}
            </div>
            <span
              className={`text-xs font-semibold ${
                active ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
            {idx < steps.length - 1 && (
              <span className="mx-1 h-px w-5 bg-border" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function EmailStep({
  email,
  onComplete,
}: {
  email: string;
  onComplete: (email: string) => void;
}) {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email },
  });

  const onSubmit = async (values: EmailValues) => {
    try {
      await forgotPassword({ email: values.email }).unwrap();
      toast.success("Verification code sent. Check your email.");
      onComplete(values.email);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Could not send verification code."));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2 text-center lg:text-left">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Forgot your password?
        </h2>
        <p className="text-sm text-muted-foreground">
          Enter the email associated with your account. We&apos;ll send you a
          verification code to reset your password.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fp-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="fp-email"
            type="email"
            placeholder="name@hospital.gov.et"
            autoComplete="email"
            className="pl-10 h-10"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full gap-2"
        size="lg"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending code…
          </>
        ) : (
          <>
            Send verification code
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

function VerifyStep({
  email,
  onComplete,
  onBack,
}: {
  email: string;
  onComplete: (token?: string, code?: string) => void;
  onBack: () => void;
}) {
  const [verifyForgotPassword, { isLoading }] =
    useVerifyForgotPasswordMutation();
  const [resend, { isLoading: isResending }] = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CodeValues>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: "" },
  });

  const onSubmit = async (values: CodeValues) => {
    try {
      const res = await verifyForgotPassword({
        email,
        code: values.code.trim(),
      }).unwrap();
      onComplete(res?.reset_token, values.code.trim());
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Invalid or expired code."));
    }
  };

  const handleResend = async () => {
    try {
      await resend({ email }).unwrap();
      toast.success("A new code has been sent.");
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Could not resend code."));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2 text-center lg:text-left">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Check your email
        </h2>
        <p className="text-sm text-muted-foreground">
          We sent a verification code to{" "}
          <span className="font-semibold text-foreground">{email}</span>. Enter
          it below to continue.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fp-code">Verification code</Label>
        <div className="relative">
          <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="fp-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            className="pl-10 h-10 tracking-widest font-mono"
            {...register("code")}
          />
        </div>
        {errors.code && (
          <p className="text-xs text-destructive">{errors.code.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full gap-2"
        size="lg"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Verifying…
          </>
        ) : (
          <>
            Verify code
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>

      <div className="flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Change email
        </button>
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="font-semibold text-primary hover:underline disabled:opacity-60"
        >
          {isResending ? "Resending…" : "Resend code"}
        </button>
      </div>
    </form>
  );
}

function ResetStep({
  email,
  resetToken,
  code,
  onComplete,
}: {
  email: string;
  resetToken?: string;
  code?: string;
  onComplete: () => void;
}) {
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { new_password: "", confirm_password: "" },
  });

  const onSubmit = async (values: PasswordValues) => {
    try {
      await resetPassword({
        email,
        ...(resetToken ? { reset_token: resetToken } : {}),
        ...(code ? { code } : {}),
        new_password: values.new_password,
      }).unwrap();
      onComplete();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to reset password."));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2 text-center lg:text-left">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Choose a new password
        </h2>
        <p className="text-sm text-muted-foreground">
          Make it strong and unique. You&apos;ll use this to sign in next time.
        </p>
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

      <ul className="space-y-1 text-xs text-muted-foreground pl-1">
        <li className="flex items-center gap-1.5">
          <KeyRound className="h-3 w-3" /> At least 8 characters
        </li>
        <li className="flex items-center gap-1.5">
          <ShieldCheck className="h-3 w-3" />
          Include uppercase, lowercase, and a number
        </li>
      </ul>

      <Button
        type="submit"
        className="w-full gap-2"
        size="lg"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Resetting…
          </>
        ) : (
          "Reset password"
        )}
      </Button>
    </form>
  );
}

function SuccessStep() {
  const router = useRouter();
  return (
    <div className="space-y-5 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Password reset
        </h2>
        <p className="text-sm text-muted-foreground">
          Your password has been updated. You can now sign in with your new
          credentials.
        </p>
      </div>
      <Button
        size="lg"
        className="w-full"
        onClick={() => router.push("/login")}
      >
        Go to sign in
      </Button>
    </div>
  );
}

// ─── Main wizard ────────────────────────────────────────────────────────────

export function ForgotPassword() {
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState<string | undefined>();
  const [code, setCode] = useState<string | undefined>();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1">
        {/* Left brand panel */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-primary p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-[-10%] right-[-10%] w-125 h-125 rounded-full bg-primary-foreground/5" />
            <div className="absolute bottom-[-15%] left-[-10%] w-150 h-150 rounded-full bg-primary-foreground/5" />
            <div className="absolute top-[40%] left-[20%] w-50 h-50 rounded-full bg-primary-foreground/5" />
          </div>
          <div className="relative z-10 max-w-md text-center">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
              <Activity className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-primary-foreground">
              Account Recovery
            </h1>
            <p className="text-lg text-primary-foreground/70">
              Reset your password in a few quick steps to regain access to the
              Hospital Referral Hub.
            </p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-sm space-y-6">
            {/* Mobile logo */}
            <div className="flex flex-col items-center lg:hidden">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
                <Activity className="h-7 w-7 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Hospital Referral Hub
              </h2>
            </div>

            {step !== 4 && <StepIndicator step={step} />}

            {step === 1 && (
              <EmailStep
                email={email}
                onComplete={(e) => {
                  setEmail(e);
                  setStep(2);
                }}
              />
            )}
            {step === 2 && (
              <VerifyStep
                email={email}
                onBack={() => setStep(1)}
                onComplete={(token, c) => {
                  setResetToken(token);
                  setCode(c);
                  setStep(3);
                }}
              />
            )}
            {step === 3 && (
              <ResetStep
                email={email}
                resetToken={resetToken}
                code={code}
                onComplete={() => setStep(4)}
              />
            )}
            {step === 4 && <SuccessStep />}
          </div>
        </div>
      </div>

      <footer className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            © 2026 Hospital Referral Hub — Ethiopia
          </p>
          <p className="text-xs text-muted-foreground">
            Ministry of Health Digital Health Initiative
          </p>
        </div>
      </footer>
    </div>
  );
}
