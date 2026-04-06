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
import type { ReferralPatient } from "@/types/referral";
import { Referral } from "@/types/referral";
import { ReferralListItem } from "@/types/referral-list";
import { SpecialistReferralListItem } from "@/types/specialist";

type ReferralRow = Referral | ReferralListItem | SpecialistReferralListItem;

function getReferralRowId(row: ReferralRow): string {
  const r = row as any;
  const id = r.ID ?? r.id;
  return typeof id === "string" ? id : "";
}

function getReferralRowPatient(
  row: ReferralRow
): ReferralPatient | { first_name: string; last_name: string } | undefined {
  if (row && 'patient_first_name' in row) {
    return {
      first_name: row.patient_first_name,
      last_name: row.patient_last_name,
    } as any;
  }
  const r = row as any;
  const p = r?.Patient ?? r?.patient;
  return p as ReferralPatient | undefined;
}

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

export const columns: ColumnDef<ReferralRow>[] = [
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
    accessorKey: "icd_code",
    header: "ICD Code",
    cell: ({ row, table }) => {
      const getRowHref = (table.options.meta as any)?.getRowHref;
      const icdCode = row.getValue("icd_code") as string;
      const id = (row.original as any).id || (row.original as any).ID;
      
      const content = (
        <span className="block w-[70px] truncate font-mono text-[10px]">
          {icdCode}
        </span>
      );

      if (getRowHref && id) {
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
    accessorKey: "target_dept_id",
    header: "Department",
    cell: ({ row }) => {
      const specialty = (row.getValue("target_dept_id") as string) || (row.original as any).department;
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
          Patient & Diagnosis
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row, table }) => {
      const getRowHref = (table.options.meta as any)?.getRowHref;
      const id = getReferralRowId(row.original);
      const patient = getReferralRowPatient(row.original);
      const original = row.original as any;
      const primaryDiagnosis = original.diagnosis 
        || original.diagnoses?.find((d: any) => d.is_primary)?.code_info.description 
        || (Array.isArray(original.diagnoses) ? original.diagnoses[0]?.code_info.description : undefined)
        || "No Diagnosis";

      const content = (
        <span className="max-w-[250px] lg:max-w-[400px] truncate font-medium block">
          {patient?.first_name} {patient?.last_name} — {primaryDiagnosis}
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
      const patient = getReferralRowPatient(row.original);
      const original = row.original as any;
      const primaryDiagnosis = original.diagnosis || original.diagnoses?.find((d: any) => d.is_primary)?.code_info.description || "";
      const searchStr = `${patient?.first_name} ${patient?.last_name} ${primaryDiagnosis}`.toLowerCase();
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
      const status = (row.getValue("status") as string || "").toLowerCase();
      return (
        <div className="flex w-[90px] items-center">
          {getStatusIcon(status)}
          <span className="capitalize text-xs truncate">{status}</span>
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
      const severityStr = (row.getValue("severity") as string) || (row.original as any).condition_at_referral;
      const severity = severityStr ? severityStr.toLowerCase() : "low";
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
      const id = getReferralRowId(row.original);

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
