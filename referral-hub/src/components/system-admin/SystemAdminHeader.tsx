import { ShieldUser, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SystemAdminHeaderProps {
  onReset: () => void;
}

export function SystemAdminHeader({ onReset }: SystemAdminHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          <ShieldUser className="h-3.5 w-3.5" />
          System Admin
        </div>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Global User Governance
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Create users, update records, assign access roles, moderate profile
            images, and keep the entire platform user base aligned.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={onReset} className="gap-2">
          <Users className="h-4 w-4" />
          Reset Form
        </Button>
      </div>
    </div>
  );
}
