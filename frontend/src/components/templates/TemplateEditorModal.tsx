import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { EmailTemplate, TemplateRequest, Attachment, SocialLink } from '../../types';
import { templateApi } from '../../api/templateApi';
import { attachmentApi } from '../../api/attachmentApi';
import { settingsApi } from '../../api/settingsApi';
import { useToast } from '../../context/ToastContext';
import {
  Sparkles,
  AlertTriangle,
  Eye,
  Edit3,
  Check,
  Paperclip,
  FileText,
  Plus,
  Trash2,
  Globe,
  Link2,
  Code,
  Share2,
} from 'lucide-react';

interface TemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  templateToEdit?: EmailTemplate | null;
}

const SUPPORTED_VARIABLES = ['name', 'company', 'position', 'email'];

export const TemplateEditorModal: React.FC<TemplateEditorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  templateToEdit,
}) => {
  const [formData, setFormData] = useState<TemplateRequest>({
    name: '',
    subject: '',
    body: '',
  });
  const [availableAttachments, setAvailableAttachments] = useState<Attachment[]>([]);
  const [selectedAttachmentIds, setSelectedAttachmentIds] = useState<string[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState<boolean>(false);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loadingLinks, setLoadingLinks] = useState<boolean>(false);
  const [showAddLinkForm, setShowAddLinkForm] = useState<boolean>(false);
  const [newLinkName, setNewLinkName] = useState<string>('');
  const [newLinkUrl, setNewLinkUrl] = useState<string>('');
  const [savingLink, setSavingLink] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'compose' | 'preview'>('compose');
  const [activeField, setActiveField] = useState<'subject' | 'body'>('body');

  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      loadAttachments();
      loadSocialLinks();
    }
  }, [isOpen]);

  const loadSocialLinks = async () => {
    setLoadingLinks(true);
    try {
      const res = await settingsApi.getSettings();
      if (res.data?.socialLinks) {
        setSocialLinks(res.data.socialLinks);
      }
    } catch {
      // Non-blocking
    } finally {
      setLoadingLinks(false);
    }
  };

  const loadAttachments = async () => {
    setLoadingAttachments(true);
    try {
      const res = await attachmentApi.getAttachments();
      if (res.data) {
        setAvailableAttachments(res.data);
      }
    } catch {
      // Non-blocking error
    } finally {
      setLoadingAttachments(false);
    }
  };

  useEffect(() => {
    if (templateToEdit) {
      setFormData({
        name: templateToEdit.name,
        subject: templateToEdit.subject,
        body: templateToEdit.body,
      });
      if (templateToEdit.attachments && templateToEdit.attachments.length > 0) {
        setSelectedAttachmentIds(templateToEdit.attachments.map((a) => a.id));
      } else {
        setSelectedAttachmentIds([]);
      }
    } else {
      setFormData({
        name: '',
        subject: '',
        body: '',
      });
      setSelectedAttachmentIds([]);
    }
    setErrors({});
    setActiveTab('compose');
  }, [templateToEdit, isOpen]);

  // Dynamic variables including custom social links
  const allSupportedVariables = [
    ...SUPPORTED_VARIABLES,
    ...socialLinks.map((l) => l.name.toLowerCase().replace(/[^a-z0-9_]/g, '')).filter(Boolean),
  ];

  // Find unknown variables across subject & body
  const findUnknownVariables = (text: string): string[] => {
    const pattern = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
    const unknowns: string[] = [];
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const varName = match[1].toLowerCase();
      if (!allSupportedVariables.includes(varName) && !unknowns.includes(match[0])) {
        unknowns.push(match[0]);
      }
    }
    return unknowns;
  };

  const unknownVariablesInSubject = findUnknownVariables(formData.subject);
  const unknownVariablesInBody = findUnknownVariables(formData.body);
  const allUnknowns = Array.from(new Set([...unknownVariablesInSubject, ...unknownVariablesInBody]));

  // Mock recipient & social link interpolation for preview
  const renderPreview = (text: string): string => {
    let res = text
      .replace(/\{\{\s*name\s*\}\}/gi, 'Alex Morgan')
      .replace(/\{\{\s*company\s*\}\}/gi, 'Acme Innovations')
      .replace(/\{\{\s*position\s*\}\}/gi, 'Lead Software Engineer')
      .replace(/\{\{\s*email\s*\}\}/gi, 'alex.morgan@acme.com');

    socialLinks.forEach((link) => {
      const key = link.name.toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (key) {
        const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'gi');
        res = res.replace(regex, link.url);
      }
    });

    return res;
  };

  // Realistic HTML preview with formatted clickable hyperlinks
  const renderPreviewHtml = (text: string): string => {
    let res = renderPreview(text);
    if (!res) return '';
    // Convert Markdown links [Text](url) to HTML <a href="url">Text</a>
    res = res.replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-brand-600 underline font-semibold hover:text-brand-700">$1</a>'
    );
    // Add nice styling and target="_blank" to any raw <a> tags
    res = res.replace(
      /<a\s+(?!.*?class=)(href=["'][^"']+["'])/gi,
      '<a $1 target="_blank" rel="noopener noreferrer" class="text-brand-600 underline font-semibold hover:text-brand-700"'
    );
    // If content does not contain <p> or <br>, convert newlines to <br/>
    if (!res.toLowerCase().includes('<p>') && !res.toLowerCase().includes('<br')) {
      res = res.replace(/\r\n/g, '<br/>').replace(/\n/g, '<br/>');
    }
    return res;
  };

  const handleAddSocialLink = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newLinkName.trim() || !newLinkUrl.trim()) {
      toast.error('Please enter both a link name and URL');
      return;
    }

    let url = newLinkUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    const newLink: SocialLink = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      name: newLinkName.trim(),
      url: url,
    };

    const updated = [...socialLinks, newLink];
    setSocialLinks(updated);
    setNewLinkName('');
    setNewLinkUrl('');
    setShowAddLinkForm(false);

    try {
      setSavingLink(true);
      const res = await settingsApi.getSettings();
      const current = res.data || {
        maxEmailsPerCampaign: 100,
        sendingDelayMs: 2000,
        defaultTemplateId: null,
      };
      await settingsApi.updatePreferences({
        ...current,
        socialLinks: updated,
      });
      toast.success(`Saved '${newLink.name}' to profile links`);
    } catch {
      // Kept in local state
    } finally {
      setSavingLink(false);
    }
  };

  const handleDeleteSocialLink = async (indexToDelete: number) => {
    const linkToDelete = socialLinks[indexToDelete];
    const updated = socialLinks.filter((_, idx) => idx !== indexToDelete);
    setSocialLinks(updated);

    try {
      const res = await settingsApi.getSettings();
      const current = res.data || {
        maxEmailsPerCampaign: 100,
        sendingDelayMs: 2000,
        defaultTemplateId: null,
      };
      await settingsApi.updatePreferences({
        ...current,
        socialLinks: updated,
      });
      toast.success(`Removed '${linkToDelete.name}'`);
    } catch {
      // Kept in local state
    }
  };

  // Insert as clickable HTML hyperlink: <a href="{{github}}">GitHub</a>
  const insertSocialHyperlink = (link: SocialLink) => {
    const tagKey = link.name.toLowerCase().replace(/[^a-z0-9_]/g, '');
    const href = tagKey ? `{{${tagKey}}}` : link.url;
    const tagToInsert = `<a href="${href}">${link.name}</a>`;
    insertVariable(tagToInsert);
    toast.success(`Inserted ${link.name} hyperlink`);
  };

  const insertSocialLinkText = (link: SocialLink) => {
    const textToInsert = `${link.name}: ${link.url}`;
    insertVariable(textToInsert);
    toast.success(`Inserted ${link.name} URL`);
  };

  const insertAllLinksSignature = (asHyperlinks = true) => {
    if (socialLinks.length === 0) return;
    let formatted = '';
    if (asHyperlinks) {
      const linksHtml = socialLinks
        .map((l) => {
          const tagKey = l.name.toLowerCase().replace(/[^a-z0-9_]/g, '');
          const href = tagKey ? `{{${tagKey}}}` : l.url;
          return `<a href="${href}">${l.name}</a>`;
        })
        .join(' • ');
      formatted = `\n\nConnect with me: ${linksHtml}`;
    } else {
      formatted = '\n\n' + socialLinks.map((l) => `${l.name}: ${l.url}`).join('\n');
    }
    insertVariable(formatted);
    toast.success(asHyperlinks ? 'Inserted hyperlinked signature' : 'Inserted plain signature');
  };

  const insertVariable = (variableTag: string) => {
    if (activeField === 'subject') {
      const input = subjectRef.current;
      if (!input) return;
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const val = formData.subject;
      const newVal = val.substring(0, start) + variableTag + val.substring(end);
      setFormData({ ...formData, subject: newVal });
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + variableTag.length, start + variableTag.length);
      }, 0);
    } else {
      const textarea = bodyRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      const val = formData.body;
      const newVal = val.substring(0, start) + variableTag + val.substring(end);
      setFormData({ ...formData, body: newVal });
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variableTag.length, start + variableTag.length);
      }, 0);
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Template name is required';
    if (!formData.subject.trim()) errs.subject = 'Subject line is required';
    if (!formData.body.trim()) errs.body = 'Email body is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const payload: TemplateRequest = {
      ...formData,
      attachmentIds: selectedAttachmentIds,
    };

    try {
      if (templateToEdit) {
        await templateApi.updateTemplate(templateToEdit.id, payload);
        toast.success('Template updated successfully');
      } else {
        await templateApi.createTemplate(payload);
        toast.success('Template created successfully');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save template';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={templateToEdit ? 'Edit Template' : 'New Outreach Template'}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Mode Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('compose')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'compose'
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Compose
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'preview'
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Email Preview
            </button>
          </div>

          <span className="text-[11px] text-slate-400 font-mono">
            {formData.body.length} chars in body
          </span>
        </div>

        {/* Template Name */}
        <Input
          label="Internal Template Name"
          placeholder="e.g. Senior Software Engineer Outreach — Series B"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          required
        />

        {activeTab === 'compose' ? (
          <div className="space-y-4">
            {/* Real email client styling container */}
            <div className="rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
              {/* Recipient Simulation Header */}
              <div className="bg-slate-50/70 px-3.5 py-2 border-b border-slate-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="font-semibold text-slate-700">To:</span>
                  <span className="font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {'{{name}}'} &lt;{'{{email}}'}&gt;
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">Recruiter Recipient</span>
              </div>

              {/* Subject line input */}
              <div className="px-3.5 py-2.5 border-b border-slate-200/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700 w-14 shrink-0">Subject:</span>
                  <input
                    ref={subjectRef}
                    type="text"
                    placeholder="e.g. Exploring Senior Engineering roles at {{company}}"
                    value={formData.subject}
                    onFocus={() => setActiveField('subject')}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full text-xs text-slate-900 bg-transparent placeholder:text-slate-400 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {formData.subject.length} chars
                  </span>
                </div>
                {errors.subject && <p className="text-[11px] text-rose-500 mt-1">{errors.subject}</p>}
              </div>

              {/* Body Textarea */}
              <div className="p-3.5">
                <textarea
                  ref={bodyRef}
                  rows={8}
                  placeholder={`Hi {{name}},\n\nI noticed your work leading engineering teams at {{company}}. I wanted to reach out regarding {{position}} opportunities and see if you have 10 minutes to connect this week.\n\nBest regards,\n[Your Name]`}
                  value={formData.body}
                  onFocus={() => setActiveField('body')}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="w-full text-xs font-sans text-slate-800 bg-transparent placeholder:text-slate-400 focus:outline-none leading-relaxed resize-y"
                />
                {errors.body && <p className="text-[11px] text-rose-500 mt-1">{errors.body}</p>}
              </div>
            </div>

            {/* Available Variables Insertion Bar */}
            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                  Insert Dynamic Variables (Click to add to {activeField}):
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className="text-brand-600 hover:text-brand-700 font-semibold inline-flex items-center gap-1 text-[11px]"
                >
                  <span>Preview Email</span>
                  <span>&rarr;</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { tag: '{{name}}', label: 'Candidate Name' },
                  { tag: '{{company}}', label: 'Company Name' },
                  { tag: '{{position}}', label: 'Position / Role' },
                  { tag: '{{email}}', label: 'Email Address' },
                ].map(({ tag, label }) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => insertVariable(tag)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-slate-200 hover:border-brand-500 hover:text-brand-600 text-slate-700 shadow-2xs transition-all active:scale-95"
                  >
                    <span className="font-mono text-brand-600 font-bold">{tag}</span>
                    <span className="text-[10px] text-slate-400">({label})</span>
                  </button>
                ))}

                {socialLinks.map((link) => {
                  const tagKey = link.name.toLowerCase().replace(/[^a-z0-9_]/g, '');
                  if (!tagKey) return null;
                  const tag = `{{${tagKey}}}`;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => insertVariable(tag)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50/60 border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100/60 text-emerald-800 shadow-2xs transition-all active:scale-95"
                    >
                      <span className="font-mono text-emerald-700 font-bold">{tag}</span>
                      <span className="text-[10px] text-emerald-600">({link.name})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Candidate Social & Portfolio Links Management */}
            <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-brand-600" />
                    Candidate Profile & Social Links:
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Add GitHub, LeetCode, portfolio, or other profile links to insert them into your outreach emails.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  {socialLinks.length > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={() => insertAllLinksSignature(true)}
                        className="px-2 py-1 text-[11px] font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-lg transition-colors flex items-center gap-1"
                        title="Insert all links as clickable hyperlinks in your email signature"
                      >
                        <Link2 className="w-3 h-3 text-brand-600" />
                        Hyperlinked Signature
                      </button>
                      <button
                        type="button"
                        onClick={() => insertAllLinksSignature(false)}
                        className="px-2 py-1 text-[11px] font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1"
                        title="Insert all links as plain URLs"
                      >
                        <Share2 className="w-3 h-3 text-slate-400" />
                        Plain URLs
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowAddLinkForm(!showAddLinkForm)}
                    className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3 text-brand-600" />
                    {showAddLinkForm ? 'Close' : '+ Add Link'}
                  </button>
                </div>
              </div>

              {/* Add Link Form */}
              {showAddLinkForm && (
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Quick Suggestions:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { name: 'GitHub', placeholder: 'https://github.com/yourname' },
                        { name: 'LeetCode', placeholder: 'https://leetcode.com/yourname' },
                        { name: 'LinkedIn', placeholder: 'https://linkedin.com/in/yourname' },
                        { name: 'Portfolio', placeholder: 'https://yourname.dev' },
                        { name: 'Codeforces', placeholder: 'https://codeforces.com/profile/yourname' },
                        { name: 'Twitter', placeholder: 'https://x.com/yourname' },
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            setNewLinkName(preset.name);
                            if (!newLinkUrl) setNewLinkUrl(preset.placeholder);
                          }}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors ${
                            newLinkName.toLowerCase() === preset.name.toLowerCase()
                              ? 'bg-brand-50 text-brand-700 border-brand-300'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Platform / Label Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. GitHub, LeetCode, Portfolio"
                        value={newLinkName}
                        onChange={(e) => setNewLinkName(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Profile URL *
                      </label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => {
                        setShowAddLinkForm(false);
                        setNewLinkName('');
                        setNewLinkUrl('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      type="button"
                      onClick={handleAddSocialLink}
                      loading={savingLink}
                      disabled={!newLinkName.trim() || !newLinkUrl.trim()}
                    >
                      Save Link
                    </Button>
                  </div>
                </div>
              )}

              {/* Links Cards */}
              {loadingLinks ? (
                <div className="text-xs text-slate-400 py-2 text-center">Loading links...</div>
              ) : socialLinks.length === 0 ? (
                <div className="text-xs text-slate-500 bg-white p-3 rounded-lg border border-dashed border-slate-200 flex items-center justify-between">
                  <span>No profile links added yet. Add your GitHub, LeetCode, or portfolio to easily include them in your emails.</span>
                  <button
                    type="button"
                    onClick={() => setShowAddLinkForm(true)}
                    className="text-brand-600 font-semibold hover:underline text-[11px] shrink-0 ml-2"
                  >
                    + Add first link
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {socialLinks.map((link, idx) => {
                    const tagKey = link.name.toLowerCase().replace(/[^a-z0-9_]/g, '');
                    return (
                      <div
                        key={link.id || idx}
                        className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2 group hover:border-slate-300 transition-all shadow-2xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200/80">
                            {link.name.toLowerCase().includes('github') ? (
                              <Code className="w-3.5 h-3.5 text-slate-800" />
                            ) : link.name.toLowerCase().includes('leetcode') ? (
                              <span className="text-[10px] font-bold text-amber-600">LC</span>
                            ) : link.name.toLowerCase().includes('portfolio') ? (
                              <Globe className="w-3.5 h-3.5 text-blue-600" />
                            ) : (
                              <Link2 className="w-3.5 h-3.5 text-slate-600" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-800 truncate">{link.name}</p>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-slate-400 hover:text-brand-600 truncate block transition-colors"
                              title={link.url}
                            >
                              {link.url.replace(/^https?:\/\//i, '')}
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => insertSocialHyperlink(link)}
                            className="px-2 py-1 text-[10px] font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-md transition-colors flex items-center gap-0.5"
                            title={`Insert clickable hyperlink: <a href="{{${tagKey}}}">${link.name}</a>`}
                          >
                            <Link2 className="w-2.5 h-2.5" />
                            Hyperlink
                          </button>
                          <button
                            type="button"
                            onClick={() => insertSocialLinkText(link)}
                            className="px-1.5 py-1 text-[10px] font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors"
                            title="Insert URL text"
                          >
                            URL
                          </button>
                          {tagKey && (
                            <button
                              type="button"
                              onClick={() => insertVariable(`{{${tagKey}}}`)}
                              className="px-1.5 py-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors"
                              title={`Insert dynamic tag {{${tagKey}}}`}
                            >
                              {`{{${tagKey}}}`}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteSocialLink(idx)}
                            className="p-1 text-slate-300 hover:text-rose-500 rounded-md transition-colors"
                            title="Delete link"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Unknown Variable Warning */}
            {allUnknowns.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Unknown variables detected:</span>
                  <span>
                    {allUnknowns.join(', ')} may not render correctly. Supported variables: {' '}
                    <code>{'{{name}}'}</code>, <code>{'{{company}}'}</code>, <code>{'{{position}}'}</code>, <code>{'{{email}}'}</code>.
                  </span>
                </div>
              </div>
            )}

            {/* Template Attachments Selection */}
            <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-brand-600" />
                  Attached Resume / PDF Documents:
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {selectedAttachmentIds.length} {selectedAttachmentIds.length === 1 ? 'selected' : 'selected'}
                </span>
              </div>

              {loadingAttachments ? (
                <div className="text-xs text-slate-400 py-3 text-center">Loading attachments...</div>
              ) : availableAttachments.length === 0 ? (
                <div className="text-xs text-slate-500 bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                  <span>No attachments in your library yet.</span>
                  <a
                    href="/attachments"
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-600 font-semibold hover:underline inline-flex items-center gap-1 text-[11px]"
                  >
                    Upload Resume &rarr;
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableAttachments.map((att) => {
                    const isChecked = selectedAttachmentIds.includes(att.id);
                    return (
                      <button
                        key={att.id}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setSelectedAttachmentIds(selectedAttachmentIds.filter((id) => id !== att.id));
                          } else {
                            setSelectedAttachmentIds([...selectedAttachmentIds, att.id]);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all ${
                          isChecked
                            ? 'bg-brand-50/60 border-brand-500 text-brand-900 ring-1 ring-brand-500/20'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className={`w-4 h-4 shrink-0 ${isChecked ? 'text-brand-600' : 'text-rose-500'}`} />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold truncate">{att.originalFileName}</p>
                            <p className="text-[10px] text-slate-400">
                              {(att.fileSize / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            isChecked ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Realistic Email Preview Screen */
          <div className="rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-500">
                <span><strong>To:</strong> Alex Morgan &lt;alex.morgan@acme.com&gt;</span>
                <span className="text-[10px] bg-brand-50 text-brand-700 px-2 py-0.5 rounded font-medium">Sample Recruiter</span>
              </div>
              <div className="text-slate-800">
                <strong>Subject:</strong> {renderPreview(formData.subject) || <span className="text-slate-400 italic font-normal">(No subject line)</span>}
              </div>
            </div>

            <div
              className="p-5 text-xs text-slate-800 font-sans leading-relaxed min-h-[200px]"
              dangerouslySetInnerHTML={{
                __html:
                  renderPreviewHtml(formData.body) ||
                  '<span class="text-slate-400 italic">Email body is empty. Switch to the Compose tab to write your template.</span>',
              }}
            />

            {/* Attached files preview */}
            {selectedAttachmentIds.length > 0 && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs space-y-2">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-brand-600" />
                  Attachments ({selectedAttachmentIds.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {availableAttachments
                    .filter((a) => selectedAttachmentIds.includes(a.id))
                    .map((att) => (
                      <div
                        key={att.id}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs text-xs font-medium"
                      >
                        <FileText className="w-4 h-4 text-rose-500" />
                        <span className="font-semibold">{att.originalFileName}</span>
                        <span className="text-[10px] text-slate-400">
                          ({(att.fileSize / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="p-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Preview rendered using sample candidate details</span>
              <button
                type="button"
                onClick={() => setActiveTab('compose')}
                className="text-brand-600 font-semibold hover:underline"
              >
                &larr; Back to Compose
              </button>
            </div>
          </div>
        )}

        {/* Actions - scrolls naturally with the form content */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5 mt-6 pb-2">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" loading={submitting}>
            {templateToEdit ? 'Save Changes' : 'Create Template'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
