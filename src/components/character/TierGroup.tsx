import type { SkillType } from '@/types/character';
import { SKILL_TYPE_LABEL_KEYS, SKILL_TYPE_STYLES } from '@/utils/characters';
import { SkillCard, type TierAccent } from './SkillCard';
import { useTranslation } from '@/hooks/useTranslation';

export interface Tier {
  key: string;
  label: string;
  accent: TierAccent;
  description?: string;
  skillType?: SkillType;
  cost?: string;
  requirement?: string;
  image?: string;
}

interface TierGroupProps {
  tiers: Tier[];
  /** Highlight numbers that changed vs. the previous tier — only meaningful when tiers are the same ability scaling up (Ultimate, Passive), not distinct abilities per tier (Awakening, Core). */
  showDelta?: boolean;
}

const GRID_COLS: Record<number, string> = {
  1: '',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
};

export function TierGroup({ tiers, showDelta = false }: TierGroupProps) {
  const { t } = useTranslation();
  const sectionSkillType = tiers[0]?.skillType;
  const sectionStyle = sectionSkillType ? SKILL_TYPE_STYLES[sectionSkillType] : undefined;

  return (
    <div className="flex flex-col gap-4">
      {sectionSkillType && sectionStyle && (
        <span
          className={`inline-flex w-fit items-center rounded-md px-2 py-1 text-xs font-bold uppercase tracking-wide ${sectionStyle.badge}`}
        >
          {t(SKILL_TYPE_LABEL_KEYS[sectionSkillType])}
        </span>
      )}

      <div className={`grid grid-cols-1 gap-4 ${GRID_COLS[tiers.length] ?? ''}`}>
        {tiers.map((tier, index) => {
          const previous = showDelta && index > 0 ? tiers[index - 1] : undefined;
          return (
            <div key={tier.key} className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">{tier.label}</span>
              {tier.description ? (
                <>
                  <SkillCard
                    description={tier.description}
                    previousDescription={previous?.description}
                    skillType={tier.skillType}
                    cost={tier.cost}
                    tierAccent={tier.accent}
                    image={tier.image}
                    showTypeBadge={false}
                  />
                  {tier.requirement && (
                    <p className="text-xs font-medium uppercase tracking-wide text-subtle">
                      {t('characterDetail.requirement', { value: tier.requirement })}
                    </p>
                  )}
                </>
              ) : (
                <div className="rounded-card border border-accent/30 bg-surface p-5">
                  <p className="text-sm leading-relaxed text-subtle">{t('common.comingSoon')}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
