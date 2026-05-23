export type ReferralListsTableMeta = {
  getRowHref?: (id: string) => string;
  departmentNames?: Record<string, string>;
  departmentsLoading?: boolean;
};
