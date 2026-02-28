import { Badge } from "@/components/ui/badge";
import { ReferralStatus } from "@/types/referral";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<ReferralStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-amber-100 text-amber-800 border-amber-200" },
  approved: { label: "Approved", className: "bg-blue-100 text-blue-800 border-blue-200" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-800 border-red-200" },
  accepted: { label: "Accepted", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  redirected: { label: "Redirected", className: "bg-purple-100 text-purple-800 border-purple-200" },
  completed: { label: "Completed", className: "bg-gray-100 text-gray-800 border-gray-200" },
};

export function StatusBadge({ status }: { status: ReferralStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}
