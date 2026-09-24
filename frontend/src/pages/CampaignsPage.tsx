import React, { useState, useEffect } from 'react';
import {
  Send,
  Plus,
  Play,
  Pause,
  Eye,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/SkeletonLoader';
import { CreateCampaignModal } from '../components/campaigns/CreateCampaignModal';
import { CampaignDetailModal } from '../components/campaigns/CampaignDetailModal';
import { campaignApi } from '../api/campaignApi';
import { Campaign } from '../types';
import { useToast } from '../context/ToastContext';

export const CampaignsPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);

  // Actions
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const toast = useToast();

  const fetchCampaigns = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await campaignApi.getCampaigns();
      if (res.data) {
        setCampaigns(res.data);
      }
    } catch {
      if (!silent) toast.error('Failed to load campaigns');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Auto-refresh running campaigns every 3 seconds so progress updates live
  useEffect(() => {
    const hasRunning = campaigns.some((c) => c.status === 'RUNNING');
    if (!hasRunning) return;

    const interval = setInterval(() => {
      fetchCampaigns(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [campaigns]);

  const openDetail = (id: string) => {
    setSelectedCampaignId(id);
    setDetailModalOpen(true);
  };

  const handleStart = async (campaign: Campaign, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await campaignApi.startCampaign(campaign.id);
      toast.success('Campaign started in background queue');
      fetchCampaigns();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start campaign');
    }
  };

  const handlePause = async (campaign: Campaign, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await campaignApi.pauseCampaign(campaign.id);
      toast.success('Campaign paused');
      fetchCampaigns();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to pause campaign');
    }
  };

  const handleResume = async (campaign: Campaign, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await campaignApi.resumeCampaign(campaign.id);
      toast.success('Campaign resumed');
      fetchCampaigns();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resume campaign');
    }
  };

  const confirmDelete = (campaign: Campaign, e: React.MouseEvent) => {
    e.stopPropagation();
    setCampaignToDelete(campaign);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!campaignToDelete) return;
    setDeleting(true);
    try {
      await campaignApi.deleteCampaign(campaignToDelete.id);
      toast.success('Campaign deleted');
      setDeleteConfirmOpen(false);
      setCampaignToDelete(null);
      fetchCampaigns();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete campaign');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Outreach Campaigns</h2>
          <p className="text-xs text-slate-500 mt-1">
            Create, queue, and dispatch personalized recruitment campaigns via Gmail
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchCampaigns()}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={() => setCreateModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            New Campaign
          </Button>
        </div>
      </div>

      {/* Campaigns List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={<Send className="w-8 h-8 text-brand-600" />}
          title="No outreach campaigns yet"
          description="Build your first campaign to personalize and dispatch candidate emails in safe, controlled batches."
          actionLabel="Create First Campaign"
          onAction={() => setCreateModalOpen(true)}
          actionIcon={<Plus className="w-4 h-4" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((camp) => {
            const total = camp.totalRecipients || 1;
            const processed = camp.sentCount + camp.failedCount;
            const progressPercent = Math.min(100, Math.round((processed / total) * 100));

            return (
              <div
                key={camp.id}
                onClick={() => openDetail(camp.id)}
                className="bg-white rounded-2xl border border-slate-200/80 hover:border-brand-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden cursor-pointer group"
              >
                {/* Header info */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                      {camp.name}
                    </h3>
                    <Badge status={camp.status} />
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-1 mb-4">
                    Template: <strong className="text-slate-700">{camp.templateName}</strong>
                  </p>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                      <span>Progress</span>
                      <span className="font-mono text-brand-600">{progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          camp.status === 'COMPLETED'
                            ? 'bg-emerald-500'
                            : camp.status === 'FAILED'
                            ? 'bg-rose-500'
                            : 'bg-brand-600'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Counters */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        Total
                      </span>
                      <span className="font-bold text-slate-800">{camp.totalRecipients}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-emerald-600 block">
                        Sent
                      </span>
                      <span className="font-bold text-emerald-700">{camp.sentCount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-amber-600 block">
                        Pending
                      </span>
                      <span className="font-bold text-amber-700">{camp.pendingCount}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    {new Date(camp.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {camp.status === 'DRAFT' && (
                      <button
                        onClick={(e) => handleStart(camp, e)}
                        className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
                        title="Start Campaign"
                      >
                        <Play className="w-4 h-4 text-brand-600" />
                      </button>
                    )}

                    {camp.status === 'RUNNING' && (
                      <button
                        onClick={(e) => handlePause(camp, e)}
                        className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
                        title="Pause Campaign"
                      >
                        <Pause className="w-4 h-4 text-amber-600" />
                      </button>
                    )}

                    {camp.status === 'PAUSED' && (
                      <button
                        onClick={(e) => handleResume(camp, e)}
                        className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
                        title="Resume Campaign"
                      >
                        <Play className="w-4 h-4 text-emerald-600" />
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetail(camp.id);
                      }}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {camp.status !== 'RUNNING' && (
                      <button
                        onClick={(e) => confirmDelete(camp, e)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
                        title="Delete Campaign"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Wizard Modal */}
      <CreateCampaignModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={fetchCampaigns}
      />

      {/* Campaign Detail Modal */}
      <CampaignDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        campaignId={selectedCampaignId}
        onUpdate={fetchCampaigns}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Campaign"
        message={`Are you sure you want to delete "${campaignToDelete?.name}"? All recipient delivery logs for this campaign will be removed.`}
        loading={deleting}
      />
    </div>
  );
};
