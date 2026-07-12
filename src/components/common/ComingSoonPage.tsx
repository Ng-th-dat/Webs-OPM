import type { ComponentType, SVGProps } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from './Badge';
import { ArrowRightIcon } from './icons';
import { useTranslation } from '@/hooks/useTranslation';

interface ComingSoonPageProps {
  title: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export function ComingSoonPage({ title, description, icon: Icon }: ComingSoonPageProps) {
  const { t } = useTranslation();

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center gap-5 px-4 py-24 text-center sm:px-8">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-surface text-accent">
        <Icon className="h-6 w-6" />
      </span>
      <Badge>{t('common.comingSoon')}</Badge>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      <p className="text-base leading-relaxed text-muted">{description}</p>
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-info transition-transform duration-200 hover:translate-x-1"
      >
        {t('common.backToHome')}
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </section>
  );
}
