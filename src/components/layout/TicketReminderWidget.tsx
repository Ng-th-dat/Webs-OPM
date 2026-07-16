import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useTicketTypeImages } from '@/hooks/useTicketTypeImages';
import { TicketIcon } from '@/components/common/icons';

const SLOGAN_VISIBLE_MS = 4500;
const SLOGAN_HIDDEN_MS = 7000;
const INITIAL_DELAY_MS = 2000;

export function TicketReminderWidget() {
  const { t } = useTranslation();
  const { images } = useTicketTypeImages();
  const [sloganVisible, setSloganVisible] = useState(false);

  useEffect(() => {
    let timeoutId: number;

    function cycle(showing: boolean) {
      setSloganVisible(showing);
      timeoutId = window.setTimeout(() => cycle(!showing), showing ? SLOGAN_VISIBLE_MS : SLOGAN_HIDDEN_MS);
    }

    timeoutId = window.setTimeout(() => cycle(true), INITIAL_DELAY_MS);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <div className="fixed bottom-5 right-4 z-40 flex items-center gap-3 sm:bottom-6 sm:right-6">
      <div
        role="status"
        aria-hidden={!sloganVisible}
        className={`relative max-w-[170px] rounded-2xl border border-border bg-elevated px-3.5 py-2.5 text-xs font-semibold leading-snug text-foreground shadow-xl shadow-black/40 transition-all duration-500 ${
          sloganVisible ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-3 opacity-0'
        }`}
      >
        {t('ticketWidget.slogan')}
        <span
          aria-hidden="true"
          className="absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 border-r border-t border-border bg-elevated"
        />
      </div>

      <Link
        to="/ticket-calculator"
        aria-label={t('ticketWidget.ariaLabel')}
        className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full shadow-lg shadow-black/40 transition-transform duration-200 hover:scale-105"
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 animate-ping rounded-full bg-accent-secondary/25"
        />
        <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-border bg-canvas">
          {images.black ? (
            <img src={images.black} alt="" className="h-full w-full animate-logo-bob object-cover" />
          ) : (
            <TicketIcon className="h-6 w-6 animate-logo-bob text-accent-secondary" />
          )}
        </span>
      </Link>
    </div>
  );
}
