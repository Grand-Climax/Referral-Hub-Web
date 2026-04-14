import { ReferralStatus } from "@/types/referral";

export const REFERRAL_STATUSES: ReferralStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "COMPLETED",
];

export const URGENCY_LEVELS = ["low", "medium", "high", "critical"] as const;
