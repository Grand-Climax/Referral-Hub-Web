"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const AUDIT_LOGS = [
  {
    timestamp: "2025-12-15 09:41:13",
    user: "M. Augustina",
    action: "User Login Success",
    variant: "primary" as const,
  },
  {
    timestamp: "2025-12-15 08:26:56",
    user: "Tigist M.",
    action: "Data Export Monthly",
    variant: "primary" as const,
  },
  {
    timestamp: "2025-12-15 08:15:22",
    user: "Dr. Frew Thomas",
    action: "Referral Rejected (Reason: Capacity)",
    variant: "destructive" as const,
  },
  {
    timestamp: "2025-12-14 16:02:00",
    user: "Kebede M.",
    action: "User Login Success",
    variant: "primary" as const,
  },
];

export function AdminAuditTrail() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Trail (Own Hospital)</CardTitle>
        <CardDescription>
          Read-only historical log of critical system actions: logins, rejections, exports. All administrative
          actions are recorded for accountability.
        </CardDescription>
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
  );
}
