"use client";

import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ChangeDepartmentOption {
  id: string;
  name: string;
}

interface ChangeDepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: ChangeDepartmentOption[];
  isLoadingDepartments?: boolean;
  /** Department the referral is currently targeting; pre-selected and
   *  treated as a no-op submit. */
  currentDepartmentId?: string | null;
  onConfirm: (values: { departmentId: string }) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function ChangeDepartmentDialog({
  open,
  onOpenChange,
  departments,
  isLoadingDepartments = false,
  currentDepartmentId,
  onConfirm,
  isSubmitting = false,
}: ChangeDepartmentDialogProps) {
  const [departmentId, setDepartmentId] = useState("");

  useEffect(() => {
    if (open) {
      setDepartmentId(currentDepartmentId ?? "");
    } else if (!isSubmitting) {
      setDepartmentId("");
    }
  }, [open, isSubmitting, currentDepartmentId]);

  const isUnchanged =
    !!currentDepartmentId && departmentId === currentDepartmentId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Change target department
          </DialogTitle>
          <DialogDescription>
            Move this referral to another department within your hospital.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="change-dept">Department</Label>
            <Select
              value={departmentId}
              onValueChange={setDepartmentId}
              disabled={isLoadingDepartments || isSubmitting}
            >
              <SelectTrigger id="change-dept" className="bg-background">
                <SelectValue
                  placeholder={
                    isLoadingDepartments
                      ? "Loading departments..."
                      : "Select department"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {departments.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No departments available
                  </div>
                ) : (
                  departments.map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name}
                      {currentDepartmentId === department.id ? " (current)" : ""}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            onClick={() => {
              void onConfirm({ departmentId });
            }}
            disabled={isSubmitting || !departmentId || isUnchanged}
          >
            {isSubmitting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Building2 className="h-4 w-4" />
            )}
            Change department
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
