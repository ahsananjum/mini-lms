import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15">
      <div className="w-16 h-16 flex items-center justify-center rounded-[1.25rem] bg-surface-container-low text-slate-400 mb-6 ring-1 ring-outline-variant/10">
        <Icon className="w-8 h-8" strokeWidth={1.5} />
      </div>
      <h3 className="text-2xl font-bold tracking-tight text-on-surface mb-3">{title}</h3>
      <p className="text-base text-slate-500 max-w-md leading-relaxed">{description}</p>
    </div>
  );
}
