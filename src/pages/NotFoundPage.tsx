import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@/components/common/icons';
import { useTranslation } from '@/hooks/useTranslation';

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center gap-5 px-4 py-24 text-center sm:px-8">
      <span className="text-sm font-semibold uppercase tracking-wider text-accent">404</span>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {t('notFound.title')}
      </h1>
      <p className="text-base leading-relaxed text-muted">{t('notFound.description')}</p>
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
