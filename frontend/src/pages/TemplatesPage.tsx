import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  FileText,
  Eye,
  Edit2,
  Copy,
  Trash2,
  Search,
  Link2,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/SkeletonLoader';
import { TemplateEditorModal } from '../components/templates/TemplateEditorModal';
import { TemplatePreviewModal } from '../components/templates/TemplatePreviewModal';
import { RoleTemplateLibrary } from '../components/templates/RoleTemplateLibrary';
import { RoleTemplate } from '../data/roleTemplates';
import { templateApi } from '../api/templateApi';
import { EmailTemplate, TemplateRequest } from '../types';
import { useToast } from '../context/ToastContext';

export const TemplatesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'my-templates' | 'role-library'>('my-templates');
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  // Modals
  const [editorOpen, setEditorOpen] = useState<boolean>(false);
  const [templateToEdit, setTemplateToEdit] = useState<EmailTemplate | null>(null);
  const [initialValues, setInitialValues] = useState<Partial<TemplateRequest> | null>(null);

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
    setInitialValues(null);
    setEditorOpen(true);
  };

  const handleCustomizeRoleTemplate = (tpl: RoleTemplate) => {
    setTemplateToEdit(null);
    setInitialValues({
      name: tpl.name,
      subject: tpl.subject,
      body: tpl.body,
    });
    setEditorOpen(true);
  };

  const handleEdit = (template: EmailTemplate) => {
    setTemplateToEdit(template);
    setInitialValues(null);
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
    <div className="space-y-6 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Email Templates</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Compose and manage personalized outreach messages or browse curated blueprints for specific roles.
          </p>
        </div>

        {/* Dynamic header button */}
        <div className="flex items-center gap-2">
          {activeTab === 'my-templates' ? (
            <>
              <Button
                variant="outline"
                size="sm"
                pill
                onClick={() => setActiveTab('role-library')}
                icon={<Sparkles className="w-3.5 h-3.5 text-brand-600" />}
              >
                Browse Role Library
              </Button>
              <Button variant="coral" size="sm" pill onClick={handleCreate} icon={<Plus className="w-3.5 h-3.5" />}>
                New Template
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                pill
                onClick={() => setActiveTab('my-templates')}
              >
                &larr; View My Templates ({templates.length})
              </Button>
              <Button variant="coral" size="sm" pill onClick={handleCreate} icon={<Plus className="w-3.5 h-3.5" />}>
                New Template
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Primary Tab Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200/50 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('my-templates')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'my-templates'
              ? 'bg-white text-slate-900 shadow-card'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-slate-500" />
          <span>My Templates</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
            activeTab === 'my-templates' ? 'bg-slate-100 text-slate-900' : 'bg-slate-200/80 text-slate-600'
          }`}>
            {templates.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('role-library')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'role-library'
              ? 'bg-brand-600 text-white shadow-card'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className={`w-4 h-4 ${activeTab === 'role-library' ? 'text-white' : 'text-brand-600'}`} />
          <span>Role Template Library</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
            activeTab === 'role-library' ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-800'
          }`}>
            10 Curated
          </span>
        </button>
      </div>

      {/* Role Template Library View */}
      {activeTab === 'role-library' ? (
        <RoleTemplateLibrary
          onTemplateAdded={() => fetchTemplates(search)}
          onCustomizeTemplate={handleCustomizeRoleTemplate}
        />
      ) : (
        /* My Templates View */
        <div className="space-y-5">
          {/* Platform Links Variable Tip Banner */}
          <div className="glass-panel p-4 rounded-2xl shadow-xs border border-amber-200/60 bg-gradient-to-r from-amber-50/60 via-white to-brand-50/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Link2 className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-800 block">
                  Auto-Attach GitHub, LeetCode &amp; Portfolio Links via Variables
                </span>
                <span className="text-slate-500">
                  Save your links once in <Link to="/settings" className="text-brand-600 font-semibold underline">Settings</Link>. Use <code className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-mono text-[11px] font-bold">&#123;&#123;github&#125;&#125;</code>, <code className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-mono text-[11px] font-bold">&#123;&#123;leetcode&#125;&#125;</code>, and <code className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-mono text-[11px] font-bold">&#123;&#123;portfolio&#125;&#125;</code> so you never have to copy-paste URLs every time.
                </span>
              </div>
            </div>
            <Link to="/settings" className="shrink-0 text-xs font-bold text-amber-800 bg-amber-100/80 hover:bg-amber-200/80 px-3 py-1.5 rounded-xl transition-colors">
              Manage Links
            </Link>
          </div>

          {/* Search Bar */}
      <div className="glass-panel p-3.5 rounded-2xl shadow-card flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            placeholder="Search templates by name, subject, or body..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white pl-10 pr-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-500/15 transition-all"
          />
        </div>

        <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
          {templates.length} template{templates.length === 1 ? '' : 's'} available
        </span>
      </div>

      {/* Templates Grid / List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : templates.length === 0 ? (
        <div className="space-y-4">
          <EmptyState
            icon={<FileText className="w-6 h-6 text-brand-600" />}
            title="No email templates found"
            description={
              search
                ? `No templates match "${search}". Try another search query.`
                : 'Create your first personalized email template or pick from our curated role-based blueprints.'
            }
            actionLabel="Create Custom Template"
            onAction={handleCreate}
            actionIcon={<Plus className="w-3.5 h-3.5" />}
          />
          {!search && (
            <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-brand-200/80 bg-gradient-to-r from-brand-50/50 via-white to-coral-50/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-xs">
              <div>
                <span className="font-bold text-slate-800 text-xs sm:text-sm block">
                  Don&apos;t want to write outreach messages from scratch?
                </span>
                <span className="text-slate-500 text-xs mt-0.5 block">
                  We have 10 pre-engineered templates for Full Stack, Frontend, Backend, AI/ML, DevOps, and more.
                </span>
              </div>
              <Button
                variant="coral"
                size="sm"
                pill
                onClick={() => setActiveTab('role-library')}
                icon={<Sparkles className="w-3.5 h-3.5" />}
                className="shrink-0 font-bold"
              >
                Browse Role Library
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="glass-card p-6 flex flex-col justify-between"
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
        </div>
      )}

      {/* Create / Edit Modal */}
      <TemplateEditorModal
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSuccess={() => fetchTemplates(search)}
        templateToEdit={templateToEdit}
        initialValues={initialValues}
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
