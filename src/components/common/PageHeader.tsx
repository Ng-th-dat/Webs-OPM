interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}

export function PageHeader({ eyebrow, title, description, className = '' }: PageHeaderProps) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {eyebrow && <span className="comic-pill h-7 w-fit px-3 text-[11px]">{eyebrow}</span>}
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{description}</p>
      )}
    </div>
  );
}
