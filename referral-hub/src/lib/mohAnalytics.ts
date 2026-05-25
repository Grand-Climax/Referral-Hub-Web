import type { MohQueryParams } from "@/types/moh-analytics";

export type MohTimeframe = "7days" | "30days" | "90days" | "year";
export type MohGranularity = "day" | "week" | "month";
export type MohTierLevel =
  | "PRIMARY"
  | "SECONDARY"
  | "SPECIALIZED"
  | "TERTIARY";

export const MOH_TIER_LEVELS: { value: MohTierLevel; label: string }[] = [
  { value: "PRIMARY", label: "Primary" },
  { value: "SECONDARY", label: "Secondary" },
  { value: "SPECIALIZED", label: "Specialized" },
  { value: "TERTIARY", label: "Tertiary" },
];

export const MOH_TIMEFRAME_OPTIONS: { value: MohTimeframe; label: string }[] = [
  { value: "7days", label: "Last 7 Days" },
  { value: "30days", label: "Last 30 Days" },
  { value: "90days", label: "Last 90 Days" },
  { value: "year", label: "Last Year" },
];

export const MOH_GRANULARITY_OPTIONS: { value: MohGranularity; label: string }[] = [
  { value: "day", label: "Daily" },
  { value: "week", label: "Weekly" },
  { value: "month", label: "Monthly" },
];

/** Fallback regions when API has not returned data yet */
export const MOH_DEFAULT_REGIONS = [
  "Addis Ababa",
  "Amhara",
  "Oromia",
  "Tigray",
  "SNNPR",
];

export function getMohDateRange(timeframe: MohTimeframe): { from: string; to: string } {
  const to = new Date().toISOString().split("T")[0];
  const from = new Date();

  switch (timeframe) {
    case "7days":
      from.setDate(from.getDate() - 7);
      break;
    case "30days":
      from.setDate(from.getDate() - 30);
      break;
    case "90days":
      from.setDate(from.getDate() - 90);
      break;
    case "year":
      from.setFullYear(from.getFullYear() - 1);
      break;
    default:
      from.setDate(from.getDate() - 30);
  }

  return { from: from.toISOString().split("T")[0], to };
}

export interface BuildMohQueryParamsInput {
  timeframe?: MohTimeframe;
  from?: string;
  to?: string;
  region?: string;
  hospitalId?: string;
  tierLevel?: string;
  granularity?: MohGranularity;
}

export function buildMohQueryParams(
  input: BuildMohQueryParamsInput = {},
): MohQueryParams {
  const range =
    input.from && input.to
      ? { from: input.from, to: input.to }
      : getMohDateRange(input.timeframe ?? "30days");

  const params: MohQueryParams = {
    from: range.from,
    to: range.to,
  };

  if (input.region && input.region !== "all") {
    params.region = input.region;
  }
  if (input.hospitalId && input.hospitalId !== "all") {
    params.hospital_id = input.hospitalId;
  }
  if (input.tierLevel && input.tierLevel !== "all") {
    params.tier_level = input.tierLevel;
  }
  if (input.granularity) {
    params.granularity = input.granularity;
  }

  return params;
}

export function safePercent(numerator: number, denominator: number): number {
  if (!denominator || denominator <= 0) return 0;
  return (numerator / denominator) * 100;
}

export function safeDivide(numerator: number, denominator: number): number {
  if (!denominator || denominator <= 0) return 0;
  return numerator / denominator;
}

export function uniqueRegionsFromStrings(regions: string[]): string[] {
  return [...new Set(regions.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b),
  );
}

export function mergeRegionOptions(
  apiRegions: string[],
  fallback: string[] = MOH_DEFAULT_REGIONS,
): string[] {
  const merged = uniqueRegionsFromStrings([...apiRegions, ...fallback]);
  return merged.length > 0 ? merged : fallback;
}

export function uniqueDepartmentsFromHotspots(
  departments: string[],
): string[] {
  return [...new Set(departments.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b),
  );
}

export interface HospitalOption {
  id: string;
  name: string;
}

export function hospitalsFromLoad(
  hospitals: { hospital_id: string; hospital_name: string }[],
): HospitalOption[] {
  const seen = new Map<string, string>();
  for (const h of hospitals) {
    if (h.hospital_id && !seen.has(h.hospital_id)) {
      seen.set(h.hospital_id, h.hospital_name);
    }
  }
  return [...seen.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
