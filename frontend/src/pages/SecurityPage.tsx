import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Cpu,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  Key,
  Database,
  EyeOff,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { MarketingHeader } from '../components/layout/MarketingHeader';
import { MarketingFooter } from '../components/layout/MarketingFooter';

export const SecurityPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FBFBFA] text-slate-800 flex flex-col selection:bg-brand-500 selection:text-white relative overflow-hidden">
      {/* Ambient background blur orbs */}
      <div className="ambient-glow w-[550px] h-[550px] bg-emerald-200/30 -top-40 -left-40" />
      <div className="ambient-glow w-[550px] h-[550px] bg-brand-200/40 -top-20 -right-40" />

      {/* Header */}
      <MarketingHeader activePage="security" />

      {/* Hero Header */}
      <section className="relative pt-6 sm:pt-10 lg:pt-14 pb-10 sm:pb-12 px-6 text-center max-w-4xl mx-auto z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/60 mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Security &amp; Privacy
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
          Your Google credentials{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-brand-600">
            stay in your hands
          </span>
        </h1>
        <p className="mt-4 font-body text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          CareerReach is engineered with isolation, cryptographic safeguards, and strict Google OAuth 2.0 protocols. Your personal mailbox password is never requested, stored, or accessible.
        </p>
      </section>

      {/* 3 Pillar Security Cards */}
      <section className="py-8 sm:py-10 px-6 max-w-6xl mx-auto w-full z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mb-4 shadow-card">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Direct Google Consent</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                You authenticate directly on Google's official accounts.google.com consent screen. We only receive a restricted sending access token.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Official OAuth 2.0 flow
            </div>
          </div>

          <div className="glass-card p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center mb-4 shadow-card">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">AES-256 Token Encryption</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Session tokens are encrypted using AES-256-GCM at rest. Tokens are decrypted only transiently in memory when sending sequences you trigger.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-brand-700">
              <CheckCircle2 className="w-4 h-4 text-brand-600" /> Encrypted database records
            </div>
          </div>

          <div className="glass-card p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center mb-4 shadow-card">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Instant Token Revocation</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Disconnect your Gmail account at any time with a single click in Settings. Tokens are permanently purged from the database immediately.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-rose-700">
              <CheckCircle2 className="w-4 h-4 text-rose-600" /> Complete user control
            </div>
          </div>
        </div>
      </section>

      {/* Transparency & Commitments */}
      <section className="py-8 sm:py-10 px-6 max-w-5xl mx-auto w-full z-10">
        <div className="glass-panel rounded-3xl p-7 sm:p-10 shadow-card border border-white/80 space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 text-center">Our Privacy Principles</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-white border border-slate-100 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <EyeOff className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block mb-1">Zero Email Reading</span>
                <span className="text-slate-500 leading-relaxed">
                  We request minimal Gmail sending scopes. We never read, index, or store incoming personal emails or inbox history.
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-100 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block mb-1">No Contact Sharing</span>
                <span className="text-slate-500 leading-relaxed">
                  Your uploaded recruiter lists and spreadsheets are private to your workspace account. We never resell or cross-reference contacts.
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-100 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block mb-1">Password Isolation</span>
                <span className="text-slate-500 leading-relaxed">
                  We never handle your Google account password. Google OAuth uses secure token exchange exclusively.
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-100 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block mb-1">Rate Limit Guard</span>
                <span className="text-slate-500 leading-relaxed">
                  Outreach sequences dispatch with randomized delays to respect Google's acceptable usage policies and protect your mailbox reputation.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-10 sm:py-12 px-6 max-w-6xl mx-auto w-full z-10 text-center">
        <div className="rounded-3xl p-10 sm:p-14 bg-gradient-to-r from-brand-600 via-indigo-600 to-coral-500 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Ready to reach decision makers safely?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-white/90 leading-relaxed">
              Create your account in 30 seconds. Connect your Gmail securely and launch your first batch today.
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

      {/* Footer */}
      <MarketingFooter />
    </div>
  );
};
