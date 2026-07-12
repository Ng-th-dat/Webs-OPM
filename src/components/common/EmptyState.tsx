import type { ComponentType, SVGProps } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  className?: string;
}

export function EmptyState({ title, description, icon: Icon, className = '' }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-card border border-dashed border-border px-6 py-16 text-center ${className}`}
    >
      {Icon && (
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface text-subtle">
          <Icon className="h-5 w-5" />
        </span>
      )}
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="max-w-sm text-sm leading-relaxed text-muted">{description}</p>
    </div>
  );
}
