import React, { useState, useEffect, useCallback } from 'react';
import {
  UploadCloud,
  Plus,
  Trash2,
  Edit2,
  Search,
  Users,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  Ban,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { TableSkeleton } from '../components/common/SkeletonLoader';
import { EmptyState } from '../components/common/EmptyState';
import { ContactUploadModal } from '../components/contacts/ContactUploadModal';
import { ImportSummaryModal } from '../components/contacts/ImportSummaryModal';
import { ContactFormModal } from '../components/contacts/ContactFormModal';
import { contactApi } from '../api/contactApi';
import { Contact, ContactStatus, ImportSummary, PageResponse } from '../types';
import { useToast } from '../context/ToastContext';

export const ContactsPage: React.FC = () => {
  const [contactsPage, setContactsPage] = useState<PageResponse<Contact> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize] = useState<number>(10);

  // Modals
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [summaryModalOpen, setSummaryModalOpen] = useState<boolean>(false);
  const [formModalOpen, setFormModalOpen] = useState<boolean>(false);
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);

  // Delete dialogs
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  const toast = useToast();

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await contactApi.getContacts({
        page: currentPage,
        size: pageSize,
        search: searchQuery.trim() || undefined,
        status: statusFilter !== 'ALL' ? (statusFilter as ContactStatus) : undefined,
      });
      if (res.data) {
        setContactsPage(res.data);
      }
    } catch {
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, statusFilter, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchContacts();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchContacts]);

  // Handle Select All on current page
  const handleSelectAll = () => {
    if (!contactsPage) return;
    const currentIds = contactsPage.content.map((c) => c.id);
    const allSelected = currentIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentIds])));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Single Delete
  const confirmDeleteContact = (contact: Contact) => {
    setContactToDelete(contact);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteContact = async () => {
    if (!contactToDelete) return;
    setDeleting(true);
    try {
      await contactApi.deleteContact(contactToDelete.id);
      toast.success('Contact deleted successfully');
      setSelectedIds((prev) => prev.filter((id) => id !== contactToDelete.id));
      setDeleteConfirmOpen(false);
      setContactToDelete(null);
      fetchContacts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete contact');
    } finally {
      setDeleting(false);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setDeleting(true);
    try {
      const res = await contactApi.bulkDeleteContacts(selectedIds);
      toast.success(`Deleted ${res.data ?? selectedIds.length} contacts successfully`);
      setSelectedIds([]);
      setBulkDeleteConfirmOpen(false);
      fetchContacts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to bulk delete contacts');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleUnsubscribe = async (contact: Contact) => {
    const newStatus: ContactStatus = contact.status === 'UNSUBSCRIBED' ? 'READY' : 'UNSUBSCRIBED';
    try {
      await contactApi.updateContactStatus(contact.id, newStatus);
      toast.success(
        newStatus === 'UNSUBSCRIBED'
          ? `Marked ${contact.email} as UNSUBSCRIBED`
          : `Restored ${contact.email} to READY`
      );
      fetchContacts();
    } catch {
      toast.error('Failed to update contact status');
    }
  };

  const openEditModal = (contact: Contact) => {
    setContactToEdit(contact);
    setFormModalOpen(true);
  };

  const openCreateModal = () => {
    setContactToEdit(null);
    setFormModalOpen(true);
  };

  const handleImportSuccess = (summary: ImportSummary) => {
    setImportSummary(summary);
    setSummaryModalOpen(true);
    fetchContacts();
  };

  const contacts = contactsPage?.content || [];
  const allCurrentPageSelected =
    contacts.length > 0 && contacts.every((c) => selectedIds.includes(c.id));

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Contacts</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage recruiter lists, inspect deliverability statuses, and import spreadsheets.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUploadModalOpen(true)}
            icon={<UploadCloud className="w-3.5 h-3.5 text-brand-600" />}
          >
            Import File
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={openCreateModal}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Contact
          </Button>
        </div>
      </div>

      {/* Filter and Bulk Action Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-2.5 flex-1">
          {/* Search */}
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search by name, email, company, title..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(0);
              }}
              icon={<Search className="w-3.5 h-3.5" />}
            />
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-52">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(0);
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="READY">READY (Eligible)</option>
                <option value="UNSUBSCRIBED">UNSUBSCRIBED (Opted Out)</option>
                <option value="INVALID">INVALID (Flagged)</option>
                <option value="SENT">SENT</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2.5 bg-brand-50/80 border border-brand-200 px-3 py-1.5 rounded-lg">
            <span className="text-xs font-semibold text-brand-900">
              {selectedIds.length} selected
            </span>
            <Button
              variant="danger"
              size="xs"
              onClick={() => setBulkDeleteConfirmOpen(true)}
              icon={<Trash2 className="w-3 h-3" />}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Main Contacts Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : contacts.length === 0 ? (
          <EmptyState
            icon={<Users className="w-6 h-6 text-brand-600" />}
            title="No contacts found"
            description={
              searchQuery || statusFilter !== 'ALL'
                ? 'No contacts match your current search or status filter.'
                : 'Upload an Excel (.xlsx, .xls) or CSV file with recruiter contacts to get started.'
            }
            actionLabel="Upload Contacts File"
            onAction={() => setUploadModalOpen(true)}
            actionIcon={<UploadCloud className="w-3.5 h-3.5" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/70 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200/80">
                <tr>
                  <th className="px-4 py-3 w-10 text-center">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-slate-400 hover:text-brand-600 transition-colors"
                      title={allCurrentPageSelected ? 'Deselect All' : 'Select All'}
                    >
                      {allCurrentPageSelected ? (
                        <CheckSquare className="w-4 h-4 text-brand-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Position</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Added</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contacts.map((c) => {
                  const isSelected = selectedIds.includes(c.id);
                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-brand-50/40' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelect(c.id)}
                          className="text-slate-400 hover:text-brand-600 transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-brand-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {c.name || <span className="text-slate-400 italic font-normal">(No Name)</span>}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-800">
                        {c.email}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {c.company || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {c.position || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge status={c.status} size="sm" />
                        {c.invalidReason && (
                          <span
                            className="block text-[10px] text-rose-500 mt-0.5 max-w-xs truncate"
                            title={c.invalidReason}
                          >
                            {c.invalidReason}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleToggleUnsubscribe(c)}
                            className={`p-1 rounded-md transition-colors ${
                              c.status === 'UNSUBSCRIBED'
                                ? 'text-amber-600 hover:text-emerald-700 hover:bg-emerald-50'
                                : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                            }`}
                            title={
                              c.status === 'UNSUBSCRIBED'
                                ? 'Restore contact to READY'
                                : 'Mark contact as UNSUBSCRIBED'
                            }
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(c)}
                            className="p-1 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                            title="Edit Contact"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => confirmDeleteContact(c)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete Contact"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {contactsPage && contactsPage.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
            <div>
              Showing{' '}
              <strong className="text-slate-800">
                {contactsPage.pageNumber * contactsPage.pageSize + 1}
              </strong>{' '}
              to{' '}
              <strong className="text-slate-800">
                {Math.min(
                  (contactsPage.pageNumber + 1) * contactsPage.pageSize,
                  contactsPage.totalElements
                )}
              </strong>{' '}
              of <strong className="text-slate-800">{contactsPage.totalElements}</strong> contacts
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="xs"
                disabled={contactsPage.pageNumber === 0}
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                icon={<ChevronLeft className="w-3.5 h-3.5" />}
              >
                Previous
              </Button>
              <span className="px-2 font-semibold text-slate-700">
                {contactsPage.pageNumber + 1} / {contactsPage.totalPages}
              </span>
              <Button
                variant="outline"
                size="xs"
                disabled={contactsPage.last}
                onClick={() => setCurrentPage((p) => p + 1)}
                icon={<ChevronRight className="w-3.5 h-3.5" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <ContactUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={handleImportSuccess}
      />

      {/* Import Summary Modal */}
      <ImportSummaryModal
        isOpen={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        summary={importSummary}
      />

      {/* Add/Edit Modal */}
      <ContactFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSuccess={fetchContacts}
        contactToEdit={contactToEdit}
      />

      {/* Single Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteContact}
        title="Delete Contact"
        message={`Are you sure you want to delete ${
          contactToDelete?.name || contactToDelete?.email
        }? This action cannot be undone.`}
        loading={deleting}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        isOpen={bulkDeleteConfirmOpen}
        onClose={() => setBulkDeleteConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title="Bulk Delete Contacts"
        message={`Are you sure you want to delete all ${selectedIds.length} selected contacts? This action is permanent.`}
        loading={deleting}
      />
    </div>
  );
};
