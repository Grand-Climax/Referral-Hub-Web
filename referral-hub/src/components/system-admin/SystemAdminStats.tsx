import { BadgeCheck, ImageMinus, Shield, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { SystemAdminUser } from "@/types/system-admin";

interface SystemAdminStatsProps {
  users: SystemAdminUser[];
  filteredUsers: SystemAdminUser[];
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="border-border/60 bg-background/80 shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {title}
          </p>
          <p className="text-2xl font-semibold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function SystemAdminStats({
  users,
  filteredUsers,
}: SystemAdminStatsProps) {
  const activeUsers = users.filter((user) => user.is_active !== false).length;
  const hospitalAdmins = users.filter(
    (user) => user.role === "hospital_admin",
  ).length;
  const pendingImageModeration = users.filter((user) =>
    Boolean(user.profile_image_url),
  ).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Global users"
        value={String(users.length)}
        description={`${filteredUsers.length} currently match the active filters.`}
        icon={Users}
      />
      <StatCard
        title="Active accounts"
        value={String(activeUsers)}
        description="Users enabled across the platform."
        icon={BadgeCheck}
      />
      <StatCard
        title="Hospital admins"
        value={String(hospitalAdmins)}
        description="Accounts with hospital-level administration access."
        icon={Shield}
      />
      <StatCard
        title="Image reviews"
        value={String(pendingImageModeration)}
        description="Profiles with images available for moderation."
        icon={ImageMinus}
      />
    </div>
  );
}
