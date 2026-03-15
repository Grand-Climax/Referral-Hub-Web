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
  return <>{children}</>;
}
