"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetUsersQuery } from "@/features/users/usersApi";
import { useGetMeQuery } from "@/features/users/usersApi";
import { Loader2 } from "lucide-react";

interface GrantConsultantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGrant: (doctorId: string) => void | Promise<void>;
  isLoading?: boolean;
  excludeIds?: string[];
}

export function GrantConsultantDialog({
  open,
  onOpenChange,
  onGrant,
  isLoading,
  excludeIds = [],
}: GrantConsultantDialogProps) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const { data: me } = useGetMeQuery(undefined, { skip: !open });
  const { data: users = [], isLoading: loadingUsers } = useGetUsersQuery(
    me?.hospital_id
      ? { role: "REFERRING_DOCTOR", hospital_id: me.hospital_id }
      : undefined,
    { skip: !open || !me?.hospital_id },
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const exclude = new Set([me?.id, ...excludeIds].filter(Boolean));
    return users
      .filter((u) => !exclude.has(u.id))
      .filter((u) => {
        if (!q) return true;
        const name = `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase();
        return name.includes(q);
      });
  }, [users, search, me?.id, excludeIds]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add consulting doctor</DialogTitle>
          <DialogDescription>
            Invite another referring doctor at your hospital to consult on this
            case.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-2">
            <Label>Search</Label>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name or email"
            />
          </div>
          <div className="max-h-48 overflow-y-auto rounded-md border divide-y">
            {loadingUsers ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground p-3">
                No doctors match your search.
              </p>
            ) : (
              filtered.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-muted ${
                    selectedId === u.id ? "bg-primary/10" : ""
                  }`}
                  onClick={() => setSelectedId(u.id)}
                >
                  <span className="font-medium">
                    {u.first_name} {u.last_name}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {u.email}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!selectedId || isLoading}
            onClick={() => void onGrant(selectedId)}
          >
            Grant access
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
