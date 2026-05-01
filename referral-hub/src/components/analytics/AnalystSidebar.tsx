"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  TrendingUp,
  Map,
  FileText,
  LayoutDashboard,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useLogoutMutation } from "@/features/auth/authApi";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Overview",
    href: "/analytics",
    icon: LayoutDashboard,
  },
  {
    title: "Regional",
    href: "/analytics/regional",
    icon: BarChart3,
  },
  {
    title: "Trends",
    href: "/analytics/trends",
    icon: TrendingUp,
  },
  {
    title: "Outbreak Map",
    href: "/analytics/outbreak-map",
    icon: Map,
  },
  {
    title: "Reports",
    href: "/analytics/reports",
    icon: FileText,
  },
];

export function AnalystSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [logoutApi, { isLoading: isLoggingOut }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
      router.push("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <div className="w-64 h-screen bg-card border-r border-border/40 flex flex-col fixed left-0 top-0 z-50">
      {/* Sidebar Header */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 overflow-hidden rounded-2xl bg-primary/5 ring-1 ring-primary/10 shadow-sm">
            <Image
              src="/logo.png"
              alt="MedRefer"
              fill
              className="object-cover object-center"
              priority
            />
          </div>
          <div className="leading-tight">
            <p className="text-lg font-semibold tracking-tight text-foreground">
              MedRefer
            </p>
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
                  : "text-muted-foreground hover:bg-slate-50 hover:text-foreground",
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-primary transition-colors",
                )}
              />
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
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-slate-50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" />
            <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
