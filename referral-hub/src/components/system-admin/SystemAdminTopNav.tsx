"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Layers, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/systemAdmin/users",
    label: "User Management",
    icon: Users,
  },
  {
    href: "/systemAdmin/hospitals",
    label: "Hospital Management",
    icon: Building2,
  },
  {
    href: "/systemAdmin/departments",
    label: "Department Management",
    icon: Layers,
  },
] as const;

export function SystemAdminTopNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-2">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-cyan-300 bg-cyan-100 text-cyan-900"
                : "border-border/70 bg-background text-muted-foreground hover:bg-muted",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
