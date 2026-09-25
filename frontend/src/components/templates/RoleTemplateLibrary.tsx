import React, { useState, useMemo } from 'react';
import {
  ROLE_TEMPLATES,
  ROLE_CATEGORIES,
  RoleTemplate,
} from '../../data/roleTemplates';
import { Button } from '../common/Button';
import {
  Search,
  Sparkles,
  Plus,
  Eye,
  Edit3,
  Check,
  Briefcase,
  Users,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { RoleTemplatePreviewModal } from './RoleTemplatePreviewModal';
import { templateApi } from '../../api/templateApi';
import { useToast } from '../../context/ToastContext';

interface RoleTemplateLibraryProps {
  onTemplateAdded: () => void;
  onCustomizeTemplate: (template: RoleTemplate) => void;
}

export const RoleTemplateLibrary: React.FC<RoleTemplateLibraryProps> = ({
  onTemplateAdded,
  onCustomizeTemplate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Roles');
  const [search, setSearch] = useState<string>('');
  const [previewTemplate, setPreviewTemplate] = useState<RoleTemplate | null>(null);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const toast = useToast();

  const filteredTemplates = useMemo(() => {
    return ROLE_TEMPLATES.filter((tpl) => {
      const matchesCategory =
        selectedCategory === 'All Roles' || tpl.category === selectedCategory;

      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        tpl.name.toLowerCase().includes(query) ||
        tpl.role.toLowerCase().includes(query) ||
        tpl.description.toLowerCase().includes(query) ||
        tpl.subject.toLowerCase().includes(query) ||
        tpl.tags.some((tag) => tag.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, search]);

  const handleAddDirectly = async (tpl: RoleTemplate) => {
    setAddingId(tpl.id);
    try {
      await templateApi.createTemplate({
        name: tpl.name,
        subject: tpl.subject,
        body: tpl.body,
      });
      setAddedIds((prev) => new Set([...prev, tpl.id]));
      toast.success(`Added "${tpl.name}" to your templates!`);
      onTemplateAdded();
      if (previewOpen && previewTemplate?.id === tpl.id) {
        setPreviewOpen(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add template to profile');
    } finally {
      setAddingId(null);
    }
  };

  const handleOpenPreview = (tpl: RoleTemplate) => {
    setPreviewTemplate(tpl);
    setPreviewOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner for Role Library */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-coral-500 text-white shadow-card relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Curated Cold Outreach Blueprints
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-snug">
            Role-Specific Email Templates
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-white/90 leading-relaxed">
            Engineered specifically for engineering, AI/ML, DevOps, and product roles. Each blueprint incorporates dynamic variables (such as <code className="bg-white/25 px-1 py-0.5 rounded font-mono font-bold text-[11px]">&#123;&#123;github&#125;&#125;</code> and <code className="bg-white/25 px-1 py-0.5 rounded font-mono font-bold text-[11px]">&#123;&#123;leetcode&#125;&#125;</code>) so you can add them to your profile and deploy high-converting campaigns instantly.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl shadow-card space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
            {ROLE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72 shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              placeholder="Search by role, skills, keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white pl-10 pr-3 py-1.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-500/15 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-700 font-bold">{filteredTemplates.length}</strong> role-ready template{filteredTemplates.length === 1 ? '' : 's'}
          </span>
          <span className="text-[11px] text-slate-400">
            Click &quot;Add to My Templates&quot; to copy any blueprint directly into your profile
          </span>
        </div>
      </div>

      {/* Role Template Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredTemplates.map((tpl) => {
          const isAdded = addedIds.has(tpl.id);
          const isCurrentAdding = addingId === tpl.id;

          return (
            <div
              key={tpl.id}
              className="glass-card p-6 flex flex-col justify-between hover:shadow-card transition-all group border border-slate-200/70 hover:border-brand-200"
            >
              <div>
                {/* Header Strip: Role Badge & High-Yield Pill */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-brand-50 text-brand-700 border border-brand-100">
                      <Briefcase className="w-3 h-3" />
                      {tpl.role}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-600">
                      {tpl.category}
                    </span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    {tpl.badge}
                  </span>
                </div>

                {/* Template Title */}
                <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                  {tpl.name}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {tpl.description}
                </p>

                {/* Subject Box */}
                <div className="mt-3.5 p-2.5 bg-slate-50/90 rounded-xl border border-slate-100 text-xs font-mono text-slate-700 truncate">
                  <strong className="font-sans text-slate-500 text-[11px] uppercase tracking-wider block font-bold mb-0.5">
                    Subject Line:
                  </strong>
                  {tpl.subject}
                </div>

                {/* Tags List */}
                <div className="mt-3 flex flex-wrap gap-1.5 items-center">
                  {tpl.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200/80 text-slate-600 text-[10px] font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Actions Footer */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenPreview(tpl)}
                    className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                    title="Live Preview Template"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>

                  <button
                    onClick={() => onCustomizeTemplate(tpl)}
                    className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                    title="Customize & Add"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Customize</span>
                  </button>
                </div>

                <Button
                  size="sm"
                  variant={isAdded ? 'outline' : 'coral'}
                  pill
                  onClick={() => handleAddDirectly(tpl)}
                  loading={isCurrentAdding}
                  icon={isAdded ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Plus className="w-3.5 h-3.5" />}
                  className="text-xs font-bold"
                >
                  {isAdded ? 'Added to Profile' : 'Add to My Templates'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Role Template Preview Modal */}
      <RoleTemplatePreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        template={previewTemplate}
        onAddToProfile={handleAddDirectly}
        onCustomize={(tpl) => {
          setPreviewOpen(false);
          onCustomizeTemplate(tpl);
        }}
        isAdding={addingId === previewTemplate?.id}
      />
    </div>
  );
};
