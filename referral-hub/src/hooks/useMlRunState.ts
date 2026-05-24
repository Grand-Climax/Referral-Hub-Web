"use client";

import { useEffect, useState } from "react";
import {
  computeMlRunState,
  type MlRunReferralFields,
} from "@/lib/mlRunLimits";

export function useMlRunState(referral: MlRunReferralFields) {
  const mlStatus = (referral.ml_status ?? "PENDING").toUpperCase();
  const [pendingSinceMs, setPendingSinceMs] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (mlStatus !== "PENDING") {
      setPendingSinceMs(null);
      return;
    }

    const startedAt = referral.ml_run_started_at
      ? new Date(referral.ml_run_started_at).getTime()
      : Date.now();

    setPendingSinceMs(Number.isNaN(startedAt) ? Date.now() : startedAt);

    const intervalId = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, [mlStatus, referral.ml_run_started_at]);

  return computeMlRunState(referral, pendingSinceMs, nowMs);
}
