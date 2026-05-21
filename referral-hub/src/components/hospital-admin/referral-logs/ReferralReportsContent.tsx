'use client';

import React, { useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useGetDepartmentsQuery } from '@/features/department/department';
import type {
  BusiestDepartmentRow,
  MonthlyReferralRow,
  TopReferringHospitalRow,
} from '@/types/hospital-admin';

type ReferralReportsContentProps = {
  monthly: MonthlyReferralRow[] | undefined;
  hospitals: TopReferringHospitalRow[] | undefined;
  departments: BusiestDepartmentRow[] | undefined;
  isLoading: boolean;
  isError?: boolean;
};

export const ReferralReportsContent = ({
  monthly = [],
  hospitals = [],
  departments = [],
  isLoading,
  isError,
}: ReferralReportsContentProps) => {
  const { data: deptList = [] } = useGetDepartmentsQuery();
  const [q, setQ] = useState('');

  const deptName = (id: string) => {
    const d = deptList.find((x) => x.id === id);
    return d?.name ?? `${id.slice(0, 8)}…`;
  };

  const chartData = useMemo(
    () =>
      monthly.map((m) => ({
        month: m.month,
        count: m.count,
      })),
    [monthly],
  );

  const filteredHospitals = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return hospitals;
    return hospitals.filter((h) => h.hospital_name.toLowerCase().includes(s));
  }, [hospitals, q]);

  const filteredDepartments = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return departments;
    return departments.filter((d) => {
      const name = deptName(d.department_id).toLowerCase();
      return name.includes(s) || d.department_id.toLowerCase().includes(s);
    });
  }, [departments, q, deptList]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-72 rounded-xl bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-64 rounded-xl bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
          <div className="h-64 rounded-xl bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-6 text-sm text-destructive">
        Some report data could not be loaded. Refresh the page or sign in again.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Filter tables by hospital or department…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
        />
      </div>

      <Card className="border-slate-100 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Monthly referrals</CardTitle>
          <CardDescription>Referral volume by month from the reporting API.</CardDescription>
        </CardHeader>
        <CardContent className="h-80 w-full min-h-[280px] min-w-0">
          {chartData.length === 0 ? (
            <p className="text-sm text-slate-500 py-12 text-center">No monthly data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%" minHeight={280}>
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-slate-500" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} className="text-slate-500" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'var(--popover)',
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="var(--color-primary, var(--primary))"
                  radius={[4, 4, 0, 0]}
                  name="Referrals"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-slate-50">Top referring hospitals</h3>
            <p className="text-xs text-slate-500 mt-0.5">By outbound/inbound referral count</p>
          </div>
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableRow>
                <TableHead className="text-[10px] font-bold uppercase text-slate-400">Hospital</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-slate-400 text-right">
                  Count
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHospitals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-sm text-slate-500 py-8">
                    No hospitals match your filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredHospitals.map((row) => (
                  <TableRow key={row.hospital_id}>
                    <TableCell className="font-medium text-slate-900 dark:text-slate-50">
                      {row.hospital_name}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{row.count}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-slate-50">Busiest departments</h3>
            <p className="text-xs text-slate-500 mt-0.5">Department IDs resolved against your directory when available</p>
          </div>
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableRow>
                <TableHead className="text-[10px] font-bold uppercase text-slate-400">Department</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-slate-400 text-right">
                  Referrals
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDepartments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-sm text-slate-500 py-8">
                    No departments match your filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDepartments.map((row) => (
                  <TableRow key={row.department_id}>
                    <TableCell className="font-medium text-slate-900 dark:text-slate-50">
                      {deptName(row.department_id)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{row.count}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
