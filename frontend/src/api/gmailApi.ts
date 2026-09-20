import { apiClient } from './client';
import { ApiResponse, GmailConnectionDto } from '../types';

export const gmailApi = {
  getStatus: async (): Promise<ApiResponse<GmailConnectionDto>> => {
    const res = await apiClient.get<ApiResponse<GmailConnectionDto>>('/gmail/status');
    return res.data;
  },

  getAuthUrl: async (): Promise<ApiResponse<{ authUrl: string }>> => {
    const res = await apiClient.get<ApiResponse<{ authUrl: string }>>('/gmail/auth-url');
    return res.data;
  },

  handleCallback: async (code: string, state?: string): Promise<ApiResponse<GmailConnectionDto>> => {
    const res = await apiClient.post<ApiResponse<GmailConnectionDto>>('/gmail/oauth/callback', {
      code,
      state,
    });
    return res.data;
  },

  disconnect: async (): Promise<ApiResponse<void>> => {
    const res = await apiClient.post<ApiResponse<void>>('/gmail/disconnect');
    return res.data;
  },
};
