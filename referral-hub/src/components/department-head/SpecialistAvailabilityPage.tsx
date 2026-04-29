'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Circle,
  Search,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

// ─── Mock Data ─────────────────────────────────────────────────────────────────

interface Specialist {
  id: string;
  name: string;
  specialty: string;
  department: string;
  load: number;
  maxLoad: number;
  status: 'available' | 'busy' | 'off-duty';
  shiftEnd: string;
  avatarFallback: string;
  currentPatients: string[];
}

const SPECIALISTS: Specialist[] = [
  {
    id: 's1',
    name: 'Dr. Sarah Smith',
    specialty: 'Interventional Cardiologist',
    department: 'Cardiology',
    load: 3,
    maxLoad: 5,
    status: 'available',
    shiftEnd: '20:00',
    avatarFallback: 'SS',
    currentPatients: ['REF-9021', 'REF-9044', 'REF-8901'],
  },
  {
    id: 's2',
    name: 'Dr. Alan Chen',
    specialty: 'Neurologist',
    department: 'Neurology',
    load: 5,
    maxLoad: 5,
    status: 'busy',
    shiftEnd: '18:00',
    avatarFallback: 'AC',
    currentPatients: ['REF-8978', 'REF-8902', 'REF-8880', 'REF-8771', 'REF-8660'],
  },
  {
    id: 's3',
    name: 'Dr. Mia Torres',
    specialty: 'Pulmonologist',
    department: 'Pulmonology',
    load: 2,
    maxLoad: 5,
    status: 'available',
    shiftEnd: '22:00',
    avatarFallback: 'MT',
    currentPatients: ['REF-9100', 'REF-9088'],
  },
  {
    id: 's4',
    name: 'Dr. James Osei',
    specialty: 'General Surgeon',
    department: 'Surgery',
    load: 4,
    maxLoad: 5,
    status: 'available',
    shiftEnd: '20:00',
    avatarFallback: 'JO',
    currentPatients: ['REF-8991', 'REF-8983', 'REF-8955', 'REF-8920'],
  },
  {
    id: 's5',
    name: 'Dr. Priya Nair',
    specialty: 'Nephrologist',
    department: 'Nephrology',
    load: 0,
    maxLoad: 5,
    status: 'off-duty',
    shiftEnd: '08:00',
    avatarFallback: 'PN',
    currentPatients: [],
  },
  {
    id: 's6',
    name: 'Dr. Lucas Ferreira',
    specialty: 'Gastroenterologist',
    department: 'Gastroenterology',
    load: 1,
    maxLoad: 5,
    status: 'available',
    shiftEnd: '19:00',
    avatarFallback: 'LF',
    currentPatients: ['REF-9072'],
  },
];

const STATUS_CONFIG = {
  available: {
    label: 'Available',
    dot: 'bg-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-400',
    badge: 'bg-emerald-100 dark:bg-emerald-900/30',
    icon: CheckCircle2,
  },
  busy: {
    label: 'At Capacity',
    dot: 'bg-amber-500',
    text: 'text-amber-700 dark:text-amber-400',
    badge: 'bg-amber-100 dark:bg-amber-900/30',
    icon: Clock,
  },
  'off-duty': {
    label: 'Off Duty',
    dot: 'bg-slate-400',
    text: 'text-slate-600 dark:text-slate-400',
    badge: 'bg-slate-100 dark:bg-slate-800/40',
    icon: XCircle,
  },
};

function LoadBar({ load, maxLoad, status }: { load: number; maxLoad: number; status: Specialist['status'] }) {
  const pct = maxLoad > 0 ? (load / maxLoad) * 100 : 0;
  const color =
    status === 'off-duty' ? 'bg-slate-300 dark:bg-slate-600'
      : pct >= 100 ? 'bg-amber-500'
        : pct >= 60 ? 'bg-blue-500'
          : 'bg-emerald-500';

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-muted-foreground">Patient Load</span>
        <span className="text-[11px] font-semibold text-foreground">{load}/{maxLoad}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function SpecialistAvailabilityPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'available' | 'busy' | 'off-duty'>('all');

  const available = SPECIALISTS.filter((s) => s.status === 'available').length;
  const busy = SPECIALISTS.filter((s) => s.status === 'busy').length;
  const offDuty = SPECIALISTS.filter((s) => s.status === 'off-duty').length;

  const filtered = SPECIALISTS.filter((s) => {
    const matchesStatus = filter === 'all' || s.status === filter;
    const query = search.toLowerCase();
    const matchesSearch =
      !query ||
      s.name.toLowerCase().includes(query) ||
      s.specialty.toLowerCase().includes(query) ||
      s.department.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Specialist Availability</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Real-time view of on-duty specialists and their current patient load.
        </p>
      </div>

      {/* Summary row */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        {[
          { label: 'Available', count: available, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', dot: 'bg-emerald-500' },
          { label: 'At Capacity', count: busy, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', dot: 'bg-amber-500' },
          { label: 'Off Duty', count: offDuty, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800/30', dot: 'bg-slate-400' },
        ].map((s) => (
          <Card key={s.label} className={`border shadow-sm ${s.bg}`}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background shadow-sm">
                <Users className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-3xl font-extrabold tabular-nums text-foreground">{s.count}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Circle className={`h-2 w-2 fill-current ${s.dot} ${s.color}`} />
                  <p className={`text-xs font-semibold ${s.color}`}>{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search specialist, department..."
            className="pl-9 h-10 bg-background text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'available', 'busy', 'off-duty'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`h-9 rounded-lg px-3.5 text-xs font-semibold capitalize transition-colors ${filter === f
                ? 'bg-primary text-primary-foreground'
                : 'border border-border bg-background text-muted-foreground hover:bg-muted'
                }`}
            >
              {f === 'all' ? 'All' : f === 'off-duty' ? 'Off Duty' : f === 'busy' ? 'At Capacity' : 'Available'}
            </button>
          ))}
        </div>
      </div>

      {/* Specialist Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((spec) => {
          const cfg = STATUS_CONFIG[spec.status];
          return (
            <Card
              key={spec.id}
              className={`border bg-card shadow-sm transition-shadow hover:shadow-md ${spec.status === 'off-duty' ? 'opacity-70' : ''
                }`}
            >
              <CardContent className="p-5">
                {/* Top row */}
                <div className="flex items-start gap-3">
                  <Avatar className="h-11 w-11 border border-border shrink-0">
                    <AvatarImage src="/user.png" alt={spec.name} />
                    <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                      {spec.avatarFallback}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{spec.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{spec.specialty}</p>
                    <span className={`mt-1.5 inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold ${cfg.badge} ${cfg.text}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </div>
                </div>

                {/* Load Bar */}
                <LoadBar load={spec.load} maxLoad={spec.maxLoad} status={spec.status} />

                {/* Meta */}
                <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="font-medium">{spec.department}</span>
                  {spec.status !== 'off-duty' && (
                    <span>Shift ends {spec.shiftEnd}</span>
                  )}
                </div>

                {/* Active Cases */}
                {spec.currentPatients.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-[11px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                      Active Cases
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {spec.currentPatients.slice(0, 3).map((ref) => (
                        <span
                          key={ref}
                          className="inline-block rounded-md bg-muted px-2 py-0.5 text-[11px] font-mono font-medium text-muted-foreground"
                        >
                          {ref}
                        </span>
                      ))}
                      {spec.currentPatients.length > 3 && (
                        <span className="inline-block rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          +{spec.currentPatients.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground">
            <Users className="mx-auto h-8 w-8 mb-3 opacity-40" />
            <p className="text-sm">No specialists match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}