import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import Header from "@/components/layout/Header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MOH Analytics - Referral Hub",
  description: "Ministry of Health Analytics Dashboard",
};

export default function AnalystLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset className="w-[calc(100%-var(--sidebar-width))]">
        <Header />
        <div className="bg-muted/20 min-h-[calc(100vh-4rem)]">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
