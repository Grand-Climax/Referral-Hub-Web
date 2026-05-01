'use client'
import { useState, useMemo } from "react";
import { MOCK_REFERRALS } from "@/data/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  CalendarCheck,
  Eye,
  Filter,
  Download,
  Search,
  ArrowUpDown
} from "lucide-react";
import { ReferralTable } from "@/components/referral/ReferralTable";
import { Referral } from "@/types/referral";
import Link from "next/link";

const statConfig = [
  {
    label: "Total Incoming",
    key: "total",
    icon: FileText,
    accent:
      "bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-200",
    delta: "+12%",
    trendUp: true,
  },
  {
    label: "High Severity",
    key: "high",
    icon: AlertTriangle,
    accent:
      "bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-200",
    delta: "-5%",
    trendUp: false,
  },
  {
    label: "Pending Reviews",
    key: "pending",
    icon: Clock,
    accent:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/20 dark:text-amber-200",
    delta: "+8%",
    trendUp: true,
  },
  {
    label: "Accepted",
    key: "accepted",
    icon: CheckCircle2,
    accent:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200",
    delta: "+15%",
    trendUp: true,
  },
  {
    label: "Rejected",
    key: "rejected",
    icon: XCircle,
    accent:
      "bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-200",
    delta: "-2%",
    trendUp: false,
  },
  {
    label: "Today's Scheduled",
    key: "scheduled",
    icon: CalendarCheck,
    accent:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-200",
    delta: "+4%",
    trendUp: true,
  },
];

type SortField = "time" | "name" | "specialty" | "status" | "diagnosis" | "priority";
type SortOrder = "asc" | "desc";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("time");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const referrals = MOCK_REFERRALS;
  const total = referrals.length;
  const high = referrals.filter((r) => r.severity === "critical" || r.severity === "high").length;
  const pending = referrals.filter((r) => r.status === "pending").length;
  const accepted = referrals.filter((r) => r.status === "accepted").length;
  const rejected = referrals.filter((r) => r.status === "rejected").length;
  const scheduled = 18; // Mock value for Today's Scheduled

  const counts: Record<string, number> = {
    total,
    high,
    pending,
    accepted,
    rejected,
    scheduled,
  };

  const filteredAndSortedReferrals = useMemo(() => {
    let result = [...referrals];

    // Search Filtering
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (ref) =>
          ref.patient.fullName.toLowerCase().includes(query) ||
          ref.requiredSpecialty.toLowerCase().includes(query) ||
          ref.provisionalDiagnosis.toLowerCase().includes(query)
      );
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "time":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "name":
          comparison = a.patient.fullName.localeCompare(b.patient.fullName);
          break;
        case "specialty":
          comparison = a.requiredSpecialty.localeCompare(b.requiredSpecialty);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "diagnosis":
          comparison = a.provisionalDiagnosis.localeCompare(b.provisionalDiagnosis);
          break;
        case "priority":
          comparison = a.severityScore - b.severityScore;
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [referrals, searchQuery, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Stat row */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {statConfig.map((stat) => {
          // In the design, icons are not present in these cards, only numbers, labels and trends.
          return (
            <Card
              key={stat.label}
              className="border bg-card shadow-sm"
            >
              <CardContent className="p-4 flex flex-col justify-between h-full">
                <span className="text-xs font-semibold text-muted-foreground mb-2">
                  {stat.label}
                </span>
                <div className="flex items-end justify-between mt-1">
                  <p className="text-2xl font-bold tracking-tight text-foreground">
                    {counts[stat.key]}
                  </p>
                  <div className={`flex items-center text-xs font-semibold ${stat.trendUp ? "text-emerald-500" : "text-rose-500"}`}>
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {stat.trendUp ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                      )}
                    </svg>
                    {stat.delta}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Incoming Referral Queue */}
      <Card className="border bg-card shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 px-6 border-b border-border">
          <div>
            <CardTitle className="text-lg font-bold">
              Incoming Referral Queue
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Prioritized by Machine Learning triage scores
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search patient, specialty, diagnosis..."
                className="pl-8 h-9 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2 text-sm font-medium border-border">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleSort('time')}>
                  Sort by Time {sortField === 'time' && (sortOrder === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('name')}>
                  Sort by Patient Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('specialty')}>
                  Sort by Specialty {sortField === 'specialty' && (sortOrder === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('status')}>
                  Sort by Status {sortField === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('diagnosis')}>
                  Sort by Diagnosis {sortField === 'diagnosis' && (sortOrder === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('priority')}>
                  Sort by Priority {sortField === 'priority' && (sortOrder === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" className="h-9 gap-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ReferralTable
            referrals={filteredAndSortedReferrals}
            actionSlot={(ref) => (
              <Link href={`/receiving-specialist/${ref.id}`}>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="text-foreground hover:bg-muted"
                  aria-label={`View referral ${ref.id}`}
                >
                  <Eye className="h-5 w-5" />
                </Button>
              </Link>
            )}
          />
          <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing {Math.min(5, filteredAndSortedReferrals.length)} of {filteredAndSortedReferrals.length} referrals</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8">
                Previous
              </Button>
              <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700 text-white px-4">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
