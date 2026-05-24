"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MohAnalyticsLoadingProps {
  className?: string;
  children?: React.ReactNode;
}

export function MohAnalyticsLoading({
  className,
  children,
}: MohAnalyticsLoadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 animate-pulse text-muted-foreground",
        className,
      )}
    >
      {children ?? (
        <>
          <div className="h-8 w-8 rounded-full bg-muted" />
          <p className="text-xs font-medium">Loading analytics…</p>
        </>
      )}
    </div>
  );
}

interface MohAnalyticsErrorProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function MohAnalyticsError({
  message = "Failed to load analytics data.",
  onRetry,
  className,
}: MohAnalyticsErrorProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center",
        className,
      )}
    >
      <AlertCircle className="h-8 w-8 text-destructive" />
      <p className="text-sm font-medium text-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          Retry
        </Button>
      )}
    </div>
  );
}

interface MohAnalyticsEmptyProps {
  message?: string;
  className?: string;
}

export function MohAnalyticsEmpty({
  message = "No data for the selected period or filters.",
  className,
}: MohAnalyticsEmptyProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border border-border/40 bg-muted/30 p-8 text-center",
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

interface MohQueryStateProps {
  isLoading: boolean;
  isError: boolean;
  isEmpty?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
  onRetry?: () => void;
  loadingClassName?: string;
  className?: string;
  children?: React.ReactNode;
}

/** Wraps chart/card content with loading, error, or empty handling */
export function MohQueryState({
  isLoading,
  isError,
  isEmpty = false,
  errorMessage,
  emptyMessage,
  onRetry,
  loadingClassName,
  className,
  children,
}: MohQueryStateProps) {
  if (isLoading) {
    return <MohAnalyticsLoading className={loadingClassName ?? "min-h-[120px]"} />;
  }
  if (isError) {
    return (
      <MohAnalyticsError
        message={errorMessage}
        onRetry={onRetry}
        className={className}
      />
    );
  }
  if (isEmpty) {
    return <MohAnalyticsEmpty message={emptyMessage} className={className} />;
  }
  return children ? <>{children}</> : null;
}
