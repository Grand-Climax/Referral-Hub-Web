"use client";

import { useEffect, useState } from "react";
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
import { useAppDispatch } from "@/lib/store/hooks";
import { resetAuthSession } from "@/lib/resetApiCaches";
import { getApiErrorMessage } from "@/lib/apiError";

// Server-configured cooldown is ~60s; we mirror it client-side so the
// "Resend code" button shows a countdown without a 429 round-trip.
const RESEND_COOLDOWN_SECONDS = 60;

// Map JWT `role` claims to landing routes — same table the login page uses.
// Keep these two in sync; the reset endpoint reuses the same JWT shape.
const ROLE_TO_PATH: Record<string, string> = {
  HOSPITAL_ADMIN: "/hospital-admin",
  REFERRING_DOCTOR: "/referring-doctor",
  LIAISON_OFFICER: "/liaison-officer",
  RECEIVING_SPECIALIST: "/receiving-specialist",
  RECEPTIONIST: "/receptionist",
  DEPT_HEAD: "/department-head",
  MOH_ANALYST: "/analytics",
  SYSTEM_SUPER_ADMIN: "/systemAdmin",
  DEPARTMENT_HEAD: "/department-head",
};

type Step = 1 | 2 | 3;

const emailSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
});

// Backend requires *exactly* 6 numeric digits. Anything else is a 400.
const codeSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/u, "Enter the 6-digit code from your email"),
});

const passwordSchema = z
  .object({
    // Server-side minimum is 8; we also enforce a little extra complexity to
    // discourage trivially weak passwords. The server is the source of
    // truth — these are belt-and-suspenders client checks.
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

// ─── Step indicator ─────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: Step }) {
  const steps = [
    { n: 1, label: "Email" },
    { n: 2, label: "Verify" },
    { n: 3, label: "Reset" },
  ];
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, idx) => {
        const done = step > s.n;
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

// ─── Step 1 — Email ─────────────────────────────────────────────────────────

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
      // Per the anti-enumeration policy we show the same toast on success
      // whether the email is registered or not. The server returns 200 in
      // both cases, so this branch always runs for valid input.
      toast.success("If that account exists, we just sent a code.");
      onComplete(values.email);
    } catch (err: unknown) {
      // Real failures (429 cooldown, 5xx) still surface their message.
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
          6-digit verification code.
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

// ─── Step 2 — Verify OTP ────────────────────────────────────────────────────

function VerifyStep({
  email,
  initialResendAt,
  onComplete,
  onBack,
}: {
  email: string;
  /**
   * Unix-ms timestamp when the resend button becomes available again. The
   * parent passes it in so the cooldown survives across step transitions
   * (e.g. user goes back to step 1 and then returns to step 2).
   */
  initialResendAt: number;
  onComplete: (resetToken: string, resendAt: number) => void;
  onBack: () => void;
}) {
  const [verifyForgotPassword, { isLoading }] =
    useVerifyForgotPasswordMutation();
  const [resend, { isLoading: isResending }] = useForgotPasswordMutation();

  // Resend cooldown — tick once per second so the button label refreshes.
  const [resendAt, setResendAt] = useState<number>(initialResendAt);
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const secondsLeft = Math.max(0, Math.ceil((resendAt - now) / 1000));
  const canResend = secondsLeft <= 0 && !isResending;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CodeValues>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: "" },
  });

  const onSubmit = async (values: CodeValues) => {
    try {
      const res = await verifyForgotPassword({
        email,
        code: values.code,
      }).unwrap();
      if (!res.reset_token) {
        // Defensive: the server should always return a token on 200.
        toast.error("Server didn't return a reset token. Please try again.");
        return;
      }
      onComplete(res.reset_token, resendAt);
    } catch (err: unknown) {
      // For expired / exhausted OTPs the server signals that the user must
      // start over. Surface a clear path back to step 1 rather than a vague
      // generic toast.
      const msg = getApiErrorMessage(err, "Invalid or expired code.");
      const status = (err as { status?: number })?.status;
      if (
        status === 401 &&
        /expired|attempts exceeded|not requested/i.test(msg)
      ) {
        toast.error(msg, {
          description: "Request a fresh code to continue.",
          action: { label: "New code", onClick: onBack },
        });
      } else {
        toast.error(msg);
      }
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      await resend({ email }).unwrap();
      const next = Date.now() + RESEND_COOLDOWN_SECONDS * 1000;
      setResendAt(next);
      setValue("code", "");
      toast.success("A new code is on its way.");
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
          We sent a 6-digit code to{" "}
          <span className="font-semibold text-foreground">{email}</span>. The
          code expires in 5 minutes.
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
            maxLength={6}
            className="pl-10 h-10 tracking-[0.5em] font-mono text-center"
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
          disabled={!canResend}
          className="font-semibold text-primary hover:underline disabled:opacity-60 disabled:no-underline"
        >
          {isResending
            ? "Resending…"
            : secondsLeft > 0
              ? `Resend in ${secondsLeft}s`
              : "Resend code"}
        </button>
      </div>
    </form>
  );
}

