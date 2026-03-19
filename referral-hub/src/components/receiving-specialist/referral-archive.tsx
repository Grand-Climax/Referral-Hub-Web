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
import { Badge } from "@/components/ui/badge";

type SortField = "time" | "name" | "status";
type SortOrder = "asc" | "desc";
type FilterStatus = "all" | "accepted" | "rejected" | "redirected";

export function ReferralArchive() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("time");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");

  // Only show processed requests in the history page
  const referrals = MOCK_REFERRALS.filter(r => 
    r.status === 'accepted' ||
    r.status === 'rejected' || 
    r.status === 'redirected' || 
    r.status === 'completed'
  );

  const filteredAndSortedReferrals = useMemo(() => {
    let result = [...referrals];

    // Status Filtering
    if (statusFilter !== "all") {
        result = result.filter(ref => ref.status === statusFilter);
    }

    // Search Filtering
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (ref) =>
          ref.patient.fullName.toLowerCase().includes(query) ||
          ref.referringHospital.toLowerCase().includes(query) ||
          ref.provisionalDiagnosis.toLowerCase().includes(query)
      );
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "time":
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case "name":
          comparison = a.patient.fullName.localeCompare(b.patient.fullName);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [referrals, searchQuery, sortField, sortOrder, statusFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc"); 
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Referral History</h1>
        <p className="text-muted-foreground">Log of past referral decisions and outcomes.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button 
          variant={statusFilter === 'all' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => setStatusFilter("all")}
        >
          All
        </Button>
        <Button 
          variant={statusFilter === 'accepted' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => setStatusFilter("accepted")}
          className={statusFilter === 'accepted' ? 'bg-emerald-600 hover:bg-emerald-700' : 'text-emerald-700 hover:text-emerald-800'}
        >
          Accepted
        </Button>
        <Button 
          variant={statusFilter === 'rejected' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => setStatusFilter("rejected")}
          className={statusFilter === 'rejected' ? 'bg-rose-600 hover:bg-rose-700' : 'text-rose-700 hover:text-rose-800'}
        >
          Rejected
        </Button>
        <Button 
          variant={statusFilter === 'redirected' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => setStatusFilter("redirected")}
          className={statusFilter === 'redirected' ? 'bg-blue-600 hover:bg-blue-700' : 'text-blue-700 hover:text-blue-800'}
        >
          Redirected
        </Button>
      </div>

      <Card className="border bg-card shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 px-6 border-b border-border">
          <div>
            <CardTitle className="text-lg font-bold">
              Processed Referrals ({filteredAndSortedReferrals.length})
            </CardTitle>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search patient, hospital..."
                className="pl-8 h-9 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2 text-sm font-medium border-border">
                  <Filter className="h-4 w-4" />
                  Sort By
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleSort('time')} className="font-medium">
                  Decision Date {sortField === 'time' && (sortOrder === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('name')}>
                  Patient Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('status')}>
                  Status {sortField === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
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
                  aria-label={`View history ${ref.id}`}
                >
                  <Eye className="h-4 w-4" />
                  <span className="text-xs hidden md:inline">View</span>
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
          {filteredAndSortedReferrals.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              No historical referrals matched your filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
