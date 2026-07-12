import { useEffect, useState } from 'react';
import { CheckIcon, CoinIcon, CopyIcon, HeartIcon, XIcon } from '@/components/common/icons';
import { useTranslation } from '@/hooks/useTranslation';

const MB_BANK_BIN = '970422';
const ACCOUNT_NUMBER = '0918498961';
const ACCOUNT_HOLDER = 'NGUYEN THANH DAT';

interface DonateMethod {
  id: 'momo' | 'bank';
  name: string;
  accent: string;
}

const DONATE_METHODS: DonateMethod[] = [
  { id: 'momo', name: 'MoMo', accent: 'var(--color-rarity-ur-plus)' },
  { id: 'bank', name: 'MB Bank', accent: 'var(--color-accent-info)' },
];

const QR_URL = `https://img.vietqr.io/image/${MB_BANK_BIN}-${ACCOUNT_NUMBER}-compact2.png?accountName=${encodeURIComponent(
  ACCOUNT_HOLDER
)}`;

export function DonateWidget() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  async function handleCopy(method: DonateMethod) {
    try {
      await navigator.clipboard.writeText(ACCOUNT_NUMBER);
    } catch {
      return;
    }
    setCopiedId(method.id);
    window.setTimeout(() => {
      setCopiedId((current) => (current === method.id ? null : current));
    }, 2000);
  }

  return (
    <div className="fixed bottom-5 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {isOpen && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label={t('footer.donate.title')}
          className="w-[min(85vw,320px)] overflow-hidden rounded-2xl border border-border bg-elevated shadow-2xl shadow-black/50"
        >
          <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3.5">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-bold text-foreground">{t('footer.donate.title')}</span>
              <span className="text-xs leading-relaxed text-subtle">
                {t('footer.donate.description')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label={t('common.closeMenu')}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-subtle transition-colors duration-200 hover:bg-surface hover:text-foreground"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col divide-y divide-border">
            {DONATE_METHODS.map((method) => (
              <div key={method.id} className="flex flex-col gap-3 px-4 py-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: method.accent, color: 'var(--color-canvas)' }}
                    >
                      <CoinIcon className="h-4 w-4" />
                    </span>
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-semibold text-foreground">{method.name}</span>
                      <span className="font-mono text-xs text-muted">{ACCOUNT_NUMBER}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(method)}
                    aria-label={t('footer.donate.copy')}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-subtle transition-colors duration-200 hover:border-accent-secondary/50 hover:text-foreground"
                  >
                    {copiedId === method.id ? (
                      <CheckIcon className="h-3.5 w-3.5 text-accent-secondary" />
                    ) : (
                      <CopyIcon className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                {method.id === 'bank' && (
                  <div className="flex items-center gap-3 rounded-lg bg-canvas/60 p-2.5">
                    <img
                      src={QR_URL}
                      alt={t('footer.donate.qrAlt', { holder: ACCOUNT_HOLDER })}
                      loading="lazy"
                      className="h-16 w-16 shrink-0 rounded-md bg-white p-1"
                    />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-subtle">
                        {t('footer.donate.accountHolder')}
                      </span>
                      <span className="text-xs font-semibold text-foreground">{ACCOUNT_HOLDER}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label={t('footer.donate.badge')}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-accent-secondary text-canvas shadow-lg shadow-black/40 transition-transform duration-200 hover:scale-105"
      >
        {!isOpen && (
          <span
            aria-hidden="true"
            className="absolute inset-0 animate-ping rounded-full bg-accent-secondary opacity-40"
          />
        )}
        {isOpen ? <XIcon className="h-5 w-5" /> : <HeartIcon className="relative h-5 w-5" />}
      </button>
    </div>
  );
}
