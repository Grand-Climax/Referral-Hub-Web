"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Bell,
  MessageCircle,
} from "lucide-react";

const statCards = [
  {
    label: "Total Referrals",
    value: 128,
    delta: "+12%",
    icon: FileText,
    accent:
      "bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-200",
    pill: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200",
  },
  {
    label: "Pending Review",
    value: 14,
    delta: "-5%",
    icon: Clock,
    accent:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/20 dark:text-amber-200",
    pill: "bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-200",
  },
  {
    label: "Approved Today",
    value: 32,
    delta: "+8%",
    icon: CheckCircle2,
    accent:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200",
    pill: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200",
  },
  {
    label: "Rejected",
    value: 5,
    delta: "-2%",
    icon: XCircle,
    accent:
      "bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-200",
    pill: "bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-200",
  },
];

const activityItems = [
  {
    id: "#4021",
    status: "Approved",
    statusColor: "bg-emerald-500",
    title: "Referral #4021 Approved",
    subtitle: "Patient: Johnathan Doe • Department: Cardiology",
    timeAgo: "2 MINUTES AGO",
  },
  {
    id: "#4020",
    status: "New",
    statusColor: "bg-blue-500",
    title: "New Referral from Dr. Smith",
    subtitle: "Priority: Urgent • Internal Medicine",
    timeAgo: "15 MINUTES AGO",
  },
  {
    id: "#3988",
    status: "Rejected",
    statusColor: "bg-rose-500",
    title: "Referral #3988 Rejected",
    subtitle: "Missing insurance authorization documents.",
    timeAgo: "1 HOUR AGO",
  },
  {
    id: "#3950",
    status: "Returned",
    statusColor: "bg-amber-500",
    title: "Referral #3950 Returned for Info",
    subtitle: "Awaiting lab results for Patient: Maria Garcia.",
    timeAgo: "2 HOURS AGO",
  },
];

const LiaisonDashboard = () => {
  return (
    <div className="space-y-8">
      {/* Top stats row */}
      <div className="grid gap-4 md:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="border bg-card shadow-sm">
              <CardContent className="flex items-center gap-4 p-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.accent}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {card.label}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${card.pill}`}
                    >
                      {card.delta}
                    </span>
                  </div>
                  <p className="text-xl font-semibold text-foreground">
                    {card.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        {/* Recent Activity */}
        <Card className="border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">
              Recent Activity
            </CardTitle>
            <button className="text-xs font-medium text-primary hover:underline">
              View All
            </button>
          </CardHeader>
          <CardContent className="border-t border-border pt-4">
            <div className="relative pl-4">
              <div className="absolute left-3 top-0 bottom-0 w-px bg-border/70" />
              <div className="space-y-4">
                {activityItems.map((item) => (
                  <div key={item.id} className="relative flex gap-3 pl-3">
                    <div className="mt-1 flex h-3 w-3 shrink-0 items-center justify-center">
                      <span
                        className={`block h-3 w-3 rounded-full ${item.statusColor}`}
                      />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-foreground">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.subtitle}
                      </p>
                      <p className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground/70">
                        {item.timeAgo}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right column: Action Required + Active Staff */}
        <div className="space-y-4">
          {/* Action Required */}
          <Card className="border bg-blue-50/80 shadow-sm dark:bg-slate-900/60">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-500 dark:text-blue-300" />
                <CardTitle className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  Action Required
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="space-y-2 rounded-xl bg-white px-3 py-3 dark:bg-slate-900/80">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-500">
                  Emergency
                </p>
                <p className="text-sm font-medium text-slate-900">
                  Stat Referral #4030
                </p>
                <p className="text-xs text-slate-500">
                  Needs review within 15m
                </p>
              </div>
              <div className="space-y-2 rounded-xl bg-white px-3 py-3 dark:bg-slate-900/80">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-500">
                  Clarification
                </p>
                <p className="text-sm font-medium text-slate-900">
                  Dr. Peterson reply
                </p>
                <p className="text-xs text-slate-500">
                  Document upload pending
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Active Staff */}
          <Card className="border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold">
                Active Staff
              </CardTitle>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200">
                12 ONLINE
              </span>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                    <span className="text-xs font-semibold">JW</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Dr. James Wilson
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Chief Liaison
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-50 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200">
                    <span className="text-xs font-semibold">ER</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Nurse Elena Rodriguez
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ER Coordinator
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                </button>
              </div>
              <Button
                variant="outline"
                className="mt-2 w-full justify-center text-xs font-medium"
              >
                Full Directory
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LiaisonDashboard;

