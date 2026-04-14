import { Badge } from "@/components/ui/badge";
import { ReferralStatus } from "@/types/referral";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDING:    { label: "Pending",     className: "bg-amber-100 text-amber-800 border-amber-200" },
  APPROVED:   { label: "Approved",    className: "bg-blue-100 text-blue-800 border-blue-200" },
  REJECTED:   { label: "Rejected",    className: "bg-red-100 text-red-800 border-red-200" },
  ACCEPTED:   { label: "Accepted",    className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  REDIRECTED: { label: "Redirected",  className: "bg-purple-100 text-purple-800 border-purple-200" },
  COMPLETED:  { label: "Completed",   className: "bg-gray-100 text-gray-800 border-gray-200" },
  DRAFT:      { label: "Draft",       className: "bg-slate-100 text-slate-800 border-slate-200" },
  SUBMITTED:  { label: "Submitted",   className: "bg-sky-100 text-sky-800 border-sky-200" },
};

export function StatusBadge({ status }: { status: string }) {
  const normalized = (status || "DRAFT").toUpperCase();
  const config = STATUS_CONFIG[normalized] || { label: normalized, className: "bg-gray-50 text-gray-600 border-gray-200" };
  
  return (
    <Badge variant="outline" className={cn("text-[10px] py-0 px-2 font-medium capitalize", config.className)}>
      {config.label}
    </Badge>
  );
}
