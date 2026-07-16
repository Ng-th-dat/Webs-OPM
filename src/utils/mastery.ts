import type { ComponentType, SVGProps } from 'react';
import type { MasteryBranch } from '@/types/mastery';
import type { Character } from '@/types/character';
import type { TranslationKey } from '@/i18n';
import { GaugeIcon, HeartIcon, ShieldIcon, SwordIcon } from '@/components/common/icons';
import { FACTION_LABEL_KEYS, RANK_LABEL_KEYS } from '@/utils/badges';

interface MasteryBranchStyle {
  iconWrap: string;
  border: string;
  bar: string;
  text: string;
  glow: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export const MASTERY_BRANCH_STYLES: Record<MasteryBranch, MasteryBranchStyle> = {
  type: {
    iconWrap: 'border-accent-info/40 text-accent-info',
    border: 'border-accent-info',
    bar: 'bg-accent-info',
    text: 'text-accent-info',
    glow: 'rgba(61, 169, 252, 0.35)',
    icon: SwordIcon,
  },
  faction: {
    iconWrap: 'border-rarity-ur/40 text-rarity-ur',
    border: 'border-rarity-ur',
    bar: 'bg-rarity-ur',
    text: 'text-rarity-ur',
    glow: 'rgba(169, 112, 255, 0.35)',
    icon: ShieldIcon,
  },
  level: {
    iconWrap: 'border-accent-secondary/40 text-accent-secondary',
    border: 'border-accent-secondary',
    bar: 'bg-accent-secondary',
    text: 'text-accent-secondary',
    glow: 'rgba(255, 176, 32, 0.35)',
    icon: GaugeIcon,
  },
};

export const MASTERY_BRANCH_LABEL_KEYS: Record<MasteryBranch, TranslationKey> = {
  type: 'mastery.branches.type',
  faction: 'mastery.branches.faction',
  level: 'mastery.branches.level',
};

export const MASTERY_ABOUT_KEYS: Record<MasteryBranch, TranslationKey> = {
  type: 'mastery.about.type',
  faction: 'mastery.about.faction',
  level: 'mastery.about.level',
};

export const MASTERY_STAT_ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  ATK: SwordIcon,
  DEF: ShieldIcon,
  HP: HeartIcon,
};

type Translate = (key: TranslationKey, vars?: Record<string, string | number>) => string;

/** Requirement lines embed {type}/{rank}/{faction} tokens for the numbers that are identical across characters but whose label depends on which character is being trained — filled in from a picked character, or left as literal tokens until one is picked. */
export function fillRequirementTemplate(line: string, character: Character | null, t: Translate): string {
  if (!character) return line;
  return line
    .replaceAll('{type}', character.type)
    .replaceAll('{rank}', t(RANK_LABEL_KEYS[character.rank]))
    .replaceAll('{faction}', t(FACTION_LABEL_KEYS[character.faction]));
}
