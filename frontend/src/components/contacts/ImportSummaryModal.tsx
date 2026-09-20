import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ImportSummary } from '../../types';
import { CheckCircle2, AlertTriangle, Copy, ChevronDown, ChevronUp, FileText } from 'lucide-react';

interface ImportSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: ImportSummary | null;
}

export const ImportSummaryModal: React.FC<ImportSummaryModalProps> = ({
  isOpen,
  onClose,
  summary,
}) => {
  const [showInvalidDetails, setShowInvalidDetails] = useState<boolean>(true);

  if (!summary) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Contact Import Summary"
      subtitle="Overview of imported records and validation diagnostics"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Total Rows
            </span>
            <span className="text-2xl font-extrabold text-slate-800">{summary.totalRows}</span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-100 text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold uppercase tracking-wider">Valid / Ready</span>
            </div>
            <span className="text-2xl font-extrabold text-emerald-700">{summary.validCount}</span>
          </div>

          <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-100 text-center">
            <div className="flex items-center justify-center gap-1 text-rose-600 mb-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold uppercase tracking-wider">Invalid Rows</span>
            </div>
            <span className="text-2xl font-extrabold text-rose-700">{summary.invalidCount}</span>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-100 text-center">
            <div className="flex items-center justify-center gap-1 text-amber-600 mb-1">
              <Copy className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold uppercase tracking-wider">Duplicates</span>
            </div>
            <span className="text-2xl font-extrabold text-amber-700">{summary.duplicateCount}</span>
          </div>
        </div>

        {/* Invalid Rows Inspector */}
        {summary.invalidRows && summary.invalidRows.length > 0 ? (
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <button
              onClick={() => setShowInvalidDetails(!showInvalidDetails)}
              className="w-full px-4 py-3 bg-slate-50 flex items-center justify-between text-left text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-500" />
                <span>Inspect Flagged / Invalid Rows ({summary.invalidRows.length})</span>
              </div>
              {showInvalidDetails ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {showInvalidDetails && (
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100/60 text-slate-600 font-semibold sticky top-0">
                    <tr>
                      <th className="px-3 py-2">Row #</th>
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summary.invalidRows.map((inv, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-3 py-2 font-mono text-slate-400 font-semibold">
                          #{inv.rowNumber}
                        </td>
                        <td className="px-3 py-2 font-medium text-slate-800">
                          {inv.email || <span className="text-slate-400 italic">(Empty)</span>}
                        </td>
                        <td className="px-3 py-2 text-slate-600">{inv.name || '—'}</td>
                        <td className="px-3 py-2">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-medium border border-rose-200 text-[11px]">
                            {inv.reason}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-3 text-emerald-800 text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>All rows passed email syntax, uniqueness, and format validation!</span>
          </div>
        )}

        {/* Modal Close Button */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Button variant="primary" onClick={onClose}>
            Done & View Contacts
          </Button>
        </div>
      </div>
    </Modal>
  );
};
