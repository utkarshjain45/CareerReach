import React, { useState, useEffect } from 'react';
import {
  Plus,
  FileText,
  Eye,
  Edit2,
  Copy,
  Trash2,
  Search,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/SkeletonLoader';
import { TemplateEditorModal } from '../components/templates/TemplateEditorModal';
import { TemplatePreviewModal } from '../components/templates/TemplatePreviewModal';
import { templateApi } from '../api/templateApi';
import { EmailTemplate } from '../types';
import { useToast } from '../context/ToastContext';

export const TemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  // Modals
  const [editorOpen, setEditorOpen] = useState<boolean>(false);
  const [templateToEdit, setTemplateToEdit] = useState<EmailTemplate | null>(null);

  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [templateToPreview, setTemplateToPreview] = useState<EmailTemplate | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const toast = useToast();

  const fetchTemplates = async (searchTerm?: string) => {
    setLoading(true);
    try {
      const res = await templateApi.getTemplates(searchTerm);
      if (res.data) {
        setTemplates(res.data);
      }
    } catch {
      toast.error('Failed to load email templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchTemplates(search);
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handleCreate = () => {
    setTemplateToEdit(null);
    setEditorOpen(true);
  };

  const handleEdit = (template: EmailTemplate) => {
    setTemplateToEdit(template);
    setEditorOpen(true);
  };

  const handlePreview = (template: EmailTemplate) => {
    setTemplateToPreview(template);
    setPreviewOpen(true);
  };

  const handleDuplicate = async (template: EmailTemplate) => {
    try {
      await templateApi.duplicateTemplate(template.id);
      toast.success(`Duplicated "${template.name}"`);
      fetchTemplates(search);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to duplicate template');
    }
  };

  const confirmDelete = (template: EmailTemplate) => {
    setTemplateToDelete(template);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!templateToDelete) return;
    setDeleting(true);
    try {
      await templateApi.deleteTemplate(templateToDelete.id);
      toast.success('Template deleted successfully');
      setDeleteConfirmOpen(false);
      setTemplateToDelete(null);
      fetchTemplates(search);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete template');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Email Templates</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Compose and manage personalized outreach messages with variable tags.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleCreate} icon={<Plus className="w-3.5 h-3.5" />}>
          New Template
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            placeholder="Search templates by name, subject, or body..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100 transition-colors"
          />
        </div>

        <span className="text-xs text-slate-400 hidden sm:inline">
          {templates.length} template{templates.length === 1 ? '' : 's'} found
        </span>
      </div>

      {/* Templates Grid / List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : templates.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-6 h-6 text-brand-600" />}
          title="No email templates found"
          description={
            search
              ? `No templates match "${search}". Try another search query.`
              : 'Create your first personalized email template to use across recruitment campaigns.'
          }
          actionLabel="Create Template"
          onAction={handleCreate}
          actionIcon={<Plus className="w-3.5 h-3.5" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {tpl.name}
                  </h3>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handlePreview(tpl)}
                      className="p-1 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                      title="Preview Email"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(tpl)}
                      className="p-1 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                      title="Duplicate Template"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleEdit(tpl)}
                      className="p-1 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                      title="Edit Template"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => confirmDelete(tpl)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="Delete Template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subject Preview */}
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 mb-3 font-mono truncate">
                  <strong className="font-sans text-slate-700">Subject:</strong> {tpl.subject}
                </div>

                {/* Body snippet */}
                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                  {tpl.body}
                </p>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Created {new Date(tpl.createdAt).toLocaleDateString()}</span>
                <button
                  onClick={() => handlePreview(tpl)}
                  className="text-brand-600 font-semibold hover:underline"
                >
                  View Details &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <TemplateEditorModal
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSuccess={() => fetchTemplates(search)}
        templateToEdit={templateToEdit}
      />

      {/* Preview Modal */}
      <TemplatePreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        template={templateToPreview}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Template"
        message={`Are you sure you want to delete "${templateToDelete?.name}"? Any active campaigns already using this template will continue uninterrupted.`}
        loading={deleting}
      />
    </div>
  );
};
