import React from "react";
import { AppointmentTable } from "@/components/receptionist/AppointmentTable";
import { DeptCapacity } from "@/components/receptionist/DeptCapacity";
import { NextArrival } from "@/components/receptionist/NextArrival";

const ScheduledPatientsPage = () => {
  return (
    <div className="container mx-auto max-w-[1600px] py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Main Content Area: Tabs, Filters, and Table */}
        <div className="xl:col-span-9 space-y-8">
          <AppointmentTable />
        </div>

        {/* Right Sidebar Area: Admin Insights */}
        <div className="xl:col-span-3 space-y-8">
          <section>
            <DeptCapacity />
          </section>
          <section>
            <NextArrival />
          </section>
        </div>
      </div>
    </div>
  );
};

export default ScheduledPatientsPage;
