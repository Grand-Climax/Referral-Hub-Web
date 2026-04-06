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
  Hospital,
  FileText,
  ListChecks,
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
    { title: "Referral Queue", url: "/hospital-admin/queue", icon: ClipboardList },
    { title: "Accepted (Schedule)", url: "/hospital-admin/schedule", icon: CalendarCheck },
    { title: "History", url: "/hospital-admin/history", icon: History },
    { title: "Notifications", url: "/hospital-admin/notifications", icon: Bell, badge: 4 },
    { title: "Profile", url: "/receiving-admin/profile", icon: User }
  ],
  receiving_specialist: [
    { title: "Dashboard", url: "/receiving-specialist", icon: LayoutDashboard },
    { title: "Incoming Referrals", url: "/receiving-specialist/referrals", icon: FileText },
    { title: "Archive", url: "/receiving-specialist/archive", icon: History },
    { title: "Profile", url: "/receiving-specialist/profile", icon: User }
  ],
  receptionist: [
    { title: "Dashboard", url: "/receptionist", icon: LayoutDashboard },
    { title: "Accepted Referrals", url: "/receptionist/referrals", icon: FileText },
    { title: "Schedule", url: "/receptionist/schedule", icon: CalendarCheck },
    { title: "Profile", url: "/receptionist/profile", icon: User }
  ],
};

type RoleKey = keyof typeof NAV_BY_ROLE;

const ROLE_MAP: Record<string, RoleKey> = {
  HOSPITAL_ADMIN: "hospital_admin",
  RECEIVING_SPECIALIST: "receiving_specialist",
  RECEPTIONIST: "receptionist",
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
    <Sidebar className="border-r">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2 font-semibold text-lg text-primary mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Hospital className="h-5 w-5" />
          </div>
          <span>Referral Hub</span>
        </div>
        
        <div className="rounded-xl bg-muted/50 p-3 mb-2 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Role</p>
            <p className="text-sm font-semibold tracking-tight capitalize">
              {role?.replace("_", " ")}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2 gap-0 pt-4">
        <SidebarGroup>
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
                      className={`h-11 justify-between transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary font-medium hover:bg-primary/15 hover:text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Link href={item.url}>
                        <div className="flex items-center gap-3">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </div>
                        {item.badge && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
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

      <SidebarFooter className="p-4 border-t mt-auto">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-11 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              onClick={handleLogout}
            >
              <button type="button" className="flex w-full items-center gap-3">
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
