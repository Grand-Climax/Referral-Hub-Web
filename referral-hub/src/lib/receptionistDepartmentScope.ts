/**
 * Receptionist JWT may include `department_id`. Mutations (assign, arrive, etc.)
 * only apply when the referral's target department matches that scope.
 * Hospital-wide receptionists (no department on token) can act on any dept.
 */
export function canReceptionistActOnReferral(
  callerDepartmentId: string | undefined | null,
  referralDepartmentId: string | undefined | null,
): boolean {
  if (!callerDepartmentId) return true;
  if (!referralDepartmentId) return true;
  return callerDepartmentId === referralDepartmentId;
}

export function receptionistScopeHint(
  callerDepartmentId: string | undefined | null,
  referralDepartmentName?: string | null,
): string | null {
  if (!callerDepartmentId) return null;
  if (referralDepartmentName) {
    return `Your account is limited to one department. This patient is under ${referralDepartmentName} — use a receptionist account for that department, or ask an admin to update your scope.`;
  }
  return 'Your account is limited to one department. This patient belongs to a different department.';
}
