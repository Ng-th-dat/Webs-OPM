import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@/components/common/icons';

interface BackLinkProps {
  to: string;
  children: ReactNode;
  className?: string;
}

export function BackLink({ to, children, className = '' }: BackLinkProps) {
  return (
    <Link
      to={to}
      className={`group mb-8 inline-flex items-center gap-2 border border-white/10 bg-white/5 py-2 pl-4 pr-5 text-xs font-bold uppercase tracking-wider text-muted transition-all duration-200 [clip-path:polygon(6%_0,100%_0,94%_100%,0%_100%)] hover:border-accent-secondary/40 hover:bg-elevated hover:text-foreground ${className}`}
    >
      <ArrowLeftIcon className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:-translate-x-1" />
      {children}
    </Link>
  );
}
