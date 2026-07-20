import { useEffect, useRef, useState } from 'react';
import type { ComponentType, CSSProperties, SVGProps } from 'react';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import type { NavGroup } from '@/routes/navigation';
import {
  ArrowRightIcon,
  BeaconIcon,
  CalendarIcon,
  ChevronDownIcon,
  SearchIcon,
  TicketIcon,
} from '@/components/common/icons';
import { useTranslation } from '@/hooks/useTranslation';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface NavDropdownProps {
  group: NavGroup;
  triggerClassName?: string;
}

const LINK_ICON: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  '/updates': CalendarIcon,
  '/intel': SearchIcon,
  '/sea-servers': BeaconIcon,
  '/game-codes': TicketIcon,
};

/** Small alternating tilt per item — same "hand-placed sticker" tilt HeroSection uses for its spotlight cards. */
const ITEM_TILT = ['-2deg', '2deg', '-1.5deg', '1.5deg'];

export function NavDropdown({ group, triggerClassName = '' }: NavDropdownProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const reducedMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const isGroupActive = group.links.some((link) => location.pathname.startsWith(link.path));

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={`comic-pill px-4 ${triggerClassName} ${isGroupActive || isOpen ? 'comic-pill--active' : ''}`}
      >
        {t(group.labelKey)}
        <ChevronDownIcon className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div role="menu" className="absolute left-1/2 top-full z-50 mt-4 flex w-52 -translate-x-1/2 flex-col gap-3">
          {group.links.map((link, index) => {
            const Icon = LINK_ICON[link.path] ?? ArrowRightIcon;
            const isActive = location.pathname.startsWith(link.path);
            const tilt = ITEM_TILT[index % ITEM_TILT.length];

            const wrapperStyle: CSSProperties | undefined = reducedMotion
              ? undefined
              : ({ animationDelay: `${index * 70}ms`, '--slam-rotate': tilt } as CSSProperties);

            return (
              <div key={link.path} className={reducedMotion ? '' : 'animate-panel-slam'} style={wrapperStyle}>
                <RouterNavLink
                  to={link.path}
                  role="menuitem"
                  className={`comic-pill h-11 w-full justify-start gap-3 px-4 text-xs ${isActive ? 'comic-pill--active' : ''}`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {t(link.labelKey)}
                </RouterNavLink>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
