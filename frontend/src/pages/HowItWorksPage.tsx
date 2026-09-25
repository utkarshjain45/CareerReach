import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileSpreadsheet,
  Mail,
  ShieldCheck,
  Send,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Link2,
  Paperclip,
  Check,
  Zap,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { MarketingHeader } from '../components/layout/MarketingHeader';
import { MarketingFooter } from '../components/layout/MarketingFooter';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FBFBFA] text-slate-800 flex flex-col selection:bg-brand-500 selection:text-white relative overflow-hidden">
      {/* Ambient background blur orbs */}
      <div className="ambient-glow w-[550px] h-[550px] bg-brand-200/40 -top-40 -left-40" />
      <div className="ambient-glow w-[550px] h-[550px] bg-coral-200/30 -top-20 -right-40" />

      {/* Header */}
      <MarketingHeader activePage="how-it-works" />

      {/* Hero Header */}
      <section className="relative pt-6 sm:pt-10 lg:pt-14 pb-10 sm:pb-14 px-6 text-center max-w-4xl mx-auto z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200/60 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          End-to-End Workflow Guide
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
          From recruiter spreadsheet to{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-600 to-coral-500">
            primary inboxes
          </span>
        </h1>
        <p className="mt-4 font-body text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          A step-by-step walkthrough of how CareerReach automates personalized cold outreach safely, cleanly, and without manual copy-pasting.
        </p>
      </section>

      {/* Detailed 4-Step Deep Dive */}
      <section className="py-8 sm:py-10 px-6 max-w-5xl mx-auto w-full z-10 space-y-10">
        {/* Step 1 */}
        <div className="glass-card p-8 sm:p-10 rounded-3xl bg-white border border-slate-100 flex flex-col md:flex-row gap-8 items-start">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-mono font-black text-xl flex items-center justify-center shrink-0 shadow-card">
            01
          </div>
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                Import Your Recruiter Target List
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-100">
                Excel &amp; CSV
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Upload your spreadsheet of hiring managers, engineering leads, and technical recruiters. CareerReach automatically analyzes your header columns, identifies verified email syntax, and strips duplicate contacts before dispatching.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="font-bold text-slate-800 block mb-0.5">Flexible Column Mapping</span>
                <span className="text-slate-500">Auto-detects First Name, Company, Email, and Title headers.</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="font-bold text-slate-800 block mb-0.5">Syntax Verification</span>
                <span className="text-slate-500">Flags typos and missing domains before attempting any sends.</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="font-bold text-slate-800 block mb-0.5">Duplicate Shield</span>
                <span className="text-slate-500">Prevents embarrassing double emails to the same recruiter.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="glass-card p-8 sm:p-10 rounded-3xl bg-white border border-slate-100 flex flex-col md:flex-row gap-8 items-start">
          <div className="w-12 h-12 rounded-2xl bg-coral-500 text-white font-mono font-black text-xl flex items-center justify-center shrink-0 shadow-card">
            02
          </div>
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                Craft Pitch or Pick from 10+ Role Blueprints
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-coral-50 text-coral-700 text-xs font-bold border border-coral-100">
                10+ Pre-Made Templates
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Don’t want to write from scratch? Browse our curated library of 10+ ready-to-use blueprints for Full Stack, Frontend, Backend Systems, DevOps/SRE, AI/ML, Mobile, and Internships. Add them directly to your account with a single click, and leverage auto-injected <code className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-mono text-xs font-bold">&#123;&#123;github&#125;&#125;</code> and <code className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-mono text-xs font-bold">&#123;&#123;leetcode&#125;&#125;</code> platform links saved in Settings.
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-slate-600 font-semibold">
                <span>Template Tag</span>
                <span>Substituted Output Per Recruiter</span>
              </div>
              <div className="flex items-center justify-between font-mono">
                <span className="text-coral-600 font-bold">&#123;&#123;name&#125;&#125;</span>
                <span className="text-slate-700">"Sarah", "Marcus", "Elena"</span>
              </div>
              <div className="flex items-center justify-between font-mono">
                <span className="text-brand-600 font-bold">&#123;&#123;github&#125;&#125;</span>
                <span className="text-slate-700">"https://github.com/yourhandle"</span>
              </div>
              <div className="flex items-center justify-between font-mono">
                <span className="text-amber-600 font-bold">&#123;&#123;leetcode&#125;&#125;</span>
                <span className="text-slate-700">"https://leetcode.com/u/yourhandle"</span>
              </div>
              <div className="flex items-center justify-between font-mono">
                <span className="text-emerald-600 font-bold">&#123;&#123;attachment&#125;&#125;</span>
                <span className="text-slate-700">Your Resume PDF (Base64 clean attachment)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="glass-card p-8 sm:p-10 rounded-3xl bg-white border border-slate-100 flex flex-col md:flex-row gap-8 items-start">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-mono font-black text-xl flex items-center justify-center shrink-0 shadow-card">
            03
          </div>
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                Connect Directly via Google OAuth 2.0
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                Primary Inbox Security
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Connect your personal Google account with 1-click authorization. Unlike risky third-party bulk email senders or unverified SMTP servers, emails sent with CareerReach originate directly from your authentic personal mailbox with your SPF/DKIM trust.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-emerald-900 font-medium">Bypasses Promotions &amp; Spam tabs straight to Primary</span>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-emerald-900 font-medium">Zero password storage: Google issues encrypted sending tokens</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="glass-card p-8 sm:p-10 rounded-3xl bg-white border border-slate-100 flex flex-col md:flex-row gap-8 items-start">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-mono font-black text-xl flex items-center justify-center shrink-0 shadow-card">
            04
          </div>
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                Launch with Randomized Throttling &amp; Live Controls
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
                Safe Dispatch
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Blasting 50 emails in one second is the fastest way to trigger Google anti-spam flags. CareerReach uses randomized interval jitter (15s to 45s between emails) to perfectly mimic realistic human drafting cadence.
            </p>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <Clock className="w-4 h-4 text-brand-600" />
                <span>Automated 15s–45s gaps respect Google daily sending limits</span>
              </div>
              <span className="text-emerald-600 font-bold hidden sm:inline">Pause &amp; Resume Anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Best Practices Section */}
      <section className="py-8 sm:py-10 px-6 max-w-5xl mx-auto w-full z-10">
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/80 space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <h3 className="text-2xl font-extrabold text-slate-900">
              Tips for Maximizing Recruiter Response Rates
            </h3>
            <p className="text-sm text-slate-500 mt-1.5">
              Battle-tested strategies used by candidates landing offers at top tech companies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h4 className="text-sm font-bold text-slate-900">Keep it under 125 words</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Recruiters scan emails on mobile in under 10 seconds. Get straight to the point: role title, key technical accomplishment, and your attached resume.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-coral-50 text-coral-600 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h4 className="text-sm font-bold text-slate-900">Include Proof of Work</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Use your <code className="bg-coral-50 text-coral-800 px-1 py-0.5 rounded font-mono">&#123;&#123;github&#125;&#125;</code> and <code className="bg-amber-50 text-amber-800 px-1 py-0.5 rounded font-mono">&#123;&#123;leetcode&#125;&#125;</code> tags so engineering leaders can immediately audit your technical quality.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h4 className="text-sm font-bold text-slate-900">Timing Matters</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Launch your campaigns between Tuesday and Thursday from 8:00 AM to 10:30 AM in the recipient's local time zone for highest open rates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* High-Converting CTA Banner */}
      <section className="py-10 sm:py-12 px-6 max-w-5xl mx-auto w-full z-10 text-center">
        <div className="rounded-3xl p-10 sm:p-14 bg-gradient-to-r from-brand-600 via-indigo-600 to-coral-500 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Ready to automate your recruiter outreach?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-white/90 leading-relaxed">
              Create your account in 30 seconds. Connect your Gmail securely and send your first batch today.
            </p>
            <div className="mt-7 flex items-center justify-center">
              <Link to="/register">
                <Button
                  variant="white"
                  size="lg"
                  pill
                  className="font-bold px-8 py-3.5 text-base text-slate-900 shadow-xl"
                  icon={<ArrowRight className="w-4 h-4 text-brand-600" />}
                >
                  Create Free Workspace
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Shared Modern Footer */}
      <MarketingFooter />
    </div>
  );
};
