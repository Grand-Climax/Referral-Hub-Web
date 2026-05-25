"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MOH_GRANULARITY_OPTIONS,
  MOH_TIMEFRAME_OPTIONS,
  MOH_TIER_LEVELS,
  type MohGranularity,
  type MohTimeframe,
  type HospitalOption,
} from "@/lib/mohAnalytics";

export interface MohFilterValues {
  timeframe: MohTimeframe;
  region: string;
  tierLevel: string;
  hospitalId: string;
  granularity?: MohGranularity;
}

interface MohAnalyticsFiltersProps {
  regionOptions: string[];
  hospitalOptions?: HospitalOption[];
  values: MohFilterValues;
  onTimeframeChange: (value: MohTimeframe) => void;
  onRegionChange: (value: string) => void;
  onTierLevelChange?: (value: string) => void;
  onHospitalChange?: (value: string) => void;
  onGranularityChange?: (value: MohGranularity) => void;
  showTierLevel?: boolean;
  showHospital?: boolean;
  showGranularity?: boolean;
  showTimeframe?: boolean;
  compact?: boolean;
}

export function MohAnalyticsFilters({
  regionOptions,
  hospitalOptions = [],
  values,
  onTimeframeChange,
  onRegionChange,
  onTierLevelChange,
  onHospitalChange,
  onGranularityChange,
  showTierLevel = false,
  showHospital = false,
  showGranularity = false,
  showTimeframe = true,
  compact = false,
}: MohAnalyticsFiltersProps) {
  const triggerClass = compact
    ? "h-9 w-full sm:w-auto bg-card border-border shadow-sm text-foreground"
    : "h-9 w-full sm:w-auto bg-card border-border shadow-sm text-foreground focus:ring-1 focus:ring-primary/30";

  return (
    <div className="flex flex-wrap items-end gap-3">
      {showTimeframe && (
        <FilterField label="Timeframe">
          <Select
            value={values.timeframe}
            onValueChange={(v) => onTimeframeChange(v as MohTimeframe)}
          >
            <SelectTrigger className={`w-[130px] ${triggerClass}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MOH_TIMEFRAME_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>
      )}

      <FilterField label="Region">
        <Select value={values.region} onValueChange={onRegionChange}>
          <SelectTrigger className={`w-[140px] ${triggerClass}`}>
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {regionOptions.map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      {showTierLevel && onTierLevelChange && (
        <FilterField label="Tier">
          <Select value={values.tierLevel} onValueChange={onTierLevelChange}>
            <SelectTrigger className={`w-[130px] ${triggerClass}`}>
              <SelectValue placeholder="Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              {MOH_TIER_LEVELS.map((tier) => (
                <SelectItem key={tier.value} value={tier.value}>
                  {tier.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>
      )}

      {showHospital && onHospitalChange && hospitalOptions.length > 0 && (
        <FilterField label="Hospital">
          <Select value={values.hospitalId} onValueChange={onHospitalChange}>
            <SelectTrigger className={`w-[160px] ${triggerClass}`}>
              <SelectValue placeholder="Hospital" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hospitals</SelectItem>
              {hospitalOptions.map((h) => (
                <SelectItem key={h.id} value={h.id}>
                  {h.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>
      )}

      {showGranularity && onGranularityChange && values.granularity && (
        <FilterField label="Granularity">
          <Select
            value={values.granularity}
            onValueChange={(v) => onGranularityChange(v as MohGranularity)}
          >
            <SelectTrigger className={`w-[120px] ${triggerClass}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MOH_GRANULARITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>
      )}
    </div>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold text-muted-foreground/60 uppercase px-1">
        {label}
      </span>
      {children}
    </div>
  );
}
