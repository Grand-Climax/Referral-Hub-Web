import { Button } from "@/components/ui/button";
import { Check, X, ArrowRight } from "lucide-react";

interface ApprovalActionsProps {
  onApprove?: () => void;
  onReject?: () => void;
  onForward?: () => void;
  size?: "sm" | "default";
}

export function ApprovalActions({ onApprove, onReject, onForward, size = "sm" }: ApprovalActionsProps) {
  return (
    <div className="flex items-center gap-1">
      {onApprove && (
        <Button
          size={size}
          variant="ghost"
          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8 px-2"
          onClick={onApprove}
        >
          <Check className="h-4 w-4" />
          <span className="hidden sm:inline ml-1">Approve</span>
        </Button>
      )}
      {onReject && (
        <Button
          size={size}
          variant="ghost"
          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
          onClick={onReject}
        >
          <X className="h-4 w-4" />
          <span className="hidden sm:inline ml-1">Reject</span>
        </Button>
      )}
      {onForward && (
        <Button
          size={size}
          variant="ghost"
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 px-2"
          onClick={onForward}
        >
          <ArrowRight className="h-4 w-4" />
          <span className="hidden sm:inline ml-1">Forward</span>
        </Button>
      )}
    </div>
  );
}
