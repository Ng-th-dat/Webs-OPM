import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

export function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-border bg-elevated px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted ${className}`}
    >
      {children}
    </span>
  );
}
