"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Building2, Shield, User2, Settings2, MapPin } from "lucide-react";

export function ReceptionistProfile() {
  const user = {
    name: "Sr. Hana Tesfaye",
    role: "Receptionist",
    email: "hana@paul.gov.et",
    phone: "+251 911 234 567",
    hospital: "St. Paul's Hospital",
    department: "Main Reception",
    bio: "Dedicated healthcare administrator with over 8 years of experience in patient coordinating and referral management.",
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Profile Header Card */}
      <Card className="relative overflow-hidden rounded-3xl border-none shadow-xl bg-white">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary to-primary/80" />
        <CardContent className="relative pt-16 flex flex-col md:flex-row items-center md:items-end gap-6 px-8 pb-8">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg rounded-2xl">
              <AvatarImage src="/hana.png" alt={user.name} />
              <AvatarFallback className="bg-slate-100 text-primary text-3xl font-bold rounded-2xl">HT</AvatarFallback>
            </Avatar>
            <Button size="icon" variant="secondary" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-md border-2 border-white">
              <Settings2 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{user.name}</h2>
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-3 font-bold text-[10px] tracking-wider uppercase">
                Receptionist
              </Badge>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-primary" />
                <span>{user.hospital}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Addis Ababa, Ethiopia</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="md:col-span-2 space-y-8">
          <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 py-5 px-8">
              <CardTitle className="text-sm font-bold text-slate-700 tracking-tight uppercase tracking-widest">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                  <p className="text-sm font-bold text-slate-900">{user.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
                  <p className="text-sm font-bold text-slate-900">{user.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <User2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Department</p>
                  <p className="text-sm font-bold text-slate-900">{user.department}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Account Status</p>
                  <p className="text-sm font-bold text-green-600">Active / Verified</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 py-5 px-8">
              <CardTitle className="text-sm font-bold text-slate-700 tracking-tight uppercase tracking-widest">About Me</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {user.bio}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-8">
          <Card className="border-none shadow-sm rounded-2xl bg-[#1E293B] text-white p-8">
            <h3 className="text-sm font-bold mb-4 tracking-tight">Quick Actions</h3>
            <div className="space-y-3">
              <Button className="w-full justify-start bg-slate-700/50 hover:bg-slate-700 border-none font-bold text-xs py-5 rounded-lg">
                <User2 className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
              <Button className="w-full justify-start bg-slate-700/50 hover:bg-slate-700 border-none font-bold text-xs py-5 rounded-lg">
                <Shield className="mr-2 h-4 w-4" />
                Security Settings
              </Button>
              <Button className="w-full justify-start bg-red-500/10 hover:bg-red-500/20 text-red-400 border-none font-bold text-xs py-5 rounded-lg">
                Sign Out
              </Button>
            </div>
          </Card>

          <Card className="border-none shadow-sm rounded-2xl bg-white p-8">
            <h3 className="text-sm font-bold text-slate-700 mb-4 tracking-tight">System Info</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Version</span>
                <span className="text-xs font-bold text-slate-900">v2.4.0</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Last Login</span>
                <span className="text-xs font-bold text-slate-900">2h ago</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
