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
    <div className="space-y-6 max-w-6xl">
      {/* Top Header & Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {getTimeGreeting()}, {user?.name ? user.name.split(' ')[0] : 'there'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Here&apos;s your outreach overview.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/campaigns">
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              New Campaign
            </Button>
          </Link>
          <Link to="/contacts">
            <Button
              variant="outline"
              size="sm"
              icon={<UploadCloud className="w-3.5 h-3.5" />}
            >
              Import Contacts
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Overview Strip (3 Key Metrics + Deliverability indicator) */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Contacts */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Contacts
              </span>
              <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats?.totalContacts ?? 0}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {stats?.contactsReady ?? 0} ready for outreach
              </span>
            </div>
          </div>

          {/* Emails Sent */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Emails Sent
              </span>
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <Send className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats?.emailsSent ?? 0}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                <CheckCircle2 className="w-3 h-3" />
                {stats?.successRate ?? 0}% success
              </span>
            </div>
          </div>

          {/* Active Campaigns */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Active Campaigns
              </span>
              <div className="p-1.5 rounded-lg bg-brand-50 text-brand-600">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-brand-600 tracking-tight">
                {stats?.activeCampaigns ?? 0}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {stats?.totalCampaigns ?? 0} total sequences
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Recent Campaigns (Left) & Quick Actions / Activity (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Campaigns List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-600" />
              Recent Campaigns
            </h2>
            <Link
              to="/campaigns"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            {!stats?.recentCampaigns || stats.recentCampaigns.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                <p className="mb-3">No outreach campaigns created yet.</p>
                <Link to="/campaigns">
                  <Button variant="outline" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
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
                      className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0 flex-1 pr-4">
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-sm font-bold text-slate-900 truncate">
                            {c.name}
                          </h3>
                          <Badge status={c.status} size="sm" />
                        </div>

                        {/* Progress Bar & Details */}
                        <div className="space-y-1 pt-1">
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>
                              {c.sentCount} of {c.totalRecipients} sent ({progressPct}%)
                            </span>
                            <span className="font-semibold text-emerald-600">
                              {c.successRate}% deliverability
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-brand-600 rounded-full transition-all duration-300"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <Link to="/campaigns">
                          <Button variant="ghost" size="xs">
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

        {/* Right Column: Quick Actions & Workspace Activity */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900">
              Quick Actions
            </h2>

            <div className="bg-white rounded-xl border border-slate-200/80 p-2 shadow-xs space-y-1">
              <Link
                to="/contacts"
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors group text-xs text-slate-700 font-medium"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 group-hover:bg-brand-100 transition-colors">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                    Import Contacts
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Upload .xlsx or .csv recruiter list
                  </span>
                </div>
              </Link>

              <Link
                to="/templates"
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors group text-xs text-slate-700 font-medium"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 group-hover:bg-brand-100 transition-colors">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                    Create Template
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Compose email with merge tags
                  </span>
                </div>
              </Link>

              <Link
                to="/campaigns"
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors group text-xs text-slate-700 font-medium"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 group-hover:bg-brand-100 transition-colors">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                    New Campaign
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Launch outreach batch sequence
                  </span>
                </div>
              </Link>

              <Link
                to="/gmail-connect"
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors group text-xs text-slate-700 font-medium"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-slate-200 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                    Gmail Connection
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Connect or test Google OAuth
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
