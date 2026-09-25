import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Send,
  ArrowRight,
  UploadCloud,
  Plus,
  CheckCircle2,
  Layers,
  FileText,
  Mail,
  Paperclip,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { CardSkeleton } from '../components/common/SkeletonLoader';
import { dashboardApi } from '../api/dashboardApi';
import { DashboardStats } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const toast = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await dashboardApi.getStats();
      if (res.data) {
        setStats(res.data);
      }
    } catch {
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  const getTimeGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Top Header & Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Workspace Overview
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {getTimeGreeting()}, {user?.name ? user.name.split(' ')[0] : 'there'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Here is your live cold outreach pipeline and deliverability status.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/campaigns">
            <Button
              variant="coral"
              size="sm"
              pill
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              New Campaign
            </Button>
          </Link>
          <Link to="/contacts">
            <Button
              variant="outline"
              size="sm"
              pill
              icon={<UploadCloud className="w-3.5 h-3.5 text-brand-600" />}
            >
              Import Contacts
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Overview Strip (Modern Aesthetic Non-Boxy Cards) */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Total Contacts */}
          <div className="glass-card p-6 bg-gradient-to-br from-white via-white to-brand-50/30">
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Contacts
              </span>
              <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shadow-xs">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {stats?.totalContacts ?? 0}
              </span>
              <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
                {stats?.contactsReady ?? 0} ready to send
              </span>
            </div>
          </div>

          {/* Emails Sent */}
          <div className="glass-card p-6 bg-gradient-to-br from-white via-white to-mint-50/30">
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Emails Sent
              </span>
              <div className="w-9 h-9 rounded-xl bg-mint-50 text-mint-600 flex items-center justify-center shadow-xs">
                <Send className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {stats?.emailsSent ?? 0}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {stats?.successRate ?? 0}% inbox rate
              </span>
            </div>
          </div>

          {/* Active Campaigns */}
          <div className="glass-card p-6 bg-gradient-to-br from-white via-white to-coral-50/30">
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Campaigns
              </span>
              <div className="w-9 h-9 rounded-xl bg-coral-50 text-coral-600 flex items-center justify-center shadow-xs">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-coral-600 tracking-tight">
                {stats?.activeCampaigns ?? 0}
              </span>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {stats?.totalCampaigns ?? 0} total sequences
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Recent Campaigns (Left) & Quick Actions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Campaigns List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-600" />
              Recent Campaigns
            </h2>
            <Link
              to="/campaigns"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
            >
              <span>View all sequences</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden shadow-card">
            {!stats?.recentCampaigns || stats.recentCampaigns.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-500">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <Layers className="w-6 h-6" />
                </div>
                <p className="font-bold text-slate-800 text-sm mb-1">No outreach campaigns yet</p>
                <p className="text-slate-400 max-w-sm mx-auto mb-4">
                  Create your first personalized sequence to reach recruiters directly from Gmail.
                </p>
                <Link to="/campaigns">
                  <Button variant="coral" size="sm" pill icon={<Plus className="w-3.5 h-3.5" />}>
                    Create Your First Campaign
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {stats.recentCampaigns.map((c) => {
                  const progressPct =
                    c.totalRecipients > 0
                      ? Math.round((c.sentCount / c.totalRecipients) * 100)
                      : 0;

                  return (
                    <div
                      key={c.id}
                      className="p-5 hover:bg-slate-50/70 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 min-w-0 flex-1 pr-4">
                        <div className="flex items-center gap-3">
                          <h3 className="text-sm font-bold text-slate-900 truncate">
                            {c.name}
                          </h3>
                          <Badge status={c.status} size="sm" />
                        </div>

                        {/* Progress Bar & Details */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>
                              {c.sentCount} of {c.totalRecipients} sent ({progressPct}%)
                            </span>
                            <span className="font-semibold text-emerald-600">
                              {c.successRate}% deliverability
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-brand-600 to-indigo-500 rounded-full transition-all duration-500"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <Link to="/campaigns">
                          <Button variant="outline" size="xs" pill>
                            Manage
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Action Cards */}
        <div className="space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-coral-500" />
            Quick Actions
          </h2>

          <div className="glass-panel rounded-2xl p-3 shadow-card space-y-2">
            <Link
              to="/contacts"
              className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-white hover:shadow-xs transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <UploadCloud className="w-4 h-4" />
              </div>
              <div>
                <span className="block font-bold text-xs text-slate-900 group-hover:text-brand-600 transition-colors">
                  Import Contacts
                </span>
                <span className="text-[11px] text-slate-400">
                  Upload .xlsx or .csv recruiter list
                </span>
              </div>
            </Link>

            <Link
              to="/templates"
              className="flex items-center gap-3.5 p-3 rounded-xl bg-gradient-to-r from-brand-50/70 to-indigo-50/50 hover:from-brand-100/70 hover:to-indigo-100/60 border border-brand-100/80 transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="block font-bold text-xs text-slate-900 group-hover:text-brand-600 transition-colors">
                    Role Template Library
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-brand-100 text-brand-800">
                    10 Ready
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 truncate block">
                  Full Stack, AI/ML, DevOps, Intern &amp; more
                </span>
              </div>
            </Link>

            <Link
              to="/attachments"
              className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-white hover:shadow-xs transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-violet-50 text-accent-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Paperclip className="w-4 h-4" />
              </div>
              <div>
                <span className="block font-bold text-xs text-slate-900 group-hover:text-brand-600 transition-colors">
                  Resume Vault
                </span>
                <span className="text-[11px] text-slate-400">
                  Manage PDF resumes attached to emails
                </span>
              </div>
            </Link>

            <Link
              to="/campaigns"
              className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-white hover:shadow-xs transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-coral-50 text-coral-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <span className="block font-bold text-xs text-slate-900 group-hover:text-coral-600 transition-colors">
                  New Campaign
                </span>
                <span className="text-[11px] text-slate-400">
                  Launch safe batch email dispatch
                </span>
              </div>
            </Link>

            <Link
              to="/gmail-connect"
              className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-white hover:shadow-xs transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-honey-50 text-honey-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="block font-bold text-xs text-slate-900 group-hover:text-honey-600 transition-colors">
                  Gmail Connection
                </span>
                <span className="text-[11px] text-slate-400">
                  Check Google OAuth link status
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
