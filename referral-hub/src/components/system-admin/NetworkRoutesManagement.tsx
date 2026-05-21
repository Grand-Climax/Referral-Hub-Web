"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Loader2,
  Network,
  Plus,
  RefreshCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/apiError";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useGetHospitalsQuery } from "@/features/hospitals/hospitalsApi";
import {
  useCreateNetworkRouteMutation,
  useDeleteNetworkRouteMutation,
  useGetNetworkRoutesQuery,
} from "@/features/networkRoutes/networkRoutesApi";
import {
  NETWORK_ROUTE_REFERRAL_TYPES,
  type CreateNetworkRouteRequest,
  type NetworkRoute,
} from "@/types/network-route";

const ALL_HOSPITALS = "__all__";

interface CreateForm {
  sender_hospital_id: string;
  receiver_hospital_id: string;
  referral_type: string;
  requires_admin_approval: boolean;
}

const DEFAULT_FORM: CreateForm = {
  sender_hospital_id: "",
  receiver_hospital_id: "",
  referral_type: NETWORK_ROUTE_REFERRAL_TYPES[0],
  requires_admin_approval: false,
};

export function NetworkRoutesManagement() {
  const [filterSenderId, setFilterSenderId] = useState<string>(ALL_HOSPITALS);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<NetworkRoute | null>(null);
  const [createForm, setCreateForm] = useState<CreateForm>(DEFAULT_FORM);

  const { data: hospitals = [], isFetching: isHospitalsLoading } =
    useGetHospitalsQuery();

  const {
    data: routes = [],
    isFetching: isRoutesLoading,
    refetch: refetchRoutes,
  } = useGetNetworkRoutesQuery(
    filterSenderId && filterSenderId !== ALL_HOSPITALS
      ? { sender_hospital_id: filterSenderId }
      : undefined,
  );

  const [createNetworkRoute, { isLoading: isCreating }] =
    useCreateNetworkRouteMutation();
  const [deleteNetworkRoute, { isLoading: isDeleting }] =
    useDeleteNetworkRouteMutation();

  const hospitalMap = useMemo(() => {
    const map = new Map<string, string>();
    hospitals.forEach((h) => map.set(h.id, h.name));
    return map;
  }, [hospitals]);

  const filteredRoutes = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return routes;
    return routes.filter((route) => {
      const sender = hospitalMap.get(route.sender_hospital_id) ?? "";
      const receiver = hospitalMap.get(route.receiver_hospital_id) ?? "";
      return `${sender} ${receiver} ${route.referral_type} ${route.id}`
        .toLowerCase()
        .includes(keyword);
    });
  }, [routes, searchTerm, hospitalMap]);

  const resetCreateForm = () => setCreateForm(DEFAULT_FORM);

  const handleOpenCreate = () => {
    resetCreateForm();
    setIsCreateDialogOpen(true);
  };

  const handleCreate = async () => {
    if (
      !createForm.sender_hospital_id ||
      !createForm.receiver_hospital_id ||
      !createForm.referral_type
    ) {
      toast.error("Please fill out all required fields.");
      return;
    }
    if (createForm.sender_hospital_id === createForm.receiver_hospital_id) {
      toast.error("Sender and receiver hospitals must be different.");
      return;
    }

    const payload: CreateNetworkRouteRequest = {
      sender_hospital_id: createForm.sender_hospital_id,
      receiver_hospital_id: createForm.receiver_hospital_id,
      referral_type: createForm.referral_type,
      requires_admin_approval: createForm.requires_admin_approval,
    };

    try {
      await createNetworkRoute(payload).unwrap();
      toast.success("Network route created.");
      setIsCreateDialogOpen(false);
      resetCreateForm();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to create network route."));
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteNetworkRoute(pendingDelete.id).unwrap();
      toast.success("Network route deleted.");
      setPendingDelete(null);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to delete network route."));
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-400 flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Network className="h-6 w-6 text-primary" />
            Network routes
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage referral routing rules between sender and receiver hospitals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" onClick={handleOpenCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            New route
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => refetchRoutes()}
            className="gap-2"
            disabled={isRoutesLoading}
          >
            {isRoutesLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      <Card className="border-border/60 bg-background/80 shadow-sm">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by hospital, type, or ID"
              className="h-10 border-border/60 pl-9"
            />
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Label
              htmlFor="filter-sender"
              className="whitespace-nowrap text-xs text-muted-foreground"
            >
              Sender hospital
            </Label>
            <Select
              value={filterSenderId}
              onValueChange={(value) => setFilterSenderId(value)}
            >
              <SelectTrigger
                id="filter-sender"
                className="h-10 w-full min-w-[220px] border-border/60"
              >
                <SelectValue placeholder="All hospitals" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_HOSPITALS}>All hospitals</SelectItem>
                {hospitals.map((hospital) => (
                  <SelectItem key={hospital.id} value={hospital.id}>
                    {hospital.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-background shadow-sm">
        <CardContent className="p-0">
          {isRoutesLoading ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading network routes...
            </div>
          ) : filteredRoutes.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Network className="h-10 w-10 text-muted-foreground" />
              <p className="text-base font-medium text-foreground">
                No network routes found
              </p>
              <p className="max-w-md text-sm text-muted-foreground">
                Create a new route to define how referrals should flow between
                hospitals.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sender hospital</TableHead>
                  <TableHead />
                  <TableHead>Receiver hospital</TableHead>
                  <TableHead>Referral type</TableHead>
                  <TableHead>Admin approval</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoutes.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>
                          {hospitalMap.get(route.sender_hospital_id) ??
                            route.sender_hospital_id}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {route.sender_hospital_id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="w-6 text-muted-foreground">
                      <ArrowRight className="h-4 w-4" />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>
                          {hospitalMap.get(route.receiver_hospital_id) ??
                            route.receiver_hospital_id}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {route.receiver_hospital_id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-medium">
                        {route.referral_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {route.requires_admin_approval ? (
                        <Badge
                          variant="outline"
                          className="gap-1 border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
                        >
                          <ShieldAlert className="h-3 w-3" />
                          Required
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                        >
                          <ShieldCheck className="h-3 w-3" />
                          Not required
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-destructive hover:text-destructive"
                        onClick={() => setPendingDelete(route)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) resetCreateForm();
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create network route</DialogTitle>
            <DialogDescription>
              Define a routing rule that lets referrals flow from a sender
              hospital to a receiver hospital.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="sender-hospital">Sender hospital *</Label>
              <Select
                value={createForm.sender_hospital_id}
                onValueChange={(value) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    sender_hospital_id: value,
                  }))
                }
                disabled={isHospitalsLoading}
              >
                <SelectTrigger id="sender-hospital">
                  <SelectValue placeholder="Select sender hospital" />
                </SelectTrigger>
                <SelectContent>
                  {hospitals.map((hospital) => (
                    <SelectItem key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="receiver-hospital">Receiver hospital *</Label>
              <Select
                value={createForm.receiver_hospital_id}
                onValueChange={(value) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    receiver_hospital_id: value,
                  }))
                }
                disabled={isHospitalsLoading}
              >
                <SelectTrigger id="receiver-hospital">
                  <SelectValue placeholder="Select receiver hospital" />
                </SelectTrigger>
                <SelectContent>
                  {hospitals.map((hospital) => (
                    <SelectItem key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="referral-type">Referral type *</Label>
              <Select
                value={createForm.referral_type}
                onValueChange={(value) =>
                  setCreateForm((prev) => ({ ...prev, referral_type: value }))
                }
              >
                <SelectTrigger id="referral-type">
                  <SelectValue placeholder="Select referral type" />
                </SelectTrigger>
                <SelectContent>
                  {NETWORK_ROUTE_REFERRAL_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
              <div className="space-y-1">
                <Label
                  htmlFor="requires-approval"
                  className="text-sm font-medium"
                >
                  Requires admin approval
                </Label>
                <p className="text-xs text-muted-foreground">
                  Referrals along this route must be approved by an admin
                  before being routed.
                </p>
              </div>
              <Switch
                id="requires-approval"
                checked={createForm.requires_admin_approval}
                onCheckedChange={(checked) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    requires_admin_approval: checked,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                void handleCreate();
              }}
              disabled={isCreating}
              className="gap-2"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Create route
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              Delete network route
            </DialogTitle>
            <DialogDescription>
              {pendingDelete
                ? `Delete the route from ${
                    hospitalMap.get(pendingDelete.sender_hospital_id) ??
                    pendingDelete.sender_hospital_id
                  } to ${
                    hospitalMap.get(pendingDelete.receiver_hospital_id) ??
                    pendingDelete.receiver_hospital_id
                  }? This action cannot be undone.`
                : "This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                void handleConfirmDelete();
              }}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Delete route
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
