import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { CampaignDetail, CampaignRecipientStatus } from '../../types';
import { campaignApi } from '../../api/campaignApi';
import { useToast } from '../../context/ToastContext';
import {
  Play,
  Pause,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Users,
  Filter,
  Check,
  AlertCircle,
  MailCheck,
  Paperclip,
  FileText,
} from 'lucide-react';

interface CampaignDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string | null;
  onUpdate: () => void;
}

export const CampaignDetailModal: React.FC<CampaignDetailModalProps> = ({
  isOpen,
  onClose,
  campaignId,
  onUpdate,
}) => {
  const [detail, setDetail] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | CampaignRecipientStatus>('ALL');
  const toast = useToast();

  const fetchDetail = async (silent = false) => {
    if (!campaignId) return;
    if (!silent) setLoading(true);
    try {
      const res = await campaignApi.getCampaignById(campaignId);
      if (res.data) {
        setDetail(res.data);
      }
    } catch {
      if (!silent) toast.error('Failed to load campaign progress details');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && campaignId) {
      fetchDetail();
      setStatusFilter('ALL');
    } else {
      setDetail(null);
    }
  }, [isOpen, campaignId]);

  // Auto-polling every 3 seconds while campaign is RUNNING
  useEffect(() => {
    if (!isOpen || !detail || detail.campaign.status !== 'RUNNING') return;

    const interval = setInterval(() => {
      fetchDetail(true);
      onUpdate();
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen, detail?.campaign.status, onUpdate]);

  const handleStart = async () => {
    if (!campaignId) return;
    setActionLoading(true);
    try {
      await campaignApi.startCampaign(campaignId);
      toast.success('Campaign started');
      fetchDetail();
      onUpdate();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start campaign');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = async () => {
    if (!campaignId) return;
    setActionLoading(true);
    try {
      await campaignApi.pauseCampaign(campaignId);
      toast.success('Campaign paused');
      fetchDetail();
      onUpdate();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to pause campaign');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    if (!campaignId) return;
    setActionLoading(true);
    try {
      await campaignApi.resumeCampaign(campaignId);
      toast.success('Campaign resumed');
      fetchDetail();
      onUpdate();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resume campaign');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!campaignId) return;
    setActionLoading(true);
    try {
      await campaignApi.cancelCampaign(campaignId);
      toast.success('Campaign cancelled');
      fetchDetail();
      onUpdate();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel campaign');
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  const campaign = detail?.campaign;
  const recipients = detail?.recipients || [];

  const total = campaign?.totalRecipients || 1;
  const processed = (campaign?.sentCount || 0) + (campaign?.failedCount || 0);
  const progressPercent = Math.min(100, Math.round((processed / total) * 100));

  const totalAttempted = (campaign?.sentCount || 0) + (campaign?.failedCount || 0);
  const successRate = totalAttempted > 0
    ? (((campaign?.sentCount || 0) / totalAttempted) * 100).toFixed(1)
    : '0.0';
  const failureRate = totalAttempted > 0
    ? (((campaign?.failedCount || 0) / totalAttempted) * 100).toFixed(1)
    : '0.0';

  const formatDuration = (start?: string | null, end?: string | null): string => {
    if (!start) return 'Not started';
    const startTime = new Date(start).getTime();
    const endTime = end ? new Date(end).getTime() : Date.now();
    const diffSec = Math.max(0, Math.floor((endTime - startTime) / 1000));

    if (diffSec < 60) return `${diffSec}s`;
    const mins = Math.floor(diffSec / 60);
    const secs = diffSec % 60;
    return `${mins}m ${secs}s`;
  };

  const getRecipientStatusBadge = (status: CampaignRecipientStatus) => {
    switch (status) {
      case 'SENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <Check className="w-3 h-3 text-emerald-600" /> Sent
          </span>
        );
      case 'SENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200/80 animate-pulse">
            <Loader2 className="w-3 h-3 text-sky-600 animate-spin" /> Sending...
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/80">
            <AlertCircle className="w-3 h-3 text-rose-600" /> Failed
          </span>
        );
      case 'SKIPPED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Skipped
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-50 text-slate-500 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Pending
          </span>
        );
    }
  };

  const filteredRecipients = recipients.filter((r) => {
    if (statusFilter === 'ALL') return true;
    return r.status === statusFilter;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={campaign?.name || 'Campaign Details'}
      subtitle={`Template: ${campaign?.templateName || '—'}`}
      maxWidth="4xl"
    >
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <p className="text-xs text-slate-400 font-medium">Loading campaign progress...</p>
        </div>
      ) : campaign ? (
        <div className="space-y-6">
          {/* Top Status & Controls Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-gradient-to-br from-slate-50/90 to-white rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Campaign Status</span>
                <div className="flex items-center gap-2.5 mt-1">
                  <Badge status={campaign.status} />
                  {campaign.status === 'RUNNING' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-50 text-brand-700 border border-brand-200/80">
                      <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
                      Live Dispatching
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Campaign Lifecycle Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => fetchDetail()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-2xs"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                Refresh
              </button>

              {campaign.status === 'DRAFT' && (
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-xl text-white bg-brand-600 hover:bg-brand-700 transition-all shadow-xs disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5" />
                  Start Outreach
                </button>
              )}

              {campaign.status === 'RUNNING' && (
                <button
                  type="button"
                  onClick={handlePause}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl text-amber-800 bg-amber-50 border border-amber-200/80 hover:bg-amber-100 transition-all shadow-2xs disabled:opacity-50"
                >
                  <Pause className="w-3.5 h-3.5 text-amber-600" />
                  Pause
                </button>
              )}

              {campaign.status === 'PAUSED' && (
                <button
                  type="button"
                  onClick={handleResume}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-xl text-white bg-brand-600 hover:bg-brand-700 transition-all shadow-xs disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5" />
                  Resume
                </button>
              )}

              {(campaign.status === 'RUNNING' || campaign.status === 'PAUSED') && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl text-rose-700 bg-rose-50 border border-rose-200/80 hover:bg-rose-100 transition-all shadow-2xs disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 tracking-tight">Dispatch Progress</span>
              <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                {processed} of {total} processed ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${Math.round((campaign.sentCount / total) * 100)}%` }}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                title={`Sent: ${campaign.sentCount}`}
              />
              <div
                style={{ width: `${Math.round((campaign.failedCount / total) * 100)}%` }}
                className="bg-gradient-to-r from-rose-500 to-red-500 transition-all duration-500"
                title={`Failed: ${campaign.failedCount}`}
              />
            </div>
          </div>

          {/* Attachments Banner */}
          {campaign.attachments && campaign.attachments.length > 0 && (
            <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <Paperclip className="w-4 h-4 text-brand-600 shrink-0" />
                <span className="font-bold text-slate-700 shrink-0">Attached Documents:</span>
                <div className="flex flex-wrap gap-1.5">
                  {campaign.attachments.map((att) => (
                    <span
                      key={att.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-medium text-slate-800 shadow-2xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-rose-500" />
                      <span className="truncate max-w-[200px]">{att.originalFileName}</span>
                      <span className="text-[10px] text-slate-400">
                        ({(att.fileSize / 1024).toFixed(1)} KB)
                      </span>
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold self-start sm:self-auto">
                MIME Attached
              </span>
            </div>
          )}

          {/* Campaign Analytics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Card 1: Total Contacts */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Recipients</span>
                <Users className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">{campaign.totalRecipients}</div>
              <span className="text-[11px] text-slate-400 font-medium block mt-1">Total targeted</span>
            </div>

            {/* Card 2: Sent */}
            <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/70 shadow-xs hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between text-emerald-600 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Delivered</span>
                <MailCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-700 tracking-tight">{campaign.sentCount}</div>
              <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
                {successRate}% success rate
              </span>
            </div>

            {/* Card 3: Failed */}
            <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-200/70 shadow-xs hover:border-rose-300 transition-all">
              <div className="flex items-center justify-between text-rose-600 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">Failed</span>
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl font-black text-rose-700 tracking-tight">{campaign.failedCount}</div>
              <span className="text-[11px] text-rose-600 font-semibold block mt-1">
                {failureRate}% failure rate
              </span>
            </div>

            {/* Card 4: Duration */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Duration</span>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-black text-slate-800 tracking-tight">
                {formatDuration(campaign.startedAt, campaign.completedAt)}
              </div>
              <span className="text-[11px] text-slate-400 font-medium block mt-1">
                {campaign.completedAt ? 'Completed' : campaign.startedAt ? 'In progress' : 'Not started'}
              </span>
            </div>
          </div>

          {/* Recipient Logs Table with Status Filters */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-brand-600" /> Recipient Dispatch Logs
                <span className="text-[11px] font-normal text-slate-400">({filteredRecipients.length})</span>
              </span>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 text-[11px] font-semibold bg-slate-100 p-1 rounded-xl">
                {(['ALL', 'SENT', 'FAILED', 'PENDING', 'SKIPPED'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      statusFilter === tab
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-2xs">
              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                {filteredRecipients.length === 0 ? (
                  <div className="p-12 text-center text-xs text-slate-400">
                    No recipients match filter <span className="font-semibold text-slate-600">"{statusFilter}"</span>.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse text-xs min-w-[680px]">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-slate-50/95 backdrop-blur-xs border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                        <th className="py-2.5 px-4">Recipient</th>
                        <th className="py-2.5 px-4">Company</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4">Dispatched</th>
                        <th className="py-2.5 px-4">Diagnostics</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredRecipients.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 min-w-[220px]">
                            <span className="font-bold text-slate-900 block truncate max-w-xs">
                              {r.contactName || '—'}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 truncate max-w-xs block mt-0.5">
                              {r.contactEmail}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-medium min-w-[130px]">
                            {r.contactCompany || '—'}
                          </td>
                          <td className="py-3 px-4 min-w-[110px] whitespace-nowrap">
                            {getRecipientStatusBadge(r.status)}
                          </td>
                          <td className="py-3 px-4 text-[11px] text-slate-500 font-mono whitespace-nowrap min-w-[110px]">
                            {r.sentAt ? new Date(r.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}
                          </td>
                          <td className="py-3 px-4 text-[11px] min-w-[180px]">
                            {r.errorMessage ? (
                              <span className="text-rose-600 font-mono block max-w-xs truncate" title={r.errorMessage}>
                                {r.errorMessage}
                              </span>
                            ) : r.status === 'SENT' ? (
                              <span className="text-emerald-600 font-medium flex items-center gap-1">
                                <Check className="w-3 h-3" /> Delivered
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};
