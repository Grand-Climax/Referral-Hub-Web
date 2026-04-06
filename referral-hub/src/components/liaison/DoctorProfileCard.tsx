"use client"

import { Mail, ShieldCheck } from "lucide-react";
import { useGetUserByIdQuery } from "@/features/auth/authApi";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface DoctorProfileCardProps {
  userId: string;
}

export function DoctorProfileCard({ userId }: { userId: string }) {
  const { data: user, isLoading } = useGetUserByIdQuery(userId);

  if (isLoading) {
    return (
      <div className="space-y-3 p-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <div className="space-y-2 border-t pt-3">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="p-4 text-xs text-muted-foreground italic">Profile data unavailable</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        < Avatar className="h-12 w-12 border-2 border-primary/20 shadow-sm">
          <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
            {user.first_name?.[0]}{user.last_name?.[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-base font-bold text-foreground">Dr. {user.first_name} {user.last_name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
             <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 text-[10px] py-0 px-1.5 leading-tight font-bold uppercase">
               {user.role?.replace('_', ' ')}
             </Badge>
          </div>
        </div>
      </div>
      
      <div className="space-y-2.5 border-t border-border pt-4">
        <div className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors group">
          <div className="p-1.5 rounded-md bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            <Mail className="h-3.5 w-3.5" />
          </div>
          <span className="truncate">{user.email}</span>
        </div>
        <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <div className="p-1.5 rounded-md bg-muted/50">
            <ShieldCheck className="h-3.5 w-3.5" />
          </div>
          <span>ID Verfied</span>
        </div>
      </div>
    </div>
  );
}
