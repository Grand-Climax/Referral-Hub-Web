import React from 'react';
import { Search, Filter, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export const ReferralLogsFilters = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search patient or ID..." 
            className="pl-9 w-[280px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <Select defaultValue="all-status">
          <SelectTrigger className="w-[150px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-status">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all-specialties">
          <SelectTrigger className="w-[180px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
            <SelectValue placeholder="Specialty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-specialties">All Specialties</SelectItem>
            <SelectItem value="cardiology">Cardiology</SelectItem>
            <SelectItem value="general-surgery">General Surgery</SelectItem>
            <SelectItem value="internal-medicine">Internal Medicine</SelectItem>
            <SelectItem value="ophthalmology">Ophthalmology</SelectItem>
            <SelectItem value="pediatrics">Pediatrics</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" className="h-10 px-3 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400">
          <Calendar className="h-4 w-4 mr-2" />
          Last 30 Days
        </Button>
        <Button variant="outline" className="h-10 px-3 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400">
          <Filter className="h-4 w-4 mr-2" />
          More Filters
        </Button>
      </div>
    </div>
  );
};
