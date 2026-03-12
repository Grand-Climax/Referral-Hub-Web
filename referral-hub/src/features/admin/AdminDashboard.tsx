"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Users,
  Shield,
  FileText,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";

const STAFF = [
  { initials: "AT", name: "Dr. Frew Thomas", role: "Surgeon" },
  { initials: "KM", name: "Kebede Mulat", role: "Nurse Lead" },
  { initials: "TM", name: "Tigist Mekonnen", role: "Administrator" },
];

const ALERTS = [
  {
    dot: "bg-primary",
    title: "MFA Reset Completed",
    detail: "Dr. Winston Tsui has reset multi-factor authentication.",
    time: "2 min ago",
  },
  {
    dot: "bg-orange-500",
    title: "New Referral Received",
    detail: "Urgent Care: Orthopedics | Steven Zweldu Hospital",
    time: "3 min ago",
  },
  {
    dot: "bg-muted-foreground",
    title: "Data Export Triggered",
    detail: "Admin Tigist M. exported Monthly Audit Report",
    time: "1 hour ago",
  },
  {
    dot: "bg-destructive",
    title: "Dept. Capacity Limit",
    detail: "Internal Medicine at 95% capacity.",
    time: "2 hours ago",
  },
];

const DEPARTMENTS = [
  { name: "Orthopedics", limit: 10, pct: 80, left: 2, trend: "+5%", trendUp: true },
  { name: "Internal Medicine", limit: 20, pct: 95, left: 2, trend: "-2%", trendUp: false },
  { name: "Radiology", limit: 10, pct: 40, left: 6, trend: "+5%", trendUp: true },
];

const AUDIT_LOGS = [
  { timestamp: "2023-10-01 09:41:13", user: "M. Augustina", action: "User Login Success", variant: "primary" as const },
  { timestamp: "2023-10-01 08:26:56", user: "Tigist M.", action: "Data Export Monthly", variant: "primary" as const },
  { timestamp: "2023-10-01 10:14", user: "System", action: "Auto save failed backup", variant: "destructive" as const },
];

const CHART_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const INFLOW = [12, 15, 10, 18, 14, 8, 6];
const CAPACITY = [20, 20, 20, 20, 20, 15, 15];

export function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <p className="text-muted-foreground">System status and administrative controls</p>
      </div>

      {/* Top stats row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Staff</p>
              <p className="text-3xl font-bold mt-1">42</p>
              <p className="text-xs text-chart-2 mt-2">+2% from last month</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">System Status</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-bold">Online</span>
                <span className="h-2 w-2 rounded-full bg-chart-2" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Updated 5M ago</p>
            </div>
            <div className="p-3 bg-chart-2/10 rounded-lg">
              <Shield className="h-6 w-6 text-chart-2" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Referrals</p>
              <p className="text-3xl font-bold mt-1">18</p>
              <p className="text-xs text-orange-600 mt-2">4 urgent cases already</p>
            </div>
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Referral Inflow vs Capacity chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Referral Inflow vs. Capacity</CardTitle>
          <Select defaultValue="7">
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Last 7 Days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="14">Last 14 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-40">
            {CHART_DAYS.map((day, i) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex gap-0.5 w-full justify-center items-end flex-1">
                  <div
                    className="w-1/2 bg-primary rounded-t min-h-[4px]"
                    style={{ height: `${(INFLOW[i]! / 20) * 100}%` }}
                  />
                  <div
                    className="w-1/2 bg-muted rounded-t min-h-[4px]"
                    style={{ height: `${(CAPACITY[i]! / 20) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{day}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-4 justify-center text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-primary" /> Referral Inflow
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-muted" /> Capacity
            </span>
          </div>
        </CardContent>
      </Card>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            System Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {ALERTS.map((alert) => (
            <div key={alert.title} className="flex gap-3 items-start">
              <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${alert.dot}`} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{alert.title}</p>
                <p className="text-xs text-muted-foreground">{alert.detail}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{alert.time}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* User Management */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Configure and manage staff access levels</CardDescription>
          </div>
          <Button>
            <Users className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="uppercase text-xs">Staff Members</TableHead>
                <TableHead className="uppercase text-xs">Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {STAFF.map((s) => (
                <TableRow key={s.initials}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">{s.initials}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{s.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{s.role}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Department Capacity */}
      <Card>
        <CardHeader>
          <CardTitle>Department Capacity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {DEPARTMENTS.map((dept) => (
            <div key={dept.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{dept.name}</span>
                <span className="text-muted-foreground">Limit {dept.limit} / day</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      dept.pct >= 90 ? "bg-destructive" : dept.pct >= 70 ? "bg-primary" : "bg-chart-2"
                    }`}
                    style={{ width: `${dept.pct}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-24">
                  {dept.left} referrals left
                </span>
                <span
                  className={`text-xs ${dept.trendUp ? "text-chart-2" : "text-destructive"}`}
                >
                  {dept.trend}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Administrative Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Administrative Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Holiday Override</p>
              <p className="text-sm text-muted-foreground">
                Set reduced referral capacity for public holidays.
              </p>
            </div>
            <Checkbox
              className="rounded-full h-5 w-9 data-[state=checked]:bg-primary"
              aria-label="Holiday Override"
            />
          </div>
          <div className="space-y-2">
            <p className="font-medium">Available Beds (Emergency)</p>
            <div className="flex items-center gap-2">
              <Input type="number" defaultValue={12} className="w-20" />
              <Button variant="secondary">Update Beds</Button>
            </div>
          </div>
          <Button variant="destructive">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Emergency System Halt
          </Button>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
          <CardDescription>Read-only historical log of critical system actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="uppercase text-xs">Timestamp</TableHead>
                <TableHead className="uppercase text-xs">User</TableHead>
                <TableHead className="uppercase text-xs">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {AUDIT_LOGS.map((log, i) => (
                <TableRow key={i}>
                  <TableCell className="text-muted-foreground text-sm">{log.timestamp}</TableCell>
                  <TableCell>{log.user}</TableCell>
                  <TableCell>
                    <span
                      className={
                        log.variant === "destructive" ? "text-destructive" : "text-primary"
                      }
                    >
                      {log.action}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button variant="link" className="mt-4 px-0">
            View All Logs
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
