import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'accent' | 'coral' | 'glass' | 'white';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  pill?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  pill = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    `inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98] select-none ${
      pill ? 'rounded-full' : 'rounded-xl'
    }`;

  const sizeStyles = {
    xs: 'px-3 py-1 text-xs gap-1.5',
    sm: 'px-3.5 py-1.5 text-xs gap-1.5 font-medium',
    md: 'px-4 py-2 text-sm gap-2 font-medium',
    lg: 'px-6 py-3 text-base gap-2.5 font-semibold',
  };

  const variantStyles = {
    primary:
      'bg-brand-600 hover:bg-brand-700 text-white shadow-card hover:shadow-glow-brand hover:-translate-y-0.5 focus-visible:ring-brand-500',
    secondary:
      'bg-slate-900 hover:bg-slate-800 text-white shadow-card hover:-translate-y-0.5 focus-visible:ring-slate-700',
    outline:
      'bg-white/80 hover:bg-white text-slate-700 border border-slate-200/80 hover:border-slate-300 shadow-xs hover:-translate-y-0.5 focus-visible:ring-brand-500',
    danger:
      'bg-rose-500 hover:bg-rose-600 text-white shadow-xs hover:-translate-y-0.5 focus-visible:ring-rose-500',
    ghost:
      'bg-transparent hover:bg-slate-100/80 text-slate-600 hover:text-slate-900 focus-visible:ring-slate-300',
    accent:
      'bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-600 hover:opacity-95 text-white shadow-card hover:shadow-glow-brand hover:-translate-y-0.5 focus-visible:ring-brand-500',
    coral:
      'bg-gradient-to-r from-coral-500 to-orange-500 hover:opacity-95 text-white shadow-card hover:shadow-glow-coral hover:-translate-y-0.5 focus-visible:ring-coral-500',
    glass:
      'bg-white/70 backdrop-blur-md hover:bg-white/90 text-slate-800 border border-white/80 shadow-soft hover:-translate-y-0.5 focus-visible:ring-brand-500',
    white:
      'bg-white hover:bg-slate-100 text-slate-900 shadow-lg hover:-translate-y-0.5 focus-visible:ring-white',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
    </button>
  );
};
