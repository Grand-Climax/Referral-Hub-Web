'use client';

import Link from 'next/link';
import { useState } from 'react';
import { format } from 'date-fns';
import {
  Plus,
  ShieldAlert,
  Trash2,
  AlertTriangle,
  Loader2,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

import {
  useGetOverridesByMonthQuery,
  useDeleteCapacityOverrideMutation,
} from '@/features/department-head/departmentHeadApi';
import type { CapacityOverride } from '@/types/department-head';
import { getApiErrorMessage } from '@/lib/apiError';

function OverrideRow({
  override,
  onDelete,
}: {
  override: CapacityOverride;
  onDelete: (o: CapacityOverride) => void;
}) {
  const targetDate = format(new Date(override.target_date), 'EEEE, MMMM d, yyyy');
  const createdAt = override.created_at
    ? format(new Date(override.created_at), 'MMM d, yyyy')
    : '—';
  const isActive = override.is_active !== false;

  return (
    <tr className="border-b border-border hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-semibold text-foreground">{targetDate}</span>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <span className="text-sm font-bold text-foreground tabular-nums">
          {override.new_limit ?? override.custom_limit}
        </span>
        <span className="text-xs text-muted-foreground ml-1">slots</span>
      </td>
      <td className="px-4 py-3.5">
        <p className="text-sm text-foreground line-clamp-2">{override.reason}</p>
      </td>
      <td className="px-4 py-3.5">
        <Badge
          variant={isActive ? 'default' : 'secondary'}
          className={
            isActive
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300'
              : ''
          }
        >
          {isActive ? 'Active' : 'Revoked'}
        </Badge>
      </td>
      <td className="px-4 py-3.5 text-xs text-muted-foreground">{createdAt}</td>
      <td className="px-4 py-3.5">
        {isActive && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete(override)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Revoke
          </Button>
        )}
      </td>
    </tr>
  );
}

function DeleteModal({
  override,
  onClose,
  onConfirm,
  isLoading,
}: {
  override: CapacityOverride;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  const targetDate = format(new Date(override.target_date), 'MMMM d, yyyy');
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Revoke Override
          </DialogTitle>
          <DialogDescription>
            This will restore the standard daily limit for{' '}
            <span className="font-semibold text-foreground">{targetDate}</span>. The override
            row stays in history for audit.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Revoke Override
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function CapacityOverridesPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [toDelete, setToDelete] = useState<CapacityOverride | null>(null);

  const { data: overrides = [], isLoading, isError } = useGetOverridesByMonthQuery({
    year,
    month,
  });
  const [deleteOverride, { isLoading: isDeleting }] = useDeleteCapacityOverrideMutation();

  const monthLabel = format(new Date(year, month - 1), 'MMMM yyyy');

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteOverride(toDelete.id).unwrap();
      toast.success(
        `Override for ${format(new Date(toDelete.target_date), 'MMMM d')} revoked`
      );
      setToDelete(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to revoke override'));
    }
  };

  const active = overrides.filter((o) => o.is_active !== false);

  return (
    <div className="max-w-[1100px] mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Capacity Overrides
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Overrides are immutable — delete and recreate to change.
          </p>
        </div>
        <Link href="/department-head/capacity/overrides/new">
          <Button className="gap-2 font-semibold">
            <Plus className="h-4 w-4" />
            New Override
          </Button>
        </Link>
      </div>

      {active.length > 0 && (
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 dark:bg-amber-900/30 px-3 py-1.5 text-sm text-amber-700 dark:text-amber-300">
          <ShieldAlert className="h-4 w-4" />
          <span className="font-semibold">{active.length}</span> active override
          {active.length !== 1 ? 's' : ''} this month
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={prevMonth}
          className="rounded-md p-1.5 hover:bg-muted border border-border"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-base font-bold text-foreground min-w-[140px] text-center">
          {monthLabel}
        </span>
        <button
          onClick={nextMonth}
          className="rounded-md p-1.5 hover:bg-muted border border-border"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <Card className="border bg-card shadow-sm">
        <CardContent className="p-0">
          {isLoading && (
            <div className="p-6 space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <p className="text-sm font-medium text-foreground">Failed to load overrides</p>
            </div>
          )}

          {!isLoading && !isError && overrides.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <ShieldAlert className="h-10 w-10 opacity-30" />
              <p className="text-sm font-medium text-foreground">
                No overrides for {monthLabel}
              </p>
              <Link href="/department-head/capacity/overrides/new">
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Override
                </Button>
              </Link>
            </div>
          )}

          {!isLoading && !isError && overrides.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {['Target Date', 'New Limit', 'Reason', 'Status', 'Created', 'Actions'].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {overrides.map((o) => (
                    <OverrideRow key={o.id} override={o} onDelete={setToDelete} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {toDelete && (
        <DeleteModal
          override={toDelete}
          onClose={() => setToDelete(null)}
          onConfirm={handleDelete}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
