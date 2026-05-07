'use client';

import { useState, useEffect } from 'react';
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
  Circle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Calendar,
} from 'lucide-react';
import { useGetTriageQueueQuery } from '@/features/department-head/departmentHeadApi';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { setFutureAvailability, cleanupOldSchedule, getSpecialistAvailabilityForDate } from '@/redux/slices/specialistAvailabilitySlice';
import { OffDutyDialog } from './OffDutyDialog';
import { format, addDays } from 'date-fns';

// ─── Types ────────────────────────────────────────────────────────────────────

type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

const PAGE_SIZE = 10;

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

function ActiveReferralsCard({ count, avgWait }: { count: number; avgWait: number }) {
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
          <span className="text-4xl font-extrabold tabular-nums text-foreground">{count}</span>
          <span className="text-sm font-semibold text-primary">Waiting Review</span>
        </div>
        <div className="mt-3 h-0.5 w-full rounded-full bg-primary/20">
          <div className="h-0.5 rounded-full bg-primary" style={{ width: '60%' }} />
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          Average wait time: {avgWait} mins
        </p>
      </CardContent>
    </Card>
  );
}

function HighSeverityCard({ count }: { count: number }) {
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
            {String(count).padStart(2, '0')}
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

function SpecialistsCard({ totalSpecialists, availableCount }: { totalSpecialists: number; availableCount: number }) {
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
            {String(totalSpecialists).padStart(2, '0')}
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
            +{Math.max(0, totalSpecialists - 3)}
          </div>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500" />
          {availableCount} Available
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function DeptHeadDashboard() {
  const dispatch = useAppDispatch();
  
  // Get tomorrow's date (can only modify future dates)
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(tomorrow);
  
  // Get specialists for the selected date
  const specialists = useAppSelector((state) => 
    getSpecialistAvailabilityForDate(state, selectedDate)
  );
  
  const [currentPage, setCurrentPage] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [showAllSpecialists, setShowAllSpecialists] = useState(false);
  const [offDutyDialog, setOffDutyDialog] = useState<{ 
    open: boolean; 
    specialistId: string; 
    specialistName: string;
    date: string;
  }>({
    open: false,
    specialistId: '',
    specialistName: '',
    date: tomorrow,
  });

  // Clean up old schedule entries on mount
  useEffect(() => {
    dispatch(cleanupOldSchedule());
  }, [dispatch]);

  // Fetch triage queue from API
  // Note: This endpoint is for RECEIVING_SPECIALIST role
  // Department heads might not have access - handle 404 gracefully
  const { data: triageQueue = [], isLoading, error } = useGetTriageQueueQuery({
    limit: 100, // Get more records for pagination
    offset: 0,
  });

  // Calculate stats from real data
  const activeCount = triageQueue.length;
  const highSevCount = triageQueue.filter(
    (p) => p.urgency_level === 'CRITICAL' || p.urgency_level === 'HIGH'
  ).length;
  const avgWait = 14; // TODO: Calculate from real data when available

  // Specialist stats
  const totalSpecialists = specialists.length;
  const availableSpecialists = specialists.filter((s) => s.available);
  const availableCount = availableSpecialists.length;

  // Show first 3 specialists by default, or all if expanded
  const displayedSpecialists = showAllSpecialists ? specialists : specialists.slice(0, 3);

  const totalPages = Math.ceil(triageQueue.length / PAGE_SIZE);
  const displayed = triageQueue.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const criticalCase = triageQueue.find((p) => p.urgency_level === 'CRITICAL');

  const handleToggleSpecialist = (id: string, currentlyAvailable: boolean, name: string) => {
    if (currentlyAvailable) {
      // Turning off - show dialog for reason
      setOffDutyDialog({ 
        open: true, 
        specialistId: id, 
        specialistName: name,
        date: selectedDate,
      });
    } else {
      // Turning on - no reason needed
      dispatch(setFutureAvailability({ 
        specialistId: id, 
        date: selectedDate,
        available: true 
      }));
    }
  };

  const handleConfirmOffDuty = (reason: string) => {
    dispatch(
      setFutureAvailability({
        specialistId: offDutyDialog.specialistId,
        date: offDutyDialog.date,
        available: false,
        reason,
      })
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isToday = selectedDate === format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">

      {/* Stat Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <ActiveReferralsCard count={activeCount} avgWait={avgWait} />
        <HighSeverityCard count={highSevCount} />
        <SpecialistsCard totalSpecialists={totalSpecialists} availableCount={availableCount} />
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
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-sm text-muted-foreground">Loading triage queue...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <AlertTriangle className="h-8 w-8 text-amber-500" />
                <span className="mt-3 text-sm font-medium text-foreground">Triage Queue Unavailable</span>
                <p className="mt-1 text-xs text-muted-foreground text-center max-w-md">
                  {'status' in error && error.status === 404 
                    ? 'The triage queue endpoint is not accessible for department heads. This feature may require RECEIVING_SPECIALIST role.'
                    : 'Failed to load triage queue. Please try again later.'}
                </p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && triageQueue.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-3 text-sm font-medium text-foreground">No patients in triage queue</p>
                <p className="text-xs text-muted-foreground mt-1">New referrals will appear here</p>
              </div>
            )}

            {/* Table */}
            {!isLoading && !error && triageQueue.length > 0 && (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">ID</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Patient</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Urgency</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">ML Score</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Facility</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {displayed.map((patient) => (
                        <tr
                          key={patient.id}
                          className={`transition-colors hover:bg-muted/40 ${patient.urgency_level === 'CRITICAL' ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''
                            }`}
                        >
                          <td className="px-6 py-4 text-xs font-mono font-medium text-muted-foreground whitespace-nowrap">
                            {patient.id}
                          </td>
                          <td className="px-4 py-4">
                            <p className="font-semibold text-foreground leading-tight">{patient.patient_name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {patient.patient_age}y • {patient.patient_sex}
                            </p>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <UrgencyBadge level={patient.urgency_level} />
                          </td>
                          <td className="px-4 py-4">
                            <MlScoreBar score={patient.severity_score} />
                          </td>
                          <td className="px-4 py-4 text-sm text-foreground whitespace-nowrap">
                            {patient.referring_facility}
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm font-medium text-foreground">
                              {patient.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-border px-6 py-3 text-xs text-muted-foreground">
                  <span>Showing {displayed.length} of {triageQueue.length} active queue items</span>
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
              </>
            )}
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
                onClick={() => criticalCase && alert(`Reviewing ${criticalCase.id} – ${criticalCase.patient_name}`)}
                disabled={!criticalCase}
              >
                Review Next Critical Case
                <ArrowRight className="h-4 w-4" />
              </Button>
              {criticalCase ? (
                <p className="mt-2.5 text-center text-xs text-muted-foreground">
                  Next: <span className="font-semibold text-foreground">{criticalCase.patient_name}</span>
                </p>
              ) : (
                <p className="mt-2.5 text-center text-xs text-muted-foreground">
                  No critical cases in queue
                </p>
              )}
            </CardContent>
          </Card>

          {/* Duty Specialists */}
          <Card className="border bg-card shadow-sm">
            <CardHeader className="pb-3 pt-4 px-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Duty Specialists</p>
                <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Live
                </span>
              </div>
              
              {/* Date Selector */}
              <div className="flex items-center gap-2 mt-2">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="flex-1 h-8 rounded-md border border-border bg-background px-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value={tomorrow}>Tomorrow - {format(addDays(new Date(), 1), 'MMM dd')}</option>
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
              </div>
              
              {isToday && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Cannot modify today's schedule
                </p>
              )}
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
              {displayedSpecialists.map((spec) => (
                <div key={spec.id} className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 border border-border shrink-0">
                    <AvatarImage src="/user.png" alt={spec.name} />
                    <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                      {getInitials(spec.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{spec.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Load: {spec.currentLoad}/{spec.maxLoad}
                    </p>
                  </div>
                  {/* Toggle - disabled for today */}
                  <button
                    onClick={() => !isToday && handleToggleSpecialist(spec.id, spec.available, spec.name)}
                    aria-label={`Toggle ${spec.name} availability`}
                    disabled={isToday}
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                      isToday 
                        ? 'cursor-not-allowed opacity-50 bg-muted-foreground/20' 
                        : `cursor-pointer ${spec.available ? 'bg-primary' : 'bg-muted-foreground/30'}`
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                        spec.available ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
              
              {/* Show More/Less Button */}
              {specialists.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 text-xs"
                  onClick={() => setShowAllSpecialists(!showAllSpecialists)}
                >
                  {showAllSpecialists ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Show More ({specialists.length - 3} more)
                    </>
                  )}
                </Button>
              )}
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
                <p className="text-2xl font-extrabold tabular-nums text-primary">{highSevCount}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">Critical Today</p>
              </CardContent>
            </Card>
            <Card className="border bg-card shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-extrabold tabular-nums text-amber-500">
                  {availableCount}/{totalSpecialists}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">Available</p>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>

      {/* Off Duty Dialog */}
      <OffDutyDialog
        open={offDutyDialog.open}
        onOpenChange={(open) => setOffDutyDialog({ ...offDutyDialog, open })}
        specialistName={offDutyDialog.specialistName}
        date={selectedDate}
        onConfirm={handleConfirmOffDuty}
      />
    </div>
  );
}