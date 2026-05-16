"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  Layers,
  LogOut,
  Network,
  ShieldCheck,
  Users,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggler";
import { useGetCurrentUserQuery, useLogoutMutation } from "@/features/auth/authApi";
import { cn } from "@/lib/utils";

interface SystemAdminShellProps {
  children: React.ReactNode;
}

type NavChild = {
  label: string;
  href: string;
  icon: typeof Users;
};

type NavItem = {
  label: string;
  href: string;
  icon: typeof Users;
  children?: readonly NavChild[];
};

const navItems: readonly NavItem[] = [
  {
    label: "User Management",
    href: "/systemAdmin/users",
    icon: Users,
  },
  {
    label: "Hospital Management",
    href: "/systemAdmin/hospitals",
    icon: Building2,
    children: [
      {
        label: "Hospital Staff",
        href: "/systemAdmin/hospitals/staff",
        icon: UsersRound,
      },
      {
        label: "Network Routes",
        href: "/systemAdmin/hospitals/network-routes",
        icon: Network,
      },
    ],
  },
  {
    label: "Department Management",
    href: "/systemAdmin/departments",
    icon: Layers,
  },
] as const;

export function SystemAdminShell({ children }: SystemAdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [logoutApi, { isLoading: isLoggingOut }] = useLogoutMutation();
  const { data: user } = useGetCurrentUserQuery();

  const handleSignOut = async () => {
    try {
      await logoutApi().unwrap();
      toast.success("Signed out successfully.");
      router.push("/login");
    } catch (error) {
      console.error(error);
      toast.error("Could not sign out. Please try again.");
    }
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent/50 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-semibold text-sidebar-foreground">
                System Admin
              </p>
              <p className="text-xs text-sidebar-foreground/70">Control Panel</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isExactActive = pathname === item.href;
                  const hasActiveChild = item.children?.some(
                    (child) => pathname === child.href,
                  );
                  const isParentActive = isExactActive && !hasActiveChild;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isParentActive}
                        tooltip={item.label}
                        className={cn(
                          isParentActive
                            ? "bg-primary/10 text-primary"
                            : "text-sidebar-foreground",
                        )}
                      >
                        <Link href={item.href}>
                          <Icon className="h-4 w-4" />
                          <span className="group-data-[collapsible=icon]:hidden">
                            {item.label}
                          </span>
                        </Link>
                      </SidebarMenuButton>

                      {item.children?.length ? (
                        <SidebarMenuSub>
                          {item.children.map((child) => {
                            const ChildIcon = child.icon;
                            const isChildActive = pathname === child.href;

                            return (
                              <SidebarMenuSubItem key={child.href}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isChildActive}
                                  className={cn(
                                    isChildActive
                                      ? "bg-primary/10 text-primary"
                                      : "text-sidebar-foreground",
                                  )}
                                >
                                  <Link href={child.href}>
                                    <ChildIcon className="h-3.5 w-3.5" />
                                    <span>{child.label}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      ) : null}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-3">
          <div className="mb-2 rounded-lg border border-sidebar-border px-3 py-2 group-data-[collapsible=icon]:hidden">
            <p className="text-xs text-sidebar-foreground/70">Signed in as</p>
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {user?.email ?? "System Administrator"}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void handleSignOut();
            }}
            disabled={isLoggingOut}
            className="w-full justify-start gap-2 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
          >
            <LogOut className="h-4 w-4" />
            <span className="group-data-[collapsible=icon]:hidden">Sign out</span>
          </Button>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <div>
              <p className="text-sm font-semibold text-foreground">System Admin</p>
              <p className="text-xs text-muted-foreground">Manage users, hospitals, and departments</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        <div className="p-4 sm:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
