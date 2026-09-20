import { apiClient } from './client';
import { ApiResponse, EmailTemplate, TemplatePreviewRequest, TemplatePreviewResponse, TemplateRequest } from '../types';

export const templateApi = {
  createTemplate: async (payload: TemplateRequest): Promise<ApiResponse<EmailTemplate>> => {
    const res = await apiClient.post<ApiResponse<EmailTemplate>>('/templates', payload);
    return res.data;
  },

  getTemplates: async (search?: string): Promise<ApiResponse<EmailTemplate[]>> => {
    const res = await apiClient.get<ApiResponse<EmailTemplate[]>>('/templates', {
      params: search ? { search } : undefined,
    });
    return res.data;
  },

  getTemplateById: async (id: string): Promise<ApiResponse<EmailTemplate>> => {
    const res = await apiClient.get<ApiResponse<EmailTemplate>>(`/templates/${id}`);
    return res.data;
  },

  updateTemplate: async (id: string, payload: TemplateRequest): Promise<ApiResponse<EmailTemplate>> => {
    const res = await apiClient.put<ApiResponse<EmailTemplate>>(`/templates/${id}`, payload);
    return res.data;
  },

  duplicateTemplate: async (id: string): Promise<ApiResponse<EmailTemplate>> => {
    const res = await apiClient.post<ApiResponse<EmailTemplate>>(`/templates/${id}/duplicate`);
    return res.data;
  },

  deleteTemplate: async (id: string): Promise<ApiResponse<void>> => {
    const res = await apiClient.delete<ApiResponse<void>>(`/templates/${id}`);
    return res.data;
  },

  previewTemplate: async (id: string, payload?: TemplatePreviewRequest): Promise<ApiResponse<TemplatePreviewResponse>> => {
    const res = await apiClient.post<ApiResponse<TemplatePreviewResponse>>(`/templates/${id}/preview`, payload || {});
    return res.data;
  },
};
