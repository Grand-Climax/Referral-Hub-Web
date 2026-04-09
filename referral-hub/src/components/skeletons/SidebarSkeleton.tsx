"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

export function SidebarSkeleton() {
  return (
    <Sidebar className="border-r h-full">
      <SidebarHeader className="p-4 border-b space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-2xl" />
          <Skeleton className="h-5 w-24" />
        </div>
        
        <div className="rounded-2xl bg-muted/20 p-4 border border-border/50">
          <div className="flex flex-col items-center gap-4">
             <Skeleton className="h-16 w-16 rounded-full" />
             <div className="space-y-2 flex flex-col items-center">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
             </div>
             <div className="space-y-2 w-full">
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-2 w-3/4" />
             </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4 pt-8">
        <SidebarMenu className="gap-4">
          {[...Array(4)].map((_, i) => (
            <SidebarMenuItem key={i}>
                <div className="flex items-center gap-3 px-2 py-2">
                    <Skeleton className="h-5 w-5 rounded-md" />
                    <Skeleton className="h-4 w-28" />
                </div>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t mt-auto">
        <SidebarMenu className="gap-2">
           {[...Array(2)].map((_, i) => (
            <SidebarMenuItem key={i}>
                <div className="flex items-center gap-3 px-2 py-2">
                    <Skeleton className="h-5 w-5 rounded-md" />
                    <Skeleton className="h-4 w-24" />
                </div>
            </SidebarMenuItem>
           ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
