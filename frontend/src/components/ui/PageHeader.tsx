import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div className="flex-1">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-on-surface leading-tight">{title}</h1>
      </div>
      {description && (
        <div className="md:w-5/12 shrink-0">
          <p className="text-sm md:text-base text-slate-500 leading-relaxed border-l-[3px] border-primary/20 pl-5">{description}</p>
        </div>
      )}
    </div>
  );
}
