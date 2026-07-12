interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}

export function PageHeader({ eyebrow, title, description, className = '' }: PageHeaderProps) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {eyebrow && (
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent-info">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent-info" />
          {eyebrow}
        </span>
      )}
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{description}</p>
      )}
    </div>
  );
}
