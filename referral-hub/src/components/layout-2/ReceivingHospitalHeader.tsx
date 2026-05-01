import { Search, HelpCircle, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export function ReceivingHospitalHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-6 shadow-sm">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search patient ID, hospital, or department..."
            className="w-full bg-muted/50 pl-9 pr-4 text-sm focus-visible:ring-1 border-0 h-10 rounded-lg"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <button className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors">
            <HelpCircle className="h-5 w-5" />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors">
            <Settings className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 pl-6 border-l">
          <div className="flex flex-col items-end">
            <p className="text-sm font-semibold leading-none">Dr. Sarah Miller</p>
            <p className="text-xs text-muted-foreground mt-1">Chief Registrar</p>
          </div>
          <Avatar className="h-10 w-10 border border-border">
            <AvatarImage src="/user.png" alt="Dr. Sarah Miller" />
            <AvatarFallback className="bg-primary/10 text-primary">SM</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
