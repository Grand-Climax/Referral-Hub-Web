import { getApiErrorMessage } from '@/lib/apiError';

const SCOPE_MESSAGES: Record<string, string> = {
  'forbidden: triage queue belongs to a different hospital': 'Not your hospital',
  'forbidden: triage queue belongs to a different department':
    'This patient is in another department. Use a receptionist account for that department, or ask an admin to update your scope.',
  'unauthorized: missing hospital scope on caller token':
    'Session error — re-login',
};

/** Maps receptionist JWT scope errors to friendly toasts (integration guide §2.4). */
export function getReceptionistErrorMessage(
  error: unknown,
  fallback: string,
): string {
  const raw = getApiErrorMessage(error, fallback);
  const normalized = raw.trim().toLowerCase();
  for (const [key, message] of Object.entries(SCOPE_MESSAGES)) {
    if (normalized === key.toLowerCase()) return message;
  }
  return raw;
}
