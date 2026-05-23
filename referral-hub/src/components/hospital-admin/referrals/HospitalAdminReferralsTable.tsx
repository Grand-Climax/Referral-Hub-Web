"use client";

import * as React from "react";
import {
  functionalUpdate,
  type OnChangeFn,
  type PaginationState,
} from "@tanstack/react-table";
import { ReferralLists } from "@/components/table/referral-lists";
import { HospitalReferralLogTable } from "./HospitalReferralLogTable";
import {
  useGetInboundReferralsQuery,
  useGetOutboundReferralsQuery,
  useGetPendingApprovalReferralsQuery,
  useGetRejectedRedirectedReferralsQuery,
} from "@/features/hospitalAdmin/hospitalAdminApi";

export type HospitalAdminReferralTab =
  | "log"
  | "inbound"
  | "outbound"
  | "pending"
  | "rejected";

interface HospitalAdminReferralsTableProps {
  tab: HospitalAdminReferralTab;
}

export function HospitalAdminReferralsTable({ tab }: HospitalAdminReferralsTableProps) {
  const [pagination, setPaginationState] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

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
    [],
  );

  React.useEffect(() => {
    setPaginationState((p) => ({ ...p, pageIndex: 0 }));
  }, [tab]);

  const queryArgs = React.useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      page_size: pagination.pageSize,
    }),
    [pagination.pageIndex, pagination.pageSize],
  );

  const isLogTab = tab === "log";

  const inboundQuery = useGetInboundReferralsQuery(queryArgs, {
    skip: isLogTab || tab !== "inbound",
  });
  const outboundQuery = useGetOutboundReferralsQuery(queryArgs, {
    skip: isLogTab || tab !== "outbound",
  });
  const pendingQuery = useGetPendingApprovalReferralsQuery(queryArgs, {
    skip: isLogTab || tab !== "pending",
  });
  const rejectedQuery = useGetRejectedRedirectedReferralsQuery(queryArgs, {
    skip: isLogTab || tab !== "rejected",
  });

  const lastTotalRef = React.useRef<number | null>(null);

  if (isLogTab) {
    return (
      <HospitalReferralLogTable
        pagination={pagination}
        onPaginationChange={onPaginationChange}
      />
    );
  }

  const activeQuery =
    tab === "inbound"
      ? inboundQuery
      : tab === "outbound"
        ? outboundQuery
        : tab === "pending"
          ? pendingQuery
          : rejectedQuery;

  const { data: response, isLoading, isFetching } = activeQuery;

  if (response?.total != null) {
    lastTotalRef.current = response.total;
  }

  const rows = response?.data ?? [];
  const total = response?.total ?? lastTotalRef.current ?? 0;
  const tableBusy = isLoading || (isFetching && response == null);

  return (
    <ReferralLists
      data={rows}
      isLoading={tableBusy}
      getRowHref={(id) => `/hospital-admin/referrals/${id}`}
      serverPagination={{
        total,
        pagination,
        onPaginationChange,
      }}
    />
  );
}
