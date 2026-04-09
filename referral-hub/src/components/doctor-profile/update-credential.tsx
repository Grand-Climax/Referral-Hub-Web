"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/passwordinput";
import { Lock, Shield, MessageCircle, Smartphone } from "lucide-react";

export function UpdateCredentialForm() {
  return (
    <Card className="border-0 bg-transparent shadow-none">
      <CardHeader className="px-2 pb-6 pt-0">
        <CardTitle className="text-xl font-bold tracking-tight">
          Security Credentials
        </CardTitle>
        <p className="text-sm font-medium text-muted-foreground">
          Ensure your account remains secure with strong authentication.
        </p>
      </CardHeader>
      <CardContent className="space-y-8 p-2">
        <div className="space-y-5 rounded-2xl border border-border/50 bg-muted/30 p-5 md:p-7 transition-colors hover:bg-muted/50">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
              <Lock className="h-5 w-5" />
            </span>
            <p className="text-base font-semibold text-foreground">
              Update Password
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <PasswordInput label="Current Password" />
            <PasswordInput label="New Password" />
            <PasswordInput label="Confirm New Password" />
          </div>
        </div>

        <div className="space-y-5 rounded-2xl border border-border/50 bg-muted/30 p-5 md:p-7 transition-colors hover:bg-muted/50">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
                <Shield className="h-5 w-5" />
              </span>
              <p className="text-base font-semibold text-foreground">
                Two-Factor Authentication
              </p>
            </div>
            <Badge variant="secondary" className="text-[11px]">
              Recommended
            </Badge>
          </div>

          <div className="space-y-4 gap-2">
            <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background px-5 py-4 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MessageCircle className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    SMS Authentication
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Receive a code via text message to your registered phone.
                  </p>
                </div>
              </div>
              <Checkbox
                defaultChecked
                aria-label="Enable SMS authentication"
                className="size-3 scale-60 border border-black/30"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background px-5 py-4 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Smartphone className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Authenticator App
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Use Google Authenticator or Microsoft Authenticator.
                  </p>
                </div>
              </div>
              <Checkbox
                aria-label="Enable authenticator app"
                className="size-3 scale-60 border border-black/30"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-border/50 pt-8 mt-2">
          <Button type="button" variant="outline" className="h-11 px-6 rounded-xl font-medium border-border/50">
            Cancel
          </Button>
          <Button type="button" className="h-11 px-6 rounded-xl font-medium shadow-md transition-transform hover:scale-[1.02]">
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
