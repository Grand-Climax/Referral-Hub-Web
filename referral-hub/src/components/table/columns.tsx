"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
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
        className="translate-y-[2px] scale-40 border-muted-foreground/40"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px] scale-40 border-muted-foreground/40"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "ID",
    header: "Task",
    cell: ({ row, table }) => {
      const getRowHref = (table.options.meta as any)?.getRowHref;
      const id = row.getValue("ID") as string;
      
      const content = (
        <span className="block w-[70px] truncate font-mono text-[10px]">
          {id}
        </span>
      );

      if (getRowHref) {
        return (
          <Link 
            href={getRowHref(id)} 
            className="hover:underline text-blue-600 font-medium"
          >
            {content}
          </Link>
        );
      }
      return content;
    },
  },
  {
    accessorKey: "TargetDeptID",
    header: "Label",
    cell: ({ row }) => {
      const specialty = row.getValue("TargetDeptID") as string;
      return (
        <Badge variant="outline" className="font-medium text-[10px] uppercase tracking-wider px-2 py-0 h-5 bg-muted/50 border-muted-foreground/20 max-w-[100px] truncate block text-center">
          {specialty || "General"}
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
    cell: ({ row, table }) => {
      const getRowHref = (table.options.meta as any)?.getRowHref;
      const id = row.original.ID;
      const patient = row.original.Patient;
      const primaryDiagnosis = row.original.Diagnoses?.find(d => d.IsPrimary)?.CodeInfo.Description 
        || row.original.Diagnoses?.[0]?.CodeInfo.Description 
        || "No Diagnosis";

      const content = (
        <span className="max-w-[250px] lg:max-w-[400px] truncate font-medium block">
          {patient?.FirstName} {patient?.LastName} — {primaryDiagnosis}
        </span>
      );

      if (getRowHref) {
        return (
          <Link href={getRowHref(id)} className="flex space-x-2 hover:underline hover:text-blue-600 transition-colors">
            {content}
          </Link>
        );
      }

      return (
        <div className="flex space-x-2">
          {content}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const patient = row.original.Patient;
      const primaryDiagnosis = row.original.Diagnoses?.find(d => d.IsPrimary)?.CodeInfo.Description || "";
      const searchStr = `${patient?.FirstName} ${patient?.LastName} ${primaryDiagnosis}`.toLowerCase();
      return searchStr.includes(String(value).toLowerCase());
    },
  },
  {
    accessorKey: "Status",
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
      const status = (row.getValue("Status") as string || "").toLowerCase();
      return (
        <div className="flex w-[90px] items-center">
          {getStatusIcon(status)}
          <span className="capitalize text-xs truncate">{status}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "MLSeverityScore",
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
      const score = row.getValue("MLSeverityScore") as number;
      const severity = score > 80 ? "critical" : score > 60 ? "high" : score > 30 ? "medium" : "low";
      return (
        <div className="flex items-center w-[80px]">
          {getPriorityIcon(severity)}
          <span className="capitalize text-xs truncate">{severity}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row, table }) => {
      const getRowHref = (table.options.meta as any)?.getRowHref;
      const id = row.original.ID;

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
              onClick={() => navigator.clipboard.writeText(id)}
            >
              Copy referral ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              {getRowHref ? (
                <Link href={getRowHref(id)}>View details</Link>
              ) : (
                <span>View details</span>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem>Update status</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
