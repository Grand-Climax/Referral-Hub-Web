"use client";

import * as React from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(function PasswordInput({ label, className, ...props }, ref) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-1.5">
      {label && (
        <Label className="text-xs font-medium text-muted-foreground">
          {label}
        </Label>
      )}
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn("h-11 pr-10", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
});
