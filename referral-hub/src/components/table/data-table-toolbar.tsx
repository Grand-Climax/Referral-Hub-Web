"use client";

import { Table } from "@tanstack/react-table";
import { Plus, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-1 items-center space-x-2">
        <div className="relative w-[150px] lg:w-[250px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter referrals..."
            value={(table.getColumn("patient")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("patient")?.setFilterValue(event.target.value)
            }
            className="pl-8 h-9"
          />
        </div>
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="h-9 border-dashed text-xs"
          onClick={() => {
            const column = table.getColumn("status");
            column?.toggleSorting(column.getIsSorted() === "asc");
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Status
        </Button>

      </div>
      <div className="flex items-center space-x-2">
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
