import { TrendingUp, Users, Circle } from 'lucide-react';
import { Card, CardContent }          from '@/components/ui/card';
import { TOTAL_SPECIALISTS, AVAILABLE_TODAY } from './types';

// ── Props ─────────────────────────────────────────────────────────────────────

interface CapacityStatsCardsProps {
  projectedCapacity: number; // 0–100
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CapacityStatsCards({ projectedCapacity }: CapacityStatsCardsProps) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">

      {/* Total Specialists */}
      <Card className="border bg-card shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Total Specialists
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-4xl font-extrabold tabular-nums text-foreground">
            {TOTAL_SPECIALISTS}
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-3 w-3" /> Stable Personnel
          </p>
        </CardContent>
      </Card>

      {/* Available Today */}
      <Card className="border border-primary/30 bg-primary/5 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Available Today
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Circle className="h-4 w-4 fill-primary" />
            </div>
          </div>
          <p className="mt-3 text-4xl font-extrabold tabular-nums text-foreground">
            {String(AVAILABLE_TODAY).padStart(2, '0')}
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary">
            <Circle className="h-2 w-2 fill-primary text-primary" /> Current Duty Shift
          </p>
        </CardContent>
      </Card>

      {/* Projected Capacity */}
      <Card className="border bg-card shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Projected Capacity
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-4xl font-extrabold tabular-nums text-foreground">
            {projectedCapacity}%
          </p>
          <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${projectedCapacity}%` }}
            />
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
