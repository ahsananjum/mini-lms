import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
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
  const baseStyles = "inline-flex items-center justify-center px-5 py-2.5 text-sm md:text-base rounded-md md:rounded-lg tracking-wide transition-all duration-300 focus:outline-none focus-visible:ring-4 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-br from-primary to-primary-container text-white font-medium shadow-ambient hover:shadow-lg focus-visible:ring-primary/40",
    secondary: "bg-[#E6E8EA] text-on-surface font-medium hover:bg-[#D8DADD] focus-visible:ring-outline-variant/40",
    tertiary: "bg-transparent text-on-surface font-medium hover:underline focus-visible:ring-outline-variant/40",
    danger: "bg-error text-white font-medium shadow-sm hover:shadow-md focus-visible:ring-error/40",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
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
