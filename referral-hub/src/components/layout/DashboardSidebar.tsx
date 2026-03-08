"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
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
  LogOut,
  Settings,
  ClipboardCheck,
  Mail,
  Phone,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_BY_ROLE = {
  referring_doctor: [
    { title: "Dashboard", url: "/referring-doctor", icon: LayoutDashboard },
    { title: "My Referrals", url: "/referring-doctor/myReferral", icon: FileText },
    { title: "New Referral", url: "/referring-doctor/newReferral", icon: FilePlus },
  ],
  receiving_specialist: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Incoming Referrals", url: "/doctor", icon: FileText },
    { title: "Triage Queue", url: "/queue", icon: ListChecks },
  ],
  hospital_admin: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Pending Approvals", url: "/doctor", icon: ClipboardList },
    { title: "All Referrals", url: "/doctor/all", icon: FileText },
  ],
  receptionist: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Accepted Referrals", url: "/doctor", icon: FileText },
    { title: "Schedule", url: "/schedule", icon: CalendarCheck },
  ],
  department_head: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Department Referrals", url: "/doctor", icon: FileText },
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
    { title: "All Referrals", url: "/doctor", icon: FileText },
  ],
};

type RoleKey = keyof typeof NAV_BY_ROLE;

interface DashboardSidebarProps {
  role?: RoleKey;
}

export function DashboardSidebar({
  role = "referring_doctor",
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const menuItems = NAV_BY_ROLE[role] as NavItem[];

  return (
    <Sidebar collapsible="icon" className="md:p-4">
      <SidebarContent className="gap-4">
        <SidebarHeader className="pt-4">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              MedRefer
            </span>
          </div>

          <div className="mt-6 rounded-2xl bg-background px-4 py-5 shadow-sm ring-1 ring-border">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-3">
                <Avatar className="h-16 w-16 ring-4 ring-primary/10">
                  <AvatarImage src="/user.png" alt="Dr. Sarah Jenkins" />
                  <AvatarFallback>SJ</AvatarFallback>
                </Avatar>
                <span className="bg-success absolute bottom-1 right-0 h-3 w-3 rounded-full border-2 border-background" />
              </div>
              <div>
                <p className="text-sm font-semibold">Dr. Sarah Jenkins</p>
                <p className="text-xs font-medium text-primary">
                  Internal Medicine
                </p>
              </div>
              <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <Mail className="h-3 w-3" />
                  <span>s.jenkins@hospital.org</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Phone className="h-3 w-3" />
                  <span>+1 (555) 902-4421</span>
                </div>
              </div>
            </div>
          </div>
        </SidebarHeader>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isActive}
                      className={
                        isActive
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-sidebar-foreground"
                      }
                    >
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

      <SidebarFooter className="mt-auto pb-4">
        <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Profile Settings">
              <Link href="/referring-doctor/profile">
                <Settings className="h-4 w-4" />
                <span>Profile Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Sign Out">
              <button type="button" className="flex w-full items-center gap-2">
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
