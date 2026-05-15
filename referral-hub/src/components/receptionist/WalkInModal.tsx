import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegisterWalkInMutation } from "@/features/receptionist/receptionistApi";
import { toast } from "sonner";

interface WalkInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalkInModal({ open, onOpenChange }: WalkInModalProps) {
  const [registerWalkIn, { isLoading }] = useRegisterWalkInMutation();
  const [referralId, setReferralId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerWalkIn({ referral_id: referralId }).unwrap();
      toast.success("Walk-in patient registered successfully");
      onOpenChange(false);
      setReferralId("");
    } catch (err: any) {
      const errorMessage = err?.data?.error || "Failed to register walk-in patient";
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Register Walk-In Patient</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="referralId">Referral ID</Label>
            <Input 
              id="referralId" 
              required 
              value={referralId} 
              onChange={(e) => setReferralId(e.target.value)} 
              placeholder="Enter Referral ID"
            />
            <p className="text-xs text-slate-500">
              Enter the referral ID of a patient with ACCEPTED or SCHEDULED status
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Registering..." : "Register"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
