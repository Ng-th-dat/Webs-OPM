import { Link } from 'react-router-dom';
import { NAV_LINKS } from '@/routes/navigation';
import { LogoMark } from './LogoMark';
import { useTranslation } from '@/hooks/useTranslation';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex max-w-xs flex-col gap-3">
          <Link to="/" className="group flex items-center gap-2.5">
            <LogoMark />
            <span className="text-lg font-bold tracking-tight text-foreground">
              S-Class <span className="text-accent">Codex</span>
            </span>
          </Link>
          <p className="text-sm leading-relaxed text-muted">{t('footer.tagline')}</p>
        </div>

        <nav aria-label={t('footer.navigationLabel')} className="flex flex-col gap-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-subtle">
            {t('common.explore')}
          </span>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-sm text-muted transition-colors duration-200 hover:text-foreground"
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </nav>

        <nav aria-label={t('footer.legalLabel')} className="flex flex-col gap-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-subtle">
            {t('footer.legalLabel')}
          </span>
          <Link
            to="/privacy-policy"
            className="text-sm text-muted transition-colors duration-200 hover:text-foreground"
          >
            {t('footer.privacyPolicyLink')}
          </Link>
          <Link
            to="/disclaimer"
            className="text-sm text-muted transition-colors duration-200 hover:text-foreground"
          >
            {t('footer.disclaimerLink')}
          </Link>
        </nav>
      </div>

      <div className="border-t border-border px-4 py-5 sm:px-8">
        <p className="mx-auto max-w-6xl text-xs text-subtle">
          {t('footer.disclaimer', { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}
