import { useState } from 'react';
import { Link } from 'react-router-dom';
import { XIcon } from '@/components/common/icons';
import { useTranslation } from '@/hooks/useTranslation';

const REPEAT_COUNT = 10;

function MarqueeGroup({ text }: { text: string }) {
  return (
    <div className="flex shrink-0 items-center gap-10" aria-hidden="true">
      {Array.from({ length: REPEAT_COUNT }).map((_, index) => (
        <span key={index} className="flex items-center gap-10">
          <span>{text}</span>
          <span className="text-subtle/50">•</span>
        </span>
      ))}
    </div>
  );
}

export function MarqueeBanner() {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const text = t('feedback.marquee');

  return (
    <div className="relative flex items-center border-b border-border bg-elevated">
      <Link
        to="/feedback"
        className="group flex flex-1 items-center overflow-hidden py-2 pl-4 pr-10"
        aria-label={text}
      >
        <div className="flex shrink-0 animate-marquee items-center gap-10 whitespace-nowrap text-xs font-semibold uppercase leading-none tracking-wide text-muted transition-colors duration-200 group-hover:text-accent-info">
          <MarqueeGroup text={text} />
          <MarqueeGroup text={text} />
        </div>
      </Link>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label={t('common.closeMenu')}
        className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-subtle transition-colors duration-200 hover:bg-surface hover:text-foreground"
      >
        <XIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
