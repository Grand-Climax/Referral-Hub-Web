import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LogIn,
  FileText,
  ClipboardList,
  User,
  BarChart3,
  Shield,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-16">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold">Referral Hub System</h1>
          <p className="text-lg text-muted-foreground">
            Patient referral management for medical ministry
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Login */}
          <Link href="/login">
            <div className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <LogIn className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Login</h2>
              </div>
              <p className="text-muted-foreground">
                Sign in to access the referral system
              </p>
            </div>
          </Link>

          {/* Referral Form */}
          <Link href="/doctor">
            <div className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">New Referral</h2>
              </div>
              <p className="text-muted-foreground">
                Create a new patient referral
              </p>
            </div>
          </Link>

          {/* Triage Board */}
          <Link href="/triage">
            <div className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <ClipboardList className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Triage Board</h2>
              </div>
              <p className="text-muted-foreground">
                Manage and track referral workflow
              </p>
            </div>
          </Link>

          {/* Liaison Dashboard */}
          <Link href="/liaison">
            <div className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Liaison Dashboard</h2>
              </div>
              <p className="text-muted-foreground">
                View assigned referrals and appointments
              </p>
            </div>
          </Link>

          {/* Analytics */}
          <Link href="/analytics">
            <div className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Analytics</h2>
              </div>
              <p className="text-muted-foreground">
                View ministry performance metrics
              </p>
            </div>
          </Link>

          {/* Hospital Admin */}
          <Link href="/refering-admin">
            <div className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Hospital Admin</h2>
              </div>
              <p className="text-muted-foreground">
                System status, user management, and administrative controls
              </p>
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Built with Next.js, TypeScript, and ShadCN UI
          </p>
        </div>
      </main>
    </div>
  );
}
