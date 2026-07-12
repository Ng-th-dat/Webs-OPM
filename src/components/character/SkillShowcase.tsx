import { useMemo, useState } from 'react';
import type { Character, Skill, SkillType } from '@/types/character';
import { getGlossaryEntries } from '@/utils/glossary';
import { hasAwakeningTier } from '@/utils/rarity';
import { SkillCard, SkillIcon, type TierAccent } from './SkillCard';
import { TierBlock } from './TierBlock';
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

const AWAKENING_TIER_COUNT = 3;
const AWAKENING_TIER_ACCENTS: TierAccent[] = ['base', 'gold', 'purple'];
/** `role: 'Core'` characters get a Core section instead of Awakening (same rarity gate). */
const CORE_ROLE = 'Core';

export function SkillShowcase({ character }: SkillShowcaseProps) {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);

  const tabs = useMemo<HubTab[]>(() => {
    const basicSkills = character.skills.filter((skill) => skill.skillType !== 'Ultimate');
    const ultimate = character.skills.find((skill) => skill.skillType === 'Ultimate');

    const result: HubTab[] = basicSkills.map((skill) => ({
      key: skill.name,
      kind: 'skill',
      label: skill.name,
      skillType: skill.skillType ?? 'Attack',
      image: skill.image,
      skill,
    }));

    if (ultimate) {
      result.push({
        key: ultimate.name,
        kind: 'ultimate',
        label: ultimate.name,
        skillType: 'Ultimate',
        image: ultimate.image,
        skill: ultimate,
      });
    }

    result.push({
      key: 'passive',
      kind: 'passive',
      label: character.passive.name,
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

  const glossaryEntries = useMemo(() => {
    const texts: (string | undefined)[] =
      active.kind === 'skill'
        ? [active.skill.description]
        : active.kind === 'ultimate'
          ? [active.skill.description, active.skill.upgradedDescription]
          : active.kind === 'passive'
            ? [
                character.passive.description,
                character.passive.goldDescription,
                character.passive.purpleDescription,
              ]
            : active.kind === 'core'
              ? (character.core?.map((entry) => entry.description) ?? [])
              : (character.awakenings?.map((entry) => entry.description) ?? []);

    return getGlossaryEntries(...texts);
  }, [active, character]);

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
            name={active.skill.name}
            description={active.skill.description}
            skillType={active.skill.skillType}
            cost={active.skill.cost}
            image={active.skill.image}
          />
        )}

        {active.kind === 'ultimate' && (
          <>
            <TierBlock
              label={t('characterDetail.tierBase')}
              name={active.skill.name}
              description={active.skill.description}
              skillType={active.skill.skillType}
              cost={active.skill.cost}
              tierAccent="base"
              image={active.skill.image}
            />
            <TierBlock
              label={t('characterDetail.tierUltimateUpgrade')}
              name={active.skill.name}
              description={active.skill.upgradedDescription}
              previousDescription={active.skill.description}
              skillType={active.skill.skillType}
              cost={active.skill.cost}
              tierAccent="gold"
              image={active.skill.image}
            />
          </>
        )}

        {active.kind === 'passive' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TierBlock
              label={t('characterDetail.tierBase')}
              name={character.passive.name}
              description={character.passive.description}
              skillType="Passive"
              cost="None"
              tierAccent="base"
              image={character.passive.image}
            />
            <TierBlock
              label={t('characterDetail.tierPassiveGold')}
              name={character.passive.name}
              description={character.passive.goldDescription}
              previousDescription={character.passive.description}
              skillType="Passive"
              cost="None"
              tierAccent="gold"
              image={character.passive.image}
            />
            <TierBlock
              label={t('characterDetail.tierPassivePurple')}
              name={character.passive.name}
              description={character.passive.purpleDescription}
              previousDescription={character.passive.goldDescription}
              skillType="Passive"
              cost="None"
              tierAccent="purple"
              image={character.passive.image}
            />
          </div>
        )}

        {active.kind === 'awakening' && (
          <>
            {Array.from({ length: AWAKENING_TIER_COUNT }, (_, index) => index + 1).map((tier) => {
              const data = character.awakenings?.find((entry) => entry.tier === tier);
              return (
                <TierBlock
                  key={tier}
                  label={t('characterDetail.awakeningTier', { tier })}
                  name={data?.name}
                  description={data?.description}
                  skillType="Awaken Passive"
                  cost="None"
                  tierAccent={AWAKENING_TIER_ACCENTS[tier - 1]}
                  image={data?.image}
                />
              );
            })}
          </>
        )}

        {active.kind === 'core' && (
          <>
            {Array.from({ length: AWAKENING_TIER_COUNT }, (_, index) => index + 1).map((tier) => {
              const data = character.core?.find((entry) => entry.tier === tier);
              return (
                <TierBlock
                  key={tier}
                  label={t('characterDetail.coreTier', { tier })}
                  name={data?.name}
                  description={data?.description}
                  skillType="Core"
                  cost="None"
                  requirement={data?.requirement}
                  tierAccent={AWAKENING_TIER_ACCENTS[tier - 1]}
                  image={data?.image}
                />
              );
            })}
          </>
        )}

        {glossaryEntries.length > 0 && (
          <div className="flex flex-col gap-1.5 rounded-card border border-border bg-surface/60 p-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-subtle">
              {t('characterDetail.glossary')}
            </span>
            {glossaryEntries.map((entry) => (
              <p key={entry.term} className="text-xs leading-relaxed text-subtle">
                <span className="font-semibold text-foreground">[{entry.term}]</span> {entry.definition}
              </p>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
