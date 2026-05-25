"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  AlertCircle,
  BrainCircuit,
  Loader2,
  RefreshCw,
  Stethoscope,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGetCurrentUserQuery } from "@/features/auth/authApi";
import {
  useGetMlPredictionQuery,
  useOverrideMlSeverityMutation,
  useRerunMlPredictionMutation,
} from "@/features/specialist/specialistApi";
import { getApiErrorMessage } from "@/lib/apiError";
import {
  MAX_SUCCESSFUL_RERUNS,
  ML_COOLDOWN_MS,
  isRerunQuotaExhausted,
} from "@/lib/mlRunLimits";
import { useMlRunState } from "@/hooks/useMlRunState";
import type { SpecialistReferralDetailResponse } from "@/types/specialist";
import { cn } from "@/lib/utils";
import { MlSeverityOverrideDialog } from "./ml-severity-override-dialog";

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

function normalizeId(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

function idsMatch(a?: string | null, b?: string | null) {
  const left = normalizeId(a);
  const right = normalizeId(b);
  return Boolean(left) && Boolean(right) && left === right;
}

function humanize(value?: string | null) {
  if (!value) return "—";
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function scoreToTier(score: number) {
  if (score >= 80) return "CRITICAL";
  if (score >= 60) return "HIGH";
  if (score >= 35) return "MODERATE";
  return "LOW";
}

function tierStyles(tier?: string | null) {
  switch ((tier ?? "").toUpperCase()) {
    case "CRITICAL":
      return "text-rose-700 bg-rose-50 border-rose-200";
    case "HIGH":
      return "text-orange-700 bg-orange-50 border-orange-200";
    case "MODERATE":
      return "text-amber-700 bg-amber-50 border-amber-200";
    case "LOW":
      return "text-emerald-700 bg-emerald-50 border-emerald-200";
    default:
      return "text-blue-700 bg-blue-50 border-blue-200";
  }
}

function useMlCooldownRemaining(mlLastFailedAt?: string | null) {
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    if (!mlLastFailedAt) {
      setRemainingSeconds(0);
      return;
    }

    const failedAt = new Date(mlLastFailedAt).getTime();
    const cooldownEndsAt = failedAt + ML_COOLDOWN_MS;

    const tick = () => {
      setRemainingSeconds(
        Math.max(0, Math.ceil((cooldownEndsAt - Date.now()) / 1000)),
      );
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [mlLastFailedAt]);

  return remainingSeconds;
}

function collectExplanationItems(
  referral: SpecialistReferralDetailResponse,
  prediction: ReturnType<typeof useGetMlPredictionQuery>["data"],
): string[] {
  if (Array.isArray(referral.ml_explanations) && referral.ml_explanations.length > 0) {
    return referral.ml_explanations;
  }

  const topFeatures = prediction?.explanation?.top_features;
  if (Array.isArray(topFeatures) && topFeatures.length > 0) {
    return topFeatures;
  }

  return [];
}

interface MlInsightsCardProps {
  referralId: string;
  referral: SpecialistReferralDetailResponse;
}

export function MlInsightsCard({ referralId, referral }: MlInsightsCardProps) {
  const { data: currentUser } = useGetCurrentUserQuery();
  const [isOverrideDialogOpen, setIsOverrideDialogOpen] = useState(false);
  const mlRunState = useMlRunState(referral);
  const { mlStatus, showAnalyzing, isTimedOut, pendingRemainingMs } = mlRunState;
  const isManualOverride = mlStatus === "MANUAL";
  const shouldFetchPrediction = mlStatus === "SUCCESS";

  const {
    data: prediction,
    isFetching: isFetchingPrediction,
    refetch: refetchPrediction,
  } = useGetMlPredictionQuery(referralId, {
    skip: !shouldFetchPrediction,
  });

  const [rerunMl, { isLoading: isRerunning }] = useRerunMlPredictionMutation();
  const [overrideMlSeverity, { isLoading: isOverriding }] =
    useOverrideMlSeverityMutation();
  const cooldownRemaining = useMlCooldownRemaining(referral.ml_last_failed_at);

  const isReceivingSpecialist =
    (currentUser?.role ?? "").toUpperCase() === "RECEIVING_SPECIALIST";
  const referralStatus = String(referral.status ?? "").toUpperCase();
  const isUnderSpecialistReview =
    referralStatus === "UNDER_SPECIALIST_REVIEW";
  const assignedToAnotherSpecialist =
    Boolean(referral.specialist_id) &&
    Boolean(currentUser?.id) &&
    !idsMatch(referral.specialist_id, currentUser?.id);
  const rerunQuotaExhausted = isRerunQuotaExhausted(referral);
  const showRerunButton =
    isReceivingSpecialist &&
    !assignedToAnotherSpecialist &&
    mlStatus !== "SKIPPED" &&
    !isManualOverride &&
    !rerunQuotaExhausted &&
    (mlStatus === "FAILED" ||
      isTimedOut ||
      (isUnderSpecialistReview && mlStatus !== "PENDING"));
  const showOverrideButton =
    isReceivingSpecialist &&
    isUnderSpecialistReview &&
    !assignedToAnotherSpecialist &&
    mlStatus === "SUCCESS";
  const canRerun =
    showRerunButton &&
    cooldownRemaining === 0 &&
    !isRerunning;
  const rerunBlockedReason = !isReceivingSpecialist
    ? "Only receiving specialists can rerun ML scoring."
    : !isUnderSpecialistReview
      ? "Rerun is available while the referral is under specialist review."
      : assignedToAnotherSpecialist
        ? "This referral is assigned to another specialist."
        : mlStatus === "MANUAL"
          ? "Manual severity override is already applied."
          : rerunQuotaExhausted
            ? `Maximum successful reruns reached (${MAX_SUCCESSFUL_RERUNS}).`
            : null;

  const displayScore = useMemo(() => {
    if (isManualOverride && referral.ml_severity_score != null) {
      return referral.ml_severity_score;
    }
    if (prediction?.output_score != null) {
      return prediction.output_score;
    }
    if (referral.ml_severity_score != null) {
      return referral.ml_severity_score;
    }
    return null;
  }, [isManualOverride, prediction, referral.ml_severity_score]);

  const displayTier = useMemo(() => {
    if (isManualOverride && displayScore != null) {
      return scoreToTier(displayScore);
    }
    return (
      prediction?.severity_tier ??
      referral.ml_severity_tier ??
      (displayScore != null ? scoreToTier(displayScore) : null)
    );
  }, [
    isManualOverride,
    displayScore,
    prediction?.severity_tier,
    referral.ml_severity_tier,
  ]);

  const explanationItems = collectExplanationItems(referral, prediction);
  const modelVersion =
    prediction?.model_version ?? referral.ml_model_version ?? "—";

  const handleRerun = async () => {
    try {
      await rerunMl(referralId).unwrap();
      toast.success("ML scoring scheduled. Results will update shortly.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not rerun ML scoring."));
    }
  };

  const handleOverride = async ({
    score,
    justification,
  }: {
    score: number;
    justification: string;
  }) => {
    try {
      await overrideMlSeverity({
        referralId,
        body: { score, justification },
      }).unwrap();
      toast.success("Severity score manually overridden.");
      setIsOverrideDialogOpen(false);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Could not apply manual severity override."),
      );
    }
  };

  if (mlStatus === "SKIPPED") {
    return null;
  }

  return (
    <Card className="overflow-hidden border-blue-200 bg-blue-50/30 shadow-sm">
      <div className="flex items-center justify-between bg-blue-600 px-4 py-3 text-white">
        <div className="flex items-center gap-2 font-semibold">
          <BrainCircuit className="h-5 w-5" />
          ML Insights
        </div>
        {isManualOverride ? (
          <Badge
            variant="secondary"
            className="border-0 bg-amber-500/40 text-[10px] uppercase tracking-wider text-white hover:bg-amber-500/40"
          >
            Manual Clinical Override
          </Badge>
        ) : mlStatus === "SUCCESS" ? (
          <Badge
            variant="secondary"
            className="border-0 bg-blue-500/30 text-[10px] uppercase tracking-wider text-white hover:bg-blue-500/30"
          >
            {modelVersion}
          </Badge>
        ) : null}
      </div>

      <CardContent className="space-y-4 p-5">
        {showAnalyzing ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <div>
              <p className="text-sm font-semibold text-blue-700">Analyzing…</p>
              <p className="mt-1 text-xs text-muted-foreground">
                ML scoring is running in the background.
              </p>
              {pendingRemainingMs > 0 ? (
                <p className="mt-2 text-[11px] text-blue-600">
                  Rerun available in{" "}
                  {formatDuration(Math.ceil(pendingRemainingMs / 1000))} if no
                  result
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {isTimedOut ? (
          <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-amber-900">
                  No ML prediction after 2 minutes
                </p>
                <p className="text-xs text-amber-800">
                  Scoring did not finish in time. Use rerun below to try again.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {mlStatus === "FAILED" ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-rose-800">
                    ML scoring failed
                  </p>
                  <p className="text-xs text-rose-700">
                    {referral.ml_last_error ||
                      "The ML service could not complete scoring for this referral."}
                  </p>
                </div>
              </div>
            </div>

            {rerunQuotaExhausted ? (
              <p className="text-center text-xs text-muted-foreground">
                Maximum successful reruns reached ({MAX_SUCCESSFUL_RERUNS}).
              </p>
            ) : null}
          </div>
        ) : null}

        {isManualOverride ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-amber-700">
                  Clinical severity (manual)
                </p>
                <p
                  className={cn(
                    "text-2xl font-black",
                    tierStyles(displayTier).split(" ")[0],
                  )}
                >
                  {humanize(displayTier)}
                </p>
              </div>
              {displayScore != null ? (
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-amber-500 bg-white shadow-sm">
                  <span className="text-xl font-bold text-amber-800">
                    {displayScore % 1 === 0
                      ? Math.round(displayScore)
                      : displayScore.toFixed(1)}
                  </span>
                </div>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">
              Severity: {displayScore != null ? displayScore.toFixed(1) : "—"}{" "}
              (manually overridden)
            </p>
            {referral.triage_status?.toUpperCase() === "OVERRIDDEN" ? (
              <p className="text-xs font-medium text-amber-800">
                Triage status: Overridden by clinician
              </p>
            ) : null}
            <p className="rounded-lg border border-amber-100 bg-amber-50/80 p-3 text-xs text-amber-900">
              Automated ML explanations are not available after a manual
              clinical override.
            </p>
          </div>
        ) : null}

        {mlStatus === "SUCCESS" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-blue-600">
                  Triage severity
                </p>
                <p
                  className={cn(
                    "text-2xl font-black",
                    tierStyles(displayTier).split(" ")[0],
                  )}
                >
                  {humanize(displayTier)}
                </p>
              </div>
              {displayScore != null ? (
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-blue-500 bg-white shadow-sm">
                  <span className="text-xl font-bold text-blue-700">
                    {Math.round(displayScore)}
                  </span>
                </div>
              ) : null}
            </div>

            {prediction?.confidence_level != null ? (
              <p className="text-xs text-muted-foreground">
                Model confidence:{" "}
                <span className="font-medium text-foreground">
                  {Math.round(prediction.confidence_level * 100)}%
                </span>
              </p>
            ) : null}

            {prediction?.predicted_at ? (
              <p className="text-xs text-muted-foreground">
                Scored {format(new Date(prediction.predicted_at), "PPp")}
                {prediction.processing_time_ms != null
                  ? ` · ${Math.round(prediction.processing_time_ms)} ms`
                  : ""}
              </p>
            ) : null}

            <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                <AlertCircle className="h-3.5 w-3.5" />
                Key factors
              </div>
              {isFetchingPrediction && explanationItems.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Loading prediction details…
                </p>
              ) : explanationItems.length > 0 ? (
                <ul className="space-y-2 text-xs text-slate-600">
                  {explanationItems.map((item) => (
                    <li key={item} className="flex items-start gap-1.5">
                      <span className="mt-1 text-blue-500">&bull;</span>
                      <span>{humanize(item)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No prediction explanation available.
                </p>
              )}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full text-blue-700 hover:bg-blue-50 hover:text-blue-800"
              onClick={() => void refetchPrediction()}
              disabled={isFetchingPrediction}
            >
              {isFetchingPrediction ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Refresh prediction details
            </Button>
          </div>
        ) : null}

        {mlStatus === "SUCCESS" || mlStatus === "FAILED" || showAnalyzing ? (
          <p className="text-center text-[11px] font-medium italic text-slate-500">
            AI-generated suggestion. Please verify clinically.
          </p>
        ) : null}

        {showOverrideButton ? (
          <div className="border-t border-blue-100 pt-4">
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 border-amber-300 bg-white font-semibold text-amber-800 hover:bg-amber-50"
              onClick={() => setIsOverrideDialogOpen(true)}
              disabled={isOverriding}
            >
              <Stethoscope className="h-4 w-4" />
              Manual severity override
            </Button>
          </div>
        ) : null}

        {showRerunButton ? (
          <div className="space-y-2 border-t border-blue-100 pt-4">
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 border-blue-300 bg-white font-semibold text-blue-700 hover:bg-blue-50"
              onClick={() => void handleRerun()}
              disabled={!canRerun}
            >
              {isRerunning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isRerunning
                ? "Scheduling rerun…"
                : cooldownRemaining > 0
                  ? `Rerun available in ${cooldownRemaining}s`
                  : "Rerun ML Prediction"}
            </Button>
            {referral.ml_successful_rerun_count != null &&
            referral.ml_successful_rerun_count > 0 ? (
              <p className="text-center text-[11px] text-muted-foreground">
                Successful reruns: {referral.ml_successful_rerun_count}/
                {MAX_SUCCESSFUL_RERUNS}
              </p>
            ) : null}
          </div>
        ) : isReceivingSpecialist && rerunBlockedReason ? (
          <p className="border-t border-blue-100 pt-4 text-center text-[11px] text-muted-foreground">
            {rerunBlockedReason}
          </p>
        ) : null}
      </CardContent>

      <MlSeverityOverrideDialog
        open={isOverrideDialogOpen}
        onOpenChange={setIsOverrideDialogOpen}
        onConfirm={handleOverride}
        isSubmitting={isOverriding}
        currentScore={displayScore}
      />
    </Card>
  );
}
