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
  Eye,
  Filter,
  Download,
  Search,
} from "lucide-react";
import { ReferralTable } from "@/components/referral/ReferralTable";
import Link from "next/link";
import { Referral } from "@/types/referral";

type SortField = "time" | "name" | "specialty" | "status" | "diagnosis" | "priority";
type SortOrder = "asc" | "desc";

export function TriageQueue() {
  const [searchQuery, setSearchQuery] = useState("");
  // Triage queue defaults to priority sort descending (highest score first)
  const [sortField, setSortField] = useState<SortField>("priority");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Only show pending or redirected requests in active triage queue
  const referrals = MOCK_REFERRALS.filter(r => r.status === 'pending' || r.status === 'redirected');

  const filteredAndSortedReferrals = useMemo(() => {
    let result = [...referrals];

    // Search Filtering
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (ref) =>
          ref.patient.fullName.toLowerCase().includes(query) ||
          ref.requiredSpecialty.toLowerCase().includes(query) ||
          ref.provisionalDiagnosis.toLowerCase().includes(query) ||
          ref.referringHospital.toLowerCase().includes(query)
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
      setSortOrder("desc"); // Default to desc when changing to support highest priority first
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Triage Queue</h1>
        <p className="text-muted-foreground">Manage and prioritize incoming patient referrals.</p>
      </div>

      <Card className="border bg-card shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 px-6 border-b border-border">
          <div>
            <CardTitle className="text-lg font-bold">
              Active Referrals ({filteredAndSortedReferrals.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Sorted by Machine Learning risk assessment
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search patient, specialty, hospital..."
                className="pl-8 h-9 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2 text-sm font-medium border-border">
                  <Filter className="h-4 w-4" />
                  Filter / Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleSort('priority')} className="font-medium">
                  Sort by Priority {sortField === 'priority' && (sortOrder === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('time')}>
                  Sort by Time {sortField === 'time' && (sortOrder === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('name')}>
                  Sort by Patient Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('specialty')}>
                  Sort by Specialty {sortField === 'specialty' && (sortOrder === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('diagnosis')}>
                  Sort by Diagnosis {sortField === 'diagnosis' && (sortOrder === 'asc' ? '↑' : '↓')}
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
                  className="text-foreground hover:bg-muted font-medium gap-2 px-3 w-auto"
                  aria-label={`Review referral ${ref.id}`}
                >
                  <Eye className="h-4 w-4" />
                  <span className="text-xs hidden md:inline">Review</span>
                </Button>
              </Link>
            )}
          />
          {filteredAndSortedReferrals.length > 0 && (
            <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
              <span>Showing {filteredAndSortedReferrals.length} referrals</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8" disabled>
                  Previous
                </Button>
                <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700 text-white px-4" disabled>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
