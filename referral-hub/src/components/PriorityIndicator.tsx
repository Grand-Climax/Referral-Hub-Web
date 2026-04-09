import { SeverityLevel } from "@/types/referral";
import { cn } from "@/lib/utils";
import { AlertTriangle, AlertCircle, Info, ArrowDown } from "lucide-react";

const SEVERITY_CONFIG: Record<SeverityLevel, { label: string; className: string; icon: React.ComponentType<{ className?: string }> }> = {
  critical: { label: "Critical", className: "text-red-600 bg-red-50 border-red-200", icon: AlertTriangle },
  high: { label: "High", className: "text-orange-600 bg-orange-50 border-orange-200", icon: AlertCircle },
  medium: { label: "Medium", className: "text-amber-600 bg-amber-50 border-amber-200", icon: Info },
  low: { label: "Low", className: "text-green-600 bg-green-50 border-green-200", icon: ArrowDown },
};

interface PriorityIndicatorProps {
  severity: SeverityLevel;
  score?: number;
  compact?: boolean;
}

export function PriorityIndicator({ severity, score, compact }: PriorityIndicatorProps) {
  const config = SEVERITY_CONFIG[severity];
  const Icon = config.icon;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-1 text-xs font-medium", config.className.split(" ")[0])}>
        <Icon className="h-3.5 w-3.5" />
        {score !== undefined && <span>{score}</span>}
      </div>
    );
  }

  return (
    <div className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium", config.className)}>
      <Icon className="h-3.5 w-3.5" />
      <span>{config.label}</span>
      {score !== undefined && (
        <span className="ml-1 font-bold">{score}</span>
      )}
    </div>
  );
}
