import { useState } from 'react';
import type { SkillType } from '@/types/character';
import { SKILL_TYPE_LABEL_KEYS, SKILL_TYPE_STYLES } from '@/utils/characters';
import { AtomIcon, BurstIcon, ShieldIcon, SparklesIcon, StarIcon, SwordIcon } from '@/components/common/icons';
import { HighlightedText } from './HighlightedText';
import { useTranslation } from '@/hooks/useTranslation';

const SKILL_TYPE_ICONS: Record<SkillType, typeof SwordIcon> = {
  Attack: SwordIcon,
  Ultimate: BurstIcon,
  Passive: ShieldIcon,
  'Awaken Passive': SparklesIcon,
  Core: AtomIcon,
};

export type TierAccent = 'base' | 'gold' | 'purple';

const TIER_STAR_STYLES: Record<TierAccent, string> = {
  base: 'text-subtle',
  gold: 'text-accent-secondary drop-shadow-[0_0_6px_rgba(255,176,32,0.6)]',
  purple: 'text-rarity-ur drop-shadow-[0_0_6px_rgba(169,112,255,0.6)]',
};

interface SkillCardProps {
  description: string;
  previousDescription?: string;
  skillType?: SkillType;
  cost?: string;
  tierAccent?: TierAccent;
  image?: string;
  /** Hide the type badge — used when a parent (e.g. TierSwitcher) already shows it once for the whole section. */
  showTypeBadge?: boolean;
}

export function SkillCard({
  description,
  previousDescription,
  skillType,
  cost,
  tierAccent,
  image,
  showTypeBadge = true,
}: SkillCardProps) {
  const { t } = useTranslation();
  const style = SKILL_TYPE_STYLES[skillType ?? 'Attack'];

  return (
    <div
      className={`relative overflow-hidden rounded-card border bg-surface p-5 ${skillType === 'Ultimate' ? 'border-accent-secondary/30' : 'border-border'}`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-[0.07] blur-xl ${style.glow}`}
      />
      {tierAccent && (
        <StarIcon className={`absolute right-4 top-4 h-4 w-4 ${TIER_STAR_STYLES[tierAccent]}`} />
      )}
      <div className={`relative flex gap-3 ${showTypeBadge && skillType ? 'items-start' : 'items-center'}`}>
        <SkillIcon skillType={skillType} image={image} />
        <div className="min-w-0 flex-1 pr-6">
          {showTypeBadge && skillType && (
            <span
              className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold uppercase tracking-wide ${style.badge}`}
            >
              {t(SKILL_TYPE_LABEL_KEYS[skillType])}
            </span>
          )}
          {cost !== undefined && (
            <p className={`text-xs font-medium uppercase tracking-wide text-subtle ${showTypeBadge && skillType ? 'mt-1' : ''}`}>
              {t('characterDetail.cost', { value: cost })}
            </p>
          )}
        </div>
      </div>
      <p className="relative mt-3 text-sm leading-relaxed text-muted">
        <HighlightedText text={description} previousText={previousDescription} />
      </p>
    </div>
  );
}

interface SkillIconProps {
  skillType?: SkillType;
  image?: string;
  className?: string;
  iconClassName?: string;
}

export function SkillIcon({
  skillType,
  image,
  className = 'h-11 w-11',
  iconClassName = 'h-5 w-5',
}: SkillIconProps) {
  const [hasError, setHasError] = useState(false);
  const style = SKILL_TYPE_STYLES[skillType ?? 'Attack'];
  const Icon = SKILL_TYPE_ICONS[skillType ?? 'Attack'];
  const showImage = image && !hasError;

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border bg-elevated ${style.iconWrap} ${className}`}
    >
      {showImage ? (
        <img
          src={image}
          alt=""
          loading="lazy"
          onError={() => setHasError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <Icon className={iconClassName} />
      )}
    </span>
  );
}
