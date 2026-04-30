'use client';
import { useGetStaffByIdQuery } from "@/features/hospitalAdmin/hospitalAdminApi";
import { Loader2, ArrowLeft, Mail, Building2, Shield, UserCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function StaffDetailProfile({ staffId }: { staffId: string }) {
  const { data: staff, isLoading, error } = useGetStaffByIdQuery(staffId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-slate-500 font-medium">Loading staff details...</p>
      </div>
    );
  }

  if (error || !staff) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-red-500 font-medium">Failed to load staff details or staff not found.</p>
        <Link href="/hospital-admin/staff-management" className="mt-4">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Staff Management
          </Button>
        </Link>
      </div>
    );
  }

  const initials = `${staff.first_name?.[0] || ""}${staff.last_name?.[0] || ""}`.toUpperCase();
  const fullName = `${staff.first_name} ${staff.last_name}`;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/hospital-admin/staff-management">
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-slate-200">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Staff Profile</h1>
          <p className="text-sm text-slate-500">Detailed information about the staff member</p>
        </div>
      </div>

      <Card className="relative overflow-hidden rounded-3xl border-none shadow-xl bg-white">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600 to-indigo-600" />
        <CardContent className="relative pt-16 flex flex-col md:flex-row items-center md:items-end gap-6 px-8 pb-8">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg rounded-2xl bg-white">
              <AvatarFallback className="bg-slate-100 text-blue-600 text-3xl font-bold rounded-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{fullName}</h2>
              <Badge className="bg-blue-50 text-blue-600 border-none px-3 font-bold text-[10px] tracking-wider uppercase">
                {staff.role}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <UserCircle2 className="h-4 w-4 text-blue-500" />
                <span>ID: {staff.id}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-blue-500" />
                <span>{staff.department_id || "Unassigned Department"}</span>
              </div>
            </div>
          </div>
          
          <div className="shrink-0 flex items-center justify-center">
             <Badge className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg border-none ${
                staff.is_active 
                  ? "bg-green-100 text-green-700" 
                  : "bg-slate-100 text-slate-600"
              }`}>
                {staff.is_active ? 'Active' : 'Inactive'}
             </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-100 py-5 px-8">
            <CardTitle className="text-sm font-bold text-slate-700 tracking-tight uppercase tracking-widest">
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                <p className="text-sm font-bold text-slate-900">{staff.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-100 py-5 px-8">
            <CardTitle className="text-sm font-bold text-slate-700 tracking-tight uppercase tracking-widest">
              Account & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Assigned Role</p>
                <p className="text-sm font-bold text-slate-900 capitalize">{staff.role}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Department</p>
                <p className="text-sm font-bold text-slate-900">{staff.department_id || "None"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
