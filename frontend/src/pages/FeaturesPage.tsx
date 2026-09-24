import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileSpreadsheet,
  Mail,
  Paperclip,
  Sliders,
  CheckCircle2,
  Check,
  ChevronRight,
  Code2,
  Link2,
  Globe,
  ExternalLink,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { MarketingHeader } from '../components/layout/MarketingHeader';
import { MarketingFooter } from '../components/layout/MarketingFooter';

export const FeaturesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FBFBFA] text-slate-800 flex flex-col selection:bg-brand-500 selection:text-white relative overflow-hidden">
      {/* Ambient background blur orbs */}
      <div className="ambient-glow w-[550px] h-[550px] bg-brand-200/40 -top-40 -left-40" />
      <div className="ambient-glow w-[550px] h-[550px] bg-coral-200/30 -top-20 -right-40" />

      {/* Header */}
      <MarketingHeader activePage="features" />

      {/* Hero Header */}
      <section className="relative pt-6 sm:pt-10 lg:pt-14 pb-10 sm:pb-12 px-6 text-center max-w-4xl mx-auto z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200/60 mb-3">
          <Zap className="w-3.5 h-3.5" />
          Feature Deep Dive
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
          Built from the ground up for{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-600 to-coral-500">
            modern job seekers
          </span>
        </h1>
        <p className="mt-4 font-body text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          From spreadsheet parsing to automated link variables and native Gmail dispatching, explore every tool built to help you land interviews faster.
        </p>
      </section>

      {/* Bento Grid: Core Features */}
      <section className="py-8 sm:py-10 px-6 max-w-6xl mx-auto w-full z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Double Wide - Smart Spreadsheets */}
          <div className="md:col-span-2 glass-card p-7 sm:p-8 flex flex-col justify-between bg-gradient-to-br from-white via-white to-brand-50/40">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-brand-500 text-white flex items-center justify-center mb-5 shadow-card">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Instant Excel &amp; CSV Contact Ingestion
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed max-w-xl mb-6">
                Upload recruiter lists from Excel or CSV files. Automatically detects column headers, verifies email syntax, and filters duplicates with an interactive 10-row preview.
              </p>

              <div className="p-3.5 bg-white/90 rounded-xl border border-slate-100 shadow-xs flex items-center justify-between text-xs font-mono">
                <span className="text-slate-700 font-semibold">sarah@stripe.com</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-sans font-bold">
                  Verified Contact
                </span>
                <span className="text-slate-400 hidden sm:inline">Engineering Lead</span>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-brand-600">
              <span>Automatic duplicate deduplication</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 2: Gmail Native Integration */}
          <div className="glass-card p-7 sm:p-8 flex flex-col justify-between bg-gradient-to-br from-white via-white to-coral-50/40">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-coral-500 text-white flex items-center justify-center mb-5 shadow-card">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Direct Gmail OAuth 2.0
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-5">
                No app passwords or SMTP setups. Authorize securely through Google to send directly from your personal mailbox with your verified profile.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100/80 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> High deliverability
            </div>
          </div>

          {/* Card 3: Dynamic Template Studio with GitHub & LeetCode */}
          <div className="glass-card p-7 sm:p-8 flex flex-col justify-between bg-gradient-to-br from-white via-white to-amber-50/40">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center mb-5 shadow-card">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                GitHub &amp; LeetCode Link Variables
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Save your GitHub, LeetCode, portfolio, and other platform URLs once in Settings. They populate automatically with <code className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-mono text-xs font-bold">&#123;&#123;github&#125;&#125;</code> and <code className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-mono text-xs font-bold">&#123;&#123;leetcode&#125;&#125;</code> variables so you never have to copy-paste URLs every time.
              </p>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/70">
                  <span className="text-slate-600">&#123;&#123;github&#125;&#125;</span>
                  <span className="text-brand-600 font-bold">github.com/...</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/70">
                  <span className="text-slate-600">&#123;&#123;leetcode&#125;&#125;</span>
                  <span className="text-amber-600 font-bold">leetcode.com/...</span>
                </div>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100/80 text-xs font-semibold text-amber-700 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-amber-600" /> Never copy-paste profile links again
            </div>
          </div>

          {/* Card 4: Resume Cloud Vault */}
          <div className="glass-card p-7 sm:p-8 flex flex-col justify-between bg-gradient-to-br from-white via-white to-emerald-50/40">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mb-5 shadow-card">
                <Paperclip className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Resume PDF Attachment
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-5">
                Store your resume securely in cloud storage. CareerReach automatically encodes and attaches your PDF cleanly to each outgoing email draft.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100/80 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" /> PDF attached seamlessly
            </div>
          </div>

          {/* Card 5: Sending Controls & Safety */}
          <div className="glass-card p-7 sm:p-8 flex flex-col justify-between bg-gradient-to-br from-white via-white to-violet-50/40">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center mb-5 shadow-card">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Live Queue Controls
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-5">
                Full control over your active sequences. Pause midway, inspect recipient status codes, resume smoothly, or stop anytime without ghost sends.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100/80 text-xs font-semibold text-slate-500">
              Real-time progress logging
            </div>
          </div>
        </div>
      </section>

      {/* Dedicated Platform Links & Variables Feature Section */}
      <section className="py-10 sm:py-12 px-6 max-w-6xl mx-auto w-full z-10">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 shadow-card border border-white/80 relative overflow-hidden bg-gradient-to-br from-white via-white to-amber-50/40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200/60 mb-4">
                <Link2 className="w-3.5 h-3.5" />
                Zero Copy-Pasting Required
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Attach GitHub, LeetCode &amp; Platform Links With Variables
              </h3>
              <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                Tired of opening extra tabs to copy-paste your GitHub, LeetCode profile, or live portfolio link into every single email you write?
              </p>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Configure your links once in Settings. In your templates, simply use dynamic variables like <code className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-mono text-xs font-bold">&#123;&#123;github&#125;&#125;</code>, <code className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-mono text-xs font-bold">&#123;&#123;leetcode&#125;&#125;</code>, and <code className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-mono text-xs font-bold">&#123;&#123;portfolio&#125;&#125;</code>. CareerReach auto-substitutes your live links directly into each email.
              </p>

              <div className="mt-6 space-y-2.5">
                {[
                  'Save GitHub, LeetCode, Codeforces, HackerRank, and Portfolio URLs once',
                  'Insert with variables as clean hyperlinks or formatted URLs with 1 click',
                  'Zero copy-pasting: eliminates the tedious repetitive URL copying per recruiter',
                  'Update links once in Settings to instantly sync across all future campaigns',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual interactive representation */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-soft border border-slate-100 space-y-3.5">
                <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2.5">
                  <span className="font-bold text-slate-800">Your Saved Profile Links:</span>
                  <span className="text-[11px] text-brand-600 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-500" /> Configured in Settings
                  </span>
                </div>
                
                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                    <span className="text-slate-700 flex items-center gap-2">
                      <Code2 className="w-3.5 h-3.5 text-brand-600" /> GitHub:
                    </span>
                    <span className="text-brand-600 font-bold">&#123;&#123;github&#125;&#125;</span>
                    <span className="text-slate-400 text-[11px] hidden sm:inline">github.com/username</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60 flex items-center justify-between">
                    <span className="text-slate-700 flex items-center gap-2">
                      <Link2 className="w-3.5 h-3.5 text-amber-600" /> LeetCode:
                    </span>
                    <span className="text-amber-700 font-bold">&#123;&#123;leetcode&#125;&#125;</span>
                    <span className="text-slate-400 text-[11px] hidden sm:inline">leetcode.com/u/username</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-coral-50/60 border border-coral-200/60 flex items-center justify-between">
                    <span className="text-slate-700 flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-coral-600" /> Portfolio:
                    </span>
                    <span className="text-coral-700 font-bold">&#123;&#123;portfolio&#125;&#125;</span>
                    <span className="text-slate-400 text-[11px] hidden sm:inline">yourportfolio.dev</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-200/60 flex items-center justify-between">
                    <span className="text-slate-700 flex items-center gap-2">
                      <ExternalLink className="w-3.5 h-3.5 text-indigo-600" /> Custom Platform:
                    </span>
                    <span className="text-indigo-700 font-bold">&#123;&#123;codeforces&#125;&#125;</span>
                    <span className="text-slate-400 text-[11px] hidden sm:inline">Kaggle, LinkedIn, etc.</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <Check className="w-3.5 h-3.5" /> 100% automated substitution
                  </span>
                  <span className="font-medium text-slate-600">No copying every time</span>
                </div>
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
              Ready to start hearing back from companies?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-white/90 leading-relaxed">
              Create your account in 30 seconds. No credit card required. Import your contacts and send your first batch today.
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
