import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  FileText,
  Eye,
  Trash2,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/SkeletonLoader';
import { attachmentApi } from '../api/attachmentApi';
import { Attachment } from '../types';
import { useToast } from '../context/ToastContext';

export const AttachmentsPage: React.FC = () => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);

  // Delete modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState<Attachment | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const fetchAttachments = async () => {
    setLoading(true);
    try {
      const res = await attachmentApi.getAttachments();
      if (res.data) {
        setAttachments(res.data);
      }
    } catch {
      toast.error('Failed to load attachments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateStr: string): string => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const validateFile = (file: File): string | null => {
    if (!file.name.toLowerCase().endsWith('.pdf') || file.type !== 'application/pdf') {
      return 'Only PDF files are supported. Please select a valid .pdf file.';
    }
    if (file.size > 5 * 1024 * 1024) {
      return 'File size exceeds the 5 MB limit. Please select a smaller PDF.';
    }
    if (file.size === 0) {
      return 'The selected file is empty. Please select a valid PDF file.';
    }
    return null;
  };

  const handleFileSelect = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setUploadError(error);
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
    setUploadError(null);
    setUploadSuccess(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      const res = await attachmentApi.uploadAttachment(selectedFile, (percent) => {
        setUploadProgress(percent);
      });

      if (res.data) {
        setUploadSuccess(true);
        toast.success(`'${selectedFile.name}' uploaded successfully`);
        fetchAttachments();
        setTimeout(() => {
          setUploadModalOpen(false);
          resetUploadState();
        }, 1200);
      }
    } catch (err: any) {
      const rawMsg: string = err.response?.data?.message || '';
      let userMsg = 'Failed to upload PDF. Please ensure it is a valid PDF under 5 MB and try again.';
      // Only display readable, user-friendly messages from the backend
      const isTechnical =
        !rawMsg ||
        rawMsg.includes('{') ||
        rawMsg.includes('PGRST') ||
        rawMsg.includes('Supabase') ||
        rawMsg.includes('status ') ||
        rawMsg.includes('com.') ||
        rawMsg.includes('Exception') ||
        rawMsg.includes('transaction') ||
        rawMsg.includes('Hibernate') ||
        rawMsg.includes('Row was') ||
        rawMsg.includes('mapping');

      if (!isTechnical) {
        userMsg = rawMsg;
      }
      setUploadError(userMsg);
    } finally {
      setUploading(false);
    }
  };

  const resetUploadState = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploading(false);
    setUploadError(null);
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePreview = async (attachment: Attachment) => {
    try {
      await attachmentApi.previewAttachment(attachment.id);
    } catch {
      toast.error('Failed to preview attachment. Please try downloading it.');
    }
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      await attachmentApi.downloadAttachment(attachment.id, attachment.originalFileName);
      toast.success('Download started');
    } catch {
      toast.error('Failed to download attachment');
    }
  };

  const handleDelete = async () => {
    if (!attachmentToDelete) return;
    setDeleting(true);
    try {
      await attachmentApi.deleteAttachment(attachmentToDelete.id);
      toast.success(`Deleted '${attachmentToDelete.originalFileName}'`);
      setDeleteConfirmOpen(false);
      setAttachmentToDelete(null);
      fetchAttachments();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete attachment';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>My Attachments</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {attachments.length} {attachments.length === 1 ? 'file' : 'files'}
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Securely store your resume and other supported PDF documents for use in outreach campaigns.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            resetUploadState();
            setUploadModalOpen(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          Upload PDF
        </Button>
      </div>

      {/* Security Banner */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-800 block">Private & Encrypted Object Storage</span>
            <span>Your PDFs are securely stored in private cloud storage and only attached to emails you explicitly send.</span>
          </div>
        </div>
        <span className="hidden md:inline-block text-[11px] text-slate-400 font-medium">Max 5 MB • PDF only</span>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : attachments.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-8 h-8 text-brand-600" />}
          title="No attachments yet"
          description="Upload your resume PDF to use it in your recruitment outreach campaigns."
          actionLabel="Upload PDF"
          onAction={() => {
            resetUploadState();
            setUploadModalOpen(true);
          }}
          actionIcon={<Plus className="w-4 h-4" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3
                        className="text-sm font-bold text-slate-900 truncate group-hover:text-brand-600 transition-colors"
                        title={att.originalFileName}
                      >
                        {att.originalFileName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        PDF • {formatFileSize(att.fileSize)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Uploaded:</span>
                  <span className="font-medium text-slate-600">{formatDate(att.createdAt)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreview(att)}
                  icon={<Eye className="w-3.5 h-3.5" />}
                >
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(att)}
                  icon={<Download className="w-3.5 h-3.5" />}
                >
                  Download
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    setAttachmentToDelete(att);
                    setDeleteConfirmOpen(true);
                  }}
                  icon={<Trash2 className="w-3.5 h-3.5" />}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload PDF Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => {
          if (!uploading) {
            setUploadModalOpen(false);
            resetUploadState();
          }
        }}
        title="Upload Resume PDF"
        subtitle="Upload a PDF document to attach to your cold outreach campaigns."
        maxWidth="md"
      >
        <div className="space-y-4">
          {/* Drag and drop zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              dragActive
                ? 'border-brand-500 bg-brand-50/50 scale-[0.99]'
                : selectedFile
                ? 'border-emerald-300 bg-emerald-50/30'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            {selectedFile ? (
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 truncate max-w-[280px] mx-auto">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formatFileSize(selectedFile.size)} • PDF Ready
                  </p>
                </div>
                {!uploading && !uploadSuccess && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-xs text-slate-500 hover:text-rose-600 font-medium underline transition-colors"
                  >
                    Choose a different file
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Drop your PDF here
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    or click to browse from your computer
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose PDF
                </Button>
                <p className="text-[11px] text-slate-400">
                  Supported format: <strong>PDF only</strong> • Max size: <strong>5 MB</strong>
                </p>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-600" />
                  Uploading securely to private storage...
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-600 transition-all duration-200 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Success message */}
          {uploadSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Resume uploaded successfully!</span>
            </div>
          )}

          {/* Error message */}
          {uploadError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => {
                setUploadModalOpen(false);
                resetUploadState();
              }}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="button"
              onClick={handleUpload}
              loading={uploading}
              disabled={!selectedFile || uploadSuccess}
            >
              Upload PDF
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setAttachmentToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Attachment"
        message={`Are you sure you want to delete '${attachmentToDelete?.originalFileName}'? It will be removed from your library and private storage.`}
        confirmText="Delete Attachment"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};
