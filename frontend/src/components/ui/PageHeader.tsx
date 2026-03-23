import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
      {description && (
        <p className="mt-1.5 text-sm text-slate-500 max-w-2xl">
          {description}
        </p>
      )}
    </div>
  );
}
