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
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  ClipboardList,
  CalendarCheck,
  History,
  Bell,
  User,
  LogOut,
  FileText,
  ListChecks,
  Users,
  Sparkles,
  LayoutGrid,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/store/hooks";
import { SidebarSkeleton } from "@/components/skeletons/SidebarSkeleton";
import {
  useLogoutMutation,
  useGetCurrentUserQuery,
} from "@/features/auth/authApi";
import { useGetHospitalByIdQuery } from "@/features/hospitals/hospitalsApi";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  items?: { title: string; url: string }[];
}

const NAV_BY_ROLE = {
  hospital_admin: [
    { title: "Dashboard", url: "/hospital-admin", icon: LayoutDashboard },
    {
      title: "Referral Queue",
      url: "/hospital-admin/queue",
      icon: ClipboardList,
    },
    {
      title: "Accepted (Schedule)",
      url: "/hospital-admin/schedule",
      icon: CalendarCheck,
    },
    { title: "History", url: "/hospital-admin/history", icon: History },
    {
      title: "Notifications",
      url: "/hospital-admin/notifications",
      icon: Bell,
      badge: 4,
    },
    { title: "Profile", url: "/receiving-admin/profile", icon: User },
  ],
  receiving_specialist: [
    { title: "Dashboard", url: "/receiving-specialist", icon: LayoutDashboard },
    {
      title: "Incoming Referrals",
      url: "/receiving-specialist/referrals",
      icon: FileText,
    },
    { title: "Archive", url: "/receiving-specialist/archive", icon: History },
  ],
  receptionist: [
    { title: "Dashboard", url: "/receptionist", icon: LayoutDashboard },
    {
      title: "Scheduled Patients",
      url: "/receptionist/scheduled-patients",
      icon: CalendarCheck,
    },
    {
      title: "Patient Check-In",
      url: "/receptionist",
      icon: ListChecks,
    },
    { title: "Profile", url: "/receptionist/profile", icon: User },
  ],
  department_head: [
    { title: "Dashboard",              url: "/department-head",                            icon: LayoutDashboard },
    { title: "Specialist Availability", url: "/department-head/specialist-availability",   icon: Users },
    { title: "Capacity Management",    url: "/department-head/capacity-management",        icon: LayoutGrid },
  ],
};

type RoleKey = keyof typeof NAV_BY_ROLE;

const ROLE_MAP: Record<string, RoleKey> = {
  HOSPITAL_ADMIN: "hospital_admin",
  RECEIVING_SPECIALIST: "receiving_specialist",
  RECEPTIONIST: "receptionist",
  DEPT_HEAD: "department_head",
};

export function ReceivingHospitalSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [logoutApi] = useLogoutMutation();
  const { data: userProfile, isLoading: isUserLoading } =
    useGetCurrentUserQuery();

  const reduxRole = useAppSelector((state) => state.auth.user?.role);
  const rawRole = reduxRole || userProfile?.role;
  const role = rawRole
    ? ROLE_MAP[rawRole.toUpperCase()] || ROLE_MAP[rawRole]
    : undefined;
  const menuItems = (role ? NAV_BY_ROLE[role] : []) as NavItem[];

  const { data: hospital, isLoading: isHospitalLoading } =
    useGetHospitalByIdQuery(userProfile?.hospital_id ?? "", {
      skip: !userProfile?.hospital_id,
    });

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
      router.push("/login");
    } catch (err) {
      console.error("Failed to log out", err);
    }
  };

  if (isUserLoading || !role) return <SidebarSkeleton />;

  return (
    <Sidebar className="border-r border-border/60 bg-linear-to-b from-background via-background to-muted/20">
      <SidebarHeader className="border-b border-border/60 bg-linear-to-b from-primary/3 to-transparent p-4 pb-5">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Activity className="h-6 w-6 shrink-0 text-primary" />
          <span className="text-lg font-bold text-foreground">Referral Hub</span>
        </Link>

        <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-2xl border border-border/60 bg-background/80 p-3 text-center shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
              <Sparkles className="h-3 w-3" />
              Active role
            </span>
          </div>
          <p className="text-sm font-semibold capitalize tracking-tight text-foreground">
            {role?.replace("_", " ")}
          </p>
          <p className="text-xs text-muted-foreground">
            {isHospitalLoading
              ? "Loading hospital details"
              : hospital?.name || "Hospital profile unavailable"}
          </p>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3 pt-5 gap-0">
        <SidebarGroup>
          <div className="px-2 pb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Navigation
          </div>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {menuItems.map((item) => {
                const isActive = item.items
                  ? item.items.some((subItem) => pathname === subItem.url)
                  : pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`h-12 justify-between rounded-2xl border transition-all duration-200 ${
                        isActive
                          ? "border-primary/20 bg-primary/10 text-primary shadow-sm hover:bg-primary/15 hover:text-primary"
                          : "border-transparent bg-transparent text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground"
                      }`}
                    >
                      <Link href={item.url}>
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-xl ${isActive ? "bg-background text-primary shadow-sm" : "bg-muted text-muted-foreground"}`}
                          >
                            <item.icon className="h-4 w-4" />
                          </span>
                          <span className="text-sm font-medium">
                            {item.title}
                          </span>
                        </div>
                        {item.badge && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="mt-auto border-t border-border/60 p-4">
        <SidebarMenu className="gap-2">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-12 rounded-2xl border border-destructive/10 bg-destructive/5 text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive"
              onClick={handleLogout}
            >
              <button type="button" className="flex w-full items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-background/80 text-destructive ring-1 ring-destructive/10">
                  <LogOut className="h-4 w-4" />
                </span>
                <div className="flex flex-1 flex-col items-start">
                  <span className="text-sm font-semibold">Sign Out</span>
                  <span className="text-[11px] text-muted-foreground">
                    End the current session
                  </span>
                </div>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}