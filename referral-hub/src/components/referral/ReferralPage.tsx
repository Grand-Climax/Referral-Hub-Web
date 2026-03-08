"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { MOCK_REFERRALS } from "@/data/mock";
import { useRouter } from "next/navigation";
import { ReferralCard } from "./ReferralCard";

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

        {/* Recent / Urgent */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Urgent Cases
            </h2>
            {critical.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No critical cases right now.
              </p>
            )}
            {critical.slice(0, 3).map((ref) => (
              <ReferralCard
                key={ref.id}
                referral={ref}
                compact
                onClick={() => router.push(`/referring-doctor/${ref.id}`)}
              />
            ))}
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Recent Pending
            </h2>
            {pending.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No pending referrals.
              </p>
            )}
            {pending.slice(0, 3).map((ref) => (
              <ReferralCard
                key={ref.id}
                referral={ref}
                compact
                onClick={() => router.push(`/doctor/${ref.id}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralDashboard;
