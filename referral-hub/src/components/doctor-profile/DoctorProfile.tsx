 "use client";

import { useGetCurrentUserQuery } from "@/features/auth/authApi";
import { useGetHospitalByIdQuery } from "@/features/hospitals/hospitalsApi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { EditProfileForm } from "./edit-profile";
import { UpdateCredentialForm } from "./update-credential";
import { Mail, CreditCard, Building2, Shield, User2, Settings2 } from "lucide-react";
import { DoctorProfileSkeleton } from "@/components/skeletons/DoctorProfileSkeleton";

export function DoctorProfile() {
  const { data: user, isLoading: userLoading } = useGetCurrentUserQuery();
  const hospitalId = user?.hospital_id;
  const { data: hospital, isLoading: hospitalLoading } = useGetHospitalByIdQuery(
    hospitalId!, { skip: !hospitalId }
  );

  const isLoading = userLoading;

  if (isLoading) {
    return <DoctorProfileSkeleton />;
  }

  const fullName = user?.first_name && user?.last_name 
    ? user.role === "RECEPTIONIST" 
      ? `${user.first_name} ${user.last_name}`
      : `Dr. ${user.first_name} ${user.last_name}` 
    : "User";
  
  const fallback = user?.first_name && user?.last_name 
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() 
    : "U";

  const email = user?.email || "user@hospital.com";
  const nationalId = user?.national_id || "—";
  
  // Role-specific display
  const roleDisplay = user?.role === "RECEPTIONIST" 
    ? "Receptionist" 
    : (user as any)?.specialization || (user as any)?.specialty || "Healthcare Professional";
  
  const specialty = user?.role === "RECEPTIONIST" 
    ? "Patient Services & Administration"
    : (user as any)?.specialization || (user as any)?.specialty || "Internal Medicine";
  
  const hospitalName = hospitalLoading ? "Loading..." : hospital?.name || "—";

  const verifiedBadgeText = user?.role === "RECEPTIONIST" 
    ? "Verified Staff" 
    : "Verified Specialist";

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden rounded-3xl border bg-card/60 backdrop-blur-xl shadow-sm transition-all hover:shadow-md">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50 pointer-events-none" />
        <CardContent className="relative space-y-6 p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-4 sm:gap-6">
              <div className="relative flex items-center justify-center">
                <Avatar className="h-50 w-50 ring-4">
                  <AvatarImage src={user?.profile_image_url || "/user.png"} alt="Dr. Sarah Jenkins" className="object-cover object-center" />
                  <AvatarFallback>{fallback[0]}</AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  className="bg-primary text-primary-foreground absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background shadow-md transition-transform hover:scale-105"
                  aria-label="Edit profile picture"
                >
                  <Settings2 className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold text-foreground">
                    {fullName}
                  </h2>
                  <Badge variant="secondary" className="text-[11px]">
                    {verifiedBadgeText}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-primary">
                  {specialty}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>{hospitalName}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:items-end" />
          </div>

          <div className="mt-6 flex flex-col gap-4 border-t border-border/50 pt-6 text-xs text-muted-foreground sm:flex-row sm:gap-8">
            <div className="flex flex-1 items-center gap-3">
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Email
                </p>
                <p className="text-sm font-medium text-foreground">
                  {email}
                </p>
              </div>
            </div>
            <div className="flex flex-1 items-center gap-3">
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
                <CreditCard className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  National ID
                </p>
                <p className="text-sm font-medium text-foreground">{nationalId}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-3xl border bg-card/60 backdrop-blur-xl shadow-sm transition-all hover:shadow-md">
        <CardHeader className="border-b border-border/50 bg-muted/20 pb-4 pt-6 px-8">
          <CardTitle className="text-base font-semibold">
            Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border/50 p-0">
          <Sheet>
            <div className="group flex items-center justify-between px-8 py-5 transition-colors hover:bg-muted/50">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110 shadow-inner">
                  <User2 className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Personal Information
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Update your name, contact details, and profile photo.
                  </p>
                </div>
              </div>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Edit
                </button>
              </SheetTrigger>
            </div>
            <SheetContent side="right" className="w-full sm:max-w-xl p-5">
              <SheetHeader>
                <SheetTitle>Edit Profile</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <EditProfileForm />
              </div>
            </SheetContent>
          </Sheet>

          <Sheet>
            <div className="group flex items-center justify-between px-8 py-5 transition-colors hover:bg-muted/50">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110 shadow-inner">
                  <Shield className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Security Credentials
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Change your password and manage two-factor authentication.
                  </p>
                </div>
              </div>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Update
                </button>
              </SheetTrigger>
            </div>
            <SheetContent side="right" className="w-full sm:max-w-2xl">
              <SheetHeader>
                <SheetTitle>Update Security Credentials</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <UpdateCredentialForm />
              </div>
            </SheetContent>
          </Sheet>
        </CardContent>
      </Card>
    </div>
  );
}

