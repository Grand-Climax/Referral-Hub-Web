"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useGetPendingApprovalReferralsQuery,
  useGetReferralStatsByStatusQuery,
} from "@/features/hospitalAdmin/hospitalAdminApi";
import { HospitalAdminReferralsTable, type HospitalAdminReferralTab } from "./HospitalAdminReferralsTable";

const TAB_LABELS: Record<HospitalAdminReferralTab, string> = {
  log: "All logs",
  inbound: "Inbound",
  outbound: "Outbound",
  pending: "Pending approvals",
  rejected: "Rejected / redirected",
};

export function HospitalAdminReferralsContainer() {
  const [tab, setTab] = useState<HospitalAdminReferralTab>("log");
  const { data: stats = [], isLoading: statsLoading } = useGetReferralStatsByStatusQuery();
  const { data: pendingData } = useGetPendingApprovalReferralsQuery({ page: 1, page_size: 1 });

  const totalByStatus = useMemo(() => {
    return stats.reduce((sum, row) => sum + (row.count ?? 0), 0);
  }, [stats]);

  return (
    <div className="mx-auto space-y-6 p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Referrals</h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor inbound, outbound, and pending referral activity for your hospital.
          </p>
        </div>
        <Link href="/hospital-admin/referral-logs">
          <Button variant="outline">View analytics reports</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total (by status)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {statsLoading ? "—" : totalByStatus}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{pendingData?.total ?? 0}</p>
          </CardContent>
        </Card>
        {stats.slice(0, 2).map((row) => (
          <Card key={row.status}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {row.status.replace(/_/g, " ")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{row.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Counts by status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {stats.map((row) => (
              <Badge key={row.status} variant="secondary" className="text-xs">
                {row.status.replace(/_/g, " ")}: {row.count}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(TAB_LABELS) as HospitalAdminReferralTab[]).map((key) => (
            <Button
              key={key}
              type="button"
              variant={tab === key ? "default" : "outline"}
              size="sm"
              onClick={() => setTab(key)}
            >
              {TAB_LABELS[key]}
            </Button>
          ))}
        </div>
        <HospitalAdminReferralsTable tab={tab} />
      </div>
    </div>
  );
}
