import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Database,
  FileText,
  MessageSquare,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navigation */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">
                ReferralHub
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="#features"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </Link>
              <Link
                href="#about"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                How it Works
              </Link>
              <Link
                href="#benefits"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Benefits
              </Link>
              <Link
                href="#contact"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact Us
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Login
              </Link>
              <Link
                href="/login"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full">
                Healthcare Data Integration
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight">
              Seamless Patient Transitions,{" "}
              <span className="text-primary">Smarter Healthcare</span>{" "}
              Coordination
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Connecting patients to better care. Streamline referrals with
              real-time intelligence to ensure patients receive the right care
              at the right time.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/login"
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
              >
                Get Started Now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button className="border border-border px-6 py-3 rounded-lg font-medium hover:bg-accent transition-colors inline-flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Watch a Demo
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary/20 to-accent/20 p-8">
              <div className="bg-card rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Patient Referral
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Real-time tracking
                      </p>
                    </div>
                  </div>
                  <div className="bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-xs font-medium">
                    Active
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className="text-foreground font-medium">
                      In Transit
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Priority</span>
                    <span className="text-orange-600 dark:text-orange-400 font-medium">
                      High
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">ETA</span>
                    <span className="text-foreground font-medium">
                      15 mins
                    </span>
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">
                      Bed availability: 12 units
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="bg-muted/30 py-16 lg:py-24 border-y border-border"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Optimized for Better Outcomes
            </h2>
            <p className="text-lg text-muted-foreground">
              Our platform optimizes healthcare delivery, improving patient
              outcomes and operational efficiency across the referral network.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-border">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Faster Referrals
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Accelerate patient transfers with an efficient, streamlined
                referral process that reduces wait times.
              </p>
              <Link
                href="#"
                className="text-sm text-primary font-medium inline-flex items-center gap-1 hover:gap-2 transition-all"
              >
                See Impact <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-border">
              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Better Patient Outcomes
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Ensure timely, coordinated care with real-time data and
                intelligent routing for improved patient outcomes.
              </p>
              <Link
                href="#"
                className="text-sm text-primary font-medium inline-flex items-center gap-1 hover:gap-2 transition-all"
              >
                Discover Excellence <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-border">
              <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Reduced Hassle
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Minimize administrative burden with automated workflows and
                digital documentation, freeing up time for patient care.
              </p>
              <Link
                href="#"
                className="text-sm text-primary font-medium inline-flex items-center gap-1 hover:gap-2 transition-all"
              >
                Simplify Workflow <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-primary-foreground">
              <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Data-Driven Triage</h3>
              <p className="text-sm opacity-90 mb-4">
                Use AI-powered triage to prioritize cases, ensuring patients
                receive the most appropriate care based on urgency and
                complexity.
              </p>
              <Link
                href="#"
                className="text-sm font-medium inline-flex items-center gap-1 hover:gap-2 transition-all text-white"
              >
                Explore Intelligence <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Infrastructure Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary/10 to-accent/10 p-8">
                <div className="bg-card/80 backdrop-blur-sm rounded-lg p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary/5 rounded-lg p-4">
                      <BarChart3 className="h-8 w-8 text-primary mb-2" />
                      <div className="text-2xl font-bold text-foreground">
                        98%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Uptime
                      </div>
                    </div>
                    <div className="bg-green-500/5 rounded-lg p-4">
                      <Zap className="h-8 w-8 text-green-600 dark:text-green-400 mb-2" />
                      <div className="text-2xl font-bold text-foreground">
                        &lt;2s
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Response
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Database className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">
                          Secure Data Storage
                        </div>
                        <div className="text-xs text-muted-foreground">
                          HIPAA Compliant
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">
                          End-to-End Encryption
                        </div>
                        <div className="text-xs text-muted-foreground">
                          256-bit AES
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 order-1 lg:order-2">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                Core Infrastructure for Modern Hospitals
              </h2>
              <p className="text-lg text-muted-foreground">
                Built on robust, secure, and scalable architecture to meet the
                demands of the healthcare industry.
              </p>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Database className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      Real-time Data Centralization
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Aggregate patient data from multiple sources into a single
                      platform, enabling comprehensive care coordination.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      Intelligent Triage Framework
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      AI-powered decision support to prioritize referrals,
                      optimize resource allocation, and improve patient flow.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      Secure Document Exchange
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Encrypted, compliant sharing of medical records and
                      referral documents between healthcare providers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-primary-foreground mb-2">
                30%
              </div>
              <div className="text-sm text-primary-foreground/80">
                Faster Referral Process
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-primary-foreground mb-2">
                15+
              </div>
              <div className="text-sm text-primary-foreground/80">
                Partner Hospitals
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-primary-foreground mb-2">
                2.4k
              </div>
              <div className="text-sm text-primary-foreground/80">
                Patients Transferred
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-primary-foreground mb-2">
                100%
              </div>
              <div className="text-sm text-primary-foreground/80">
                Secure & Compliant
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-accent/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Ready to modernize your referral network?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join 100+ healthcare facilities using ReferralHub
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/login"
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
              >
                Request a Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-primary" />
                <span className="font-bold text-foreground">ReferralHub</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Connecting healthcare providers for better patient outcomes.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Security
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 ReferralHub. All rights reserved. Built with care for
              healthcare.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
