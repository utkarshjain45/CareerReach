import client from './client';
import { ApiResponse, UserSettings, User } from '../types';

export const settingsApi = {
  getSettings: async (): Promise<ApiResponse<UserSettings>> => {
    const res = await client.get<ApiResponse<UserSettings>>('/settings');
    return res.data;
  },

  updatePreferences: async (data: UserSettings): Promise<ApiResponse<UserSettings>> => {
    const res = await client.put<ApiResponse<UserSettings>>('/settings/preferences', data);
    return res.data;
  },

  updateSettings: async (data: UserSettings): Promise<ApiResponse<UserSettings>> => {
    const res = await client.put<ApiResponse<UserSettings>>('/settings/preferences', data);
    return res.data;
  },

  updateProfile: async (data: { name: string }): Promise<ApiResponse<User>> => {
    const res = await client.put<ApiResponse<User>>('/settings/profile', data);
    return res.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<void>> => {
    const res = await client.put<ApiResponse<void>>('/settings/password', data);
    return res.data;
  },
};
