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
          <label htmlFor={selectId} className="block text-sm font-medium leading-6 text-slate-900 mb-1">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset placeholder:text-slate-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 transition-all bg-white
            ${error ? 'ring-rose-300 focus:ring-rose-500' : 'ring-slate-300 focus:ring-indigo-600 hover:ring-slate-400'}
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
