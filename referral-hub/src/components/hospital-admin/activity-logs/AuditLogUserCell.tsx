'use client';

import React, { useState } from 'react';
import { useGetUserByIdQuery } from '@/features/users/usersApi';
import type { UserProfile } from '@/types/user';
import { formatHospitalStaffRole } from '@/types/hospital-admin';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

function displayName(user: UserProfile): string {
  const parts = [user.first_name, user.middle_name, user.last_name].filter(Boolean);
  const full = parts.join(' ').trim();
  return full || user.email || user.id;
}

function initials(user: UserProfile): string {
  const a = user.first_name?.[0] ?? '';
  const b = user.last_name?.[0] ?? '';
  const s = `${a}${b}`.toUpperCase();
  return s || user.email?.slice(0, 2).toUpperCase() || '?';
}

type AuditLogUserCellProps = {
  userId: string;
};

export function AuditLogUserCell({ userId }: AuditLogUserCellProps) {
  const [open, setOpen] = useState(false);
  const { data: user, isLoading, isError } = useGetUserByIdQuery(userId, {
    skip: !userId,
  });

  const label = user ? displayName(user) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group text-left max-w-[200px] rounded-md px-1 py-0.5 -mx-1 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
            Loading…
          </span>
        ) : isError || !user ? (
          <span className="font-mono text-xs text-slate-600 dark:text-slate-300 break-all">
            {userId.slice(0, 8)}…
          </span>
        ) : (
          <>
            <span className="block text-sm font-medium text-primary group-hover:underline truncate">
              {label}
            </span>
            <span className="block font-mono text-[10px] text-slate-400 truncate">{userId}</span>
          </>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User profile</DialogTitle>
            <DialogDescription>Hospital directory record for this audit actor.</DialogDescription>
          </DialogHeader>

          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          )}

          {!isLoading && isError && (
            <p className="text-sm text-destructive">
              Could not load user profile. You may lack permission or the account no longer exists.
            </p>
          )}

          {!isLoading && user && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 border border-border">
                  {user.profile_image_url ? (
                    <AvatarImage src={user.profile_image_url} alt="" />
                  ) : null}
                  <AvatarFallback className="text-lg font-semibold">{initials(user)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-lg text-foreground leading-tight">{displayName(user)}</p>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  <Badge variant="secondary" className="mt-2 font-normal">
                    {formatHospitalStaffRole(user.role)}
                  </Badge>
                </div>
              </div>

              <Separator />

              <dl className="grid gap-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground shrink-0">User ID</dt>
                  <dd className="font-mono text-xs text-right break-all">{user.id}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground shrink-0">National ID</dt>
                  <dd className="text-right">{user.national_id || '—'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground shrink-0">Hospital</dt>
                  <dd className="text-right">{user.hospital?.name ?? user.hospital_id}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground shrink-0">Department</dt>
                  <dd className="text-right">{user.department?.name ?? user.department_id ?? '—'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground shrink-0">Status</dt>
                  <dd>{user.is_active ? 'Active' : 'Inactive'}</dd>
                </div>
              </dl>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
