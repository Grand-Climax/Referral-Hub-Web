'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Filter,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Activity,
  AlertTriangle,
  FileText,
  Users,
  Clock,
  Zap,
  Circle,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

interface TriagePatient {
  id: string;
  name: string;
  age: number;
  sex: string;
  urgency: UrgencyLevel;
  mlScore: number;
  facility: string;
  eta: string;
}

interface DutySpecialist {
  id: string;
  name: string;
  specialty: string;
  load: string;
  available: boolean;
  avatarFallback: string;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const TRIAGE_QUEUE: TriagePatient[] = [
  { id: 'REF-9021', name: 'Jameson, R.', age: 64, sex: 'Male', urgency: 'CRITICAL', mlScore: 9.4, facility: 'Central Metro ER', eta: '04m' },
  { id: 'REF-9044', name: 'Lin, Mei', age: 52, sex: 'Female', urgency: 'HIGH', mlScore: 7.8, facility: 'Westside Clinic', eta: '12m' },
  { id: 'REF-8998', name: 'Harrison, P.', age: 79, sex: 'Male', urgency: 'MEDIUM', mlScore: 5.2, facility: 'Riverside Gen', eta: 'Arrived' },
  { id: 'REF-9102', name: "O'Neill, Sarah", age: 33, sex: 'Female', urgency: 'LOW', mlScore: 2.1, facility: "St. Mary's ER", eta: '24m' },
];

const DUTY_SPECIALISTS: DutySpecialist[] = [
  { id: 's1', name: 'Dr. Sarah Smith', specialty: 'Cardiologist', load: '3/5 patients', available: true, avatarFallback: 'SS' },
  { id: 's2', name: 'Dr. Alan Chen', specialty: 'Neurologist', load: '5/5 patients', available: false, avatarFallback: 'AC' },
  { id: 's3', name: 'Dr. Mia Torres', specialty: 'Pulmonologist', load: '2/5 patients', available: true, avatarFallback: 'MT' },
];

const ACTIVE_COUNT = 12;
const HIGH_SEV_COUNT = 4;
const SPECIALISTS_ON_DUTY = 6;
const AVG_WAIT = 14;
const PAGE_SIZE = 4;

// ─── Urgency helpers ───────────────────────────────────────────────────────────

const URGENCY_STYLES: Record<UrgencyLevel, { badge: string; bar: string }> = {
  CRITICAL: { badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300', bar: 'bg-rose-500' },
  HIGH: { badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', bar: 'bg-amber-500' },
  MEDIUM: { badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', bar: 'bg-blue-500' },
  LOW: { badge: 'bg-slate-100 text-slate-600 dark:bg-slate-700/40 dark:text-slate-300', bar: 'bg-slate-400' },
};

function UrgencyBadge({ level }: { level: UrgencyLevel }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase ${URGENCY_STYLES[level].badge}`}>
      {level}
    </span>
  );
}

function MlScoreBar({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  const level: UrgencyLevel = score >= 8 ? 'CRITICAL' : score >= 6 ? 'HIGH' : score >= 4 ? 'MEDIUM' : 'LOW';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${URGENCY_STYLES[level].bar} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-bold tabular-nums text-foreground">{score.toFixed(1)}</span>
    </div>
  );
}

// ─── Stat Cards ────────────────────────────────────────────────────────────────

function ActiveReferralsCard() {
  return (
    <Card className="border bg-card shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Active Referrals</p>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
            <FileText className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-3">
          <span className="text-4xl font-extrabold tabular-nums text-foreground">{ACTIVE_COUNT}</span>
          <span className="text-sm font-semibold text-primary">Waiting Review</span>
        </div>
        <div className="mt-3 h-0.5 w-full rounded-full bg-primary/20">
          <div className="h-0.5 rounded-full bg-primary" style={{ width: '60%' }} />
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          Average wait time: {AVG_WAIT} mins
        </p>
      </CardContent>
    </Card>
  );
}

function HighSeverityCard() {
  return (
    <Card className="border bg-card shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">High-Severity</p>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300">
            <AlertTriangle className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-3">
          <span className="text-4xl font-extrabold tabular-nums text-rose-600 dark:text-rose-400">
            {String(HIGH_SEV_COUNT).padStart(2, '0')}
          </span>
          <span className="text-sm font-semibold text-rose-600 dark:text-rose-400">Critical Triage</span>
        </div>
        <div className="mt-4">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
            <Circle className="h-2 w-2 fill-rose-500 text-rose-500" />
            Immediate Action
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function SpecialistsCard() {
  return (
    <Card className="border bg-card shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Specialists</p>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-3">
          <span className="text-4xl font-extrabold tabular-nums text-foreground">
            {String(SPECIALISTS_ON_DUTY).padStart(2, '0')}
          </span>
          <span className="text-sm font-semibold text-muted-foreground">On Duty</span>
        </div>
        <div className="mt-3 flex -space-x-2">
          {['SS', 'AC', 'MT'].map((fb) => (
            <Avatar key={fb} className="h-7 w-7 border-2 border-background ring-1 ring-border">
              <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">{fb}</AvatarFallback>
            </Avatar>
          ))}
          <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-semibold text-muted-foreground ring-1 ring-border">
            +3
          </div>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500" />
          Adequate Coverage
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function DeptHeadDashboard() {
  const [specialists, setSpecialists] = useState(DUTY_SPECIALISTS);
  const [currentPage, setCurrentPage] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);

  const totalPages = Math.ceil(TRIAGE_QUEUE.length / PAGE_SIZE);
  const displayed = TRIAGE_QUEUE.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const criticalCase = TRIAGE_QUEUE.find((p) => p.urgency === 'CRITICAL');

  const toggleSpecialist = (id: string) => {
    setSpecialists((prev) =>
      prev.map((s) => (s.id === id ? { ...s, available: !s.available } : s))
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">

      {/* Stat Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <ActiveReferralsCard />
        <HighSeverityCard />
        <SpecialistsCard />
      </div>

      {/* Two-column layout: Triage Queue + Right Panel */}
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-[1fr_320px]">

        {/* ── Triage Queue ────────────────────────────────────────────────────── */}
        <Card className="border bg-card shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-4 px-6 border-b border-border">
            <div>
              <CardTitle className="text-base font-bold text-foreground">Triage Queue</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Real-time incoming referrals prioritized by ML severity.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 text-sm border-border"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <Filter className="h-4 w-4" />
              Filter Queue
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">ID</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Patient</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Urgency</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">ML Score</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Facility</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">ETA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displayed.map((patient) => (
                    <tr
                      key={patient.id}
                      className={`transition-colors hover:bg-muted/40 ${patient.urgency === 'CRITICAL' ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''
                        }`}
                    >
                      <td className="px-6 py-4 text-xs font-mono font-medium text-muted-foreground whitespace-nowrap">
                        {patient.id}
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-foreground leading-tight">{patient.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {patient.age}y • {patient.sex}
                        </p>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <UrgencyBadge level={patient.urgency} />
                      </td>
                      <td className="px-4 py-4">
                        <MlScoreBar score={patient.mlScore} />
                      </td>
                      <td className="px-4 py-4 text-sm text-foreground whitespace-nowrap">
                        {patient.facility}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-sm font-bold tabular-nums ${patient.eta === 'Arrived' ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                          }`}>
                          {patient.eta}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-border px-6 py-3 text-xs text-muted-foreground">
              <span>Showing {displayed.length} of {TRIAGE_QUEUE.length} active queue items</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Right Panel ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Command Center */}
          <Card className="border bg-card shadow-sm">
            <CardHeader className="pb-3 pt-4 px-5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Command Center</p>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <Button
                className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground h-11 text-sm font-semibold shadow-sm"
                onClick={() => criticalCase && alert(`Reviewing ${criticalCase.id} – ${criticalCase.name}`)}
              >
                Review Next Critical Case
                <ArrowRight className="h-4 w-4" />
              </Button>
              {criticalCase && (
                <p className="mt-2.5 text-center text-xs text-muted-foreground">
                  Next: <span className="font-semibold text-foreground">{criticalCase.name}</span>{' '}
                  — ETA {criticalCase.eta}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Duty Specialists */}
          <Card className="border bg-card shadow-sm">
            <CardHeader className="pb-3 pt-4 px-5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Duty Specialists</p>
                <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Live
                </span>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
              {specialists.map((spec) => (
                <div key={spec.id} className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 border border-border shrink-0">
                    <AvatarImage src="/user.png" alt={spec.name} />
                    <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                      {spec.avatarFallback}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{spec.name}</p>
                    <p className="text-xs text-muted-foreground">Load: {spec.load}</p>
                  </div>
                  {/* Toggle */}
                  <button
                    onClick={() => toggleSpecialist(spec.id)}
                    aria-label={`Toggle ${spec.name} availability`}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${spec.available ? 'bg-primary' : 'bg-muted-foreground/30'
                      }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform ${spec.available ? 'translate-x-4' : 'translate-x-0'
                        }`}
                    />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className="border bg-foreground dark:bg-card shadow-sm">
            <CardContent className="p-5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground dark:text-muted-foreground mb-3">
                System Health
              </p>
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-emerald-400 shrink-0" />
                <p className="text-base font-bold text-background dark:text-foreground leading-snug">
                  ML Triage Engine is operating at 98.4% precision.
                </p>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400">
                <Circle className="h-2 w-2 fill-emerald-400 text-emerald-400" />
                Models recalibrated 2h ago
              </p>
            </CardContent>
          </Card>

          {/* Quick Stats strip */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="border bg-card shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-extrabold tabular-nums text-primary">{HIGH_SEV_COUNT}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">Critical Today</p>
              </CardContent>
            </Card>
            <Card className="border bg-card shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-extrabold tabular-nums text-amber-500">
                  {specialists.filter((s) => s.available).length}/{specialists.length}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">Available</p>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}