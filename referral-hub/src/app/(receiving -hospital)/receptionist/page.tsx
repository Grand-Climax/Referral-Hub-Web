import React from "react";
import { StatsCards } from "@/components/receptionist/StatsCards";
import { ExpectedPatientsTable } from "@/components/receptionist/ExpectedPatientsTable";

const ReceptionistDashboard = () => {
  return (
    <div className="container mx-auto max-w-[1600px] px-6 py-8 space-y-8">
      {/* Top Section: Stats Cards */}
      <StatsCards />

      {/* Bottom Section: Expected Patients Table */}
      <ExpectedPatientsTable />
    </div>
  );
};

export default ReceptionistDashboard;