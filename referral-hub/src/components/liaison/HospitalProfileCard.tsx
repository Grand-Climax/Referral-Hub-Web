"use client"

import { Building2, MapPin, Phone } from "lucide-react";
import { useGetHospitalByIdQuery } from "@/features/hospitals/hospitalsApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function HospitalProfileCard({ hospitalId }: { hospitalId: string }) {
  const { data: hospital, isLoading } = useGetHospitalByIdQuery(hospitalId);

  const hospitalName = hospital?.name ?? "";
  const tierLevel = hospital?.tier_level ?? "";
  const region = hospital?.region ?? "";
  const contactPhone = hospital?.contact_phone ?? "";
  const address = hospital?.address ?? "";

  if (isLoading) {
    return (
      <div className="space-y-3 p-2">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-2 border-t pt-3">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    );
  }

  if (!hospital) {
    return <div className="p-4 text-xs text-muted-foreground italic">Hospital data unavailable</div>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h4 className="text-base font-bold text-foreground flex items-center gap-2">
          <Building2 className="h-4 w-4 text-blue-600" />
          {hospitalName}
        </h4>
        <div className="flex items-center gap-2 mt-1.5">
          <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-blue-200 text-blue-600 bg-blue-50/50 font-bold uppercase">
            {tierLevel}
          </Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {region}
          </span>
        </div>
      </div>

      <div className="space-y-2.5 border-t border-slate-100 pt-4">
         <div className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors group">
          <div className="p-1.5 rounded-md bg-slate-50 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
            <Phone className="h-3.5 w-3.5" />
          </div>
          <span>{contactPhone}</span>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">Location Address</p>
          <p className="text-xs text-muted-foreground leading-relaxed italic">{address}</p>
        </div>
      </div>
    </div>
  );
}
