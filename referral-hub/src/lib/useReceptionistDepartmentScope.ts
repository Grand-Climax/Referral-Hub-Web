'use client';

import { useMemo } from 'react';
import { useGetMeQuery } from '@/features/users/usersApi';

/**
 * Receptionist department from JWT — used to gate assign/check-in actions,
 * not to filter list APIs (hospital-wide triage lists; backend enforces scope
 * on mutations).
 */
export function useReceptionistDepartmentScope() {
  const { data: me } = useGetMeQuery();

  return useMemo(
    () => ({
      departmentId: me?.department_id,
      departmentName: me?.department?.name,
      isDepartmentScoped: Boolean(me?.department_id),
    }),
    [me?.department_id, me?.department?.name],
  );
}
