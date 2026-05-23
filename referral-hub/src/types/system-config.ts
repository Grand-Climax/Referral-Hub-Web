export type SystemConfig = Record<string, string>;

export interface SystemConfigResponse {
  data?: SystemConfig;
  success?: boolean;
  message?: string;
}

export type SystemConfigFieldType = "boolean" | "number" | "text" | "readonly";

export interface SystemConfigFieldMeta {
  key: string;
  label: string;
  description: string;
  type: SystemConfigFieldType;
}

export const SYSTEM_CONFIG_SECTIONS = [
  {
    id: "scheduling",
    title: "Scheduling & capacity",
    description:
      "Controls referral aging, booking buffers, horizon limits, and background scheduling jobs.",
    fields: [
      {
        key: "aging_factor",
        label: "Aging factor",
        description: "Weight multiplier applied to referral aging calculations.",
        type: "number" as const,
      },
      {
        key: "buffer_days",
        label: "Buffer days",
        description: "Extra days reserved before scheduling appointments.",
        type: "number" as const,
      },
      {
        key: "max_horizon_days",
        label: "Max horizon (days)",
        description: "Maximum number of days ahead appointments can be scheduled.",
        type: "number" as const,
      },
      {
        key: "overbook_limit_default",
        label: "Default overbook limit",
        description: "Default allowed overbooking slots per schedule window.",
        type: "number" as const,
      },
      {
        key: "enable_cron_jobs",
        label: "Enable cron jobs",
        description: "Turn on automated background scheduling and maintenance tasks.",
        type: "boolean" as const,
      },
      {
        key: "last_waiting_weight_update",
        label: "Last waiting-weight update",
        description: "Timestamp of the last automated waiting-weight recalculation (read-only).",
        type: "readonly" as const,
      },
    ],
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "System-wide notification and OTP delivery settings.",
    fields: [
      {
        key: "auto_notify",
        label: "Auto notify",
        description: "Automatically send notifications when referral status changes.",
        type: "boolean" as const,
      },
      {
        key: "sms_otp_enabled",
        label: "SMS OTP enabled",
        description: "Allow one-time passwords to be sent via SMS.",
        type: "boolean" as const,
      },
    ],
  },
  {
    id: "mfa",
    title: "Multi-factor authentication",
    description: "Global MFA policy and OTP timing limits for all users.",
    fields: [
      {
        key: "mfa_enabled",
        label: "MFA enabled",
        description: "Require multi-factor authentication for sign-in.",
        type: "boolean" as const,
      },
      {
        key: "mfa_otp_max_attempts",
        label: "OTP max attempts",
        description: "Maximum failed OTP verification attempts before lockout.",
        type: "number" as const,
      },
      {
        key: "mfa_otp_resend_cooldown_seconds",
        label: "OTP resend cooldown (seconds)",
        description: "Minimum wait time between OTP resend requests.",
        type: "number" as const,
      },
      {
        key: "mfa_otp_ttl_seconds",
        label: "OTP TTL (seconds)",
        description: "How long an OTP code remains valid.",
        type: "number" as const,
      },
      {
        key: "mfa_sms_fallback_email",
        label: "SMS fallback to email",
        description: "Send OTP via email when SMS delivery is unavailable.",
        type: "boolean" as const,
      },
    ],
  },
] as const;

export function normalizeSystemConfig(
  response: SystemConfigResponse | SystemConfig | unknown,
): SystemConfig {
  if (response && typeof response === "object") {
    if ("data" in response && response.data && typeof response.data === "object") {
      return { ...(response.data as SystemConfig) };
    }
    if (!("success" in response) && !("message" in response)) {
      return { ...(response as SystemConfig) };
    }
  }
  return {};
}
