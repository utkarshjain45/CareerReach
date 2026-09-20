import React from 'react';
import { ContactStatus } from '../../types';

export interface BadgeProps {
  status?: ContactStatus | string;
  variant?: 'ready' | 'invalid' | 'sent' | 'failed' | 'unsubscribed' | 'default' | 'neutral' | 'running' | 'paused' | 'completed' | 'draft';
  children?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, variant, children, className = '', size = 'sm' }) => {
  let resolvedVariant = variant || 'default';

  if (status) {
    switch (status.toUpperCase()) {
      case 'READY':
        resolvedVariant = 'ready';
        break;
      case 'INVALID':
        resolvedVariant = 'invalid';
        break;
      case 'SENT':
        resolvedVariant = 'sent';
        break;
      case 'FAILED':
        resolvedVariant = 'failed';
        break;
      case 'UNSUBSCRIBED':
        resolvedVariant = 'unsubscribed';
        break;
      case 'RUNNING':
        resolvedVariant = 'running';
        break;
      case 'PAUSED':
        resolvedVariant = 'paused';
        break;
      case 'COMPLETED':
        resolvedVariant = 'completed';
        break;
      case 'DRAFT':
        resolvedVariant = 'draft';
        break;
      default:
        resolvedVariant = 'neutral';
    }
  }

  const variantStyles = {
    ready: 'bg-emerald-50/80 text-emerald-700 border-emerald-200/80',
    invalid: 'bg-rose-50/80 text-rose-700 border-rose-200/80',
    sent: 'bg-sky-50/80 text-sky-700 border-sky-200/80',
    failed: 'bg-rose-50/80 text-rose-700 border-rose-200/80',
    unsubscribed: 'bg-slate-100 text-slate-600 border-slate-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    default: 'bg-brand-50 text-brand-700 border-brand-200',
    running: 'bg-amber-50 text-amber-800 border-amber-200',
    paused: 'bg-slate-100 text-slate-700 border-slate-200',
    completed: 'bg-emerald-50/80 text-emerald-700 border-emerald-200/80',
    draft: 'bg-slate-50 text-slate-600 border-slate-200',
  };

  const dotStyles = {
    ready: 'bg-emerald-500',
    invalid: 'bg-rose-500',
    sent: 'bg-sky-500',
    failed: 'bg-rose-500',
    unsubscribed: 'bg-slate-400',
    neutral: 'bg-slate-400',
    default: 'bg-brand-500',
    running: 'bg-amber-500 animate-pulse',
    paused: 'bg-slate-400',
    completed: 'bg-emerald-500',
    draft: 'bg-slate-400',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${
        variantStyles[resolvedVariant as keyof typeof variantStyles] || variantStyles.default
      } ${sizeStyles[size]} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
          dotStyles[resolvedVariant as keyof typeof dotStyles] || dotStyles.default
        }`}
      />
      <span>{children || status}</span>
    </span>
  );
};
