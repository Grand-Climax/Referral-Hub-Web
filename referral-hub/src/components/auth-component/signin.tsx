"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff, Lock, Mail, Activity, Loader2 } from "lucide-react";
import Link from "next/link";
import { useLoginMutation } from "@/features/auth/authApi";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/apiError";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/store/hooks";
import { resetAuthSession } from "@/lib/resetApiCaches";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid hospital email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading }] = useLoginMutation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    resetAuthSession(dispatch);

    try {
      const result = await login({
        email: values.email,
        password: values.password,
      }).unwrap();

      toast.success("Welcome back!");

      // Redirect based on user role
      // Redirect based on user role using the correct mapping
      const roleToPath: Record<string, string> = {
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

      if (result.user && result.user.role) {
        const targetPath = roleToPath[result.user.role] || "/";
        router.replace(targetPath);
      }
    } catch (error: unknown) {
      toast.error(
        getApiErrorMessage(error, "Invalid credentials. Please try again."),
      );
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1">
        {/* Left Panel */}
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
              Hospital Referral Hub
            </h1>
            <p className="text-lg text-primary-foreground/70">
              Digital referral coordination platform for Ethiopian hospitals.
              Send, review, and track patient referrals in real-time.
            </p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-sm space-y-6">
            {/* Mobile Logo */}
            <div className="flex flex-col items-center lg:hidden">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
                <Activity className="h-7 w-7 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Hospital Referral Hub
              </h2>
            </div>

            <div className="space-y-2 text-center lg:text-left">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Welcome back
              </h2>
              <p className="text-sm text-muted-foreground">
                Sign in to access the referral system
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
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
                            className="pl-10 pr-10 h-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
