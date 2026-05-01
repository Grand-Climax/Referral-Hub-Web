import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { Metadata } from "next";
import { ReceivingHospitalSidebar } from "@/components/layout-2/ReceivingHospitalSidebar";
import { ReceivingHospitalHeader } from "@/components/layout-2/ReceivingHospitalHeader";

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
      <ReceivingHospitalSidebar />
      <SidebarInset className="w-[calc(100%-var(--sidebar-width))]">
        <ReceivingHospitalHeader />
        <div className="p-6 bg-muted/20 min-h-[calc(100vh-4rem)]">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
