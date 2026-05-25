"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import {
  useLoginMutation,
  useMfaVerifyMutation,
  type MfaChannel,
} from "@/features/auth/authApi";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/apiError";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/store/hooks";
import { resetAuthSession } from "@/lib/resetApiCaches";

// Mirror of the role → landing route table used elsewhere (forgot-password,
// auth initializer). Keep them in sync. The map is keyed on the JWT `role`
// claim that the server embeds in `access_token`.
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

// Server-configured cooldown is ~60s; mirror it client-side so the
// "Resend code" button shows a countdown instead of a hard 429.
const RESEND_COOLDOWN_SECONDS = 60;

// Whether the deployment exposes the SMS option on the login form. The
// backend only honours `mfa_channel: "sms"` when `sms_otp_enabled` is
// true server-side; this env flag is purely a UI gate so we don't show
// an option that the server will ignore.
const SMS_OTP_AVAILABLE =
  process.env.NEXT_PUBLIC_SMS_OTP_ENABLED === "true";

// ─── Schemas ───────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email("Please enter a valid hospital email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Backend requires exactly 6 numeric digits — anything else is a 400.
const otpSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/u, "Enter the 6-digit code"),
});

type OtpFormValues = z.infer<typeof otpSchema>;

// ─── State carried between credentials and OTP screens ─────────────────────

interface MfaState {
  mfaToken: string;
  channel: MfaChannel;
  email: string;
  /**
   * Password is held in memory ONLY to support "Resend code", which
   * re-issues POST /auth/login under the hood. It's never written to
   * any cookie / storage and is wiped the moment the MFA step succeeds
   * or the user navigates back to the credentials screen.
   */
  password: string;
  /** Unix-ms timestamp when "Resend code" becomes available again. */
  resendAt: number;
}

type Stage =
  | { kind: "credentials" }
  | { kind: "mfa"; state: MfaState };

// ─── Component ─────────────────────────────────────────────────────────────

const Login = () => {
  const [stage, setStage] = useState<Stage>({ kind: "credentials" });
  const router = useRouter();
  const dispatch = useAppDispatch();

  const redirectByRole = (role: string | undefined) => {
    const target = (role && ROLE_TO_PATH[role]) || "/";
    router.replace(target);
  };

  // The two stages are isolated components so each can own its own form
  // state without leaking RHF instances across stage transitions.
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1">
        <BrandPanel
          title={stage.kind === "mfa" ? "Almost there" : "Hospital Referral Hub"}
          subtitle={
            stage.kind === "mfa"
              ? "Confirm the verification code we just sent to keep your account secure."
              : "Digital referral coordination platform for Ethiopian hospitals. Send, review, and track patient referrals in real-time."
          }
        />

        <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-sm space-y-6">
            <MobileLogo />

            {stage.kind === "credentials" ? (
              <CredentialsForm
                onMfaChallenge={(state) =>
                  setStage({ kind: "mfa", state })
                }
                onLoggedIn={(role) => {
                  // Cookies + setUser already happened in the mutation's
                  // onQueryStarted. Do NOT call resetAuthSession here —
                  // it would clear the cookies we just wrote and bounce
                  // the user back to /login from the route guard.
                  toast.success("Welcome back!");
                  redirectByRole(role);
                }}
                onBeforeSubmit={() => resetAuthSession(dispatch)}
              />
            ) : (
              <MfaForm
                state={stage.state}
                onUpdateState={(next) =>
                  setStage({ kind: "mfa", state: next })
                }
                onLoggedIn={(role) => {
                  toast.success("Welcome back!");
                  redirectByRole(role);
                }}
                onAbort={() => setStage({ kind: "credentials" })}
              />
            )}

            <div className="relative">
              <Separator />
            </div>
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
};

export default Login;

// ─── Stage 1 — Credentials ─────────────────────────────────────────────────

function CredentialsForm({
  onMfaChallenge,
  onLoggedIn,
  onBeforeSubmit,
}: {
  onMfaChallenge: (state: MfaState) => void;
  onLoggedIn: (role: string | undefined) => void;
  onBeforeSubmit: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [channel, setChannel] = useState<MfaChannel>("email");
  const [login, { isLoading }] = useLoginMutation();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    onBeforeSubmit();
    try {
      const result = await login({
        email: values.email,
        password: values.password,
        // Only send `mfa_channel` when the deployment exposes the picker
        // AND the user explicitly chose SMS. Sending it with `email` is
        // harmless but noisy; sending it when SMS is disabled would be
        // ignored anyway.
        ...(SMS_OTP_AVAILABLE && channel === "sms"
          ? { mfa_channel: "sms" as const }
          : {}),
      }).unwrap();

      if (result.kind === "complete") {
        onLoggedIn(result.user?.role);
        return;
      }

      // MFA is enabled — hand off the mfa_token (and credentials, so the
      // user can hit Resend without retyping) to the OTP screen.
      onMfaChallenge({
        mfaToken: result.mfa_token,
        channel: result.channel,
        email: values.email,
        password: values.password,
        resendAt: Date.now() + RESEND_COOLDOWN_SECONDS * 1000,
      });
      toast.success(
        result.channel === "sms"
          ? "We sent a code to your phone."
          : "We sent a code to your email.",
      );
    } catch (error: unknown) {
      toast.error(
        getApiErrorMessage(error, "Invalid credentials. Please try again."),
      );
    }
  };

  return (
    <>
      <div className="space-y-2 text-center lg:text-left">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back
        </h2>
        <p className="text-sm text-muted-foreground">
          Sign in to access the referral system
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="name@hospital.gov.et"
                      autoComplete="email"
                      className="pl-10 h-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="pl-10 pr-10 h-10"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {SMS_OTP_AVAILABLE && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Send verification code via
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <ChannelChoice
                  active={channel === "email"}
                  onClick={() => setChannel("email")}
                  icon={<Mail className="h-4 w-4" />}
                  label="Email"
                />
                <ChannelChoice
                  active={channel === "sms"}
                  onClick={() => setChannel("sms")}
                  icon={<MessageSquare className="h-4 w-4" />}
                  label="SMS"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                SMS is sent to the phone number on your profile. Falls back
                to email if no number is set.
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            <Link
              href="/forgot-password"
              className="font-semibold text-primary hover:underline"
            >
              Forgot your password?
            </Link>
          </p>
        </form>
      </Form>
    </>
  );
}

