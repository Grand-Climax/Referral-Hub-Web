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
  ClipboardCheck,
  Mail,
  Phone,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  ],
  hospital_admin: [
    { title: "Dashboard", url: "/referring-admin", icon: LayoutDashboard },
    { title: "Staff Management", url: "/referring-admin/staff-management", icon: ClipboardList },
    { title: "Referral Logs", url: "/referring-admin/referral-logs", icon: FileText },
    { title: "Activity Logs", url: "/referring-admin/activity-logs", icon: ListChecks },
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
    { title: "Doctors", url: "/liaison-officer/doctors", icon: Users },
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
  role = "hospital_admin",
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const menuItems = NAV_BY_ROLE[role] as NavItem[];

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="gap-4">
        <SidebarHeader className="pt-4 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0">
          <div className="flex items-center gap-3 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
              MedRefer
            </span>
          </div>

          <div className="mt-6 rounded-2xl bg-background px-4 py-5 shadow-sm ring-1 ring-border group-data-[collapsible=icon]:mt-3 group-data-[collapsible=icon]:rounded-full group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:shadow-none group-data-[collapsible=icon]:ring-0">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-3 group-data-[collapsible=icon]:mb-0">
                <Avatar className="h-16 w-16 ring-4 ring-primary/10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10">
                  <AvatarImage src="/user.png" alt="Dr. Sarah Jenkins" />
                  <AvatarFallback>SJ</AvatarFallback>
                </Avatar>
                <span className="bg-success absolute bottom-1 right-0 h-3 w-3 rounded-full border-2 border-background group-data-[collapsible=icon]:hidden" />
              </div>
              <div className="group-data-[collapsible=icon]:hidden">
                <p className="text-sm font-semibold">Dr. Sarah Jenkins</p>
                <p className="text-xs font-medium text-primary">
                  Internal Medicine
                </p>
              </div>
              <div className="mt-4 space-y-1 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
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
                const isActive = item.items
                  ? item.items.some((subItem) => pathname === subItem.url)
                  : pathname === item.url;

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
                            isActive={isActive}
                            className={`group-data-[collapsible=icon]:justify-center  ${
                              isActive
                                ? "bg-primary/10 text-primary font-semibold"
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
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={pathname === subItem.url}
                                >
                                  <Link href={subItem.url}>
                                    <span className="group-data-[collapsible=icon]:hidden">
                                      {subItem.title}
                                    </span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
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
                            ? "bg-primary/10 text-primary font-semibold"
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
            <SidebarMenuButton asChild tooltip="Profile Settings" className="group-data-[collapsible=icon]:justify-center">
              <Link href="/referring-doctor/profile">
                <Settings className="h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden ">
                  Profile Settings
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Sign Out" className="group-data-[collapsible=icon]:justify-center">
              <button type="button" className="flex w-full items-center gap-2">
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
