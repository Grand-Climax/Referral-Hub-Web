'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { format } from 'date-fns';
import { Users, CalendarDays, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  useGetScheduleQuery,
  useGetSchedulePatientsQuery,
} from '@/features/department-head/departmentHeadApi';
import type { ScheduledPatient, DailySchedule } from '@/types/department-head';

const ARRIVAL_CONFIG = {
  EXPECTED: {
    label: 'Expected',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    order: 1,
  },
  ARRIVED: {
    label: 'Arrived',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    order: 2,
  },
  ADMITTED: {
    label: 'Admitted',
    color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    order: 3,
  },
  MISSED: {
    label: 'Missed',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    order: 4,
  },
};

function patientName(p: ScheduledPatient): string {
  const patient = p.patient ?? p.referral?.patient;
  if (patient) return `${patient.first_name} ${patient.last_name}`;
  return 'Unknown Patient';
}

function PatientCard({ patient }: { patient: ScheduledPatient }) {
  const status = patient.arrival_status;
  const cfg = ARRIVAL_CONFIG[status] ?? {
    label: status,
    color: 'bg-slate-100 text-slate-600',
    order: 99,
  };
  const name = patientName(patient);
  const score = patient.composite_score;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
        <User className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{name}</p>
        {score !== undefined && (
          <p className="text-xs text-muted-foreground">Score: {score.toFixed(1)}</p>
        )}
      </div>
      <Badge className={`text-[10px] font-semibold shrink-0 hover:opacity-100 ${cfg.color}`}>
        {cfg.label}
      </Badge>
    </div>
  );
}

function ArrivalGroup({
  status,
  patients,
}: {
  status: string;
  patients: ScheduledPatient[];
}) {
  if (patients.length === 0) return null;
  const cfg = ARRIVAL_CONFIG[status as keyof typeof ARRIVAL_CONFIG] ?? {
    label: status,
    color: '',
  };

  return (
    <Card className="border bg-card shadow-sm">
      <CardHeader className="py-3 px-5 border-b border-border">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${cfg.color}`}
          >
            {cfg.label}
          </span>
          <span className="text-muted-foreground font-normal">({patients.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {patients.map((p) => (
          <PatientCard key={p.id} patient={p} />
        ))}
      </CardContent>
    </Card>
  );
}

export default function PatientsOfDayPage() {
  const searchParams = useSearchParams();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [date, setDate] = useState(searchParams.get('date') ?? todayStr);

  const { data: scheduleRaw, isLoading: isSchedLoading } = useGetScheduleQuery({ date });
  const { data: patients = [], isLoading: isPatientsLoading } =
    useGetSchedulePatientsQuery(date);

  const schedule = Array.isArray(scheduleRaw)
    ? scheduleRaw[0]
    : (scheduleRaw as DailySchedule | null);
  const isLoading = isSchedLoading || isPatientsLoading;

  const grouped: Record<string, ScheduledPatient[]> = {};
  for (const p of patients) {
    const key = p.arrival_status ?? 'EXPECTED';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  }

  const ORDER = ['EXPECTED', 'ARRIVED', 'ADMITTED', 'MISSED'];
  const formattedDate = date ? format(new Date(date), 'EEEE, MMMM d, yyyy') : '—';

  return (
    <div className="max-w-[900px] mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Patients of the Day
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Day-of-clinic roll call grouped by arrival status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="date-pick" className="text-sm whitespace-nowrap">
            Viewing:
          </Label>
          <Input
            id="date-pick"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-auto"
          />
        </div>
      </div>

      {schedule && (
        <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 px-4 py-3">
          <CalendarDays className="h-5 w-5 text-muted-foreground shrink-0" />
          <div>
            <p className="text-sm font-bold text-foreground">{formattedDate}</p>
            <p className="text-xs text-muted-foreground">
              {schedule.booked_slots} / {schedule.max_slots} booked
              {(schedule.overbook_limit ?? 0) > 0 &&
                ` (+${schedule.overbook_limit} emergency overbook)`}
            </p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      )}

      {!isLoading && patients.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
          <Users className="h-10 w-10 opacity-30" />
          <p className="text-sm font-medium text-foreground">
            No patients scheduled for {formattedDate}
          </p>
          <p className="text-xs">Run batch scheduling to assign patients to this day.</p>
        </div>
      )}

      {!isLoading && patients.length > 0 && (
        <div className="space-y-4">
          {ORDER.map((status) => (
            <ArrivalGroup key={status} status={status} patients={grouped[status] ?? []} />
          ))}
          {Object.keys(grouped)
            .filter((s) => !ORDER.includes(s))
            .map((status) => (
              <ArrivalGroup key={status} status={status} patients={grouped[status]} />
            ))}
        </div>
      )}
    </div>
  );
}
