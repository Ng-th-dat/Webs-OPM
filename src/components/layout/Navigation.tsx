import { NavLink as RouterNavLink } from 'react-router-dom';
import { NAV_LINKS } from '@/routes/navigation';
import { useTranslation } from '@/hooks/useTranslation';

interface NavigationProps {
  id?: string;
  className?: string;
  linkClassName?: string;
  onLinkClick?: () => void;
}

export function Navigation({ id, className = '', linkClassName = '', onLinkClick }: NavigationProps) {
  const { t } = useTranslation();

  return (
    <nav id={id} className={className} aria-label={t('common.mainNavigation')}>
      {NAV_LINKS.map((link) => (
        <RouterNavLink
          key={link.path}
          to={link.path}
          end={link.path === '/'}
          onClick={onLinkClick}
          className={({ isActive }) =>
            `${linkClassName} comic-pill px-4 ${isActive ? 'comic-pill--active' : ''}`
          }
        >
          {t(link.labelKey)}
        </RouterNavLink>
      ))}
    </nav>
  );
}
