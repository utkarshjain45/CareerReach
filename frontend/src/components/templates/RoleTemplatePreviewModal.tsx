import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { RoleTemplate } from '../../data/roleTemplates';
import {
  Sparkles,
  Plus,
  Edit3,
  Copy,
  Check,
  Briefcase,
  Users,
  Code2,
  Mail,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface RoleTemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: RoleTemplate | null;
  onAddToProfile: (template: RoleTemplate) => Promise<void>;
  onCustomize: (template: RoleTemplate) => void;
  isAdding: boolean;
}

export const RoleTemplatePreviewModal: React.FC<RoleTemplatePreviewModalProps> = ({
  isOpen,
  onClose,
  template,
  onAddToProfile,
  onCustomize,
  isAdding,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'raw'>('preview');
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  if (!template) return null;

  // Render mock personalized preview
  const sampleValues: Record<string, string> = {
    name: 'Alex Rivera',
    company: 'Stripe',
    position: template.role,
    email: 'alex.rivera@stripe.com',
    github: 'https://github.com/your-username',
    leetcode: 'https://leetcode.com/your-profile',
    portfolio: 'https://your-portfolio.dev',
  };

  const renderSubject = (rawSubject: string): string => {
    return rawSubject
      .replace(/\{\{\s*name\s*\}\}/gi, sampleValues.name)
      .replace(/\{\{\s*company\s*\}\}/gi, sampleValues.company)
      .replace(/\{\{\s*position\s*\}\}/gi, sampleValues.position);
  };

  const renderBody = (rawBody: string): string => {
    return rawBody
      .replace(/\{\{\s*name\s*\}\}/gi, sampleValues.name)
      .replace(/\{\{\s*company\s*\}\}/gi, sampleValues.company)
      .replace(/\{\{\s*position\s*\}\}/gi, sampleValues.position)
      .replace(/\{\{\s*github\s*\}\}/gi, sampleValues.github)
      .replace(/\{\{\s*leetcode\s*\}\}/gi, sampleValues.leetcode)
      .replace(/\{\{\s*portfolio\s*\}\}/gi, sampleValues.portfolio);
  };

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(`Subject: ${template.subject}\n\n${template.body}`);
    setCopied(true);
    toast.success('Template copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={template.name}
      subtitle={`Curated Role Template for ${template.role}`}
      maxWidth="3xl"
    >
      <div className="space-y-5">
        {/* Role & Category Badge Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-brand-50 text-brand-700 border border-brand-100">
              <Briefcase className="w-3.5 h-3.5" />
              {template.role}
            </span>
            <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-white text-slate-600 border border-slate-200">
              {template.category}
            </span>
            <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {template.badge}
            </span>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>Target: <strong className="text-slate-700 font-semibold">{template.suggestedAudience}</strong></span>
          </div>
        </div>

        {/* View Switcher: Rendered vs Raw */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'preview'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-coral-500" />
              Live Sample Preview
            </button>
            <button
              onClick={() => setActiveTab('raw')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'raw'
                  ? 'bg-white text-brand-600 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-brand-600" />
              Raw Template &amp; Variables
            </button>
          </div>

          <button
            onClick={handleCopyRaw}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Text'}
          </button>
        </div>

        {/* Subject Display */}
        <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Subject Line
          </span>
          <div className="text-xs sm:text-sm font-semibold text-slate-900">
            {activeTab === 'preview' ? renderSubject(template.subject) : template.subject}
          </div>
        </div>

        {/* Body Display */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Email Message Content
          </span>
          {activeTab === 'preview' ? (
            <div className="text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed font-sans">
              {renderBody(template.body)}
            </div>
          ) : (
            <div className="text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed font-mono bg-slate-50/60 p-4 rounded-xl border border-slate-100">
              {template.body}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-semibold mr-1">Skills &amp; Keywords:</span>
          {template.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium text-[11px]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Informational tip */}
        <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Adding this template to your profile saves a personal copy you can edit anytime. Dynamic variables like <code className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-mono text-[11px] font-bold">&#123;&#123;github&#125;&#125;</code> and <code className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-mono text-[11px] font-bold">&#123;&#123;leetcode&#125;&#125;</code> automatically pull links from your <strong>Settings</strong> page.
          </span>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isAdding}>
            Close
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Edit3 className="w-3.5 h-3.5" />}
              onClick={() => {
                onClose();
                onCustomize(template);
              }}
              disabled={isAdding}
            >
              Customize &amp; Add
            </Button>
            <Button
              variant="coral"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => onAddToProfile(template)}
              loading={isAdding}
            >
              Add to My Templates
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
