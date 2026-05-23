import { useMemo } from "react";
import { useGetDepartmentsQuery } from "@/features/department/department";

export function useDepartmentNameMap() {
  const { data: departments = [], isLoading } = useGetDepartmentsQuery({
    page: 1,
    page_size: 500,
  });

  const nameById = useMemo(
    () =>
      Object.fromEntries(
        departments.map((department) => [department.id, department.name]),
      ),
    [departments],
  );

  const getDepartmentName = (
    id: string | null | undefined,
    fallback = "—",
  ): string => {
    if (!id) return fallback;
    const name = nameById[id];
    if (name) return name;
    if (isLoading) return "Loading…";
    return fallback;
  };

  return { nameById, getDepartmentName, isLoading };
}
