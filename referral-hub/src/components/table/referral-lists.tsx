"use client";

import * as React from "react";
import {
  ColumnFiltersState,
  OnChangeFn,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { columns } from "./columns";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";

import { Referral } from "@/types/referral";
import { ReferralListItem } from "@/types/referral-list";
import { SpecialistReferralListItem } from "@/types/specialist";

/** When set, row counts and page changes come from the server (see liaison list API). */
export type ReferralListsServerPagination = {
  total: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
};

interface ReferralListsProps {
  data?: (Referral | ReferralListItem | SpecialistReferralListItem)[];
  isLoading?: boolean;
  getRowHref?: (id: string) => string;
  serverPagination?: ReferralListsServerPagination;
}

export function ReferralLists({
  data = [],
  isLoading,
  getRowHref,
  serverPagination,
}: ReferralListsProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [clientPagination, setClientPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    });

  const pagination = serverPagination?.pagination ?? clientPagination;
  const setPaginationFromParent =
    serverPagination?.onPaginationChange ?? setClientPagination;

  /** Bridge TanStack Updater<PaginationState> to React setState (works for both liaison wrapper and client-only state). */
  const onPaginationChange = React.useCallback<OnChangeFn<PaginationState>>(
    (updater) => {
      setPaginationFromParent(updater);
    },
    [setPaginationFromParent],
  );

  const serverPageCount = serverPagination
    ? serverPagination.total === 0
      ? 1
      : Math.max(
          1,
          Math.ceil(
            serverPagination.total / serverPagination.pagination.pageSize,
          ),
        )
    : undefined;

  const table = useReactTable({
    data: data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    ...(serverPagination
      ? {
          manualPagination: true,
          rowCount: serverPagination.total,
          pageCount: serverPageCount,
        }
      : {
          getPaginationRowModel: getPaginationRowModel(),
        }),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange,
    autoResetPageIndex: false,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    meta: {
      getRowHref,
    },
  });

  return (
    <div className="w-full space-y-4">
      {/* Header removed from generic table */}

      <DataTableToolbar table={table} />

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="text-xs font-semibold uppercase tracking-wider py-3 px-4"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span>Loading referrals...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50 transition-colors border-border/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 px-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {serverPagination ? (
        <DataTablePagination
          controlled={{
            pagination: serverPagination.pagination,
            total: serverPagination.total,
            pageCount: serverPageCount ?? 1,
            onPaginationChange,
          }}
        />
      ) : (
        <DataTablePagination table={table} />
      )}
    </div>
  );
}
