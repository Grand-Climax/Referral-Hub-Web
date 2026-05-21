type ApiErrorPayload = {
  success?: boolean;
  error?: string;
  message?: string;
  detail?: string;
  errors?: unknown;
};

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  return undefined;
}

function formatErrorsField(errors: unknown): string | undefined {
  if (!errors) return undefined;

  if (Array.isArray(errors)) {
    const messages = errors
      .map(asNonEmptyString)
      .filter((value): value is string => Boolean(value));
    return messages.length > 0 ? messages.join(", ") : undefined;
  }

  if (typeof errors === "object") {
    const messages = Object.values(errors as Record<string, unknown>)
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .map(asNonEmptyString)
      .filter((value): value is string => Boolean(value));
    return messages.length > 0 ? messages.join(", ") : undefined;
  }

  return asNonEmptyString(errors);
}

function parseDataPayload(data: unknown): string | undefined {
  if (typeof data === "string") return asNonEmptyString(data);
  if (!data || typeof data !== "object") return undefined;

  const body = data as ApiErrorPayload;
  return (
    asNonEmptyString(body.error) ??
    asNonEmptyString(body.message) ??
    asNonEmptyString(body.detail) ??
    formatErrorsField(body.errors)
  );
}

/** Extracts a user-facing message from RTK Query / backend API errors. */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (!error) return fallback;

  if (typeof error === "string") {
    return asNonEmptyString(error) ?? fallback;
  }

  if (typeof error === "object") {
    const record = error as {
      data?: unknown;
      error?: string;
      message?: string;
    };

    const fromData = parseDataPayload(record.data);
    if (fromData) return fromData;

    const fromError = asNonEmptyString(record.error);
    if (fromError) return fromError;

    const fromMessage = asNonEmptyString(record.message);
    if (fromMessage && fromMessage !== "Rejected") return fromMessage;
  }

  return fallback;
}
