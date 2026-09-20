import { apiClient } from './client';
import { ApiResponse, DashboardStats } from '../types';

export const dashboardApi = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const res = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return res.data;
  },
};
