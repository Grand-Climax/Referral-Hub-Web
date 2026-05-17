import { TrendingUp, Users, Circle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// ── Props ─────────────────────────────────────────────────────────────────────

interface CapacityStatsCardsProps {
  projectedCapacity: number; // 0–100
  totalCapacity?: number;
  totalBooked?: number;
  isLoading?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CapacityStatsCards({
  projectedCapacity,
  totalCapacity = 0,
  totalBooked = 0,
  isLoading = false,
}: CapacityStatsCardsProps) {
  const totalAvailable = totalCapacity - totalBooked;

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
      {/* Total Capacity */}
      <Card className="border bg-card shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Total Capacity
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
              <Users className="h-4 w-4" />
            </div>
          </div>
          {isLoading ? (
            <div className="mt-3 flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : (
            <>
              <p className="mt-3 text-4xl font-extrabold tabular-nums text-foreground">
                {totalCapacity}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Total slots across all days
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Booked Slots */}
      <Card className="border border-primary/30 bg-primary/5 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Booked Slots
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Circle className="h-4 w-4 fill-primary" />
            </div>
          </div>
          {isLoading ? (
            <div className="mt-3 flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : (
            <>
              <p className="mt-3 text-4xl font-extrabold tabular-nums text-foreground">
                {totalBooked}
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary">
                <Circle className="h-2 w-2 fill-primary text-primary" /> {totalAvailable} available
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Utilization Rate */}
      <Card className="border bg-card shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Utilization Rate
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          {isLoading ? (
            <div className="mt-3 flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : (
            <>
              <p className="mt-3 text-4xl font-extrabold tabular-nums text-foreground">
                {projectedCapacity}%
              </p>
              <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${projectedCapacity}%` }}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
