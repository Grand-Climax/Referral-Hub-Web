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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  Mail,
  IdCard,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/store/hooks";
import {
  useLogoutMutation,
  useGetCurrentUserQuery,
} from "@/features/auth/authApi";
import { useGetHospitalByIdQuery } from "@/features/hospitals/hospitalsApi";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  items?: { title: string; url: string }[];
}

const NAV_BY_ROLE = {
  referring_doctor: [
    { title: "Dashboard", url: "/referring-doctor", icon: LayoutDashboard },
    {
      title: "My Referrals",
      url: "/referring-doctor/myReferral",
      icon: FileText,
    },
    {
      title: "New Referral",
      url: "/referring-doctor/newReferral",
      icon: FilePlus,
    },
    {
      title: "Referral Review",
      url: "/referring-doctor/review",
      icon: FilePlus,
    },
  ],
  hospital_admin: [
    { title: "Dashboard", url: "/hospital-admin", icon: LayoutDashboard },
    {
      title: "Staff Management",
      url: "/hospital-admin/staff-management",
      icon: ClipboardList,
    },
    {
      title: "Referral Logs",
      url: "/hospital-admin/referral-logs",
      icon: FileText,
    },
    {
      title: "Activity Logs",
      url: "/hospital-admin/activity-logs",
      icon: ListChecks,
    },
  ],
  liaison_officer: [
    { title: "Dashboard", url: "/liaison-officer", icon: LayoutDashboard },
    {
      title: "Referrals",
      url: "/liaison-officer/referrals",
      icon: ArrowLeftRight,
      items: [
        { title: "Approved", url: "/liaison-officer/referrals/approved" },
        { title: "Rejected", url: "/liaison-officer/referrals/rejected" },
      ],
    },
    { title: "Reports", url: "/liaison-officer/report", icon: Users },
  ],
};

type RoleKey = keyof typeof NAV_BY_ROLE;

const ROLE_MAP: Record<string, RoleKey> = {
  REFERRING_DOCTOR: "referring_doctor",
  HOSPITAL_ADMIN: "hospital_admin",
  LIAISON_OFFICER: "liaison_officer",
};

const PROFILE_PATH_BY_ROLE: Record<RoleKey, string> = {
  referring_doctor: "/referring-doctor/profile",
  hospital_admin: "/hospital-admin/profile",
  liaison_officer: "/liaison-officer/profile",
};

export function DashboardSidebar() {
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
  const profilePath = role
    ? PROFILE_PATH_BY_ROLE[role]
    : "/referring-doctor/profile";
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

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="gap-4">
        <SidebarHeader className="pt-4 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0">
          <div className="flex items-center gap-3 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <div className="relative h-11 w-11 overflow-hidden rounded-2xl bg-primary/5 ring-1 ring-primary/10 shadow-sm">
              <Image
                src="/logo.png"
                alt="MedRefer"
                fill
                className="object-cover object-center"
                priority
              />
            </div>
            <div className="leading-tight group-data-[collapsible=icon]:hidden">
              <p className="text-lg font-semibold tracking-tight text-foreground">
                MedRefer
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-background px-4 py-5 shadow-sm ring-1 ring-border group-data-[collapsible=icon]:mt-3 group-data-[collapsible=icon]:rounded-full group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:shadow-none group-data-[collapsible=icon]:ring-0">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-3 group-data-[collapsible=icon]:mb-0">
                <Avatar className="h-16 w-16 ring-4 ring-primary/10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10">
                  <AvatarImage src={userProfile?.profile_image_url || "/user.png"} alt="Dr. Sarah Jenkins" className="object-cover object-center" />
                  <AvatarFallback>SJ</AvatarFallback>
                </Avatar>
                <span className="bg-success absolute bottom-1 right-0 h-3 w-3 rounded-full border-2 border-background group-data-[collapsible=icon]:hidden" />
              </div>
              <div className="group-data-[collapsible=icon]:hidden">
                {isUserLoading ? (
                  <div className="mx-auto h-4 w-32 animate-pulse rounded bg-muted" />
                ) : (
                  <p className="text-sm font-semibold">
                    {userProfile
                      ? `Dr. ${userProfile.first_name} ${userProfile.last_name}`
                      : "Unknown User"}
                  </p>
                )}
                {isHospitalLoading ? (
                  <div className="mx-auto mt-2 h-3 w-24 animate-pulse rounded bg-muted" />
                ) : (
                  <p className="text-xs font-medium text-primary mt-1">
                    {hospital?.name || "Unknown Hospital"}
                  </p>
                )}
              </div>
              <div className="mt-4 space-y-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                <div className="flex items-center justify-center gap-2">
                  <Mail className="h-3 w-3" />
                  <span>
                    {isUserLoading
                      ? "Loading..."
                      : userProfile?.email || "No email"}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <IdCard className="h-3 w-3" />
                  <span>
                    {isUserLoading
                      ? "Loading..."
                      : userProfile?.national_id || "No National ID"}
                  </span>
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
                const isActive = item.items
                  ? item.items.some((subItem) => pathname === subItem.url)
                  : pathname === item.url;
                const isMainRouteActive = pathname === item.url;
                const isSubRouteActive = Boolean(
                  item.items?.some((subItem) => pathname === subItem.url),
                );

                if (item.items && item.items.length > 0) {
                  return (
                    <Collapsible
                      key={item.title}
                      asChild
                      defaultOpen={isActive}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.title}
                            isActive={isMainRouteActive}
                            onClick={() => router.push(item.url)}
                            className={`group-data-[collapsible=icon]:justify-center ${
                              isMainRouteActive
                                ? "bg-primary/10 text-primary font-semibold border-l-primary border-l-[3px] rounded-l-md"
                                : "text-sidebar-foreground"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="group-data-[collapsible=icon]:hidden">
                              {item.title}
                            </span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => {
                              const isSubItemActive = pathname === subItem.url;

                              return (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={isSubItemActive}
                                    className={`group-data-[collapsible=icon]:justify-center ${
                                      isSubItemActive
                                        ? "bg-primary/10 text-primary font-semibold border-l-primary border-l-[3px] rounded-l-md"
                                        : ""
                                    }`}
                                  >
                                    <Link href={subItem.url} className="w-full">
                                      <span className="group-data-[collapsible=icon]:hidden">
                                        {subItem.title}
                                      </span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isActive}
                      className={`group-data-[collapsible=icon]:justify-center
                        ${
                          isActive
                            ? "bg-primary/10 text-primary font-semibold border-l-primary border-l-[3px] rounded-l-md"
                            : "text-sidebar-foreground"
                        }
                        `}
                    >
                      <Link href={item.url}>
                        <Icon className="h-4 w-4" />
                        <span className="group-data-[collapsible=icon]:hidden">
                          {item.title}
                        </span>
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
            <SidebarMenuButton
              asChild
              tooltip="Profile Settings"
              className="group-data-[collapsible=icon]:justify-center"
            >
              <Link href={profilePath}>
                <Settings className="h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden ">
                  Profile Settings
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Sign Out"
              className="group-data-[collapsible=icon]:justify-center"
            >
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden">
                  Sign Out
                </span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
