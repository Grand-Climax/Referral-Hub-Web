"use client";

import * as React from "react";
import {
  functionalUpdate,
  type OnChangeFn,
  type PaginationState,
} from "@tanstack/react-table";

import { ReferralLists } from "@/components/table/referral-lists";
import { useGetReferralsQuery } from "@/features/liaison/liaisonApi";

interface ReferralsTableProps {
  statusFilter?: "all" | "approved" | "rejected";
}

export function ReferralsTable({ statusFilter = "all" }: ReferralsTableProps) {
  const [pagination, setPaginationState] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  /** TanStack passes Updater<PaginationState>; normalize and reset to first page when page size changes (server expects a new slice). */
  const onPaginationChange = React.useCallback<OnChangeFn<PaginationState>>(
    (updater) => {
      setPaginationState((old) => {
        const next = functionalUpdate(updater, old);
        if (next.pageSize !== old.pageSize) {
          return { ...next, pageIndex: 0 };
        }
        return next;
      });
    },
    []
  );

  React.useEffect(() => {
    setPaginationState((p) => ({ ...p, pageIndex: 0 }));
  }, [statusFilter]);

  const queryArgs = React.useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      listType: statusFilter,
    }),
    [pagination.pageIndex, pagination.pageSize, statusFilter]
  );

  const { data: response, isLoading, isFetching } = useGetReferralsQuery(
    queryArgs,
    {
      refetchOnMountOrArgChange: true,
    }
  );

  /** RTK Query clears `data` while fetching a new page arg; without this, total becomes 0, pageCount becomes 1, and TanStack clamps pageIndex so next page never applies. */
  const lastTotalRef = React.useRef<number | null>(null);
  if (response?.total != null) {
    lastTotalRef.current = response.total;
  }

  const allReferrals = response?.data ?? [];
  const total = response?.total ?? lastTotalRef.current ?? 0;

  const tableBusy = isLoading || (isFetching && response == null);

  return (
    <div className="space-y-4">
      <ReferralLists
        data={allReferrals}
        isLoading={tableBusy}
        getRowHref={(id) => `/liaison-officer/referrals/${id}`}
        serverPagination={{
          total,
          pagination,
          onPaginationChange,
        }}
      />
    </div>
  );
}
