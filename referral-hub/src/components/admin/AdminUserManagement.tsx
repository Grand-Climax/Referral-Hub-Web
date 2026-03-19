"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, MoreVertical, KeyRound, UserX, UserCheck } from "lucide-react";

export type StaffRole =
  | "Referring Doctor"
  | "Liaison Officer"
  | "Receiving Specialist"
  | "Receptionist"
  | "Hospital Admin"
  | "Department Head"
  | "MoH Analyst";

export interface StaffMember {
  id: string;
  initials: string;
  name: string;
  role: StaffRole;
  isActive: boolean;
}

export const STAFF_ROLES: StaffRole[] = [
  "Referring Doctor",
  "Liaison Officer",
  "Receiving Specialist",
  "Receptionist",
  "Hospital Admin",
  "Department Head",
  "MoH Analyst",
];

interface AdminUserManagementProps {
  staff: StaffMember[];
  onRoleChange: (id: string, role: StaffRole) => void;
  onToggleActive: (id: string) => void;
  onResetMFA: (name: string) => void;
}

export function AdminUserManagement({
  staff,
  onRoleChange,
  onToggleActive,
  onResetMFA,
}: AdminUserManagementProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Create or deactivate user accounts for your hospital. Assign or change roles for local staff.
          </CardDescription>
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
              <TableHead className="uppercase text-xs">Status</TableHead>
              <TableHead className="uppercase text-xs w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((s) => (
              <TableRow key={s.id} className={!s.isActive ? "opacity-60" : ""}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{s.initials}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{s.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={s.role}
                    onValueChange={(value) => onRoleChange(s.id, value as StaffRole)}
                    disabled={!s.isActive}
                  >
                    <SelectTrigger className="w-[180px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STAFF_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Badge variant={s.isActive ? "default" : "secondary"}>
                    {s.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onResetMFA(s.name)}>
                        <KeyRound className="h-4 w-4 mr-2" />
                        Reset MFA (lost device)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleActive(s.id)}>
                        {s.isActive ? (
                          <>
                            <UserX className="h-4 w-4 mr-2" />
                            Deactivate account
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Activate account
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
