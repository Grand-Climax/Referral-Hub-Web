"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  ListChecks,
  Users,
  BarChart3,
  ClipboardList,
  CalendarCheck,
  ArrowLeftRight,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavSubItem {
  title: string;
  url: string;
}

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  items?: NavSubItem[];
}

const NAV_BY_ROLE = {
  referring_doctor: [
    { title: "Dashboard", url: "/doctor", icon: LayoutDashboard },
    { title: "Create Referral", url: "/doctor/referralForm", icon: FilePlus },
    { title: "My Referral", url: "/doctor/myReferral", icon: FileText },
  ],
  receiving_specialist: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Incoming Referral", url: "/doctor", icon: FileText },
    { title: "Triage Queue", url: "/queue", icon: ListChecks },
  ],
  hospital_admin: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Pending Approvals", url: "/doctor", icon: ClipboardList },
    { title: "All Referral", url: "/doctor/all", icon: FileText },
  ],
  receptionist: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Accepted Referral", url: "/doctor", icon: FileText },
    { title: "Schedule", url: "/schedule", icon: CalendarCheck },
  ],
  department_head: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Department Referral", url: "/doctor", icon: FileText },
    { title: "Analytics", url: "/analytics", icon: BarChart3 },
  ],
  liaison_officer: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Transfers", url: "/doctor", icon: ArrowLeftRight },
    { title: "Coordination", url: "/queue", icon: Users },
  ],
  moh_analyst: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Analytics", url: "/analytics", icon: BarChart3 },
    { title: "All Referral", url: "/doctor", icon: FileText },
  ],
};

type RoleKey = keyof typeof NAV_BY_ROLE;

interface DashboardSidebarProps {
  role?: RoleKey;
}

export function DashboardSidebar({
  role = "referring_doctor",
}: DashboardSidebarProps) {
  const { state } = useSidebar();
  const pathname = usePathname();
  const menuItems = NAV_BY_ROLE[role] as NavItem[];
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem
                    key={item.title}
                    className={`rounded-md transition-colors ${
                      pathname === item.url
                        ? "bg-sidebar-primary/10 text-sidebar-primary font-bold border-l-2 border-sidebar-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <Link href={item.url}>
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
