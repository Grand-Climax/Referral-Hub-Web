import { SystemAdminShell } from "@/components/system-admin/SystemAdminShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "System Admin - Referral Hub",
  description: "Manage hospitals and users in Referral Hub",
};

export default function SystemAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SystemAdminShell>{children}</SystemAdminShell>;
}
