import { SystemAdminTopNav } from "@/components/system-admin/SystemAdminTopNav";
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
  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_500px_at_0%_-5%,rgba(34,211,238,0.15),transparent_60%),radial-gradient(1200px_500px_at_100%_-5%,rgba(14,165,233,0.12),transparent_60%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-400 flex-col gap-6">
        <header className="rounded-3xl border border-border/70 bg-background/85 p-6 shadow-sm backdrop-blur">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-700">
              System Administration
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Control Center
            </h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Manage platform accounts and hospital records from one dedicated
              workspace.
            </p>
          </div>

          <div className="mt-5">
            <SystemAdminTopNav />
          </div>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}