function ChannelChoice({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-primary bg-primary/5 text-primary"
          : "border-border bg-background text-muted-foreground hover:bg-muted"
      }`}
      aria-pressed={active}
    >
      {icon}
      {label}
    </button>
  );
}

// ─── Stage 2 — MFA OTP ─────────────────────────────────────────────────────

function MfaForm({
  state,
  onUpdateState,
  onLoggedIn,
  onAbort,
}: {
  state: MfaState;
  onUpdateState: (next: MfaState) => void;
  onLoggedIn: (role: string | undefined) => void;
  onAbort: () => void;
}) {
  const [verify, { isLoading: isVerifying }] = useMfaVerifyMutation();
  const [resendLogin, { isLoading: isResending }] = useLoginMutation();

  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  // Tick once per second so the resend countdown stays current.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const secondsLeft = Math.max(0, Math.ceil((state.resendAt - now) / 1000));
  const canResend = secondsLeft <= 0 && !isResending;

  // Auto-focus the OTP input the first time the MFA screen mounts so the
  // user can paste / type without an extra click.
  const codeInputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    codeInputRef.current?.focus();
  }, []);

  const onSubmit = async (values: OtpFormValues) => {
    try {
      const result = await verify({
        mfa_token: state.mfaToken,
        code: values.code,
      }).unwrap();
      onLoggedIn(result.user?.role);
    } catch (error: unknown) {
      const status = (error as { status?: number })?.status;
      const msg = getApiErrorMessage(error, "OTP verification failed.");

      // If the MFA token itself is dead the only valid path is to start
      // over from the credentials screen — the server won't accept any
      // more OTPs against this token.
      if (
        status === 401 &&
        /MFA token|MFA intermediate|expired MFA/i.test(msg)
      ) {
        toast.error("Your MFA session expired. Please sign in again.");
        onAbort();
        return;
      }

      if (/attempts exceeded/i.test(msg)) {
        toast.error("Too many wrong codes. Request a new one.");
        form.setValue("code", "");
        return;
      }

      toast.error(msg);
      form.setValue("code", "");
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      const result = await resendLogin({
        email: state.email,
        password: state.password,
        ...(SMS_OTP_AVAILABLE && state.channel === "sms"
          ? { mfa_channel: "sms" as const }
          : {}),
      }).unwrap();

      // If config flipped to MFA-off between our two requests the server
      // will hand us a completed login. Bail out of this screen and let
      // the caller handle the redirect — this is rare but worth handling.
      if (result.kind === "complete") {
        onLoggedIn(result.user?.role);
        return;
      }

      onUpdateState({
        ...state,
        mfaToken: result.mfa_token,
        channel: result.channel,
        resendAt: Date.now() + RESEND_COOLDOWN_SECONDS * 1000,
      });
      form.setValue("code", "");
      toast.success(
        result.channel === "sms"
          ? "A new code is on its way to your phone."
          : "A new code is on its way to your email.",
      );
    } catch (error: unknown) {
      const msg = getApiErrorMessage(error, "Could not resend code.");
      // Cooldown 429: the server already returns a specific message; we
      // surface it as-is so users see the exact wait time. A countdown
      // timer below the button still drives the disabled state.
      toast.error(msg);
    }
  };

  const channelLabel =
    state.channel === "sms" ? "your phone" : "your email";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2 text-center lg:text-left">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Verify it&apos;s you
          </h2>
          <p className="text-sm text-muted-foreground">
            We sent a 6-digit code to {channelLabel}{" "}
            <span className="font-semibold text-foreground">
              ({state.email})
            </span>
            . The code expires in 5 minutes.
          </p>
        </div>

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Verification code</FormLabel>
              <FormControl>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...field}
                    ref={(node) => {
                      field.ref(node);
                      codeInputRef.current = node;
                    }}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    maxLength={6}
                    className="pl-10 h-10 tracking-[0.5em] font-mono text-center"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full gap-2"
          size="lg"
          disabled={isVerifying}
        >
          {isVerifying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying…
            </>
          ) : (
            <>
              Verify and sign in
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        <div className="flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onAbort}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Use a different account
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
    </Form>
  );
}

// ─── Layout pieces ─────────────────────────────────────────────────────────

function BrandPanel({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
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
          {title}
        </h1>
        <p className="text-lg text-primary-foreground/70">{subtitle}</p>
      </div>
    </div>
  );
}

function MobileLogo() {
  return (
    <div className="flex flex-col items-center lg:hidden">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
        <Activity className="h-7 w-7 text-primary-foreground" />
      </div>
      <h2 className="text-xl font-bold text-foreground">
        Hospital Referral Hub
      </h2>
    </div>
  );
}
