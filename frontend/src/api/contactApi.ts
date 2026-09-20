import { apiClient } from './client';
import {
  ApiResponse,
  Contact,
  ContactRequest,
  ContactStatus,
  ImportPreviewResponse,
  ImportSummary,
  PageResponse,
} from '../types';

export interface GetContactsParams {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'asc' | 'desc';
  status?: ContactStatus;
  search?: string;
}

export const contactApi = {
  previewImport: async (file: File): Promise<ApiResponse<ImportPreviewResponse>> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ApiResponse<ImportPreviewResponse>>('/contacts/import/preview', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  importContacts: async (file: File, mapping?: Record<string, string>): Promise<ApiResponse<ImportSummary>> => {
    const formData = new FormData();
    formData.append('file', file);
    if (mapping && Object.keys(mapping).length > 0) {
      formData.append('mapping', JSON.stringify(mapping));
    }
    const res = await apiClient.post<ApiResponse<ImportSummary>>('/contacts/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  updateContactStatus: async (id: string, status: ContactStatus): Promise<ApiResponse<Contact>> => {
    const res = await apiClient.put<ApiResponse<Contact>>(`/contacts/${id}/status`, null, {
      params: { status },
    });
    return res.data;
  },

  createContact: async (payload: ContactRequest): Promise<ApiResponse<Contact>> => {
    const res = await apiClient.post<ApiResponse<Contact>>('/contacts', payload);
    return res.data;
  },

  getContacts: async (params: GetContactsParams = {}): Promise<ApiResponse<PageResponse<Contact>>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Contact>>>('/contacts', { params });
    return res.data;
  },

  getAllContacts: async (): Promise<ApiResponse<Contact[]>> => {
    const res = await apiClient.get<ApiResponse<Contact[]>>('/contacts/all');
    return res.data;
  },

  getContactById: async (id: string): Promise<ApiResponse<Contact>> => {
    const res = await apiClient.get<ApiResponse<Contact>>(`/contacts/${id}`);
    return res.data;
  },

  updateContact: async (id: string, payload: ContactRequest): Promise<ApiResponse<Contact>> => {
    const res = await apiClient.put<ApiResponse<Contact>>(`/contacts/${id}`, payload);
    return res.data;
  },

  deleteContact: async (id: string): Promise<ApiResponse<void>> => {
    const res = await apiClient.delete<ApiResponse<void>>(`/contacts/${id}`);
    return res.data;
  },

  bulkDeleteContacts: async (ids: string[]): Promise<ApiResponse<number>> => {
    const res = await apiClient.delete<ApiResponse<number>>('/contacts', {
      data: { ids },
    });
    return res.data;
  },
};
