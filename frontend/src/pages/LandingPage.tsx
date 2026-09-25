import React, { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import {
  Mail,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  Sliders,
  CheckCircle2,
  Sparkles,
  Lock,
  RefreshCw,
  Send,
  Paperclip,
  Check,
  ChevronRight,
  Zap,
  Clock,
  Cpu,
  Link2,
  Code2,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { MarketingHeader } from '../components/layout/MarketingHeader';
import { MarketingFooter } from '../components/layout/MarketingFooter';

export const LandingPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Interactive Hero Simulator States
  const [selectedProfile, setSelectedProfile] = useState<'stripe' | 'figma' | 'anthropic'>('stripe');
  const [sendingState, setSendingState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [activeMode, setActiveMode] = useState<'raw' | 'composed'>('composed');

  // If redirected from Google OAuth to root domain, forward client-side to /settings
  if (searchParams.get('code') || searchParams.get('error')) {
    return <Navigate to={`/settings${window.location.search}`} replace />;
  }

  const profiles = {
    stripe: {
      name: 'Sarah Chen',
      role: 'Head of Tech Recruiting',
      company: 'Stripe',
      email: 'sarah.chen@stripe.com',
      avatarBg: 'from-violet-500 to-indigo-600',
      subject: 'Senior Full Stack Engineer opportunities at Stripe',
      opening: "Hi Sarah, saw your post regarding Stripe's developer infrastructure scaling. With 4+ years architecting high-throughput distributed APIs, I would love to connect for high-impact engineering roles.",
    },
    figma: {
      name: 'Marcus Vance',
      role: 'Principal Talent Partner',
      company: 'Figma',
      email: 'm.vance@figma.com',
      avatarBg: 'from-rose-500 to-orange-500',
      subject: 'Product Engineering roles on Figma Editor Core',
      opening: "Hey Marcus, huge fan of Figma's recent canvas performance updates. I specialize in React, WebGL, and state synchronization, and I'd love to share my portfolio with your team.",
    },
    anthropic: {
      name: 'Elena Rostova',
      role: 'Lead Engineering Recruiter',
      company: 'Anthropic',
      email: 'elena@anthropic.com',
      avatarBg: 'from-amber-500 to-yellow-600',
      subject: 'Frontier AI System Engineering — Alex Morgan',
      opening: "Hello Elena, I've been following Anthropic's alignment research and infrastructure work closely. I've led platform reliability projects and would value 10 minutes to discuss current openings.",
    },
  };

  const current = profiles[selectedProfile];

  const handleSimulateSend = () => {
    if (sendingState !== 'idle') return;
    setSendingState('sending');
    setTimeout(() => {
      setSendingState('sent');
      setTimeout(() => setSendingState('idle'), 4000);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-slate-800 flex flex-col selection:bg-brand-500 selection:text-white relative overflow-hidden">
      {/* Ambient background blur orbs for depth and warm modern aesthetic */}
      <div className="ambient-glow w-[550px] h-[550px] bg-brand-200/40 -top-40 -left-40" />
      <div className="ambient-glow w-[550px] h-[550px] bg-coral-200/30 -top-20 -right-40" />

      {/* Floating Modern Pill Header */}
      <MarketingHeader activePage="home" />

      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-10 lg:pt-14 pb-10 sm:pb-14 px-6 text-center max-w-5xl mx-auto z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/70 text-brand-700 text-xs font-bold shadow-xs mb-5">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>New: 10+ Pre-Made Role Blueprints (Full Stack, AI/ML, DevOps, Intern &amp; more)</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12] max-w-4xl mx-auto">
          Skip the job board black hole.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-600 to-coral-500">
            Reach decision makers directly.
          </span>
        </h1>

        <p className="mt-5 font-body font-normal text-slate-600 text-base sm:text-[17px] max-w-2xl mx-auto leading-relaxed">
          Connect your personal Gmail, upload hiring manager contacts, and dispatch personalized outreach with your resume attached directly to primary inboxes.
        </p>

        {/* CTA Button Group */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register">
            <Button
              size="lg"
              variant="coral"
              pill
              icon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto px-7 py-3 font-bold text-base"
            >
              Start Reaching Out Free
            </Button>
          </Link>
          <a href="#simulator">
            <Button
              size="lg"
              variant="outline"
              pill
              icon={<Sparkles className="w-4 h-4 text-brand-600" />}
              className="w-full sm:w-auto px-6 py-3 text-base"
            >
              Try Live Simulator
            </Button>
          </a>
        </div>

        {/* 3-Box Highlight Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3.5 max-w-5xl mx-auto text-left">
          {/* Box 1: 85% Time Savings */}
          <div className="p-3.5 sm:p-4 rounded-2xl glass-panel shadow-xs flex items-start gap-3.5 text-xs text-slate-600">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-sm">
              85%
            </div>
            <div>
              <span className="font-bold text-slate-900 block text-xs sm:text-sm">
                Cuts manual outreach time by over 85%
              </span>
              <span className="text-slate-500 text-xs mt-0.5 block leading-relaxed">
                Automating personalized cold emails replaces 4+ hours of manual one-by-one drafting with a single 3-minute sequence.
              </span>
            </div>
          </div>

          {/* Box 2: GitHub & LeetCode Variable Links Automation */}
          <div className="p-3.5 sm:p-4 rounded-2xl glass-panel shadow-xs flex items-start gap-3.5 text-xs text-slate-600 border border-brand-100/60">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-coral-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 block text-xs sm:text-sm">
                Attach GitHub, LeetCode &amp; Platform Links via Variables
              </span>
              <span className="text-slate-500 text-xs mt-0.5 block leading-relaxed">
                Save your links once in Settings. Use <code className="text-brand-600 font-bold">&#123;&#123;github&#125;&#125;</code> and <code className="text-amber-600 font-bold">&#123;&#123;leetcode&#125;&#125;</code> so you never have to copy-paste URLs every time.
              </span>
            </div>
          </div>

          {/* Box 3: Direct Gmail Inbox & Resume Attachment */}
          <div className="p-3.5 sm:p-4 rounded-2xl glass-panel shadow-xs flex items-start gap-3.5 text-xs text-slate-600 border border-emerald-100/60">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-coral-500 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 block text-xs sm:text-sm">
                Direct Gmail Primary Delivery
              </span>
              <span className="text-slate-500 text-xs mt-0.5 block leading-relaxed">
                Dispatches through your authenticated personal mailbox with your resume PDF attached directly, landing safely in primary inboxes.
              </span>
            </div>
          </div>
        </div>

        {/* Social Proof Avatars & Reassurance */}
        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs sm:text-sm text-slate-500 font-medium">
          <div className="flex -space-x-2 overflow-hidden items-center">
            <div className="inline-flex h-8 w-8 rounded-full ring-2 ring-white bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold items-center justify-center text-[10px] shadow-xs">
              AK
            </div>
            <div className="inline-flex h-8 w-8 rounded-full ring-2 ring-white bg-gradient-to-tr from-rose-500 to-orange-500 text-white font-bold items-center justify-center text-[10px] shadow-xs">
              SL
            </div>
            <div className="inline-flex h-8 w-8 rounded-full ring-2 ring-white bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-bold items-center justify-center text-[10px] shadow-xs">
              RJ
            </div>
            <div className="inline-flex h-8 w-8 rounded-full ring-2 ring-white bg-gradient-to-tr from-amber-500 to-yellow-600 text-white font-bold items-center justify-center text-[10px] shadow-xs">
              MC
            </div>
          </div>
          <span>
            Designed to help you connect with hiring teams at companies like{' '}
            <strong className="text-slate-800 font-semibold">Stripe, Figma, and Google</strong>
          </span>
        </div>
      </section>

      {/* Interactive Hero Simulator Section */}
      <section id="simulator" className="px-4 sm:px-6 pb-10 sm:pb-12 max-w-6xl mx-auto w-full z-10 scroll-mt-20">
        <div className="glass-panel rounded-3xl p-6 sm:p-9 shadow-card border border-white/80 relative">
          {/* Top bar with Clean Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Interactive Outreach Preview
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Compare your raw template during creation with the final composed email sent to hiring managers
              </p>
            </div>

            {/* Mode Switcher: Raw Template vs Composed Email */}
            <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-2xl text-xs font-semibold shrink-0 self-start md:self-auto">
              <button
                onClick={() => setActiveMode('raw')}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeMode === 'raw'
                    ? 'bg-white text-brand-600 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-brand-600" />
                Raw Template
              </button>
              <button
                onClick={() => setActiveMode('composed')}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeMode === 'composed'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-coral-500" />
                Composed Email
              </button>
            </div>
          </div>

          {/* Interactive Email Canvas */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left: Email Composer Preview */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-xs border border-slate-100/80 space-y-4">
              {/* Context Bar depending on Mode */}
              {activeMode === 'composed' ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100 text-xs">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-coral-500 shrink-0" />
                    Previewing personalized draft for:
                  </span>
                  <div className="inline-flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
                    {(['stripe', 'figma', 'anthropic'] as const).map((key) => (
                      <button
                        key={key}
                        onClick={() => setSelectedProfile(key)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          selectedProfile === key
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {key === 'stripe' ? 'Stripe' : key === 'figma' ? 'Figma' : 'Anthropic'}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    Template creation draft with variables:
                  </span>
                  <span className="text-[11px] font-mono font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-lg border border-brand-100">
                    &#123;&#123;name&#125;&#125;, &#123;&#123;company&#125;&#125;, &#123;&#123;github&#125;&#125;, &#123;&#123;leetcode&#125;&#125;
                  </span>
                </div>
              )}

              {/* Header Fields */}
              <div className="space-y-2.5 text-xs sm:text-sm border-b border-slate-100 pb-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Recipient:</span>
                  {activeMode === 'composed' ? (
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-tr ${current.avatarBg} text-white font-bold text-[10px] flex items-center justify-center shadow-xs`}>
                        {current.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-slate-800">{current.name}</span>
                      <span className="text-slate-400 font-mono text-xs">• {current.email}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 font-mono text-xs text-brand-600 font-bold bg-brand-50 px-2 py-0.5 rounded-md">
                      <span>&#123;&#123;email&#125;&#125;</span>
                      <span className="text-slate-400 font-normal font-sans">• &#123;&#123;name&#125;&#125; at &#123;&#123;company&#125;&#125;</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Subject:</span>
                  <span className="font-medium text-slate-800 font-mono text-xs sm:text-sm">
                    {activeMode === 'composed' ? current.subject : 'Senior Full Stack Engineer opportunities at {{company}}'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Attached:</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono text-xs">
                    <Paperclip className="w-3.5 h-3.5 text-brand-600" /> Resume_Alex_Morgan.pdf
                  </span>
                </div>
              </div>

              {/* Message Body with Dynamic Variables or Resolved Links */}
              <div className="p-4 rounded-xl bg-slate-50/50 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans min-h-[140px] space-y-3">
                {activeMode === 'composed' ? (
                  <>
                    <p>{current.opening}</p>
                    
                    <div className="p-3 rounded-lg bg-white border border-slate-200/80 space-y-1.5 text-xs">
                      <p className="font-medium text-slate-600">You can inspect my code and problem-solving benchmarks below:</p>
                      <div className="space-y-1 font-mono text-xs pl-1">
                        <p className="flex items-center gap-1.5">
                          <span className="text-slate-400 font-sans">• GitHub:</span>
                          <span className="text-brand-600 font-medium underline">https://github.com/alexmorgan</span>
                          <span className="text-[10px] text-emerald-600 font-sans font-bold bg-emerald-50 px-1 rounded">Auto-filled</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <span className="text-slate-400 font-sans">• LeetCode:</span>
                          <span className="text-amber-600 font-medium underline">https://leetcode.com/u/alexmorgan</span>
                          <span className="text-[10px] text-emerald-600 font-sans font-bold bg-emerald-50 px-1 rounded">Auto-filled</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <span className="text-slate-400 font-sans">• Portfolio:</span>
                          <span className="text-coral-600 font-medium underline">https://alexmorgan.dev</span>
                          <span className="text-[10px] text-emerald-600 font-sans font-bold bg-emerald-50 px-1 rounded">Auto-filled</span>
                        </p>
                      </div>
                    </div>

                    <p className="text-slate-600">My resume is attached directly. Would love 10 minutes to discuss open roles!</p>
                  </>
                ) : (
                  <>
                    <p>
                      Hi <span className="bg-brand-100/80 text-brand-800 font-mono px-1 rounded font-bold">&#123;&#123;name&#125;&#125;</span>, saw your recent update regarding <span className="bg-brand-100/80 text-brand-800 font-mono px-1 rounded font-bold">&#123;&#123;company&#125;&#125;</span>'s engineering infrastructure scaling. With 4+ years architecting high-throughput distributed systems, I would love to connect for high-impact roles.
                    </p>
                    
                    <div className="p-3 rounded-lg bg-white border border-slate-200/80 space-y-1.5 text-xs">
                      <p className="font-medium text-slate-600">You can inspect my code and problem-solving benchmarks below:</p>
                      <div className="space-y-1 font-mono text-xs text-slate-700 pl-1">
                        <p className="flex items-center gap-1.5">
                          <span className="text-slate-400">• GitHub:</span>
                          <span className="bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded font-bold border border-brand-100">&#123;&#123;github&#125;&#125;</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <span className="text-slate-400">• LeetCode:</span>
                          <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-bold border border-amber-100">&#123;&#123;leetcode&#125;&#125;</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <span className="text-slate-400">• Portfolio:</span>
                          <span className="bg-coral-50 text-coral-700 px-1.5 py-0.5 rounded font-bold border border-coral-100">&#123;&#123;portfolio&#125;&#125;</span>
                        </p>
                      </div>
                    </div>

                    <p className="text-slate-600">My resume is attached directly. Would love 10 minutes to discuss open roles!</p>
                  </>
                )}
              </div>

              {/* Variable Highlight Banner */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 flex items-start gap-2.5 text-xs text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  {activeMode === 'raw' ? (
                    <>
                      <strong>Template Creation Mode:</strong> Write your message once using dynamic variables. You never need to copy-paste URLs or look up recruiter details every time!
                    </>
                  ) : (
                    <>
                      <strong>Final Composed Email:</strong> CareerReach substitutes <code className="bg-white px-1.5 py-0.5 rounded text-brand-600 font-mono font-bold">&#123;&#123;github&#125;&#125;</code> and <code className="bg-white px-1.5 py-0.5 rounded text-amber-700 font-mono font-bold">&#123;&#123;leetcode&#125;&#125;</code> automatically before sending directly to the recruiter's primary inbox!
                    </>
                  )}
                </span>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Mode: <strong>{activeMode === 'raw' ? 'Raw Template' : 'Final Composed'}</strong></span>
                </div>

                <button
                  onClick={handleSimulateSend}
                  disabled={sendingState !== 'idle'}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    sendingState === 'sent'
                      ? 'bg-emerald-500 text-white shadow-card'
                      : sendingState === 'sending'
                      ? 'bg-brand-600 text-white animate-pulse'
                      : 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white shadow-card hover:-translate-y-0.5'
                  }`}
                >
                  {sendingState === 'sent' ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Delivered to Inbox!
                    </>
                  ) : sendingState === 'sending' ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Dispatching via Gmail...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Simulate Real Send
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right: Live Diagnostics Panel */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100/80 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Delivery Safeguards
                </span>

                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-100 flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Link2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-amber-900">Variable Link Injection</h5>
                    <p className="text-[11px] text-amber-700">Auto-injects GitHub, LeetCode &amp; Portfolio without copying</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-emerald-900">Primary Inbox Delivery</h5>
                    <p className="text-[11px] text-emerald-700">Official Gmail OAuth avoids spam traps</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">Randomized Throttle</h5>
                    <p className="text-[11px] text-slate-500">15s–45s gaps respect Google rate limits</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-indigo-900">Duplicate Shield</h5>
                    <p className="text-[11px] text-indigo-700">Skips previously contacted recruiters</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gateway Discovery Cards: Sub-pages */}
      <section className="py-12 px-6 max-w-6xl mx-auto w-full z-10">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dive Deeper Into CareerReach
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Explore our end-to-end workflow, full feature suite, and Google-certified security architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: How It Works Gateway */}
          <div className="glass-card p-7 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-white to-coral-50/50 flex flex-col justify-between hover:shadow-card transition-all">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-coral-500 text-white flex items-center justify-center mb-5 shadow-card">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                Outreach Workflow
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                Walk through the step-by-step recruiter outreach journey from raw CSV ingestion to personalized variables and response rate optimization.
              </p>
            </div>
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-coral-600 hover:text-coral-700 transition-colors group"
            >
              <span>Explore 4-Step Workflow</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Card 2: Features Gateway */}
          <div className="glass-card p-7 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-white to-brand-50/50 flex flex-col justify-between hover:shadow-card transition-all">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-brand-500 text-white flex items-center justify-center mb-5 shadow-card">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                Full Feature Suite &amp; Role Templates
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                Inspect our 10+ role-tailored blueprints (Full Stack, Frontend, DevOps, AI), contact parser, dynamic link variables, and live campaign queue controls.
              </p>
            </div>
            <Link
              to="/features"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors group"
            >
              <span>View All Capabilities</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Card 3: Security Gateway */}
          <div className="glass-card p-7 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-white to-emerald-50/50 flex flex-col justify-between hover:shadow-card transition-all">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mb-5 shadow-card">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                Security &amp; Google Consent
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                Your Gmail password is never stored or seen. We use restricted Google OAuth 2.0 tokens, AES-256 encryption at rest, and 1-click token erasure.
              </p>
            </div>
            <Link
              to="/security"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors group"
            >
              <span>Inspect Security Architecture</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* High-Converting CTA Banner */}
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

      {/* Shared Modern Footer */}
      <MarketingFooter />
    </div>
  );
};
