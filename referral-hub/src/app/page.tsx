import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  ClipboardList,
  FileText,
  Hospital,
  LogIn,
  MessageSquare,
  Network,
  Shield,
  Stethoscope,
  UserCog,
  Users,
} from "lucide-react";

const FEATURES = [
  {
    icon: FileText,
    title: "Digital Referral Lifecycle",
    description:
      "Create structured referrals with clinical data, vitals, ICD-10 diagnoses, attachments, and full status tracking from submission to completion.",
    accent: "bg-blue-500/10 text-blue-600 dark:text-blue-300",
  },
  {
    icon: ClipboardList,
    title: "Liaison Review & Approval",
    description:
      "Referring-hospital liaison officers validate cases, run review checklists, approve or return referrals, and forward them to receiving facilities.",
    accent: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
  },
  {
    icon: MessageSquare,
    title: "Real-Time Clinical Chat",
    description:
      "Secure WebSocket messaging between care teams, with referral-scoped conversations, read tracking, and REST fallback when offline.",
    accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  },
  {
    icon: Bell,
    title: "Notifications & Alerts",
    description:
      "Role-aware in-app notifications and urgent referral alerts so clinicians respond quickly when cases need attention.",
    accent: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
  },
  {
    icon: Stethoscope,
    title: "Triage & Specialist Routing",
    description:
      "Department heads and receiving specialists review incoming cases, manage triage queues, and accept or redirect patients to the right unit.",
    accent: "bg-rose-500/10 text-rose-600 dark:text-rose-300",
  },
  {
    icon: Building2,
    title: "Hospital & Network Operations",
    description:
      "Hospital admins manage departments, staff, sessions, and referrals; system admins govern hospitals, users, and platform configuration.",
    accent: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-300",
  },
];

const ROLE_GROUPS = [
  {
    label: "Referring hospital",
    icon: Hospital,
    roles: [
      {
        name: "Referring Doctor",
        description: "Submits referrals, attaches records, and tracks case progress.",
      },
      {
        name: "Liaison Officer",
        description: "Reviews, approves, rejects, or returns referrals before dispatch.",
      },
    ],
  },
  {
    label: "Receiving hospital",
    icon: Stethoscope,
    roles: [
      {
        name: "Department Head",
        description: "Oversees triage queues and assigns cases within the department.",
      },
      {
        name: "Receiving Specialist",
        description: "Evaluates referrals and accepts, schedules, or redirects patients.",
      },
      {
        name: "Receptionist",
        description: "Tracks expected arrivals and records patient check-in status.",
      },
    ],
  },
  {
    label: "Administration & oversight",
    icon: UserCog,
    roles: [
      {
        name: "Hospital Admin",
        description: "Manages staff, departments, referrals hub, activity logs, and hospital profile.",
      },
      {
        name: "System Super Admin",
        description: "Governs hospitals, users, and platform-wide settings across the network.",
      },
      {
        name: "MOH Analyst",
        description: "Views ministry-level analytics and referral trends for policy and planning.",
      },
    ],
  },
];

