import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, MoreHorizontal } from 'lucide-react';
import { mockStaff } from './mockData';

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

export const StaffGrid = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {mockStaff.map((staff) => (
        <Card key={staff.id} className="border-none shadow-sm dark:bg-slate-900/50 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <Avatar className="h-14 w-14 border-2 border-slate-100 dark:border-slate-800">
                <AvatarImage src={staff.avatar} alt={staff.name} />
                <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-lg">{staff.initials}</AvatarFallback>
              </Avatar>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-bold text-slate-900 dark:text-slate-50 text-lg leading-tight mb-0.5">{staff.name}</h4>
              <p className="text-xs text-slate-400">ID: {staff.id}</p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <Badge variant="outline" className={`${getRoleColor(staff.role)} py-0.5 px-2 text-[10px] font-bold rounded-md uppercase tracking-wide border`}>
                  {staff.role}
                </Badge>
                <div className={`h-2.5 w-2.5 rounded-full ${staff.status === 'active' ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
              </div>
              
              <div className="text-sm text-slate-600 dark:text-slate-400">
                <p className="font-medium text-[10px] text-slate-400 uppercase tracking-wider mb-1">Department</p>
                <p>{staff.department}</p>
              </div>

              <div className="pt-2 border-t border-slate-50 dark:border-slate-800">
                <p className="font-medium text-[10px] text-slate-400 uppercase tracking-wider mb-2">Permissions</p>
                <div className="flex gap-1.5 flex-wrap">
                  {staff.permissions.map((perm) => (
                    <Badge key={perm} variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium px-2 py-0 border-none rounded-md">
                      {perm}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
