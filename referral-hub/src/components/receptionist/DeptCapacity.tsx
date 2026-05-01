"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BarChart } from "lucide-react";

const capacities = [
  { name: "CARDIOLOGY", value: 88, color: "bg-red-500" },
  { name: "NEUROLOGY", value: 62, color: "bg-primary" },
  { name: "GENERAL", value: 41, color: "bg-green-500" },
];

export function DeptCapacity() {
  return (
    <Card className="border-none shadow-md overflow-hidden bg-white mb-6">
      <CardHeader className="flex flex-row items-center justify-between py-6 px-6 pb-2">
        <CardTitle className="text-sm font-bold text-slate-700 tracking-tight">Dept. Capacity</CardTitle>
        <BarChart className="h-4 w-4 text-slate-400" />
      </CardHeader>
      <CardContent className="px-6 pb-6 space-y-6">
        {capacities.map((dept) => (
          <div key={dept.name} className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold tracking-tight">
              <span className="text-slate-400 uppercase">{dept.name}</span>
              <span className="text-slate-900">{dept.value}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full ${dept.color} transition-all duration-500`} 
                style={{ width: `${dept.value}%` }}
              />
            </div>
          </div>
        ))}
        
        <Button variant="ghost" className="w-full mt-2 bg-primary/10 text-primary hover:bg-primary/20 font-bold text-xs py-5 rounded-lg">
          View Detailed Metrics
        </Button>
      </CardContent>
    </Card>
  );
}
