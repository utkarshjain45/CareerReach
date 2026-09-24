import React from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import {
  Mail,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  Sliders,
  CheckCircle2,
  BarChart3,
  Layers,
  Sparkles,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../components/common/Button';

export const LandingPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  // If redirected from Google OAuth to root domain, forward client-side to /settings
  if (searchParams.get('code') || searchParams.get('error')) {
    return <Navigate to={`/settings${window.location.search}`} replace />;
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-brand-600 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-xs group-hover:bg-brand-700 transition-colors">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                Career<span className="text-brand-600">Reach</span>
              </span>
              <span className="text-[10px] font-medium text-slate-400 hidden sm:block">
                Smarter outreach. Better opportunities.
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-slate-900 transition-colors">
              Features
            </a>
            <a href="#security" className="hover:text-slate-900 transition-colors">
              Security &amp; Privacy
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          {/* Tagline pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Smarter outreach. Better opportunities.</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.12]">
            Turn job outreach{' '}
            <span className="text-brand-600">
              into a workflow.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            CareerReach empowers you to import recruiter contacts from spreadsheets, craft personalized
            cold-email templates, connect your Gmail securely via OAuth, and launch controlled outreach sequences.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link to="/register">
              <Button size="lg" variant="primary" icon={<ArrowRight className="w-4 h-4" />}>
                Get Started
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button size="lg" variant="outline">
                See How It Works
              </Button>
            </a>
          </div>

          {/* Trust pills */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Official Gmail OAuth 2.0
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Zero Password Retention
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Pre-Flight Duplicate Protection
            </span>
          </div>

          {/* Tasteful Product/Dashboard Visual */}
          <div className="mt-14 max-w-5xl mx-auto rounded-xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-sm text-left">
            {/* Window header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-300" />
                <div className="w-3 h-3 rounded-full bg-slate-300" />
                <div className="w-3 h-3 rounded-full bg-slate-300" />
                <span className="text-xs font-mono text-slate-400 ml-2">careerreach.app/campaigns/overview</span>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                Connected: alex@company.com
              </span>
            </div>

            {/* Visual content: Dashboard layout mockup */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Campaign status preview card */}
              <div className="md:col-span-2 p-5 bg-slate-50/70 rounded-lg border border-slate-200/70 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Campaign</span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">Software Engineering Outreach — Q3</h4>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Running
                  </span>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
                    <span>Dispatch progress: 79 of 82 sent</span>
                    <span className="font-semibold text-emerald-600">96.3% success</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-brand-600 rounded-full w-[96%]" />
                  </div>
                </div>

                {/* Email preview snippet */}
                <div className="p-3.5 bg-white rounded-lg border border-slate-200/80 text-xs text-slate-700 font-mono space-y-1.5">
                  <div className="text-slate-500 font-sans text-[11px] pb-1 border-b border-slate-100 flex items-center justify-between">
                    <span>Subject: <strong className="text-slate-800">Engineering Manager opportunities at TechCorp</strong></span>
                    <span className="text-brand-600 font-mono">alex.morgan@techcorp.com</span>
                  </div>
                  <p className="font-sans text-xs text-slate-700 pt-1 leading-relaxed">
                    Hello <span className="bg-brand-50 text-brand-700 px-1 py-0.5 rounded font-mono text-[11px]">Alex</span>,
                    I noticed your work leading the platform engineering team at <span className="bg-brand-50 text-brand-700 px-1 py-0.5 rounded font-mono text-[11px]">TechCorp</span>. I wanted to reach out regarding high-impact senior engineering roles...
                  </p>
                </div>
              </div>

              {/* Side metrics panel */}
              <div className="p-5 bg-white rounded-lg border border-slate-200/70 flex flex-col justify-between space-y-3">
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Deliverability Metrics</span>
                  
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-[11px] text-slate-500 block">Total Recruiter Contacts</span>
                    <span className="text-xl font-bold text-slate-900">142</span>
                  </div>

                  <div className="p-3 bg-emerald-50/60 rounded-lg">
                    <span className="text-[11px] text-emerald-700 block">Delivered Successfully</span>
                    <span className="text-xl font-bold text-emerald-700">128</span>
                  </div>

                  <div className="p-3 bg-brand-50/60 rounded-lg">
                    <span className="text-[11px] text-brand-700 block">Google API Rate Limits</span>
                    <span className="text-xs font-medium text-brand-800">Controlled (8s interval)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  AES-256 token encryption at rest
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50/60 border-t border-slate-200/60 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-2">
              Workflow
            </h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              From recruiter list to high-deliverability outreach in 4 steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 01 */}
            <div className="p-6 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-2xl font-extrabold text-brand-600/30 block mb-3 font-mono">
                  01
                </span>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Import contacts
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Drop your Excel (<code className="text-brand-600">.xlsx</code>, <code className="text-brand-600">.xls</code>) or CSV spreadsheet. Map columns interactively with a 10-row data preview.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] font-medium text-slate-400">
                Automatic duplicate &amp; syntax audit
              </div>
            </div>

            {/* Step 02 */}
            <div className="p-6 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-2xl font-extrabold text-brand-600/30 block mb-3 font-mono">
                  02
                </span>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Personalize your message
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Craft dynamic email templates with tags like <code className="text-brand-600">&#123;&#123;name&#125;&#125;</code> and <code className="text-brand-600">&#123;&#123;company&#125;&#125;</code>. Real-time linter warns of unknown tags.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] font-medium text-slate-400">
                Live recipient preview mode
              </div>
            </div>

            {/* Step 03 */}
            <div className="p-6 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-2xl font-extrabold text-brand-600/30 block mb-3 font-mono">
                  03
                </span>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Connect Gmail
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Authorize through Google&apos;s official OAuth 2.0 flow. Passwords are never requested, stored, or visible to the application.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] font-medium text-slate-400">
                Scoped strictly to email dispatch
              </div>
            </div>

            {/* Step 04 */}
            <div className="p-6 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-2xl font-extrabold text-brand-600/30 block mb-3 font-mono">
                  04
                </span>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Launch your campaign
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Review pre-flight validation, safely skip past recipients, and dispatch with controlled rate throttling to ensure inbox delivery.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] font-medium text-slate-400">
                Pause, resume, or abort anytime
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-white border-t border-slate-100 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-2">
              Features
            </h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Everything you need for serious recruitment outreach
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-xl border border-slate-200/80 bg-white shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Excel &amp; CSV Contact Import</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Smart parser handles .xlsx and .csv files. Map varied columns (Full Name, Company, Title, Email) with a 10-row preview and dry-run validation.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-xl border border-slate-200/80 bg-white shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Personalized Templates</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Compose custom outreach templates with dynamic placeholders. Built-in linter warns against misspelled tags before emails are queued.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-xl border border-slate-200/80 bg-white shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Gmail Integration</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connect your personal Gmail or Google Workspace account via Google OAuth 2.0. Send messages authentically from your own inbox.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-xl border border-slate-200/80 bg-white shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Campaign Tracking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Monitor every campaign in real time. Inspect recipient logs, delivery statuses, error codes, and live dispatch counters.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-xl border border-slate-200/80 bg-white shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Sending Controls &amp; Safety</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Configure customizable dispatch intervals (2s–15s), pause/resume execution, avoid duplicate recipients, and respect opt-outs.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-xl border border-slate-200/80 bg-white shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Analytics &amp; Audit Trail</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Track global deliverability success rates, failed emails with error reasons, and a chronological workspace activity audit log.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section id="security" className="py-16 bg-slate-900 text-white scroll-mt-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-emerald-400 text-xs font-semibold mb-3 border border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Authentic Security Architecture</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Your Google credentials stay in your hands.
            </h2>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              We designed CareerReach so you never have to give us or anyone else your Gmail password.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-5 rounded-lg bg-slate-800/80 border border-slate-700 text-left">
              <div className="w-8 h-8 rounded-lg bg-slate-700 text-emerald-400 flex items-center justify-center mb-3">
                <Lock className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5">Official Google OAuth 2.0</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                You authorize directly on Google&apos;s login domain. Passwords are never requested or handled by CareerReach.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-slate-800/80 border border-slate-700 text-left">
              <div className="w-8 h-8 rounded-lg bg-slate-700 text-emerald-400 flex items-center justify-center mb-3">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5">AES-256 Token Encryption</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                OAuth access tokens are encrypted at rest using industry-standard AES-256-GCM. Tokens are never exposed client-side.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-slate-800/80 border border-slate-700 text-left">
              <div className="w-8 h-8 rounded-lg bg-slate-700 text-emerald-400 flex items-center justify-center mb-3">
                <RefreshCw className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5">One-Click Disconnect</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Disconnect your Gmail account at any time with a single click. All associated session tokens are immediately deleted.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white border-t border-slate-100 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Ready to streamline your cold recruitment outreach?
          </h2>
          <p className="mt-3 text-base text-slate-600 max-w-xl mx-auto">
            Get started today with CareerReach. Import contacts, craft personalized templates, and launch your first campaign.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" variant="primary" icon={<ArrowRight className="w-4 h-4" />}>
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-slate-50 border-t border-slate-200/80 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-brand-600 text-white flex items-center justify-center">
              <Mail className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-800">CareerReach</span>
            <span className="text-slate-400">&bull; Smarter outreach. Better opportunities.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-slate-900 transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-slate-900 transition-colors">Register</Link>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</a>
            <a href="#security" className="hover:text-slate-900 transition-colors">Security</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-4 pt-4 border-t border-slate-200/50 text-center text-slate-400 text-[11px]">
          © 2026 CareerReach. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
