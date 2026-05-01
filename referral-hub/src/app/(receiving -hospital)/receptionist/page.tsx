import React from "react";
import { StatsCards } from "@/components/receptionist/StatsCards";
import { PatientLocator } from "@/components/receptionist/PatientLocator";
import { ExpectedPatientsTable } from "@/components/receptionist/ExpectedPatientsTable";

const ReceptionistDashboard = () => {
  return (
    <div className="container mx-auto max-w-[1400px] py-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Top Section: Locator and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8">
          <PatientLocator />
        </div>
        <div className="lg:col-span-4">
          <StatsCards />
        </div>
      </div>

      {/* Bottom Section: Expected Patients Table */}
      <div className="w-full">
        <ExpectedPatientsTable />
      </div>
    </div>
  );
};

export default ReceptionistDashboard;