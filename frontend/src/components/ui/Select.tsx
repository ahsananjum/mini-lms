import React, { SelectHTMLAttributes, forwardRef } from 'react';

interface Option {
  label: string;
  value: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Option[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`block w-full px-4 py-2.5 bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 sm:text-sm transition-colors
            ${error ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 text-rose-900' : 'border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900'}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
