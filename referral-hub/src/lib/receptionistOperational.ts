const TERMINAL_REFERRAL_STATUSES = new Set([
  'COMPLETED',
  'DECEASED',
  'CANCELLED',
  'REJECTED',
  'REJECTED_BY_LIAISON',
  'REJECTED_BY_SPECIALIST',
  'REJECTED_AFTER_SEND',
]);

export type OperationalRow = {
  status?: string;
  arrival_status?: string;
};

/** Operational dashboard rows only — excludes closed referrals and ADMITTED arrivals. */
export function isOperationalReceptionistRow(row: OperationalRow): boolean {
  const status = row.status?.toUpperCase() ?? '';
  if (TERMINAL_REFERRAL_STATUSES.has(status)) return false;
  if (status.startsWith('REJECTED_')) return false;
  if (row.arrival_status === 'ADMITTED') return false;
  return true;
}

export function filterOperationalReferrals<T extends OperationalRow>(
  rows: T[],
): T[] {
  return rows.filter(isOperationalReceptionistRow);
}
