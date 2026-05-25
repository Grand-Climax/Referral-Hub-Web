'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { HospitalAdminAuditLog } from '@/types/hospital-admin';
import { auditLogCategory, parseAuditTimestamp, type AuditDisplayCategory } from './auditLogDisplay';
import { AuditLogUserCell } from './AuditLogUserCell';

const getCategoryColor = (category: AuditDisplayCategory) => {
  switch (category) {
    case 'referral':
      return 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800';
    case 'staff':
      return 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800';
    case 'security':
      return 'bg-red-50 text-red-600 border-red-100 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800';
    case 'system':
      return 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-100';
  }
};

type ActivityListProps = {
  logs: HospitalAdminAuditLog[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  /** Search/category filters hide some rows on this page */
  clientFilterActive?: boolean;
};

export const ActivityList = ({
  logs,
  isLoading,
  isError,
  errorMessage,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  clientFilterActive,
}: ActivityListProps) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const startIdx = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIdx = total === 0 ? 0 : Math.min(page * pageSize, total);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="animate-pulse p-4 space-y-3">
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-full" />
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800/80 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-6 text-sm text-destructive">
        {errorMessage || 'Could not load audit logs. Check your session and try again.'}
      </div>
    );
  }

  if (logs.length === 0 && total === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 px-6 py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
        No audit entries match your filters.
      </div>
    );
  }

  if (logs.length === 0 && total > 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 px-6 py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
        No rows on this page match your search or category filters. Clear the client filters or go to
        another page.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
            <TableRow>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                Time
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                User
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                Action
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                Resource
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                Category
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                IP
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 min-w-[200px]">
                User agent
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => {
              const category = auditLogCategory(log);
              return (
                <TableRow
                  key={log.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
                >
                  <TableCell className="text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap align-top py-3">
                    <span className="block font-medium text-slate-900 dark:text-slate-50">
                      {formatDistanceToNow(parseAuditTimestamp(log.timestamp), { addSuffix: true })}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                  </TableCell>
                  <TableCell className="align-top py-3 max-w-[220px]">
                    <AuditLogUserCell userId={log.user_id} />
                  </TableCell>
                  <TableCell className="text-sm font-medium align-top py-3 whitespace-nowrap">
                    {log.action_type}
                  </TableCell>
                  <TableCell className="text-sm align-top py-3 max-w-[220px]">
                    <span className="break-words">{log.resource}</span>
                    {log.resource_id ? (
                      <span className="block text-[10px] font-mono text-slate-400 mt-0.5 break-all">
                        {log.resource_id}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="align-top py-3">
                    <Badge
                      variant="outline"
                      className={`${getCategoryColor(category)} py-0 px-2 text-[10px] font-bold rounded-md uppercase tracking-wide border w-fit`}
                    >
                      {category}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs align-top py-3 whitespace-nowrap">
                    {log.ip_address}
                  </TableCell>
                  <TableCell className="text-[11px] text-slate-500 dark:text-slate-400 align-top py-3 max-w-[280px]">
                    <span className="line-clamp-2 break-all">{log.user_agent}</span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-2">
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span className="normal-case font-normal text-xs text-slate-600 dark:text-slate-400">
            {clientFilterActive ? (
              <>
                Showing <strong className="text-slate-900 dark:text-slate-100">{logs.length}</strong>{' '}
                visible row(s) on this page · API reports{' '}
                <strong className="text-slate-900 dark:text-slate-100">{total}</strong> matching row(s)
                total
              </>
            ) : (
              <>
                Showing {startIdx}–{endIdx} of {total}
              </>
            )}
          </span>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <div className="flex items-center gap-2 normal-case font-normal">
            <span className="text-xs text-slate-500">Rows per page</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => onPageSizeChange(Number(v))}
            >
              <SelectTrigger className="h-8 w-[72px] text-xs border-slate-200 dark:border-slate-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg border-slate-200 dark:border-slate-800"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-slate-600 dark:text-slate-400 tabular-nums px-2 min-w-[5rem] text-center">
            Page {page} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg border-slate-200 dark:border-slate-800"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
