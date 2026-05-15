'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Search,
  UserCheck,
  UserX,
  Users,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { useGetReferralsQuery, useGetScheduleQuery } from '@/features/receptionist/receptionistApi';
import { WalkInModal } from './WalkInModal';
import { AssignDoctorModal } from './AssignDoctorModal';
import { ReferralDetailsModal } from './ReferralDetailsModal';

const PAGE_SIZE = 10;

// ─── Stat Cards ────────────────────────────────────────────────────────────────

function ExpectedTodayCard({ count }: { count: number }) {
  return (
    <Card className="border bg-card shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Expected Today</p>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-3">
          <span className="text-4xl font-extrabold tabular-nums text-foreground">{count}</span>
          <span className="text-sm font-semibold text-primary">Patients</span>
        </div>
        <div className="mt-3 h-0.5 w-full rounded-full bg-primary/20">
          <div className="h-0.5 rounded-full bg-primary" style={{ width: '70%' }} />
        </div>
      </CardContent>
    </Card>
  );
}

function AdmittedCard({ count }: { count: number }) {
  return (
    <Card className="border bg-card shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Admitted</p>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
            <UserCheck className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-3">
          <span className="text-4xl font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
            {String(count).padStart(2, '0')}
          </span>
          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Checked In</span>
        </div>
      </CardContent>
    </Card>
  );
}

