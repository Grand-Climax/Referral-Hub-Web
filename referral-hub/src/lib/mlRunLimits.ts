export const ML_COOLDOWN_MS = 60_000;
export const MAX_SUCCESSFUL_RERUNS = 3;
/** Stop "Analyzing" and offer rerun if still PENDING after this (ms) */
export const ML_PENDING_TIMEOUT_MS = 120_000;

export interface MlRunReferralFields {
  ml_status?: string | null;
  ml_run_started_at?: string | null;
  ml_successful_rerun_count?: number | null;
}

export function normalizeMlStatus(status?: string | null) {
  return (status ?? "PENDING").trim().toUpperCase();
}

export function isRerunQuotaExhausted(referral: MlRunReferralFields) {
  return (referral.ml_successful_rerun_count ?? 0) >= MAX_SUCCESSFUL_RERUNS;
}

export function computeMlRunState(
  referral: MlRunReferralFields,
  pendingSinceMs: number | null,
  nowMs = Date.now(),
) {
  const mlStatus = normalizeMlStatus(referral.ml_status);
  const isPending = mlStatus === "PENDING";

  const startedAtMs =
    pendingSinceMs ??
    (referral.ml_run_started_at
      ? new Date(referral.ml_run_started_at).getTime()
      : null);

  const pendingElapsedMs =
    startedAtMs != null ? Math.max(0, nowMs - startedAtMs) : 0;

  const isTimedOut =
    isPending &&
    startedAtMs != null &&
    pendingElapsedMs >= ML_PENDING_TIMEOUT_MS;

  return {
    mlStatus,
    isPending,
    isTimedOut,
    showAnalyzing: isPending && !isTimedOut,
    shouldPollReferral: isPending && !isTimedOut,
    pendingElapsedMs,
    pendingRemainingMs: isPending && startedAtMs != null
      ? Math.max(0, ML_PENDING_TIMEOUT_MS - pendingElapsedMs)
      : 0,
  };
}
