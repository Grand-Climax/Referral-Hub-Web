import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { PriorityIndicator } from '@/components/PriorityIndicator';
import { Button } from '@/components/ui/button';
import { Eye, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { mockReferralLogs } from './mockData';
import { formatDistanceToNow } from 'date-fns';

export const ReferralLogsTable = () => {
  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
          <TableRow>
            <TableHead className="py-4 px-6 text-[10px] font-bold tracking-wider uppercase text-slate-400">PATIENT</TableHead>
            <TableHead className="py-4 px-6 text-[10px] font-bold tracking-wider uppercase text-slate-400">REFERRAL ID</TableHead>
            <TableHead className="py-4 px-6 text-[10px] font-bold tracking-wider uppercase text-slate-400">SPECIALTY</TableHead>
            <TableHead className="py-4 px-6 text-[10px] font-bold tracking-wider uppercase text-slate-400">PRIORITY</TableHead>
            <TableHead className="py-4 px-6 text-[10px] font-bold tracking-wider uppercase text-slate-400">STATUS</TableHead>
            <TableHead className="py-4 px-6 text-[10px] font-bold tracking-wider uppercase text-slate-400">DATE</TableHead>
            <TableHead className="py-4 px-6 text-[10px] font-bold tracking-wider uppercase text-slate-400 text-right">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockReferralLogs.map((log) => (
            <TableRow key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors cursor-pointer group">
              <TableCell className="py-4 px-6">
                <div>
                  <p className="font-bold text-sm text-slate-900 dark:text-slate-50">
                    {log.patient ? [log.patient.first_name, log.patient.last_name].filter(Boolean).join(' ') : 'Unknown Patient'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 whitespace-nowrap">
                    {log.patient ? `${log.patient.sex} — ${log.patient.id}` : '—'}
                  </p>
                </div>
              </TableCell>
              <TableCell className="py-4 px-6">
                <code className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">
                  {log.id}
                </code>
              </TableCell>
              <TableCell className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">
                {log.target_dept_id}
              </TableCell>
              <TableCell className="py-4 px-6">
                <PriorityIndicator
                  severity={log.severity || 'medium'}
                  score={0}
                  compact
                />
              </TableCell>
              <TableCell className="py-4 px-6">
                <StatusBadge status={log.status} />
              </TableCell>
              <TableCell className="py-4 px-6 text-xs text-slate-400">
                {log.created_at ? formatDistanceToNow(new Date(log.created_at), { addSuffix: true }) : '—'}
              </TableCell>
              <TableCell className="py-4 px-6 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 group-hover:text-blue-600 transition-colors">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Pagination Bar inside table container */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          SHOWING 1-5 OF 1,248
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-slate-200 dark:border-slate-800">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1 mx-2">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:border-blue-500">1</Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500">2</Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500">3</Button>
            <span className="text-slate-300 mx-1">...</span>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500">125</Button>
          </div>
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-slate-200 dark:border-slate-800">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