// ─── Step 3 — Set new password + auto-login ─────────────────────────────────

function ResetStep({
  resetToken,
  onTokenExpired,
}: {
  resetToken: string;
  /** Called when the reset token comes back 401 — caller resets to step 1. */
  onTokenExpired: () => void;
}) {
  const router = useRouter();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { new_password: "", confirm_password: "" },
  });

  const onSubmit = async (values: PasswordValues) => {
    // Make sure no stale auth from a previous tab/session interferes with
    // the cookies the mutation is about to write.
    resetAuthSession(dispatch);

    try {
      const result = await resetPassword({
        reset_token: resetToken,
        new_password: values.new_password,
      }).unwrap();

      // The mutation's onQueryStarted has already written cookies, primed
      // authSlice, and reset cached data. All that's left is the redirect.
      toast.success("Password updated. Signing you in…");
      const target =
        (result.user?.role && ROLE_TO_PATH[result.user.role]) || "/";
      router.replace(target);
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      const msg = getApiErrorMessage(err, "Failed to reset password.");

      if (status === 401 || /reset token|confirmation token/i.test(msg)) {
        toast.error("Your reset session expired. Please start over.");
        onTokenExpired();
        return;
      }
      if (/different from the current password/i.test(msg)) {
        // The backend rejects re-using the same password — keep the user on
        // this step and prompt them to pick a fresh one.
        toast.error("New password must differ from your current one.");
        return;
      }
      toast.error(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2 text-center lg:text-left">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Choose a new password
        </h2>
        <p className="text-sm text-muted-foreground">
          You&apos;ll be signed in automatically once it&apos;s set. Make it
          strong and unique.
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
            Resetting & signing in…
          </>
        ) : (
          "Reset password"
        )}
      </Button>
    </form>
  );
}

// ─── Wizard ────────────────────────────────────────────────────────────────

export function ForgotPassword() {
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  // Reset token lives ONLY in component state — never in localStorage,
  // never in cookies. Cleared automatically when the component unmounts
  // or the user successfully resets (then real auth tokens take over).
  const [resetToken, setResetToken] = useState<string>("");
  const [resendAt, setResendAt] = useState<number>(0);

  const restartFlow = (preservedEmail = email) => {
    setStep(1);
    setEmail(preservedEmail);
    setResetToken("");
    setResendAt(0);
  };

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
              Reset your password in three quick steps and get straight back
              to coordinating referrals.
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

            <StepIndicator step={step} />

            {step === 1 && (
              <EmailStep
                email={email}
                onComplete={(e) => {
                  setEmail(e);
                  setResendAt(Date.now() + RESEND_COOLDOWN_SECONDS * 1000);
                  setStep(2);
                }}
              />
            )}
            {step === 2 && (
              <VerifyStep
                email={email}
                initialResendAt={resendAt}
                onBack={() => restartFlow()}
                onComplete={(token, nextResendAt) => {
                  setResetToken(token);
                  setResendAt(nextResendAt);
                  setStep(3);
                }}
              />
            )}
            {step === 3 && (
              <ResetStep
                resetToken={resetToken}
                onTokenExpired={() => restartFlow()}
              />
            )}
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
