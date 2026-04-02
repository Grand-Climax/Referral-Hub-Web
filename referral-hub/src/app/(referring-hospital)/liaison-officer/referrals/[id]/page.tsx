"use client"

import { useParams } from "next/navigation";
import { ReferralDetailView } from "@/components/liaison/ReferralDetailView";
import { useGetReferralByIdQuery } from "@/features/liaison/liaisonApi";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LiaisonReferralDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: response, isLoading, isError, error } = useGetReferralByIdQuery(id);
  const referral = response?.data;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Fetching referral details...</p>
      </div>
    );
  }

  if (isError || !referral) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center px-4">
        <div className="bg-destructive/10 p-4 rounded-full">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Referral Not Found</h2>
          <p className="text-muted-foreground max-w-[400px]">
            We couldn't find the referral case you're looking for. It might have been deleted or the link is incorrect.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/liaison-officer/referrals">Return to Listing</Link>
        </Button>
      </div>
    );
  }

  return (
    <ReferralDetailView referral={referral} />
  );
}
