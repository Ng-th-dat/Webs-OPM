import { useState, type CSSProperties } from 'react';
import type { Rarity } from '@/types/character';
import { RARITY_GLOW } from '@/utils/rarity';
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/common/icons';
import { useTranslation } from '@/hooks/useTranslation';

interface CharacterGalleryProps {
  characterName: string;
  images: string[];
  rarity: Rarity;
}

export function CharacterGallery({ characterName, images, rarity }: CharacterGalleryProps) {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const glowStyle = { '--card-glow': RARITY_GLOW[rarity] } as CSSProperties;

  if (images.length === 0) return null;

  const hasMultiple = images.length > 1;

  function showPrevious() {
    setActiveIndex((index) => (index === 0 ? images.length - 1 : index - 1));
  }

  function showNext() {
    setActiveIndex((index) => (index === images.length - 1 ? 0 : index + 1));
  }

  return (
    <section className="flex flex-col gap-4">
      <h2
        className="relative inline-flex w-fit items-center px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-canvas"
        style={{
          clipPath: 'polygon(8% 0, 100% 0, 92% 100%, 0% 100%)',
          background: 'linear-gradient(120deg, var(--color-accent-secondary), var(--color-accent))',
        }}
      >
        {t('characterDetail.gallery')}
      </h2>

      <div style={glowStyle} className="relative mx-auto w-full max-w-sm sm:max-w-md">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-8 rounded-[2.5rem] opacity-70 blur-3xl"
          style={{ background: 'var(--card-glow)' }}
        />
        <div className="relative rounded-3xl border border-white/20 bg-surface p-2 shadow-[0_30px_70px_-24px_var(--card-glow)] sm:p-3">
          <div className="relative overflow-hidden rounded-2xl">
            <img
              src={images[activeIndex]}
              alt={characterName}
              loading="lazy"
              className="aspect-[3/4] w-full object-cover"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {hasMultiple && (
          <button
            type="button"
            onClick={showPrevious}
            aria-label={t('characterDetail.previousImage')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted transition-colors duration-200 hover:border-accent-info/40 hover:text-foreground"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </button>
        )}

        <div className="flex flex-1 gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-pressed={index === activeIndex}
              aria-label={`${characterName} ${index + 1}`}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition duration-200 ${
                index === activeIndex
                  ? 'border-accent-info'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>

        {hasMultiple && (
          <button
            type="button"
            onClick={showNext}
            aria-label={t('characterDetail.nextImage')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted transition-colors duration-200 hover:border-accent-info/40 hover:text-foreground"
          >
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </section>
  );
}
