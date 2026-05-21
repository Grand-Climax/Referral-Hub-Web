"use client";

import { FormEvent, useEffect, useState } from "react";
import { AlertCircle, Loader2, RefreshCcw, Save, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  useGetSystemConfigQuery,
  useUpdateSystemConfigMutation,
} from "@/features/adminConfig/adminConfigApi";
import { SYSTEM_CONFIG_SECTIONS } from "@/types/system-config";
import type { SystemConfigFieldMeta } from "@/types/system-config";

function isConfigTruthy(value: string | undefined) {
  return value === "true" || value === "1";
}

function formatReadonlyValue(value: string | undefined) {
  if (!value) return "—";
  const parsed = Date.parse(value);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed).toLocaleString();
  }
  return value;
}

function ConfigField({
  field,
  value,
  onChange,
  disabled,
}: {
  field: SystemConfigFieldMeta;
  value: string;
  onChange: (key: string, value: string) => void;
  disabled?: boolean;
}) {
  if (field.type === "readonly") {
    return (
      <p className="rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
        {formatReadonlyValue(value)}
      </p>
    );
  }

  if (field.type === "boolean") {
    return (
      <div className="flex items-center gap-3">
        <Switch
          id={field.key}
          checked={isConfigTruthy(value)}
          disabled={disabled}
          onCheckedChange={(checked) =>
            onChange(field.key, checked ? "true" : "false")
          }
        />
        <span className="text-sm text-muted-foreground">
          {isConfigTruthy(value) ? "Enabled" : "Disabled"}
        </span>
      </div>
    );
  }

  return (
    <Input
      id={field.key}
      type={field.type === "number" ? "number" : "text"}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(field.key, event.target.value)}
      className="max-w-md"
    />
  );
}

export function SystemConfigManagement() {
  const {
    data: config,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetSystemConfigQuery();
  const [updateConfig, { isLoading: isSaving }] = useUpdateSystemConfigMutation();

  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (config) {
      setFormValues({ ...config });
      setIsDirty(false);
    }
  }, [config]);

  const handleChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const payload = { ...formValues };
    for (const section of SYSTEM_CONFIG_SECTIONS) {
      for (const field of section.fields) {
        if (field.type === "readonly") {
          delete payload[field.key];
        }
      }
    }

    try {
      await updateConfig(payload).unwrap();
      toast.success("System configuration updated.");
      setIsDirty(false);
      await refetch();
    } catch (error) {
      console.error(error);
      toast.error("Could not update system configuration.");
    }
  };

  const handleReset = () => {
    if (config) {
      setFormValues({ ...config });
      setIsDirty(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading system configuration...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <AlertCircle className="h-10 w-10 text-destructive opacity-50" />
        <div className="text-center">
          <h2 className="text-lg font-semibold">Failed to load configuration</h2>
          <p className="text-sm text-muted-foreground">
            Please check your connection and try again.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Settings2 className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold tracking-tight">
              System configuration
            </h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Manage global platform settings for scheduling, notifications, and
            authentication. Changes apply system-wide for all hospitals and users.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching || isSaving}
            className="gap-2"
          >
            {isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
            Refresh
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={!isDirty || isSaving}
          >
            Discard changes
          </Button>
          <Button type="submit" disabled={!isDirty || isSaving} className="gap-2">
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save changes
          </Button>
        </div>
      </div>

      {SYSTEM_CONFIG_SECTIONS.map((section) => (
        <Card
          key={section.id}
          className="border-border/60 bg-background/80 shadow-sm"
        >
          <CardHeader>
            <CardTitle className="text-base">{section.title}</CardTitle>
            <CardDescription>{section.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {section.fields.map((field) => (
              <div
                key={field.key}
                className="grid gap-2 border-b border-border/40 pb-6 last:border-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,280px)] sm:items-start sm:gap-6"
              >
                <div className="space-y-1">
                  <Label htmlFor={field.key} className="text-sm font-medium">
                    {field.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {field.description}
                  </p>
                </div>
                <ConfigField
                  field={field}
                  value={formValues[field.key] ?? ""}
                  onChange={handleChange}
                  disabled={isSaving || field.type === "readonly"}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </form>
  );
}
