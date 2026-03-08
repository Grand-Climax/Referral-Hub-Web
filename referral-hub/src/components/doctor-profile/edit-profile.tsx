"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Mail, Phone, User, Building2, Settings2 } from "lucide-react";

export function EditProfileForm() {
  return (
    <Card className="border-0 bg-transparent shadow-none">
      <CardContent className="space-y-10 p-2">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative flex items-center justify-center">
            <Avatar className="h-36 w-36 ring-4 ring-background shadow-xl" size="lg">
              <AvatarImage src="/user.png" alt="Dr. Smith" />
              <AvatarFallback>DS</AvatarFallback>
            </Avatar>
            <button
              type="button"
              className="bg-primary text-primary-foreground absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border-4 border-background shadow-md transition-transform hover:scale-105"
              aria-label="Change profile photo"
            >
              <Settings2 className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-1.5 mt-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Dr. Smith</h2>
            <p className="text-base font-medium text-muted-foreground">Medical Practitioner</p>
            <button
              type="button"
              className="text-sm font-semibold text-primary/80 transition-colors hover:text-primary hover:underline"
            >
              Change Profile Photo
            </button>
          </div>
        </div>

        <div className="grid gap-6 border-t border-border/50 pt-8 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Full Name
            </Label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted-foreground/70">
                <User className="h-5 w-5" />
              </span>
              <Input defaultValue="James Smith, MD" className="h-12 pl-11 rounded-xl bg-muted/40 transition-colors focus:bg-background" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Email Address
            </Label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted-foreground/70">
                <Mail className="h-5 w-5" />
              </span>
              <Input
                type="email"
                defaultValue="dr.smith@hospital.org"
                className="h-12 pl-11 rounded-xl bg-muted/40 transition-colors focus:bg-background"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Phone Number
            </Label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted-foreground/70">
                <Phone className="h-5 w-5" />
              </span>
              <Input
                defaultValue="+1 (555) 000-1234"
                className="h-12 pl-11 rounded-xl bg-muted/40 transition-colors focus:bg-background"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Department
            </Label>
            <Select defaultValue="general-practice">
              <SelectTrigger className="h-12 rounded-xl bg-muted/40 transition-colors focus:bg-background px-3.5">
                <div className="flex w-full items-center gap-2.5">
                  <span className="text-muted-foreground/70">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <SelectValue placeholder="Select department" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general-practice">
                  General Practice
                </SelectItem>
                <SelectItem value="internal-medicine">
                  Internal Medicine
                </SelectItem>
                <SelectItem value="cardiology">Cardiology</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-border/50 pt-8 mt-4">
          <Button type="button" variant="outline" className="h-11 px-6 rounded-xl font-medium border-border/50">
            Cancel
          </Button>
          <Button type="button" className="h-11 px-6 rounded-xl font-medium shadow-md transition-transform hover:scale-[1.02]">
            Update Information
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

