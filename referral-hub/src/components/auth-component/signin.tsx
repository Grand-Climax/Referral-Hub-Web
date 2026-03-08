'use client'
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Lock, Mail, Activity } from "lucide-react";
import { ROLE_LABELS, UserRole } from "@/types/referral";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const handleSubmit = (e: React.FormEvent) => {}

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1">
        {/* Left Panel */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-primary p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary-foreground/5" />
            <div className="absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary-foreground/5" />
            <div className="absolute top-[40%] left-[20%] w-[200px] h-[200px] rounded-full bg-primary-foreground/5" />
          </div>

          <div className="relative z-10 max-w-md text-center">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
              <Activity className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-primary-foreground">
              Hospital Referral Hub
            </h1>
            <p className="text-lg text-primary-foreground/70">
              Digital referral coordination platform for Ethiopian hospitals. Send, review, and track patient referrals in real-time.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 text-left">
              {[
                "Digital referral forms",
                "Real-time tracking",
                "Priority triage",
                "MoH analytics",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-primary-foreground/80">
                  <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                  {feature}
                </div>
              ))}
            </div>
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
              <h2 className="text-xl font-bold text-foreground">Hospital Referral Hub</h2>
            </div>

            <div className="space-y-2 text-center lg:text-left">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h2>
              <p className="text-sm text-muted-foreground">Sign in to access the referral system</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@hospital.gov.et"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" size="lg">
                Sign in
              </Button>
            </form>

            <div className="relative">
              <Separator />
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">© 2026 Hospital Referral Hub — Ethiopia</p>
          <p className="text-xs text-muted-foreground">Ministry of Health Digital Health Initiative</p>
        </div>
      </footer>
    </div>
  );
};

export default Login;
