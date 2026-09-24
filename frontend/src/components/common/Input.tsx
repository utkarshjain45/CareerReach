import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, endAdornment, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative rounded-xl">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full rounded-xl border bg-slate-50/50 hover:bg-white focus:bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:ring-4 ${
              icon ? 'pl-10' : ''
            } ${endAdornment ? 'pr-10' : ''} ${
              error
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/15'
                : 'border-slate-200/80 hover:border-slate-300 focus:border-brand-500 focus:ring-brand-500/15'
            } ${className}`}
            {...props}
          />
          {endAdornment && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
              {endAdornment}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-slate-400">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
