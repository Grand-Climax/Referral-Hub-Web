"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

export function TextInput({ label, icon, className, ...props }: TextInputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <Label className="text-xs font-medium text-muted-foreground">
          {label}
        </Label>
      )}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
            {icon}
          </span>
        )}
        <Input
          className={cn("h-11", icon && "pl-9", className)}
          {...props}
        />
      </div>
    </div>
  );
}

