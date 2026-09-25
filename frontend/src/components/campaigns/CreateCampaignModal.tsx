import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import {
  Contact,
  EmailTemplate,
  GmailConnectionDto,
  TemplatePreviewResponse,
  DuplicateCheckResponse,
  PreflightCheckResponse,
  Attachment,
} from '../../types';
import { templateApi } from '../../api/templateApi';
import { contactApi } from '../../api/contactApi';
import { campaignApi } from '../../api/campaignApi';
import { gmailApi } from '../../api/gmailApi';
import { attachmentApi } from '../../api/attachmentApi';
import { useToast } from '../../context/ToastContext';
import {
  Send,
  FileText,
  Eye,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  CheckSquare,
  Square,
  AlertCircle,
  Ban,
  Paperclip,
  Check,
} from 'lucide-react';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<number>(1);

  // Form state
  const [name, setName] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [recipientSelectionMode, setRecipientSelectionMode] = useState<'all' | 'selective'>('all');
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [availableAttachments, setAvailableAttachments] = useState<Attachment[]>([]);
  const [selectedAttachmentIds, setSelectedAttachmentIds] = useState<string[]>([]);

  // Duplicate protection state
  const [skipDuplicates, setSkipDuplicates] = useState<boolean>(true);
  const [duplicateCheck, setDuplicateCheck] = useState<DuplicateCheckResponse | null>(null);

  // Preflight validation state
  const [preflight, setPreflight] = useState<PreflightCheckResponse | null>(null);
  const [loadingPreflight, setLoadingPreflight] = useState<boolean>(false);

  // Data
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [gmailStatus, setGmailStatus] = useState<GmailConnectionDto | null>(null);

  // Preview & sending states
  const [previewData, setPreviewData] = useState<TemplatePreviewResponse | null>(null);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [startImmediately, setStartImmediately] = useState<boolean>(true);

  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      setStep(1);
      setName('');
      setSelectedContactIds([]);
      setSelectedAttachmentIds([]);
      setDuplicateCheck(null);
      setPreflight(null);
      setSkipDuplicates(true);
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      const [tplRes, contactRes, gmailRes, attRes] = await Promise.all([
        templateApi.getTemplates(),
        contactApi.getAllContacts(),
        gmailApi.getStatus(),
        attachmentApi.getAttachments(),
      ]);

      if (tplRes.data) {
        setTemplates(tplRes.data);
        if (tplRes.data.length > 0) setSelectedTemplateId(tplRes.data[0].id);
      }
      if (contactRes.data) {
        setContacts(contactRes.data);
      }
      if (gmailRes.data) {
        setGmailStatus(gmailRes.data);
      }
      if (attRes.data) {
        setAvailableAttachments(attRes.data);
      }
    } catch {
      toast.error('Failed to load campaign dependencies');
    } finally {
      setLoadingData(false);
    }
  };

  const readyContacts = contacts.filter((c) => c.status === 'READY');
  const unsubscribedContacts = contacts.filter((c) => c.status === 'UNSUBSCRIBED');
  const invalidContacts = contacts.filter((c) => c.status === 'INVALID');

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  const rawResolvedContactIds =
    recipientSelectionMode === 'all'
      ? readyContacts.map((c) => c.id)
      : selectedContactIds;

  // If skipping duplicates, filter them out of resolved IDs
  const resolvedContactIds =
    skipDuplicates && duplicateCheck && duplicateCheck.duplicateContactIds.length > 0
      ? rawResolvedContactIds.filter((id) => !duplicateCheck.duplicateContactIds.includes(id))
      : rawResolvedContactIds;

  const handleToggleContact = (id: string) => {
    setSelectedContactIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllReady = () => {
    const readyIds = readyContacts.map((c) => c.id);
    const allSelected = readyIds.every((id) => selectedContactIds.includes(id));
    if (allSelected) {
      setSelectedContactIds([]);
    } else {
      setSelectedContactIds(readyIds);
    }
  };

  const runDuplicateCheck = async () => {
    if (!selectedTemplateId || rawResolvedContactIds.length === 0) return;
    try {
      const res = await campaignApi.checkDuplicates(selectedTemplateId, rawResolvedContactIds);
      if (res.data) {
        setDuplicateCheck(res.data);
      }
    } catch {
      // ignore
    }
  };

  const runPreflightValidation = async () => {
    if (!selectedTemplateId || rawResolvedContactIds.length === 0) return;
    setLoadingPreflight(true);
    try {
      const res = await campaignApi.validatePreflight(
        selectedTemplateId,
        rawResolvedContactIds,
        skipDuplicates
      );
      if (res.data) {
        setPreflight(res.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Preflight check failed');
    } finally {
      setLoadingPreflight(false);
    }
  };

  const generatePreview = async () => {
    if (!selectedTemplateId) return;
    const sampleContact = contacts.find((c) => resolvedContactIds.includes(c.id)) || contacts[0];
    try {
      const res = await templateApi.previewTemplate(selectedTemplateId, {
        contactId: sampleContact?.id,
      });
      if (res.data) setPreviewData(res.data);
    } catch {
      toast.error('Could not generate sample preview');
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!name.trim()) {
        toast.error('Please enter a campaign name');
        return;
      }
      if (!selectedTemplateId) {
        toast.error('Please select an email template');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (rawResolvedContactIds.length === 0) {
        toast.error('Please select at least one contact to receive this campaign');
        return;
      }
      await runDuplicateCheck();
      await generatePreview();
      setStep(3);
    } else if (step === 3) {
      await runPreflightValidation();
      setStep(4);
    }
  };

  const handleCreateAndLaunch = async () => {
    if (resolvedContactIds.length === 0) {
      toast.error('No valid contacts to send to.');
      return;
    }
    setSubmitting(true);

    try {
      // 1. Create campaign
      const createRes = await campaignApi.createCampaign({
        name: name.trim(),
        templateId: selectedTemplateId,
        contactIds: resolvedContactIds,
        attachmentIds: selectedAttachmentIds,
      });

      if (createRes.data) {
        const campaignId = createRes.data.id;

        if (startImmediately) {
          if (!gmailStatus?.connected) {
            toast.warning('Campaign created as draft. Connect Gmail to start dispatching.');
          } else {
            // 2. Start campaign
            await campaignApi.startCampaign(campaignId);
            toast.success('Campaign launched! Emails are now dispatching in the background.');
          }
        } else {
          toast.success('Campaign created as draft.');
        }

        onSuccess();
        onClose();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to launch campaign');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Outreach Campaign"
      subtitle={`Step ${step} of 4: ${
        step === 1
          ? 'Campaign Details & Template'
          : step === 2
          ? 'Recipients Selection & Duplicate Protection'
          : step === 3
          ? 'Personalization Preview'
          : 'Pre-Flight Safety Review'
      }`}
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Step Indicator */}
        <div className="flex items-center w-full pb-3 border-b border-slate-100">
          {[
            { num: 1, label: 'Details' },
            { num: 2, label: 'Recipients' },
            { num: 3, label: 'Preview' },
            { num: 4, label: 'Review' },
          ].map((s, idx, arr) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                    step === s.num
                      ? 'bg-brand-600 text-white shadow-xs'
                      : step > s.num
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                </div>
                <span
                  className={`text-xs font-semibold whitespace-nowrap ${
                    step === s.num ? 'text-slate-900 font-bold' : 'text-slate-500'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {idx < arr.length - 1 && (
                <div className="flex-1 mx-2 sm:mx-3 h-0.5 bg-slate-200 min-w-[8px]" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* STEP 1: Details & Template */}
        {step === 1 && (
          loadingData ? (
            <div className="py-12 text-center text-sm text-slate-500">Loading campaign dependencies...</div>
          ) : (
          <div className="space-y-4 pt-1">
            <Input
              label="Campaign Name *"
              placeholder="e.g. Senior Backend Engineer Outreach Q3"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Outreach Template *
              </label>
              {templates.length === 0 ? (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span>No templates found in your profile yet.</span>
                  <Link
                    to="/templates"
                    onClick={onClose}
                    className="inline-flex items-center gap-1 font-bold text-brand-600 hover:text-brand-700 underline shrink-0"
                  >
                    Browse Role Template Library &rarr;
                  </Link>
                </div>
              ) : (
                <Select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  options={templates.map((t) => ({
                    value: t.id,
                    label: `${t.name} (Subject: ${t.subject})`,
                  }))}
                />
              )}
            </div>

            {selectedTemplate && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
                <span className="font-bold text-slate-700 block">Template Content Preview:</span>
                <p className="text-slate-900 font-semibold truncate">
                  Subject: {selectedTemplate.subject}
                </p>
                <p className="text-slate-500 font-sans line-clamp-3 leading-relaxed">
                  {selectedTemplate.body}
                </p>
              </div>
            )}

            {/* Outreach Attachments & Resume Section */}
            <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-brand-600" />
                  Campaign Attachments (Resume / PDF):
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {(selectedTemplate?.attachments?.length || 0) + selectedAttachmentIds.length} attached
                </span>
              </div>

              {/* Inherited Template Attachments */}
              {selectedTemplate?.attachments && selectedTemplate.attachments.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Inherited from Template:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="truncate max-w-[200px]">{att.originalFileName}</span>
                        <span className="text-[10px] text-emerald-600/80 font-normal">
                          ({(att.fileSize / 1024).toFixed(1)} KB)
                        </span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1 rounded font-bold">Template</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Campaign Attachments from Library */}
              {availableAttachments.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Additional Attachments from Library:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {availableAttachments
                      .filter((att) => !selectedTemplate?.attachments?.some((tAtt) => tAtt.id === att.id))
                      .map((att) => {
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
                                <p className="text-[10px] text-slate-400">{(att.fileSize / 1024).toFixed(1)} KB</p>
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
                </div>
              )}
            </div>
          </div>
          )
        )}

        {/* STEP 2: Recipients Selection & Duplicate Protection */}
        {step === 2 && (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRecipientSelectionMode('all')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  recipientSelectionMode === 'all'
                    ? 'border-brand-500 bg-brand-50/40 ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="font-bold text-sm text-slate-900 leading-tight">All Eligible Contacts</span>
                  <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {readyContacts.length} Ready
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Target all valid and active candidates marked READY in your database.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRecipientSelectionMode('selective')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  recipientSelectionMode === 'selective'
                    ? 'border-brand-500 bg-brand-50/40 ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="font-bold text-sm text-slate-900 leading-tight">Select Individually</span>
                  <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
                    {selectedContactIds.length} Chosen
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Pick specific candidates or hiring managers from your contacts list.
                </p>
              </button>
            </div>

            {/* Individual selector checklist */}
            {recipientSelectionMode === 'selective' && (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Candidate List ({readyContacts.length} Available)</span>
                  <button
                    type="button"
                    onClick={handleSelectAllReady}
                    className="text-brand-600 hover:text-brand-700 text-xs font-semibold"
                  >
                    Toggle All
                  </button>
                </div>
                <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 text-xs">
                  {readyContacts.map((c) => {
                    const isChecked = selectedContactIds.includes(c.id);
                    return (
                      <div
                        key={c.id}
                        onClick={() => handleToggleContact(c.id)}
                        className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50/70 cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-brand-600 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300 shrink-0" />
                          )}
                          <div>
                            <span className="font-bold text-slate-800">{c.name || 'Unnamed'}</span>
                            <span className="text-slate-400 font-mono ml-2">&lt;{c.email}&gt;</span>
                          </div>
                        </div>
                        <span className="text-slate-500">{c.company || '—'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Unsubscribed & Invalid Exclusion Notices */}
            {(unsubscribedContacts.length > 0 || invalidContacts.length > 0) && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
                {unsubscribedContacts.length > 0 && (
                  <div className="flex items-center gap-2 text-amber-700">
                    <Ban className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {unsubscribedContacts.length} unsubscribed contact(s) will automatically be skipped.
                    </span>
                  </div>
                )}
                {invalidContacts.length > 0 && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span>
                      {invalidContacts.length} invalid contact(s) are excluded from outreach.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Preview & Duplicate Warning */}
        {step === 3 && (
          <div className="space-y-4 pt-2">
            {/* Duplicate Protection Warning */}
            {duplicateCheck && duplicateCheck.duplicateCount > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-amber-900">
                      Duplicate Outreach Protection
                    </h5>
                    <p className="text-xs text-amber-800 mt-0.5">
                      <strong>{duplicateCheck.duplicateCount} contact(s)</strong> in your selection have already received outreach with this template.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setSkipDuplicates(true)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      skipDuplicates
                        ? 'bg-amber-600 text-white border-transparent shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    ✓ Skip Previously Contacted (Recommended)
                  </button>

                  <button
                    type="button"
                    onClick={() => setSkipDuplicates(false)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      !skipDuplicates
                        ? 'bg-slate-800 text-white border-transparent shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Include Them
                  </button>
                </div>
              </div>
            )}

            <div className="p-3.5 bg-brand-50/60 border border-brand-200 rounded-xl text-xs text-brand-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-brand-600 shrink-0" />
              <span>
                Personalization Preview: Variables rendered dynamically using sample recipient data.
              </span>
            </div>

            {previewData ? (
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden text-xs">
                <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold uppercase tracking-wider text-slate-400 w-16">
                      To:
                    </span>
                    <span className="font-bold text-slate-900">
                      {previewData.toName} &lt;{previewData.toEmail}&gt;
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold uppercase tracking-wider text-slate-400 w-16">
                      Subject:
                    </span>
                    <span className="font-bold text-slate-900">{previewData.subject}</span>
                  </div>
                </div>
                <div className="p-5 whitespace-pre-wrap leading-relaxed font-sans text-slate-800 min-h-[140px]">
                  {previewData.body}
                </div>

                {/* Attached files preview */}
                {((selectedTemplate?.attachments?.length || 0) > 0 || selectedAttachmentIds.length > 0) && (
                  <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-xs space-y-1.5">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-brand-600" />
                      Email Attachments:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate?.attachments?.map((att) => (
                        <div
                          key={att.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs shadow-2xs font-medium"
                        >
                          <FileText className="w-3.5 h-3.5 text-rose-500" />
                          <span className="truncate max-w-[180px]">{att.originalFileName}</span>
                          <span className="text-[10px] text-slate-400">({(att.fileSize / 1024).toFixed(1)} KB)</span>
                        </div>
                      ))}
                      {availableAttachments
                        .filter((att) => selectedAttachmentIds.includes(att.id) && !selectedTemplate?.attachments?.some((tAtt) => tAtt.id === att.id))
                        .map((att) => (
                          <div
                            key={att.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs shadow-2xs font-medium"
                          >
                            <FileText className="w-3.5 h-3.5 text-rose-500" />
                            <span className="truncate max-w-[180px]">{att.originalFileName}</span>
                            <span className="text-[10px] text-slate-400">({(att.fileSize / 1024).toFixed(1)} KB)</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* STEP 4: Pre-Flight Safety Review */}
        {step === 4 && (
          <div className="space-y-5 pt-2">
            {loadingPreflight ? (
              <div className="p-8 text-center text-xs text-slate-500">
                <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span>Running pre-flight campaign validations...</span>
              </div>
            ) : preflight ? (
              <div className="space-y-4">
                {/* Final Review Summary Card */}
                <div className="p-6 rounded-xl bg-slate-900 text-white space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {preflight.readyToSend ? "You're ready to send" : "Campaign Review — Attention Needed"}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Please confirm your campaign configuration before dispatching.
                      </p>
                    </div>
                    <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                      {preflight.readyToSend ? 'Ready to Launch' : 'Draft Mode'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                    <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                        Recipients
                      </span>
                      <span className="text-xl font-extrabold text-white">
                        {preflight.willSendCount}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        ({preflight.totalRecipients} selected, {preflight.skippedCount} skipped)
                      </span>
                    </div>

                    <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                        Template
                      </span>
                      <span className="text-sm font-bold text-white block truncate mt-1">
                        {selectedTemplate?.name || 'Selected Template'}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                        Subject: {selectedTemplate?.subject}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                        From Account
                      </span>
                      <span className="text-xs font-bold text-emerald-400 block truncate mt-1">
                        {preflight.gmailConnected ? preflight.gmailAccountEmail : 'Not Connected'}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {preflight.gmailConnected ? 'Official Gmail OAuth' : 'Will save as draft'}
                      </span>
                    </div>
                  </div>

                  {preflight.skippedReasons.length > 0 && (
                    <div className="text-xs text-slate-300 bg-white/5 p-3 rounded-xl space-y-1">
                      <span className="font-semibold block text-amber-300">Reason for skipped:</span>
                      {preflight.skippedReasons.map((reason, idx) => (
                        <p key={idx} className="text-slate-300 text-[11px]">
                          • {reason}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pre-flight Checklist */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Gmail Connected:</span>
                    {preflight.gmailConnected ? (
                      <span className="font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {preflight.gmailAccountEmail}
                      </span>
                    ) : (
                      <span className="font-semibold text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Not Connected (Save as Draft)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Unsubscribed Contacts:</span>
                    <span className="font-semibold text-slate-800">
                      Excluded automatically ({preflight.unsubscribedCount} filtered)
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Duplicate Protection:</span>
                    <span className="font-semibold text-slate-800">
                      {skipDuplicates ? 'Enabled (Previously contacted skipped)' : 'Disabled'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Email Attachments:</span>
                    <span className="font-semibold text-slate-800">
                      {(selectedTemplate?.attachments?.length || 0) + selectedAttachmentIds.length > 0
                        ? `${(selectedTemplate?.attachments?.length || 0) + selectedAttachmentIds.length} file(s) attached (MIME email)`
                        : 'None'}
                    </span>
                  </div>
                </div>

                {/* Validation Errors */}
                {preflight.validationErrors.length > 0 && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>Pre-flight Issues Detected</span>
                    </div>
                    {preflight.validationErrors.map((err, i) => (
                      <p key={i} className="text-[11px] text-rose-700">
                        • {err}
                      </p>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="startImmediately"
                    checked={startImmediately}
                    onChange={(e) => setStartImmediately(e.target.checked)}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <label htmlFor="startImmediately" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    Start sending immediately in background queue
                  </label>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Modal Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {step > 1 ? (
            <Button
              variant="outline"
              type="button"
              onClick={() => setStep((s) => s - 1)}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
          ) : (
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
          )}

          {step < 4 ? (
            <Button variant="primary" type="button" onClick={handleNext} icon={<ArrowRight className="w-4 h-4" />}>
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              type="button"
              onClick={handleCreateAndLaunch}
              loading={submitting}
              icon={<Send className="w-4 h-4" />}
            >
              {startImmediately ? 'Start Campaign' : 'Save as Draft'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
