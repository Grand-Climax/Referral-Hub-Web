import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import Header from "@/components/layout/Header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - Referral Hub",
  description: "Referral Hub Dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset className="flex min-h-svh min-w-0 flex-1 flex-col">
          <Header />
          <div className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
