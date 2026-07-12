import { Link } from 'react-router-dom';
import type { ComponentType, SVGProps } from 'react';
import { ArrowRightIcon } from '@/components/common/icons';
import { useTranslation } from '@/hooks/useTranslation';

interface FeatureCardProps {
  title: string;
  description: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export function FeatureCard({ title, description, href, icon: Icon }: FeatureCardProps) {
  const { t } = useTranslation();

  return (
    <Link
      to={href}
      className="group relative flex flex-col gap-4 overflow-hidden rounded-card border border-border bg-surface p-6 transition duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_20px_45px_-20px_rgba(255,77,77,0.35)]"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/0 blur-2xl transition-colors duration-300 group-hover:bg-accent/15"
      />
      <span className="relative flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-elevated text-accent transition-colors duration-300 group-hover:border-accent/40">
        <Icon className="h-5 w-5" />
      </span>
      <div className="relative flex flex-col gap-1.5">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-muted">{description}</p>
      </div>
      <span className="relative mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-accent-info transition-transform duration-200 group-hover:translate-x-1">
        {t('common.explore')}
        <ArrowRightIcon className="h-4 w-4" />
      </span>
    </Link>
  );
}
