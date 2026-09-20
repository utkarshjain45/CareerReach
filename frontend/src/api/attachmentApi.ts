import { apiClient } from './client';
import { ApiResponse, Attachment } from '../types';

export const attachmentApi = {
  getAttachments: async (): Promise<ApiResponse<Attachment[]>> => {
    const res = await apiClient.get<ApiResponse<Attachment[]>>('/attachments');
    return res.data;
  },

  getAttachmentById: async (id: string): Promise<ApiResponse<Attachment>> => {
    const res = await apiClient.get<ApiResponse<Attachment>>(`/attachments/${id}`);
    return res.data;
  },

  uploadAttachment: async (
    file: File,
    onUploadProgress?: (progress: number) => void
  ): Promise<ApiResponse<Attachment>> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient.post<ApiResponse<Attachment>>('/attachments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onUploadProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percent);
        }
      },
    });
    return res.data;
  },

  deleteAttachment: async (id: string): Promise<ApiResponse<void>> => {
    const res = await apiClient.delete<ApiResponse<void>>(`/attachments/${id}`);
    return res.data;
  },

  previewAttachment: async (id: string): Promise<void> => {
    const res = await apiClient.get(`/attachments/${id}/download`, {
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
  },

  downloadAttachment: async (id: string, originalFileName: string): Promise<void> => {
    const res = await apiClient.get(`/attachments/${id}/download`, {
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = originalFileName || 'resume.pdf';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};