const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#purpose", label: "Purpose" },
  { href: "#solution", label: "Solution" },
  { href: "#features", label: "Features" },
  { href: "#roles", label: "Roles" },
];

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-lg text-muted-foreground">{description}</p>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 pt-4 backdrop-blur-md">
        <nav className="container mx-auto grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 pb-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">Referral Hub</span>
          </Link>
          <div className="flex items-center justify-center gap-5 overflow-x-auto sm:gap-6 lg:gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="shrink-0 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <Link
            href="/login"
            className="group relative inline-flex shrink-0 items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-primary via-primary to-primary/80 px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/30 ring-1 ring-primary/20 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-primary/40"
          >
            <LogIn className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
            <span className="relative z-10">Login</span>
            <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            <span className="absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto grid items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div className="space-y-6">
            <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Hospital Referral Management Platform
            </span>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground lg:text-5xl xl:text-6xl">
              Coordinate patient referrals across{" "}
              <span className="text-primary">Ethiopian hospitals</span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Referral Hub connects referring and receiving facilities on one
              secure platform — replacing fragmented phone calls and paper
              handoffs with structured digital workflows.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-lg ring-1 ring-border/60">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Network className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Referral in progress
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Cardiology · Dire Dawa → Addis Ababa
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                Under review
              </span>
            </div>
            <div className="space-y-3 rounded-xl bg-muted/40 p-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Patient</span>
                <span className="font-medium text-foreground">Abel K. Mos</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Diagnosis</span>
                <span className="text-right font-medium text-foreground">
                  A001 · Cholera (ICD-10)
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Condition</span>
                <span className="font-medium text-foreground">Stable</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Workflow</span>
                <span className="font-medium text-foreground">
                  Liaison → Specialist → Reception
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="About the project"
            title="A national referral coordination system for healthcare"
            description="Referral Hub is a web platform built for Ethiopia's hospital referral ecosystem. It gives clinicians, administrators, and ministry analysts a shared workspace to move patients between facilities with clarity, accountability, and auditability."
          />
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
            {[
              {
                icon: Hospital,
                title: "Multi-hospital network",
                text: "Supports referring hospitals, receiving hospitals, and networked partners under one referral pipeline.",
              },
              {
                icon: Shield,
                title: "Role-based access",
                text: "Every user sees only the tools and data their clinical or administrative role requires.",
              },
              {
                icon: BarChart3,
                title: "Ministry visibility",
                text: "Aggregated analytics help the Ministry of Health monitor referral patterns and system performance.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Purpose & Solution */}
      <section
        id="purpose"
        className="border-y border-border bg-muted/30 py-16 lg:py-24"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div id="solution" className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                The problem we solve
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Referrals should not depend on phone calls and lost paperwork
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Today, inter-hospital transfers often lack a single source of
                truth. Clinical details get delayed, liaison approvals are hard
                to track, receiving teams cannot triage effectively, and
                administrators have limited visibility into bottlenecks.
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {[
                  "Delayed handoffs between referring and receiving clinicians",
                  "No unified audit trail for approvals and status changes",
                  "Poor visibility into department capacity and case urgency",
                  "Fragmented communication during active referral cases",
                ].map((point) => (
                  <li key={point} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-5 rounded-2xl border border-border bg-card p-8 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Our purpose
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                One platform for the entire referral journey
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Referral Hub exists to make every transfer traceable from the
                moment a referring doctor submits a case until the patient is
                received, treated, or redirected — with the right people
                involved at each step.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { step: "1", label: "Submit", detail: "Structured referral with clinical data" },
                  { step: "2", label: "Review", detail: "Liaison validation and approval" },
                  { step: "3", label: "Route", detail: "Triage and specialist assignment" },
                  { step: "4", label: "Receive", detail: "Arrival tracking and case closure" },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="rounded-lg border border-border/60 bg-muted/30 p-4"
                  >
                    <p className="text-xs font-bold text-primary">Step {item.step}</p>
                    <p className="mt-1 font-semibold text-foreground">{item.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Platform capabilities"
            title="Six core features that power Referral Hub"
            description="Each module maps to a real workflow in the system — from referral creation and liaison review to real-time chat and hospital administration."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div
                  className={`mb-4 flex h-11 w-11 items-center justify-center rounded-lg ${feature.accent}`}
                >
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section
        id="roles"
        className="border-t border-border bg-muted/20 py-16 lg:py-24"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Who uses the platform"
            title="Role-based workspaces for every stakeholder"
            description="Referral Hub serves the full referral chain — from the doctor who initiates a transfer to the ministry analyst who studies national trends."
          />
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {ROLE_GROUPS.map((group) => (
              <div
                key={group.label}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <group.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {group.label}
                  </h3>
                </div>
                <ul className="space-y-4">
                  {group.roles.map((role) => (
                    <li
                      key={role.name}
                      className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3"
                    >
                      <p className="text-sm font-semibold text-foreground">
                        {role.name}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {role.description}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 text-primary-foreground lg:py-20">
        <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
          <Users className="mx-auto mb-4 h-10 w-10 opacity-90" />
          <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">
            Ready to streamline your hospital referrals?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/85">
            Sign in with your assigned role to access dashboards, referral
            workflows, clinical messaging, and administrative tools.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-border bg-card py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <span className="font-bold text-foreground">Referral Hub</span>
              </div>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                A hospital referral management platform for Ethiopia — built to
                improve coordination, transparency, and patient outcomes across
                the care continuum.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/login"
                className="font-medium text-primary hover:text-primary/80"
              >
                Login
              </Link>
            </div>
          </div>
          <p className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Referral Hub. Ministry of Health referral
            coordination project.
          </p>
        </div>
      </footer>
    </div>
  );
}