function MissedCard({ count }: { count: number }) {
  return (
    <Card className="border bg-card shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Missed</p>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300">
            <UserX className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-3">
          <span className="text-4xl font-extrabold tabular-nums text-rose-600 dark:text-rose-400">
            {String(count).padStart(2, '0')}
          </span>
          <span className="text-sm font-semibold text-rose-600 dark:text-rose-400">No Show</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ReceptionistDashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedReferralId, setSelectedReferralId] = useState<string | null>(null);

  // Fetch referrals with filters
  const { data: referralsData, isLoading, error } = useGetReferralsQuery({
    page: currentPage,
    limit: PAGE_SIZE,
    patient_name: searchQuery || undefined,
    status: statusFilter || undefined,
  });

  const { data: scheduleData } = useGetScheduleQuery();

  const referrals = referralsData?.data || [];
  const totalPages = referralsData?.total 
    ? Math.ceil(referralsData.total / (referralsData.page_size || PAGE_SIZE)) 
    : 1;

  // Calculate stats
  const expectedCount = referralsData?.total || 0;
  const admittedCount = referrals.filter(r => r.status === 'ARRIVED').length;
  const missedCount = referrals.filter(r => r.status === 'MISSED').length;

  // Get next scheduled arrival
  const scheduleItems = scheduleData ? Object.values(scheduleData).flat() : [];
  const nextArrival = scheduleItems.length > 0 ? scheduleItems[0] : null;

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACCEPTED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      SCHEDULED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
      ARRIVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
      ASSIGNED: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
      MISSED: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
      COMPLETED: 'bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300',
    };
    return styles[status] || 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <ExpectedTodayCard count={expectedCount} />
        <AdmittedCard count={admittedCount} />
        <MissedCard count={missedCount} />
      </div>

      {/* Two-column layout: Patient List + Right Panel */}
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-[1fr_320px]">
        {/* ── Patient List ────────────────────────────────────────────────────── */}
        <Card className="border bg-card shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-4 px-6 border-b border-border">
            <div>
              <CardTitle className="text-base font-bold text-foreground">Expected Patients</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Scheduled arrivals for the next 48 hours
              </p>
            </div>
            <Button
              onClick={() => setIsWalkInModalOpen(true)}
              className="h-9 gap-2 text-sm bg-primary hover:bg-primary/90"
            >
              Register Walk-In
            </Button>
          </CardHeader>

          {/* Search and Filter */}
          <div className="px-6 py-4 border-b border-border bg-muted/30">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by patient name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All Status</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="ARRIVED">Arrived</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="MISSED">Missed</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <CardContent className="p-0">
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-sm text-muted-foreground">Loading patients...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <AlertCircle className="h-8 w-8 text-amber-500" />
                <span className="mt-3 text-sm font-medium text-foreground">Failed to Load Patients</span>
                <p className="mt-1 text-xs text-muted-foreground text-center max-w-md">
                  Please try again later or contact support if the issue persists.
                </p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && referrals.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-3 text-sm font-medium text-foreground">No patients found</p>
                <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters</p>
              </div>
            )}

            {/* Table */}
            {!isLoading && !error && referrals.length > 0 && (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Patient</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Department</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Region</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Updated</th>
                        <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {referrals.map((referral) => {
                        const initials = getInitials(referral.patient_first_name, referral.patient_last_name);
                        const fullName = `${referral.patient_first_name || ''} ${referral.patient_middle_name || ''} ${referral.patient_last_name || ''}`.trim();
                        
                        return (
                          <tr key={referral.id} className="transition-colors hover:bg-muted/40">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 border border-border">
                                  <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                                    {initials}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold text-foreground leading-tight">{fullName}</p>
                                  <p className="text-xs text-muted-foreground font-mono">{referral.id.slice(0, 8)}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-foreground">
                              {referral.department || 'N/A'}
                            </td>
                            <td className="px-4 py-4 text-sm text-foreground">
                              {referral.patient_region || 'N/A'}
                            </td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase ${getStatusBadge(referral.status)}`}>
                                {referral.status}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-xs text-muted-foreground">
                              {formatDate(referral.updated_at)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedReferralId(referral.id);
                                  setIsDetailsModalOpen(true);
                                }}
                                className="text-xs"
                              >
                                View Details
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-border px-6 py-3 text-xs text-muted-foreground">
                  <span>
                    Showing {referrals.length} of {referralsData?.total || 0} patients
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-3 text-sm font-medium">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
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
          {/* Next Arrival */}
          <Card className="border bg-card shadow-sm">
            <CardHeader className="pb-3 pt-4 px-5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                Next Arrival
              </p>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              {nextArrival ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border border-border">
                      <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
                        {getInitials(nextArrival.patient_first_name, nextArrival.patient_last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {`${nextArrival.patient_first_name || ''} ${nextArrival.patient_last_name || ''}`.trim()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {nextArrival.department || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatDate(nextArrival.scheduled_time)}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No scheduled arrivals</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border bg-card shadow-sm">
            <CardHeader className="pb-3 pt-4 px-5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Quick Actions</p>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 h-10"
                onClick={() => setIsWalkInModalOpen(true)}
              >
                <UserCheck className="h-4 w-4" />
                Register Walk-In
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 h-10"
                onClick={() => {
                  if (referrals.length > 0) {
                    setSelectedReferralId(referrals[0].id);
                    setIsAssignModalOpen(true);
                  }
                }}
                disabled={referrals.length === 0}
              >
                <Users className="h-4 w-4" />
                Assign Doctor
              </Button>
            </CardContent>
          </Card>

          {/* Today's Summary */}
          <Card className="border bg-card shadow-sm">
            <CardHeader className="pb-3 pt-4 px-5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Today's Summary</p>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Expected</span>
                <span className="text-sm font-bold text-foreground">{expectedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Admitted</span>
                <span className="text-sm font-bold text-emerald-600">{admittedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Missed</span>
                <span className="text-sm font-bold text-rose-600">{missedCount}</span>
              </div>
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Completion Rate</span>
                  <span className="text-sm font-bold text-primary">
                    {expectedCount > 0 ? Math.round((admittedCount / expectedCount) * 100) : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <WalkInModal open={isWalkInModalOpen} onOpenChange={setIsWalkInModalOpen} />
      <AssignDoctorModal 
        open={isAssignModalOpen} 
        onOpenChange={setIsAssignModalOpen} 
        referralId={selectedReferralId} 
      />
      <ReferralDetailsModal 
        open={isDetailsModalOpen} 
        onOpenChange={setIsDetailsModalOpen} 
        referralId={selectedReferralId} 
      />
    </div>
  );
}
