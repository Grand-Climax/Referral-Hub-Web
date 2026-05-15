'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Circle,
  Search,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { cleanupOldSchedule, getSpecialistAvailabilityForDate } from '@/redux/slices/specialistAvailabilitySlice';
import { format, addDays, formatDistanceToNow } from 'date-fns';

// ─── Types ─────────────────────────────────────────────────────────────────────

type SpecialistStatus = 'available' | 'busy' | 'off-duty';

const STATUS_CONFIG = {
  available: {
    label: 'On Duty',
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

function LoadBar({ load, maxLoad, status }: { load: number; maxLoad: number; status: SpecialistStatus }) {
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

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function SpecialistAvailabilityPage() {
  const dispatch = useAppDispatch();
  
  // Default to today's view
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(today);
  
  // Get specialists for the selected date
  const specialists = useAppSelector((state) => 
    getSpecialistAvailabilityForDate(state, selectedDate)
  );
  
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'available' | 'busy' | 'off-duty'>('all');

  // Clean up old schedule entries on mount
  useEffect(() => {
    dispatch(cleanupOldSchedule());
  }, [dispatch]);

  // Calculate status for each specialist
  const specialistsWithStatus = specialists.map((s) => {
    let status: SpecialistStatus;
    if (!s.available) {
      status = 'off-duty';
    } else if (s.currentLoad >= s.maxLoad) {
      status = 'busy';
    } else {
      status = 'available';
    }
    return { ...s, status };
  });

  const available = specialistsWithStatus.filter((s) => s.status === 'available').length;
  const busy = specialistsWithStatus.filter((s) => s.status === 'busy').length;
  const offDuty = specialistsWithStatus.filter((s) => s.status === 'off-duty').length;

  const filtered = specialistsWithStatus.filter((s) => {
    const matchesStatus = filter === 'all' || s.status === filter;
    const query = search.toLowerCase();
    const matchesSearch =
      !query ||
      s.name.toLowerCase().includes(query) ||
      s.specialty.toLowerCase().includes(query);
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
        
        {/* Date Selector */}
        <div className="flex items-center gap-2 mt-4">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-9 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value={today}>Today - {format(new Date(), 'MMM dd')}</option>
            <option value={format(addDays(new Date(), 1), 'yyyy-MM-dd')}>
              Tomorrow - {format(addDays(new Date(), 1), 'MMM dd')}
            </option>
            <option value={format(addDays(new Date(), 2), 'yyyy-MM-dd')}>
              {format(addDays(new Date(), 2), 'EEE, MMM dd')}
            </option>
            <option value={format(addDays(new Date(), 3), 'yyyy-MM-dd')}>
              {format(addDays(new Date(), 3), 'EEE, MMM dd')}
            </option>
            <option value={format(addDays(new Date(), 4), 'yyyy-MM-dd')}>
              {format(addDays(new Date(), 4), 'EEE, MMM dd')}
            </option>
            <option value={format(addDays(new Date(), 5), 'yyyy-MM-dd')}>
              {format(addDays(new Date(), 5), 'EEE, MMM dd')}
            </option>
            <option value={format(addDays(new Date(), 6), 'yyyy-MM-dd')}>
              {format(addDays(new Date(), 6), 'EEE, MMM dd')}
            </option>
            <option value={format(addDays(new Date(), 7), 'yyyy-MM-dd')}>
              {format(addDays(new Date(), 7), 'EEE, MMM dd')}
            </option>
          </select>
          <span className="text-xs text-muted-foreground">
            Viewing schedule for {format(new Date(selectedDate), 'EEEE, MMMM dd, yyyy')}
          </span>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        {[
          { label: 'On Duty', count: available, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', dot: 'bg-emerald-500' },
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
            placeholder="Search specialist, specialty..."
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
              {f === 'all' ? 'All' : f === 'off-duty' ? 'Off Duty' : f === 'busy' ? 'At Capacity' : 'On Duty'}
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
                      {getInitials(spec.name)}
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
                <LoadBar load={spec.currentLoad} maxLoad={spec.maxLoad} status={spec.status} />

                {/* Contact Info */}
                {spec.email && (
                  <div className="mt-3 text-[11px] text-muted-foreground">
                    <p className="truncate">{spec.email}</p>
                    {spec.phone && <p className="mt-0.5">{spec.phone}</p>}
                  </div>
                )}

                {/* Off Duty Reason */}
                {spec.status === 'off-duty' && spec.offDutyReason && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 p-2.5">
                      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-amber-900 dark:text-amber-200 uppercase tracking-wide">
                          Off Duty Reason
                        </p>
                        <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                          {spec.offDutyReason}
                        </p>
                        {spec.offDutySince && (
                          <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-1">
                            Since {formatDistanceToNow(new Date(spec.offDutySince), { addSuffix: true })}
                          </p>
                        )}
                      </div>
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
