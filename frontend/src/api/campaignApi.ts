import { apiClient } from './client';
import {
  ApiResponse,
  Campaign,
  CampaignDetail,
  CreateCampaignRequest,
  DuplicateCheckResponse,
  PreflightCheckResponse,
} from '../types';

export const campaignApi = {
  createCampaign: async (payload: CreateCampaignRequest): Promise<ApiResponse<Campaign>> => {
    const res = await apiClient.post<ApiResponse<Campaign>>('/campaigns', payload);
    return res.data;
  },

  checkDuplicates: async (
    templateId: string,
    contactIds: string[]
  ): Promise<ApiResponse<DuplicateCheckResponse>> => {
    const res = await apiClient.post<ApiResponse<DuplicateCheckResponse>>('/campaigns/check-duplicates', {
      templateId,
      contactIds,
    });
    return res.data;
  },

  validatePreflight: async (
    templateId: string,
    contactIds: string[],
    skipDuplicates = true
  ): Promise<ApiResponse<PreflightCheckResponse>> => {
    const res = await apiClient.post<ApiResponse<PreflightCheckResponse>>('/campaigns/validate-preflight', {
      templateId,
      contactIds,
      skipDuplicates,
    });
    return res.data;
  },

  getCampaigns: async (): Promise<ApiResponse<Campaign[]>> => {
    const res = await apiClient.get<ApiResponse<Campaign[]>>('/campaigns');
    return res.data;
  },

  getCampaignById: async (id: string): Promise<ApiResponse<CampaignDetail>> => {
    const res = await apiClient.get<ApiResponse<CampaignDetail>>(`/campaigns/${id}`);
    return res.data;
  },

  startCampaign: async (id: string): Promise<ApiResponse<Campaign>> => {
    const res = await apiClient.post<ApiResponse<Campaign>>(`/campaigns/${id}/start`);
    return res.data;
  },

  pauseCampaign: async (id: string): Promise<ApiResponse<Campaign>> => {
    const res = await apiClient.post<ApiResponse<Campaign>>(`/campaigns/${id}/pause`);
    return res.data;
  },

  resumeCampaign: async (id: string): Promise<ApiResponse<Campaign>> => {
    const res = await apiClient.post<ApiResponse<Campaign>>(`/campaigns/${id}/resume`);
    return res.data;
  },

  cancelCampaign: async (id: string): Promise<ApiResponse<Campaign>> => {
    const res = await apiClient.post<ApiResponse<Campaign>>(`/campaigns/${id}/cancel`);
    return res.data;
  },

  deleteCampaign: async (id: string): Promise<ApiResponse<void>> => {
    const res = await apiClient.delete<ApiResponse<void>>(`/campaigns/${id}`);
    return res.data;
  },

  retryFailedCampaign: async (id: string): Promise<ApiResponse<Campaign>> => {
    const res = await apiClient.post<ApiResponse<Campaign>>(`/campaigns/${id}/retry-failed`);
    return res.data;
  },
};
