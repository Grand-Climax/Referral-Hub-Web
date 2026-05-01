import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Referral } from "@/types/referral";
import { Clock, User, Building2, Stethoscope } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { StatusBadge } from "../StatusBadge";
import { PriorityIndicator } from "../PriorityIndicator";

interface ReferralCardProps {
  referral: Referral;
  onClick?: (referral: Referral) => void;
  compact?: boolean;
}

export function ReferralCard({ referral, onClick, compact }: ReferralCardProps) {
  const timeAgo = formatDistanceToNow(new Date(referral.createdAt), { addSuffix: true });

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md cursor-pointer",
        referral.severity === "critical" && "border-l-4 border-l-red-500",
        referral.severity === "high" && "border-l-4 border-l-orange-500"
      )}
      onClick={() => onClick?.(referral)}
    >
      <CardHeader className={cn("pb-2", compact && "p-3 pb-1")}>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">{referral.id}</span>
              <StatusBadge status={referral.status} />
            </div>
            <h3 className="font-semibold text-foreground truncate">{referral.patient.fullName}</h3>
          </div>
          <PriorityIndicator severity={referral.severity} score={referral.severityScore} compact={compact} />
        </div>
      </CardHeader>
      <CardContent className={cn("space-y-2", compact && "p-3 pt-0")}>
        <p className="text-sm text-muted-foreground line-clamp-2">{referral.provisionalDiagnosis}</p>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Stethoscope className="h-3 w-3" />
            {referral.requiredSpecialty}
          </span>
          <span className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {referral.referringHospital}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeAgo}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
