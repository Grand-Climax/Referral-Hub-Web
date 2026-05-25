'use client';

import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

type ActivityFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  /** Sent to API as `action_type` query param when non-empty. */
  serverActionType: string;
  onServerActionTypeChange: (value: string) => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onReset?: () => void;
};

export const ActivityFilters = ({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  serverActionType,
  onServerActionTypeChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onReset,
}: ActivityFiltersProps) => {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Action type (API)
          </label>
          <Input
            placeholder="e.g. API_CALL"
            value={serverActionType}
            onChange={(e) => onServerActionTypeChange(e.target.value)}
            className="w-[min(100%,200px)] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg shadow-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Start date
          </label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-[160px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg shadow-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            End date
          </label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-[160px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg shadow-sm"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search this page: user, resource, IP…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 w-[min(100%,300px)] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg shadow-sm"
            />
          </div>

          <Select value={category} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-[180px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="referral">Referrals</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {onReset && (
            <Button
              type="button"
              variant="outline"
              className="h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400"
              onClick={onReset}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
