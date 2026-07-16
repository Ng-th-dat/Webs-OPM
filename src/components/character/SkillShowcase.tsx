import { useMemo, useState } from 'react';
import type { Character, Skill, SkillType } from '@/types/character';
import { hasAwakeningTier } from '@/utils/rarity';
import { SKILL_TYPE_LABEL_KEYS, pickLocalizedText } from '@/utils/characters';
import { SkillCard, SkillIcon, type TierAccent } from './SkillCard';
import { TierGroup } from './TierGroup';
import { useTranslation } from '@/hooks/useTranslation';

interface SkillShowcaseProps {
  character: Character;
}

type HubTab =
  | { key: string; kind: 'skill'; label: string; skillType: SkillType; image?: string; skill: Skill }
  | { key: string; kind: 'ultimate'; label: string; skillType: SkillType; image?: string; skill: Skill }
  | { key: 'passive'; kind: 'passive'; label: string; skillType: SkillType; image?: string }
  | { key: 'awakening'; kind: 'awakening'; label: string; skillType: SkillType; image?: string }
  | { key: 'core'; kind: 'core'; label: string; skillType: SkillType; image?: string };

/** Awakening only ever has 2 tiers — unlike Passive/Core, it has no 5★ gold/purple grading. */
const AWAKENING_TIER_COUNT = 2;
const AWAKENING_TIER_ACCENTS: TierAccent[] = ['base', 'gold'];
const CORE_TIER_COUNT = 3;
const CORE_TIER_ACCENTS: TierAccent[] = ['base', 'gold', 'purple'];
/** `role: 'Core'` characters get a Core section instead of Awakening (same rarity gate). */
const CORE_ROLE = 'Core';

export function SkillShowcase({ character }: SkillShowcaseProps) {
  const { t, language } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);

  const tabs = useMemo<HubTab[]>(() => {
    const basicSkills = character.skills.filter((skill) => skill.skillType !== 'Ultimate');
    const ultimate = character.skills.find((skill) => skill.skillType === 'Ultimate');

    const result: HubTab[] = basicSkills.map((skill, index) => {
      const typeLabel = t(SKILL_TYPE_LABEL_KEYS[skill.skillType ?? 'Attack']);
      return {
        key: `skill-${index}`,
        kind: 'skill',
        label: basicSkills.length > 1 ? `${typeLabel} ${index + 1}` : typeLabel,
        skillType: skill.skillType ?? 'Attack',
        image: skill.image,
        skill,
      };
    });

    if (ultimate) {
      result.push({
        key: 'ultimate',
        kind: 'ultimate',
        label: t(SKILL_TYPE_LABEL_KEYS.Ultimate),
        skillType: 'Ultimate',
        image: ultimate.image,
        skill: ultimate,
      });
    }

    result.push({
      key: 'passive',
      kind: 'passive',
      label: t('characterDetail.passive'),
      skillType: 'Passive',
      image: character.passive.image,
    });

    if (hasAwakeningTier(character.rarity)) {
      if (character.role === CORE_ROLE) {
        result.push({
          key: 'core',
          kind: 'core',
          label: t('characterDetail.core'),
          skillType: 'Core',
          image: character.core?.[0]?.image,
        });
      } else {
        result.push({
          key: 'awakening',
          kind: 'awakening',
          label: t('characterDetail.awakening'),
          skillType: 'Awaken Passive',
          image: character.awakenings?.[0]?.image,
        });
      }
    }

    return result;
  }, [character, t]);

  const active = tabs[activeIndex] ?? tabs[0];

  return (
    <section className="flex flex-col gap-6 rounded-3xl border border-border bg-surface p-6 sm:p-8">
      <h2 className="text-sm font-extrabold uppercase tracking-[0.2em] text-accent-info">
        {t('characterDetail.skills')}
      </h2>

      <div className="flex flex-wrap gap-3">
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-pressed={isActive}
              aria-label={tab.label}
              className={`overflow-hidden rounded-xl border-2 transition duration-200 ${
                isActive
                  ? 'border-accent-info shadow-[0_0_16px_var(--color-accent-glow)]'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <SkillIcon skillType={tab.skillType} image={tab.image} />
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-canvas/60 p-5 sm:p-6">
        {active.kind === 'skill' && (
          <SkillCard
            description={pickLocalizedText(active.skill.description, active.skill.descriptionVi, language) ?? ''}
            skillType={active.skill.skillType}
            cost={active.skill.cost}
            image={active.skill.image}
          />
        )}

        {active.kind === 'ultimate' && (
          <TierGroup
            showDelta
            tiers={[
              {
                key: 'base',
                label: t('characterDetail.tierBase'),
                accent: 'base',
                description: pickLocalizedText(active.skill.description, active.skill.descriptionVi, language),
                skillType: active.skill.skillType,
                cost: active.skill.cost,
                image: active.skill.image,
              },
              {
                key: 'upgrade',
                label: t('characterDetail.tierUltimateUpgrade'),
                accent: 'gold',
                description: pickLocalizedText(active.skill.upgradedDescription, active.skill.upgradedDescriptionVi, language),
                skillType: active.skill.skillType,
                cost: active.skill.cost,
                image: active.skill.image,
              },
            ]}
          />
        )}

        {active.kind === 'passive' && (
          <TierGroup
            showDelta
            tiers={[
              {
                key: 'base',
                label: t('characterDetail.tierBase'),
                accent: 'base',
                description: pickLocalizedText(character.passive.description, character.passive.descriptionVi, language),
                skillType: 'Passive',
                cost: 'None',
                image: character.passive.image,
              },
              {
                key: 'gold',
                label: t('characterDetail.tierPassiveGold'),
                accent: 'gold',
                description: pickLocalizedText(character.passive.goldDescription, character.passive.goldDescriptionVi, language),
                skillType: 'Passive',
                cost: 'None',
                image: character.passive.image,
              },
              {
                key: 'purple',
                label: t('characterDetail.tierPassivePurple'),
                accent: 'purple',
                description: pickLocalizedText(character.passive.purpleDescription, character.passive.purpleDescriptionVi, language),
                skillType: 'Passive',
                cost: 'None',
                image: character.passive.image,
              },
            ]}
          />
        )}

        {active.kind === 'awakening' && (
          <TierGroup
            tiers={Array.from({ length: AWAKENING_TIER_COUNT }, (_, index) => index + 1).map((tier) => {
              const data = character.awakenings?.find((entry) => entry.tier === tier);
              return {
                key: `awakening-${tier}`,
                label: t('characterDetail.awakeningTier', { tier }),
                accent: AWAKENING_TIER_ACCENTS[tier - 1],
                description: pickLocalizedText(data?.description, data?.descriptionVi, language),
                skillType: 'Awaken Passive',
                cost: 'None',
                requirement: data?.requirement,
                image: data?.image,
              };
            })}
          />
        )}

        {active.kind === 'core' && (
          <TierGroup
            tiers={Array.from({ length: CORE_TIER_COUNT }, (_, index) => index + 1).map((tier) => {
              const data = character.core?.find((entry) => entry.tier === tier);
              return {
                key: `core-${tier}`,
                label: t('characterDetail.coreTier', { tier }),
                accent: CORE_TIER_ACCENTS[tier - 1],
                description: pickLocalizedText(data?.description, data?.descriptionVi, language),
                skillType: 'Core',
                cost: 'None',
                requirement: data?.requirement,
                image: data?.image,
              };
            })}
          />
        )}
      </div>
    </section>
  );
}
