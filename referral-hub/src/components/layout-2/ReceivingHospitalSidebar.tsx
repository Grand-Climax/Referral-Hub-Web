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
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { title: "Dashboard", url: "/receiving-specialist", icon: LayoutDashboard },
  { title: "Referral Queue", url: "/receiving-specialist/queue", icon: ClipboardList },
  { title: "Accepted (Schedule)", url: "/receiving-specialist/schedule", icon: CalendarCheck },
  { title: "History", url: "/receiving-specialist/history", icon: History },
  { title: "Notifications", url: "/receiving-specialist/notifications", icon: Bell, badge: 4 },
  { title: "Profile", url: "/receiving-specialist/profile", icon: User },
];

export function ReceivingHospitalSidebar() {
  const pathname = usePathname();

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
            <p className="text-sm font-semibold tracking-tight">Receiving Specialist</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2 gap-0 pt-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.url;
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
