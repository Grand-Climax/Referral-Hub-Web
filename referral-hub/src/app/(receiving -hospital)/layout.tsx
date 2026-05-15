import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { Metadata } from "next";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import Header from "@/components/layout/Header";

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
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset className="w-[calc(100%-var(--sidebar-width))]">
        <Header />
        <div className="p-6 bg-muted/20 min-h-[calc(100vh-4rem)]">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
