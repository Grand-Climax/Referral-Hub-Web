"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle } from "lucide-react";

export function AdminControls() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Administrative Controls</CardTitle>
        <CardDescription>
          Set facility-wide capacity adjustments for holidays or strike days. All changes are recorded in the audit log.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Facility-wide holiday / strike-day capacity</p>
            <p className="text-sm text-muted-foreground">
              Set reduced referral capacity for public holidays or strike days. Applies to all departments.
            </p>
          </div>
          <Checkbox
            className="rounded-full h-5 w-9 data-[state=checked]:bg-primary"
            aria-label="Holiday or strike-day override"
          />
        </div>
        <div className="space-y-2">
          <p className="font-medium">Available Beds (Emergency)</p>
          <div className="flex items-center gap-2">
            <Input type="number" defaultValue={12} className="w-20" />
            <Button variant="secondary">Update Beds</Button>
          </div>
        </div>
        <Button variant="destructive">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Emergency System Halt
        </Button>
      </CardContent>
    </Card>
  );
}
