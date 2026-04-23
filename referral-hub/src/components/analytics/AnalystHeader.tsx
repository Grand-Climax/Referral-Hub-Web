"use client";

import { Bell, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetCurrentUserQuery } from "@/features/auth/authApi";

export function AnalystHeader() {
  const { data: user } = useGetCurrentUserQuery();

  const userName = user
    ? `${user.first_name} ${user.last_name}`
    : "Analyst User";
  const userDetails = user?.hospital?.name ?? "MOH Ethiopia";
  const userInitials = user
    ? `${user.first_name?.[0] ?? "A"}${user.last_name?.[0] ?? "N"}`.toUpperCase()
    : "AN";

  return (
    <header className="h-16 border-b border-border/40 bg-card/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
      {/* Search Bar */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search analytics, regions, diseases..."
            className="w-full bg-slate-50 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-xl relative"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-card" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-xl"
        >
          <Settings className="h-5 w-5" />
        </Button>
        <div className="hidden lg:flex items-center gap-3 rounded-2xl bg-slate-50/70 px-3 py-2 ring-1 ring-border/40">
          <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-bold text-primary">
            {userInitials}
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-foreground">
              {userName}
            </p>
            <p className="truncate text-[10px] text-muted-foreground">
              {userDetails}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
