"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CHART_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const INFLOW = [12, 15, 10, 18, 14, 8, 6];
const CAPACITY = [20, 20, 20, 20, 20, 15, 15];

export function AdminReferralChart() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Referral Inflow vs. Capacity</CardTitle>
        <Select defaultValue="7">
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Last 7 Days" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="14">Last 14 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2 h-40">
          {CHART_DAYS.map((day, i) => (
            <div key={day} className="flex-1 flex flex-col items-center gap-1">
              <div className="flex gap-0.5 w-full justify-center items-end flex-1">
                <div
                  className="w-1/2 bg-primary rounded-t min-h-[4px]"
                  style={{ height: `${(INFLOW[i]! / 20) * 100}%` }}
                />
                <div
                  className="w-1/2 bg-muted rounded-t min-h-[4px]"
                  style={{ height: `${(CAPACITY[i]! / 20) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{day}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-4 justify-center text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-primary" /> Referral Inflow
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-muted" /> Capacity
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
