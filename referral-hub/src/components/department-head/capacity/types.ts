// ── Shared Types ──────────────────────────────────────────────────────────────

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  ward: string;
  defaultStatus: 'available' | 'at-capacity' | 'off-duty';
  avatarFallback: string;
}

export type DaySchedule = Record<string, boolean>; // doctorId → isActive

// ── Mock Data ─────────────────────────────────────────────────────────────────

export const DOCTORS: Doctor[] = [
  { id: 'd1', name: 'Dr. Sarah Smith',     specialty: 'Interventional Cardiology', ward: 'Ward A-1',   defaultStatus: 'available',   avatarFallback: 'SS' },
  { id: 'd2', name: 'Dr. Alan Chen',       specialty: 'Electrophysiology',         ward: 'Ward B-3',   defaultStatus: 'at-capacity', avatarFallback: 'AC' },
  { id: 'd3', name: 'Dr. Elena Rodriguez', specialty: 'Non-Invasive Imaging',      ward: 'Outpatient', defaultStatus: 'off-duty',    avatarFallback: 'ER' },
  { id: 'd4', name: 'Dr. James Osei',      specialty: 'General Cardiology',        ward: 'Ward C-2',   defaultStatus: 'available',   avatarFallback: 'JO' },
  { id: 'd5', name: 'Dr. Priya Nair',      specialty: 'Cardiac Rehabilitation',    ward: 'Ward D-1',   defaultStatus: 'available',   avatarFallback: 'PN' },
];

export const TOTAL_SPECIALISTS = 12;
export const AVAILABLE_TODAY   = 8;

export const REASON_OPTIONS = [
  'Planned Leave / Time Off',
  'Medical Emergency Staffing Change',
  'Increased Patient Load',
  'Staff Training / Development',
  'Equipment / Facility Issue',
  'Public Holiday Coverage',
  'Department Review',
  'Other',
];

export const STATUS_CONFIG = {
  available:     { label: 'AVAILABLE',   cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  'at-capacity': { label: 'AT CAPACITY', cls: 'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-300'  },
  'off-duty':    { label: 'OFF DUTY',    cls: 'bg-slate-100  text-slate-600  dark:bg-slate-800/40  dark:text-slate-400'  },
} as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

export const DEFAULT_SCHEDULE: DaySchedule = Object.fromEntries(
  DOCTORS.map((d) => [d.id, true])
);

export function buildDays(count = 7): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
}

export function dayMeta(d: Date, idx: number) {
  return {
    month:  d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    dayNum: d.getDate(),
    label:
      idx === 0 ? 'TODAY'
      : idx === 1 ? 'TOMORROW'
      : d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
  };
}
