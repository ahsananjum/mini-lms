import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label htmlFor={inputId} className="block text-xs uppercase tracking-widest font-medium text-slate-500 mb-2">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`block w-full rounded-md border-0 py-3 px-4 text-on-surface shadow-sm ring-1 ring-inset outline-none transition-all duration-300 bg-surface-container-lowest placeholder:text-slate-400
            ${error ? 'ring-error focus:ring-error/40 focus:ring-[4px]' : 'ring-outline-variant/15 focus:ring-primary/40 focus:ring-[4px] hover:ring-outline-variant/30'}
          `}
          {...props}
        />
        {error && (
          <p className="mt-2 text-xs font-medium text-error flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-error"></span>{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
