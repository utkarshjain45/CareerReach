import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Contact, ContactRequest, ContactStatus } from '../../types';
import { contactApi } from '../../api/contactApi';
import { useToast } from '../../context/ToastContext';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  contactToEdit?: Contact | null;
}

export const ContactFormModal: React.FC<ContactFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  contactToEdit,
}) => {
  const [formData, setFormData] = useState<ContactRequest>({
    name: '',
    email: '',
    company: '',
    position: '',
    status: 'READY',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (contactToEdit) {
      setFormData({
        name: contactToEdit.name || '',
        email: contactToEdit.email,
        company: contactToEdit.company || '',
        position: contactToEdit.position || '',
        status: contactToEdit.status || 'READY',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        company: '',
        position: '',
        status: 'READY',
      });
    }
    setErrors({});
  }, [contactToEdit, isOpen]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (contactToEdit) {
        await contactApi.updateContact(contactToEdit.id, formData);
        toast.success('Contact updated successfully');
      } else {
        await contactApi.createContact(formData);
        toast.success('Contact added successfully');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save contact';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={contactToEdit ? 'Edit Contact' : 'Add New Contact'}
      subtitle={
        contactToEdit
          ? 'Update contact details or delivery status'
          : 'Manually add a recruiter or hiring manager contact'
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="e.g. Sarah Connor"
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        <Input
          label="Email Address *"
          type="email"
          placeholder="e.g. sarah@skynet.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Company"
            placeholder="e.g. Cyberdyne"
            value={formData.company || ''}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          />

          <Input
            label="Job Position / Role"
            placeholder="e.g. Head of Talent"
            value={formData.position || ''}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
          />
        </div>

        <Select
          label="Contact Status"
          value={formData.status || 'READY'}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as ContactStatus })}
          options={[
            { value: 'READY', label: 'READY — Eligible for outreach' },
            { value: 'INVALID', label: 'INVALID — Flagged email error' },
            { value: 'SENT', label: 'SENT — Email sent' },
            { value: 'FAILED', label: 'FAILED — Delivery failed' },
            { value: 'UNSUBSCRIBED', label: 'UNSUBSCRIBED — Opted out' },
          ]}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={submitting}>
            {contactToEdit ? 'Save Changes' : 'Create Contact'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
