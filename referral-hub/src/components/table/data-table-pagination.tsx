"use client";

import * as React from "react";
import type { OnChangeFn, PaginationState, Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** Larger options request more rows per API page; list length follows `page_size` from the server response. */
const DEFAULT_PAGE_SIZES = [10, 20, 30, 40, 50, 100] as const;

/** Server-driven lists: drive UI from React state + the same onPaginationChange as useReactTable (avoids table instance / getState() drift). */
export type DataTableControlledPagination = {
  pagination: PaginationState;
  total: number;
  pageCount: number;
  onPaginationChange: OnChangeFn<PaginationState>;
};

type DataTablePaginationProps<TData> =
  | {
      table: Table<TData>;
      controlled?: undefined;
    }
  | {
      table?: undefined;
      controlled: DataTableControlledPagination;
    };

export function DataTablePagination<TData>({
  table,
  controlled,
}: DataTablePaginationProps<TData>) {
  const resolved = controlled
    ? {
        pageIndex: controlled.pagination.pageIndex,
        pageSize: controlled.pagination.pageSize,
        total: controlled.total,
        pageCount: controlled.pageCount,
        setPagination: controlled.onPaginationChange,
      }
    : table
      ? (() => {
          const p = table.getState().pagination;
          return {
            pageIndex: p.pageIndex,
            pageSize: p.pageSize,
            total: table.getRowCount(),
            pageCount: table.getPageCount(),
            setPagination: ((updater) => {
              table.setPagination(updater);
            }) as OnChangeFn<PaginationState>,
          };
        })()
      : null;

  if (!resolved) {
    throw new Error("DataTablePagination requires `table` or `controlled`");
  }

  const { pageIndex, pageSize, total, pageCount, setPagination } = resolved;

  const pageSizeOptions = React.useMemo(() => {
    const defaults = DEFAULT_PAGE_SIZES as readonly number[];
    if (defaults.includes(pageSize)) {
      return [...DEFAULT_PAGE_SIZES];
    }
    return [...new Set([pageSize, ...defaults])].sort((a, b) => a - b);
  }, [pageSize]);

  const start = total === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, total);

  const rangeLabel =
    total === 0
      ? "No results"
      : `Showing ${start}–${end} of ${total.toLocaleString()}`;

  const safePageCount = pageCount > 0 ? pageCount : 1;
  const pageLabel = `Page ${pageIndex + 1} of ${safePageCount}`;

  const canPrevious = pageIndex > 0;
  const canNext = pageCount > 0 ? pageIndex < pageCount - 1 : false;

  const goPrev = () => {
    setPagination((old) => ({
      ...old,
      pageIndex: Math.max(0, old.pageIndex - 1),
    }));
  };

  const goNext = () => {
    setPagination((old) => ({
      ...old,
      pageIndex: Math.min(
        pageCount > 0 ? pageCount - 1 : old.pageIndex,
        old.pageIndex + 1
      ),
    }));
  };

  const setPageSize = (size: number) => {
    setPagination((old) => ({
      ...old,
      pageSize: size,
      pageIndex: 0,
    }));
  };

  return (
    <div className="flex flex-col gap-3 px-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground tabular-nums">{rangeLabel}</p>
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium whitespace-nowrap">Rows per page</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={String(pageSize)} />
            </SelectTrigger>
            <SelectContent
              align="end"
              position="popper"
              sideOffset={4}
              className="z-[100]"
            >
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <p className="min-w-[7rem] text-center text-sm font-medium tabular-nums">
            {pageLabel}
          </p>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={goPrev}
              disabled={!canPrevious}
            >
              <span className="sr-only">Previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={goNext}
              disabled={!canNext}
            >
              <span className="sr-only">Next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
