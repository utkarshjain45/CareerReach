import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import {
  UploadCloud,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Columns,
  Eye,
} from 'lucide-react';
import { contactApi } from '../../api/contactApi';
import { ImportPreviewResponse, ImportSummary } from '../../types';
import { useToast } from '../../context/ToastContext';

interface ContactUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (summary: ImportSummary) => void;
}

export const ContactUploadModal: React.FC<ContactUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Step 2: Mapping & Preview
  const [previewData, setPreviewData] = useState<ImportPreviewResponse | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({
    name: '',
    email: '',
    company: '',
    position: '',
  });

  // Step 3: Validation Summary
  const [dryRunSummary, setDryRunSummary] = useState<ImportSummary | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewData(null);
    setDryRunSummary(null);
    setErrorMsg(null);
    setStep(1);
    onClose();
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

  const validateAndSelectFile = async (file: File) => {
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      setErrorMsg('Please select a valid Excel (.xlsx, .xls) or CSV (.csv) file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File size must not exceed 10MB');
      return;
    }

    setErrorMsg(null);
    setSelectedFile(file);
    await loadPreview(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

  const loadPreview = async (file: File) => {
    setLoadingPreview(true);
    setErrorMsg(null);
    try {
      const res = await contactApi.previewImport(file);
      if (res.data) {
        setPreviewData(res.data);
        // Initialize mapping with suggestions
        const suggested = res.data.suggestedMapping || {};
        setColumnMapping({
          name: suggested.name || '',
          email: suggested.email || '',
          company: suggested.company || '',
          position: suggested.position || '',
        });
        setStep(2);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to read file preview';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoadingPreview(false);
    }
  };

  const proceedToSummary = async () => {
    if (!columnMapping.email) {
      setErrorMsg('Email column mapping is required.');
      return;
    }

    if (!selectedFile) return;

    setUploading(true);
    setErrorMsg(null);

    try {
      // Execute import with custom mapping
      const res = await contactApi.importContacts(selectedFile, columnMapping);
      if (res.data) {
        setDryRunSummary(res.data);
        setStep(3);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to process contacts';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleFinalConfirm = () => {
    if (dryRunSummary) {
      toast.success(`Successfully added ${dryRunSummary.importedCount} contacts to your workspace`);
      onSuccess(dryRunSummary);
      handleClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Contacts from Spreadsheet"
      size="xl"
    >
      <div className="space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between px-2 pt-1 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                step === 1
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              1
            </div>
            <span className={`text-xs font-medium ${step === 1 ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
              Upload File
            </span>
          </div>

          <div className="h-0.5 w-12 bg-slate-200" />

          <div className="flex items-center gap-3">
            <div
              className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                step === 2
                  ? 'bg-brand-600 text-white shadow-sm'
                  : step > 2
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              2
            </div>
            <span className={`text-xs font-medium ${step === 2 ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
              Map Columns &amp; Preview
            </span>
          </div>

          <div className="h-0.5 w-12 bg-slate-200" />

          <div className="flex items-center gap-3">
            <div
              className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                step === 3
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              3
            </div>
            <span className={`text-xs font-medium ${step === 3 ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
              Review &amp; Confirm
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: Upload File */}
        {step === 1 && (
          <div className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                dragActive
                  ? 'border-brand-500 bg-brand-50/50'
                  : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 mx-auto flex items-center justify-center mb-4">
                <UploadCloud className="w-7 h-7" />
              </div>

              <h4 className="text-sm font-bold text-slate-900">
                Click to browse or drag &amp; drop your spreadsheet
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Supports Excel (.xlsx, .xls) and CSV (.csv) up to 10MB
              </p>
            </div>

            {loadingPreview && (
              <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-center gap-3 text-xs text-slate-600">
                <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                <span>Reading headers and generating preview...</span>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Map Columns & Preview First 10 Rows */}
        {step === 2 && previewData && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Columns className="w-4 h-4 text-brand-600" />
                <span>Map your spreadsheet columns</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Ensure each application field is mapped to the corresponding column header in your file.
              </p>
            </div>

            {/* Column Mapping Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Candidate Name <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <select
                  value={columnMapping.name}
                  onChange={(e) => setColumnMapping({ ...columnMapping, name: e.target.value })}
                  className="w-full text-xs rounded-xl border-slate-200 bg-white py-2 px-3 focus:border-brand-500 focus:ring-brand-500"
                >
                  <option value="">— Skip / Not in file —</option>
                  {previewData.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Email Address <span className="text-rose-500 font-bold">*</span>
                </label>
                <select
                  value={columnMapping.email}
                  onChange={(e) => setColumnMapping({ ...columnMapping, email: e.target.value })}
                  className={`w-full text-xs rounded-xl bg-white py-2 px-3 focus:border-brand-500 focus:ring-brand-500 ${
                    !columnMapping.email ? 'border-amber-300 ring-1 ring-amber-300' : 'border-slate-200'
                  }`}
                >
                  <option value="">— Select Email Column —</option>
                  {previewData.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Company / Organization <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <select
                  value={columnMapping.company}
                  onChange={(e) => setColumnMapping({ ...columnMapping, company: e.target.value })}
                  className="w-full text-xs rounded-xl border-slate-200 bg-white py-2 px-3 focus:border-brand-500 focus:ring-brand-500"
                >
                  <option value="">— Skip / Not in file —</option>
                  {previewData.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Job Title / Position <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <select
                  value={columnMapping.position}
                  onChange={(e) => setColumnMapping({ ...columnMapping, position: e.target.value })}
                  className="w-full text-xs rounded-xl border-slate-200 bg-white py-2 px-3 focus:border-brand-500 focus:ring-brand-500"
                >
                  <option value="">— Skip / Not in file —</option>
                  {previewData.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* First 10 Rows Preview Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  Preview (First {previewData.previewRows.length} rows of ~{previewData.totalEstimatedRows})
                </span>
                <span className="text-[11px] text-slate-400">
                  Headers detected: {previewData.headers.length}
                </span>
              </div>

              <div className="border border-slate-100 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold">
                      {previewData.headers.map((h) => {
                        const isMappedEmail = h === columnMapping.email;
                        return (
                          <th key={h} className="py-2 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <span>{h}</span>
                              {isMappedEmail && (
                                <span className="px-1.5 py-0.2 bg-brand-100 text-brand-700 rounded text-[9px]">
                                  Email
                                </span>
                              )}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {previewData.previewRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        {previewData.headers.map((h) => (
                          <td key={h} className="py-1.5 px-3 truncate max-w-xs font-mono text-[11px]">
                            {row[h] || '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(1)}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Back to Upload
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={proceedToSummary}
                disabled={!columnMapping.email || uploading}
                loading={uploading}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Continue &amp; Validate
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Review & Confirm */}
        {step === 3 && dryRunSummary && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Validation Summary</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Review the parsed contact counts before committing to your workspace.
              </p>
            </div>

            {/* Metric counters */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                <span className="text-2xl font-extrabold text-emerald-700 block">
                  {dryRunSummary.validCount}
                </span>
                <span className="text-xs font-semibold text-emerald-800 flex items-center justify-center gap-1 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Valid &amp; Ready
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-center">
                <span className="text-2xl font-extrabold text-amber-700 block">
                  {dryRunSummary.duplicateCount}
                </span>
                <span className="text-xs font-semibold text-amber-800 flex items-center justify-center gap-1 mt-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Duplicates
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-center">
                <span className="text-2xl font-extrabold text-rose-700 block">
                  {dryRunSummary.invalidCount}
                </span>
                <span className="text-xs font-semibold text-rose-800 flex items-center justify-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Invalid Rows
                </span>
              </div>
            </div>

            {/* Invalid rows inspection if any */}
            {dryRunSummary.invalidRows.length > 0 && (
              <div className="border border-rose-100 rounded-2xl p-4 bg-rose-50/50 space-y-2">
                <span className="text-xs font-bold text-rose-900 block">
                  Invalid row diagnostics ({dryRunSummary.invalidRows.length} errors)
                </span>
                <div className="max-h-40 overflow-y-auto space-y-1.5 text-xs text-rose-800">
                  {dryRunSummary.invalidRows.slice(0, 10).map((r, i) => (
                    <div key={i} className="flex items-center justify-between py-1 border-b border-rose-100/50">
                      <span>Row {r.rowNumber}: {r.email || '(Empty Email)'}</span>
                      <span className="font-semibold text-rose-600 text-[11px]">{r.reason}</span>
                    </div>
                  ))}
                  {dryRunSummary.invalidRows.length > 10 && (
                    <span className="text-[11px] text-slate-500 italic block pt-1">
                      ...and {dryRunSummary.invalidRows.length - 10} more invalid rows skipped.
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
              >
                Cancel
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleFinalConfirm}
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                Continue &amp; Complete Import
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
