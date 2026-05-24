'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  UserCog,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  Info,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  useGetStaffSummaryQuery,
  useUpdateStaffCapacityMutation,
} from '@/features/department-head/departmentHeadApi';
import type { StaffMember } from '@/types/department-head';
import { getApiErrorMessage } from '@/lib/apiError';

function getInitials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

function RoleChip({ role }: { role: string }) {
  const map: Record<string, { label: string; color: string }> = {
    RECEIVING_SPECIALIST: {
      label: 'Specialist',
      color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40',
    },
    REFERRING_DOCTOR: {
      label: 'Doctor',
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40',
    },
    RECEPTIONIST: {
      label: 'Reception',
      color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40',
    },
  };
  const cfg = map[role] ?? {
    label: role.replace(/_/g, ' '),
    color: 'bg-slate-100 text-slate-600',
  };
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cfg.color}`}
    >
      {cfg.label}
    </span>
  );
}

function MemberCard({ member }: { member: StaffMember }) {
  return (
    <Card
      className={`border bg-card shadow-sm transition-shadow hover:shadow-md ${
        !member.is_active ? 'opacity-60' : ''
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-11 w-11 border border-border shrink-0">
            <AvatarImage
              src={member.profile_image ?? ''}
              alt={`${member.first_name} ${member.last_name}`}
            />
            <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
              {getInitials(member.first_name, member.last_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">
              {member.first_name} {member.last_name}
            </p>
            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
              <RoleChip role={member.role} />
              {member.is_active ? (
                <span className="flex items-center gap-1 text-[10px] text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" /> Active
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-slate-500">
                  <XCircle className="h-3 w-3" /> Inactive
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 truncate">{member.email}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function KpiStat({
  label,
  active,
  total,
  icon: Icon,
  color,
}: {
  label: string;
  active: number;
  total: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <Card className="border bg-card shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {label}
            </p>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className={`text-3xl font-extrabold tabular-nums ${color}`}>{active}</span>
              <span className="text-sm text-muted-foreground">/ {total} total</span>
            </div>
          </div>
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
              color === 'text-blue-600'
                ? 'bg-blue-50 dark:bg-blue-900/30'
                : 'bg-emerald-50 dark:bg-emerald-900/30'
            }`}
          >
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StaffPage() {
  const { data: summary, isLoading, isError } = useGetStaffSummaryQuery(undefined, {
    pollingInterval: 5 * 60_000,
  });
  const [updateCapacity, { isLoading: isUpdating }] = useUpdateStaffCapacityMutation();
  const [capacityInput, setCapacityInput] = useState<string>('');
  const [edited, setEdited] = useState(false);

  const currentHint = summary?.staff_capacity_hint ?? 0;
  const displayValue = edited ? capacityInput : String(currentHint);

  const handleSave = async () => {
    const value = parseInt(displayValue, 10);
    if (isNaN(value) || value < 0 || value > 999) {
      toast.error('Capacity hint must be between 0 and 999');
      return;
    }
    try {
      await updateCapacity({ value }).unwrap();
      toast.success('Staff capacity hint updated');
      setEdited(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update capacity'));
    }
  };

  const members = summary?.members ?? [];

  return (
    <div className="max-w-[1100px] mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Staff Management</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {summary?.department ?? 'Department'} — doctors, receptionists, and capacity hints
        </p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <p className="text-sm">Failed to load staff data.</p>
        </div>
      )}

      {summary && summary.department && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiStat
              label="Doctors"
              active={summary.doctors?.active ?? 0}
              total={summary.doctors?.total ?? 0}
              icon={UserCog}
              color="text-blue-600"
            />
            <KpiStat
              label="Receptionists"
              active={summary.receptionists?.active ?? 0}
              total={summary.receptionists?.total ?? 0}
              icon={Users}
              color="text-emerald-600"
            />
            <Card className="border bg-card shadow-sm">
              <CardContent className="p-5">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Doctors w/ Bookings Today
                </p>
                <p className="mt-2 text-3xl font-extrabold tabular-nums text-foreground">
                  {summary.doctors_assigned_today ?? 0}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border bg-card shadow-sm">
            <CardHeader className="py-3 px-5 border-b border-border">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <UserCog className="h-4 w-4 text-muted-foreground" />
                Staff Capacity Hint
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <div className="space-y-1.5 flex-1 max-w-xs">
                  <Label htmlFor="cap-hint">Capacity hint value</Label>
                  <Input
                    id="cap-hint"
                    type="number"
                    min={0}
                    max={999}
                    value={displayValue}
                    onChange={(e) => {
                      setCapacityInput(e.target.value);
                      setEdited(true);
                    }}
                  />
                </div>
                <Button
                  onClick={handleSave}
                  disabled={isUpdating || !edited}
                  className="gap-2 self-end"
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save
                </Button>
              </div>
              <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <p>
                  This is a <strong>soft hint</strong> — it never blocks bookings. Used only
                  for staffing visibility.
                </p>
              </div>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-base font-bold text-foreground mb-3">
              Team Roster ({members.length} members)
            </h2>
            {members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
                <Users className="h-10 w-10 opacity-30" />
                <p className="text-sm">No team members found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((m) => (
                  <MemberCard key={m.id} member={m} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
