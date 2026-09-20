import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { Contact, EmailTemplate, TemplatePreviewResponse } from '../../types';
import { templateApi } from '../../api/templateApi';
import { contactApi } from '../../api/contactApi';
import { Eye, ShieldAlert, UserCheck, Loader2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: EmailTemplate | null;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  isOpen,
  onClose,
  template,
}) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [previewData, setPreviewData] = useState<TemplatePreviewResponse | null>(null);
  const [loadingContacts, setLoadingContacts] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const toast = useToast();

  useEffect(() => {
    if (isOpen && template) {
      loadContacts();
    } else {
      setPreviewData(null);
      setSelectedContactId('');
    }
  }, [isOpen, template]);

  const loadContacts = async () => {
    setLoadingContacts(true);
    try {
      const res = await contactApi.getAllContacts();
      if (res.data) {
        setContacts(res.data);
        if (res.data.length > 0) {
          setSelectedContactId(res.data[0].id);
          fetchPreview(res.data[0].id);
        } else {
          // Default fallback preview
          fetchPreview();
        }
      }
    } catch {
      toast.error('Failed to load contacts for preview');
      fetchPreview();
    } finally {
      setLoadingContacts(false);
    }
  };

  const fetchPreview = async (contactId?: string) => {
    if (!template) return;
    setGenerating(true);
    try {
      const res = await templateApi.previewTemplate(
        template.id,
        contactId ? { contactId } : undefined
      );
      if (res.data) {
        setPreviewData(res.data);
      }
    } catch (err: any) {
      toast.error('Failed to generate template preview');
    } finally {
      setGenerating(false);
    }
  };

  const handleContactChange = (contactId: string) => {
    setSelectedContactId(contactId);
    fetchPreview(contactId);
  };

  if (!template) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Personalized Email Preview"
      subtitle={`Template: ${template.name}`}
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Distinct Preview Banner */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-300 text-amber-900 text-xs font-semibold">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <span className="font-bold uppercase tracking-wider text-amber-800">
              Preview Mode Only:
            </span>{' '}
            This is a mock rendering test with substituted variables. No emails will be sent.
          </div>
        </div>

        {/* Contact Selector */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-brand-600" />
              <span>Select Recipient to Personalize:</span>
            </label>
            {contacts.length === 0 && !loadingContacts && (
              <span className="text-[11px] text-slate-400 italic">
                (Using demo candidate data - upload contacts to test real data)
              </span>
            )}
          </div>

          {loadingContacts ? (
            <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
              <span>Loading your contacts...</span>
            </div>
          ) : contacts.length > 0 ? (
            <Select
              value={selectedContactId}
              onChange={(e) => handleContactChange(e.target.value)}
              options={contacts.map((c) => ({
                value: c.id,
                label: `${c.name || 'Unnamed'} (${c.email}) — ${c.company || 'No Company'}${
                  c.position ? ` / ${c.position}` : ''
                }`,
              }))}
            />
          ) : (
            <div className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 font-medium">
              Demo Preview: Alex Morgan (alex.morgan@techcorp.com) — TechCorp / Senior Engineering Manager
            </div>
          )}
        </div>

        {/* Email Mail Preview Container */}
        {generating ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            <p className="text-xs text-slate-400">Rendering personalized variables...</p>
          </div>
        ) : previewData ? (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden text-sm">
            {/* Header info */}
            <div className="p-4 bg-slate-50/70 border-b border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 w-16">
                  To:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-900">{previewData.toName}</span>
                  <span className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 text-xs font-mono border border-brand-200">
                    &lt;{previewData.toEmail}&gt;
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1 border-t border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 w-16 mt-0.5">
                  Subject:
                </span>
                <span className="font-bold text-slate-900 leading-snug">
                  {previewData.subject}
                </span>
              </div>
            </div>

            {/* Email Body Content */}
            <div className="p-6 font-sans text-slate-800 leading-relaxed whitespace-pre-wrap min-h-[160px] bg-white">
              {previewData.body}
            </div>

            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Personalized tags: {'{{name}}'}, {'{{company}}'}, {'{{position}}'}, {'{{email}}'}</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> Rendered
              </span>
            </div>
          </div>
        ) : null}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-400">
            Phase 2 will allow dispatching in controlled batches via Gmail OAuth.
          </span>
          <Button variant="primary" onClick={onClose}>
            Close Preview
          </Button>
        </div>
      </div>
    </Modal>
  );
};
