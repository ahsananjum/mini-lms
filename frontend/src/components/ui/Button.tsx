import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  disabled, 
  ...props 
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98]";
  
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow focus:ring-indigo-500 border border-transparent",
    secondary: "bg-white text-slate-700 hover:bg-slate-50 shadow-sm border border-slate-300 focus:ring-slate-500",
    danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm hover:shadow focus:ring-rose-500 border border-transparent",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
}
