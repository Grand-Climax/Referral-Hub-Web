import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, MoreHorizontal } from 'lucide-react';
import { mockStaff, StaffMember } from './mockData';

const getRoleColor = (role: string) => {
  switch (role) {
    case 'Specialist':
      return 'bg-blue-50 text-blue-600 border-blue-200';
    case 'Liaison Officer':
      return 'bg-slate-50 text-slate-600 border-slate-200';
    case 'Doctor':
      return 'bg-indigo-50 text-indigo-600 border-indigo-200';
    case 'Admin Staff':
      return 'bg-orange-50 text-orange-600 border-orange-200';
    case 'Nursing Admin':
      return 'bg-purple-50 text-purple-600 border-purple-200';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
};

export const StaffList = () => {
  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
          <TableRow>
            <TableHead className="py-4 px-6 text-[10px] font-bold tracking-wider uppercase text-slate-400">NAME & ID</TableHead>
            <TableHead className="py-4 px-6 text-[10px] font-bold tracking-wider uppercase text-slate-400">ROLE</TableHead>
            <TableHead className="py-4 px-6 text-[10px] font-bold tracking-wider uppercase text-slate-400">DEPARTMENT</TableHead>
            <TableHead className="py-4 px-6 text-[10px] font-bold tracking-wider uppercase text-slate-400">PERMISSIONS</TableHead>
            <TableHead className="py-4 px-6 text-[10px] font-bold tracking-wider uppercase text-slate-400">STATUS</TableHead>
            <TableHead className="py-4 px-6 text-[10px] font-bold tracking-wider uppercase text-slate-400 text-right">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockStaff.map((staff) => (
            <TableRow key={staff.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
              <TableCell className="py-4 px-6">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-800">
                    <AvatarImage src={staff.avatar} alt={staff.name} />
                    <AvatarFallback className="bg-slate-100 text-slate-600 font-semibold">{staff.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-slate-50">{staff.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">ID: {staff.id}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-4 px-6">
                <Badge variant="outline" className={`${getRoleColor(staff.role)} py-0.5 px-2 text-[10px] font-bold rounded-md uppercase tracking-wide border`}>
                  {staff.role}
                </Badge>
              </TableCell>
              <TableCell className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">
                {staff.department}
              </TableCell>
              <TableCell className="py-4 px-6">
                <div className="flex gap-1.5 flex-wrap">
                  {staff.permissions.map((perm) => (
                    <Badge key={perm} variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium px-2 py-0 border-none rounded-md">
                      {perm}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="py-4 px-6">
                <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${staff.status === 'active' ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'}`}>
                  <span className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${staff.status === 'active' ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
              </TableCell>
              <TableCell className="py-4 px-6 text-right">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <Edit2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
