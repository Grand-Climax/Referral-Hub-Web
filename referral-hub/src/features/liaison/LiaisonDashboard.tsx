"use client";

import { Button } from "@/components/ui/button";
import type { Referral } from "@/types/referral";

export function LiaisonDashboard() {
  const stats = {
    active: 12,
    urgent: 8,
    scheduled: 15,
    complete: 23,
  };

  const referrals: Referral[] = []; // TODO: Fetch from API

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold">Welcome back, Sarah Johnson</h2>
        <p className="text-muted-foreground">You have 8 active referrals</p>
      </div>

      {/* Quick Stats */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-primary">{stats.active}</div>
          <div className="text-sm text-muted-foreground mt-1">Active</div>
        </div>
        <div className="bg-card border rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-destructive">
            {stats.urgent}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Urgent</div>
        </div>
        <div className="bg-card border rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-primary">
            {stats.scheduled}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Scheduled</div>
        </div>
        <div className="bg-card border rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-chart-2">
            {stats.complete}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Complete</div>
        </div>
      </section>

      {/* Active Referrals */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">My Active Referrals</h2>
          <Button variant="outline">View All</Button>
        </div>
        <div className="space-y-3">
          {referrals.length === 0 ? (
            <div className="bg-card border rounded-lg p-8 text-center text-muted-foreground">
              No active referrals
            </div>
          ) : (
            referrals.map((referral) => (
              <div
                key={referral.id}
                className="bg-card border rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        referral.referral.urgency === "emergency"
                          ? "bg-destructive text-white"
                          : referral.referral.urgency === "urgent"
                            ? "bg-yellow-500 text-white"
                            : "bg-chart-2 text-white"
                      }`}
                    >
                      {referral.referral.urgency.toUpperCase()}
                    </span>
                    <span className="ml-2 font-semibold">
                      {referral.patient.firstName} {referral.patient.lastName} -{" "}
                      {referral.medical.primaryDiagnosis}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Submitted: {referral.createdAt}</span>
                  <span>Status: {referral.status}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    Schedule
                  </Button>
                  <Button variant="outline" size="sm">
                    Add Note
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Upcoming Appointments */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            No upcoming appointments
          </p>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Activity</h2>
        <div className="bg-card border rounded-lg p-4 space-y-2">
          <p className="text-sm text-muted-foreground">
            No recent activity
          </p>
        </div>
      </section>
    </div>
  );
}
