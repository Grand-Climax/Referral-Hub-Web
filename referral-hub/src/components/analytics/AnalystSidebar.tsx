"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  TrendingUp, 
  Map, 
  FileText, 
  LayoutDashboard,
  ChevronRight,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { 
    title: "Overview", 
    href: "/analytics", 
    icon: LayoutDashboard 
  },
  { 
    title: "Regional", 
    href: "/analytics/regional", 
    icon: BarChart3 
  },
  { 
    title: "Trends", 
    href: "/analytics/trends", 
    icon: TrendingUp 
  },
  { 
    title: "Outbreak Map", 
    href: "/analytics/outbreak-map", 
    icon: Map 
  },
  { 
    title: "Reports", 
    href: "/analytics/reports", 
    icon: FileText 
  },
];

export function AnalystSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen bg-card border-r border-border/40 flex flex-col fixed left-0 top-0 z-50">
      {/* Sidebar Header */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-sm">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">Analyst Hub</h1>
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest leading-none">MOH National</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "bg-primary/10 text-primary font-bold shadow-sm" 
                  : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5",
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary transition-colors"
              )} />
              <span className="text-sm">{item.title}</span>
              {isActive && (
                <div className="absolute right-3">
                  <ChevronRight className="h-4 w-4 text-primary" />
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 mt-auto border-t border-border/20">
        <div className="flex items-center gap-3 px-2 py-3 rounded-xl bg-slate-50/50">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
            AN
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700">Analyst User</p>
            <p className="text-[10px] text-slate-400">MOH Ethiopia</p>
          </div>
        </div>
      </div>
    </div>
  );
}
