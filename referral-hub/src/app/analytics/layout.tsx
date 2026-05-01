"use client";

import { AnalystSidebar } from "@/components/analytics/AnalystSidebar";
import { AnalystHeader } from "@/components/analytics/AnalystHeader";

export default function AnalystLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar - Fixed with 64 (16rem) width */}
      <AnalystSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-64 min-w-0 h-full">
        {/* Header - Sticky at the top of content */}
        <AnalystHeader />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/30">
          <div className="max-w-[1600px] mx-auto min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
