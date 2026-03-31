"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUp,
  ArrowRight,
  ArrowDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Referral } from "@/types/referral";

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return <Clock className="mr-2 h-4 w-4 text-muted-foreground" />;
    case "approved":
      return <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />;
    case "accepted":
      return <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />;
    case "rejected":
      return <XCircle className="mr-2 h-4 w-4 text-destructive" />;
    default:
      return <HelpCircle className="mr-2 h-4 w-4 text-muted-foreground" />;
  }
};

const getPriorityIcon = (severity: string) => {
  switch (severity) {
    case "critical":
      return <ArrowUp className="mr-2 h-4 w-4 text-destructive" />;
    case "high":
      return <ArrowUp className="mr-2 h-4 w-4 text-orange-500" />;
    case "medium":
      return <ArrowRight className="mr-2 h-4 w-4 text-yellow-500" />;
    case "low":
      return <ArrowDown className="mr-2 h-4 w-4 text-emerald-500" />;
    default:
      return null;
  }
};

export const columns: ColumnDef<Referral>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px] scale-60 border-muted-foreground/40"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px] scale-60 border-muted-foreground/40"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "Task",
    cell: ({ row }) => <div className="w-[80px] font-mono text-xs">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "requiredSpecialty",
    header: "Label",
    cell: ({ row }) => {
      const specialty = row.getValue("requiredSpecialty") as string;
      return (
        <Badge variant="outline" className="font-medium text-[10px] uppercase tracking-wider px-2 py-0 h-5 bg-muted/50 border-muted-foreground/20">
          {specialty}
        </Badge>
      );
    },
  },
  {
    accessorKey: "patient",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4 h-8 data-[state=open]:bg-accent"
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const patient = row.original.patient;
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {patient.fullName} — {row.original.provisionalDiagnosis}
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const patient = row.original.patient;
      const diagnosis = row.original.provisionalDiagnosis;
      const searchStr = `${patient.fullName} ${diagnosis}`.toLowerCase();
      return searchStr.includes(String(value).toLowerCase());
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4 h-8 data-[state=open]:bg-accent"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <div className="flex w-[100px] items-center">
          {getStatusIcon(status)}
          <span className="capitalize text-sm">{status}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "severity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4 h-8 data-[state=open]:bg-accent"
        >
          Priority
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const severity = row.getValue("severity") as string;
      return (
        <div className="flex items-center">
          {getPriorityIcon(severity)}
          <span className="capitalize text-sm">{severity}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(row.original.id)}
            >
              Copy referral ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Update status</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
