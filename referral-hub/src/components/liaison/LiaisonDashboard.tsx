"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  CheckCircle2,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useGetLiaisonDashboardStatsQuery, useGetReferralsQuery } from "@/features/liaison/liaisonApi";
import type {
  LiaisonDashboardStatItem,
  LiaisonDashboardStats,
} from "@/types/liaison";
import type { ReferralListItem } from "@/types/referral-list";
import { useRouter } from "next/navigation";
import Link from "next/link";

type StatTone = "default" | "warning" | "success" | "destructive";

const STAT_CARD_DEFINITIONS: Array<{
  key: keyof LiaisonDashboardStats;
  label: string;
  icon: typeof FileText;
  accent: string;
  tone: StatTone;
}> = [
  {
    key: "total_referrals",
    label: "Total Referrals",
    icon: FileText,
    accent: "bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-200",
    tone: "default",
  },
  {
    key: "pending_review",
    label: "Pending Review",
    icon: Clock,
    accent: "bg-amber-50 text-amber-600 dark:bg-amber-500/20 dark:text-amber-200",
    tone: "warning",
  },
  {
    key: "approved_today",
    label: "Approved Today",
    icon: CheckCircle2,
    accent:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200",
    tone: "success",
  },
  {
    key: "rejected",
    label: "Rejected",
    icon: XCircle,
    accent: "bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-200",
    tone: "destructive",
  },
];

const EMPTY_STAT: LiaisonDashboardStatItem = { count: 0, change: 0 };

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: "bg-blue-100 text-blue-800",
  UNDER_LIAISON_REVIEW: "bg-yellow-100 text-yellow-800",
  FORWARDED: "bg-purple-100 text-purple-800",
  UNDER_SPECIALIST_REVIEW: "bg-indigo-100 text-indigo-800",
  ACCEPTED: "bg-green-100 text-green-800",
  SCHEDULED: "bg-teal-100 text-teal-800",
  REJECTED_BY_LIAISON: "bg-red-100 text-red-800",
  REJECTED_BY_SPECIALIST: "bg-red-100 text-red-800",
  REJECTED_AFTER_SEND: "bg-red-100 text-red-800",
  NEED_REVISION: "bg-orange-100 text-orange-800",
  COMPLETED: "bg-gray-100 text-gray-800",
};

const formatDelta = (change: number) => {
  if (!Number.isFinite(change) || change === 0) return "0%";
  const sign = change > 0 ? "+" : "";
  return `${sign}${change}%`;
};

const getDeltaPillClasses = (change: number, tone: StatTone) => {
  if (!Number.isFinite(change) || change === 0) {
    return "bg-muted text-muted-foreground";
  }
  const isImprovement = tone === "destructive" ? change < 0 : change > 0;
  return isImprovement
    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200"
    : "bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-200";
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatStatus = (status: string) => {
  return status.replace(/_/g, " ");
};

const LiaisonDashboard = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
  } = useGetLiaisonDashboardStatsQuery();

  const { data: referralsData, isLoading: referralsLoading } = useGetReferralsQuery({
    page,
    page_size: pageSize,
    listType: "all",
  });

  const referrals = referralsData?.data || [];
  const totalPages = Math.ceil((referralsData?.total || 0) / pageSize);

  const handleViewDetails = (id: string) => {
    router.push(`/liaison-officer/referrals/${id}`);
  };

  return (
    <div className="container mx-auto max-w-[1400px] py-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {STAT_CARD_DEFINITIONS.map((card) => {
          const Icon = card.icon;
          const item = stats?.[card.key] ?? EMPTY_STAT;
          const pillClasses = getDeltaPillClasses(item.change, card.tone);
          return (
            <Card key={card.label} className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {card.label}
                    </p>
                    {statsLoading ? (
                      <div className="h-8 w-20 animate-pulse rounded bg-muted" />
                    ) : statsError ? (
                      <p className="text-sm text-destructive">Error</p>
                    ) : (
                      <p className="text-3xl font-bold">{item.count}</p>
                    )}
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${pillClasses}`}
                    >
                      {formatDelta(item.change)}
                    </span>
                  </div>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.accent}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Referrals Table */}
      <Card className="border-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">Pending Approvals</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Review and approve referrals before dispatch to receiving hospitals
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/liaison-officer/referrals/approved">
              <Button variant="outline" size="sm">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Approved
              </Button>
            </Link>
            <Link href="/liaison-officer/referrals/rejected">
              <Button variant="outline" size="sm">
                <XCircle className="h-4 w-4 mr-1" />
                Rejected
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {referralsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : referrals.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No referrals found.
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Diagnosis</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referrals.map((referral: ReferralListItem) => (
                      <TableRow key={referral.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {referral.patient_first_name} {referral.patient_middle_name}{" "}
                          {referral.patient_last_name}
                        </TableCell>
                        <TableCell>{referral.department || "N/A"}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {referral.diagnosis || "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={STATUS_COLORS[referral.status] || ""}
                          >
                            {formatStatus(referral.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(referral.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(referral.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages} ({referralsData?.total} total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LiaisonDashboard;

