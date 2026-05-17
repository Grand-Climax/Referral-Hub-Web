"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { useGetReferralStatusHistoryQuery } from "@/features/hospitalAdmin/hospitalAdminApi";

export function ReferralStatusHistoryCard() {
  const [referralId, setReferralId] = useState("");
  const [searchedId, setSearchedId] = useState("");

  const { data, isLoading, error } = useGetReferralStatusHistoryQuery(searchedId, {
    skip: !searchedId,
  });

  return (
    <Card className="border-none shadow-sm rounded-2xl bg-white h-full">
      <CardHeader className="border-b border-slate-50 py-5 px-8">
        <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-widest">
          Referral Status History Lookup
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        <div className="flex gap-2">
          <Input
            placeholder="Enter Referral ID..."
            value={referralId}
            onChange={(e) => setReferralId(e.target.value)}
            className="flex-1"
          />
          <Button onClick={() => setSearchedId(referralId)}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm text-center py-4">Failed to load history or invalid ID.</p>
        )}

        {data && data.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-4">No history found for this referral.</p>
        )}

        {data && data.length > 0 && (
          <div className="space-y-4">
            {data.map((history, idx) => (
              <div key={history.id || idx} className="flex gap-4 items-start relative">
                {idx !== data.length - 1 && (
                  <div className="absolute left-2 top-8 bottom-0 w-px bg-slate-200" />
                )}
                <div className="h-4 w-4 rounded-full bg-primary mt-1 shrink-0 z-10" />
                <div className="bg-slate-50 p-4 rounded-lg flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-bold text-sm text-slate-900">{history.status}</p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {new Date(history.created_at).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-xs text-slate-600">Changed by: <span className="font-semibold">{history.changed_by}</span></p>
                  {history.notes && (
                    <p className="text-xs text-slate-500 mt-2 bg-white p-2 rounded border border-slate-100">
                      {history.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
