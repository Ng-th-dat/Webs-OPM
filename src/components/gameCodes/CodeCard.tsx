import { useState } from 'react';
import type { GameCodeEntry } from '@/types/gameCode';
import { CheckIcon, CopyIcon } from '@/components/common/icons';
import { useTranslation } from '@/hooks/useTranslation';

interface CodeCardProps {
  entry: GameCodeEntry;
  delayMs: number;
  reducedMotion: boolean;
}

export function CodeCard({ entry, delayMs, reducedMotion }: CodeCardProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(entry.code);
    } catch {
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className={`flex flex-col gap-4 rounded-card border border-border bg-surface p-5 ${reducedMotion ? '' : 'animate-rise-in'}`}
      style={reducedMotion ? undefined : { animationDelay: `${delayMs}ms` }}
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 rounded-lg border-2 border-dashed border-accent-secondary/50 bg-canvas/60 px-4 py-2.5 text-center">
          <span className="font-mono text-lg font-extrabold tracking-wide text-foreground sm:text-xl">{entry.code}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? t('gameCodes.copied') : t('gameCodes.copy')}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-elevated text-muted transition-colors duration-200 hover:border-accent-secondary/50 hover:text-foreground"
        >
          {copied ? <CheckIcon className="h-4 w-4 text-accent-secondary" /> : <CopyIcon className="h-4 w-4" />}
        </button>
      </div>

      <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-rarity-r/30 bg-rarity-r/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-rarity-r">
        <CheckIcon className="h-3 w-3" />
        {t('gameCodes.stillActive')}
      </span>
    </div>
  );
}
