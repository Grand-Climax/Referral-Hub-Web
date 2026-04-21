"use client";

import { 
  Bell, 
  Search, 
  Settings, 
  Calendar,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function AnalystHeader() {
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
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 mr-2 cursor-pointer hover:bg-slate-100 transition-colors">
          <Calendar className="h-4 w-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700">Jan 2026 - Feb 2026</span>
        </div>

        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-xl">
          <Download className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-xl relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-card" />
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-xl">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
