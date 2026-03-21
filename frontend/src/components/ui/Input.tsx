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
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`block w-full px-4 py-2.5 bg-white border rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 sm:text-sm transition-colors
            ${error ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 text-rose-900' : 'border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900'}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
