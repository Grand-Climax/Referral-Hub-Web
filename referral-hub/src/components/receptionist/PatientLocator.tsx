"use client";

import { Input } from "@/components/ui/input";
import { Search, Info, Clock } from "lucide-react";

export function PatientLocator() {
  return (
    <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-100 h-full flex flex-col justify-center">
      <p className="text-[10px] font-bold text-slate-500 tracking-widest mb-6 uppercase">
        Patient Locator
      </p>
      <div className="relative mb-6">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
        <Input
          placeholder="Search by Patient ID, Name, or Referral Code..."
          className="pl-16 py-8 bg-slate-50 border-slate-200 text-slate-900 text-lg placeholder:text-slate-400 rounded-xl focus-visible:ring-primary"
        />
      </div>
      <div className="flex gap-6">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <Info className="h-4 w-4" />
          <span>B-Tree Indexed</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <Clock className="h-4 w-4" />
          <span>Recent: <span className="text-primary font-bold">REF-9921</span></span>
        </div>
      </div>
    </div>
  );
}
