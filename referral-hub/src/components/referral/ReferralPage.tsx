"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { MOCK_REFERRALS } from "@/data/mock";
import { useRouter } from "next/navigation";

function StatCard({
  title,
  value,
  icon: Icon,
  accent,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  accent?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div
          className={`h-10 w-10 rounded-lg flex items-center justify-center ${accent || "bg-primary/10"}`}
        >
          <Icon
            className={`h-5 w-5 ${accent ? "text-current" : "text-primary"}`}
          />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

const ReferralDashboard = () => {
  const router = useRouter();
  const referrals = MOCK_REFERRALS;
  const pending = referrals.filter((r) => r.status === "pending");
  const approved = referrals.filter((r) => r.status === "approved");
  const accepted = referrals.filter((r) => r.status === "accepted");
  const rejected = referrals.filter((r) => r.status === "rejected");
  const critical = referrals.filter((r) => r.severity === "critical");

  return (
    <div>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome, Dawit</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Referrals"
            value={referrals.length}
            icon={FileText}
          />
          <StatCard title="Pending" value={pending.length} icon={Clock} />
          <StatCard
            title="Accepted"
            value={accepted.length}
            icon={CheckCircle}
          />
          <StatCard
            title="Critical"
            value={critical.length}
            icon={AlertTriangle}
          />
        </div>

        {/* Urgent table + Pending sidebar */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Urgent Cases Table (centre / main) ── */}
          <div className="flex-1 min-w-0 space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Urgent Cases
            </h2>

            <Card className="border-0 shadow-sm ring-1 ring-border/60 overflow-hidden">
              {critical.length === 0 ? (
                <CardContent className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">No critical cases right now.</p>
                </CardContent>
              ) : (
                <div className="h-[240px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 z-10">
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">ID</TableHead>
                        <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Patient</TableHead>
                        <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground hidden sm:table-cell">Specialty</TableHead>
                        <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground hidden md:table-cell">Hospital</TableHead>
                        <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Severity</TableHead>
                        <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground hidden sm:table-cell">Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {critical.slice(0, 6).map((ref) => (
                        <TableRow
                          key={ref.id}
                          className="cursor-pointer"
                          onClick={() => router.push(`/referring-doctor/${ref.id}`)}
                        >
                          <TableCell className="px-4 py-3 font-mono text-xs text-muted-foreground">{ref.id}</TableCell>
                          <TableCell className="px-4 py-3 font-medium text-foreground">{ref.patient.fullName}</TableCell>
                          <TableCell className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{ref.requiredSpecialty}</TableCell>
                          <TableCell className="px-4 py-3 text-muted-foreground hidden md:table-cell">{ref.referringHospital}</TableCell>
                          <TableCell className="px-4 py-3">
                            <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700 ring-1 ring-red-100 capitalize">
                              {ref.severity}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell whitespace-nowrap">
                            {new Date(ref.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </div>

          {/* ── Recent Pending Card (right sidebar) ── */}
          <div className="w-full lg:w-[300px] shrink-0 space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Recent Pending
            </h2>

            <Card className="border-0 shadow-sm ring-1 ring-border/60">
              <CardContent className="p-0">
                {pending.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No pending referrals.
                  </p>
                ) : (
                  <ul className="divide-y divide-border/40">
                    {pending.slice(0, 5).map((ref) => (
                      <li
                        key={ref.id}
                        className="flex cursor-pointer flex-col gap-1 px-4 py-3 transition-colors hover:bg-muted/30"
                        onClick={() => router.push(`/referring-doctor/${ref.id}`)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-medium text-sm text-foreground">
                            {ref.patient.fullName}
                          </span>
                          <span className="inline-flex shrink-0 items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-100 capitalize">
                            {ref.severity}
                          </span>
                        </div>
                        <p className="truncate text-xs text-muted-foreground">{ref.provisionalDiagnosis}</p>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(ref.createdAt).toLocaleDateString()}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReferralDashboard;
