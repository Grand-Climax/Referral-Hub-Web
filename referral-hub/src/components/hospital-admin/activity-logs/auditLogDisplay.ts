import type { HospitalAdminAuditLog } from '@/types/hospital-admin';

export type AuditDisplayCategory = 'referral' | 'staff' | 'security' | 'system';

export function parseAuditTimestamp(raw: string): Date {
  const normalized = raw.includes('T') ? raw : raw.replace(' ', 'T');
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

export function auditLogCategory(log: HospitalAdminAuditLog): AuditDisplayCategory {
  const r = `${log.resource} ${log.action_type}`.toLowerCase();
  if (r.includes('auth') || r.includes('login') || r.includes('password') || r.includes('security')) {
    return 'security';
  }
  if (r.includes('staff') || r.includes('user') || r.includes('activation') || r.includes('role')) {
    return 'staff';
  }
  if (r.includes('referral')) {
    return 'referral';
  }
  return 'system';
}

export function userIdInitials(userId: string): string {
  const compact = userId.replace(/-/g, '');
  if (compact.length >= 2) {
    return compact.slice(-2).toUpperCase();
  }
  return 'U';
}

export function formatRateAsPercent(value: number): string {
  if (value == null || Number.isNaN(value)) return '—';
  const n = value <= 1 && value >= 0 ? value * 100 : value;
  return `${n.toFixed(1)}%`;
}
