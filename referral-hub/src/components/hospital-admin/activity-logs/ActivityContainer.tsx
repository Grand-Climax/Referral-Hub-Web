'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityHeader } from './ActivityHeader';
import { ActivityStats } from './ActivityStats';
import { ActivityFilters } from './ActivityFilters';
import { ActivityList } from './ActivityList';
import { useGetAuditLogsQuery } from '@/features/hospitalAdmin/hospitalAdminApi';
import type { HospitalAdminAuditLog } from '@/types/hospital-admin';
import { auditLogCategory } from './auditLogDisplay';

export const ActivityContainer = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [serverActionType, setServerActionType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');

  useEffect(() => {
    setPage(1);
  }, [serverActionType, startDate, endDate, pageSize]);

  const queryParams = useMemo(
    () => ({
      page,
      page_size: pageSize,
      ...(serverActionType.trim() ? { action_type: serverActionType.trim() } : {}),
      ...(startDate ? { start_date: startDate } : {}),
      ...(endDate ? { end_date: endDate } : {}),
    }),
    [page, pageSize, serverActionType, startDate, endDate],
  );

  const { data, isLoading, isError } = useGetAuditLogsQuery(queryParams);

  const logs = data?.data ?? [];
  const total = data?.total ?? 0;

  const filteredLogs = useMemo(() => {
    return logs.filter((log: HospitalAdminAuditLog) => {
      if (category !== 'all') {
        if (auditLogCategory(log) !== category) return false;
      }
      const q = search.trim().toLowerCase();
      if (q) {
        const hay = `${log.user_id} ${log.resource} ${log.resource_id} ${log.ip_address} ${log.action_type}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [logs, category, search]);

  const exportJson = useCallback(() => {
    const payload = {
      filters: queryParams,
      total,
      exported_rows: logs,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hospital-audit-log-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [logs, queryParams, total]);

  const resetFilters = useCallback(() => {
    setSearch('');
    setCategory('all');
    setServerActionType('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  }, []);

  const errMsg = isError
    ? 'Failed to load audit logs. Please refresh the page or sign in again.'
    : undefined;

  return (
    <div className="mx-auto min-h-screen bg-slate-50/30 dark:bg-transparent">
      <ActivityHeader onExportJson={exportJson} disabledExport={isLoading || logs.length === 0} />
      <ActivityStats logs={logs} totalCount={total} isLoading={isLoading} />
      <ActivityFilters
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        serverActionType={serverActionType}
        onServerActionTypeChange={setServerActionType}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onReset={resetFilters}
      />
      <ActivityList
        logs={filteredLogs}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errMsg}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        clientFilterActive={search.trim() !== '' || category !== 'all'}
      />
    </div>
  );
};
