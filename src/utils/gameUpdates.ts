import type { ComponentType, SVGProps } from 'react';
import type { UpdateCategory } from '@/types/gameUpdate';
import type { TranslationKey } from '@/i18n';
import { BurstIcon, GaugeIcon, ShieldIcon, SparklesIcon } from '@/components/common/icons';

export const UPDATE_CATEGORY_LABEL_KEYS: Record<UpdateCategory, TranslationKey> = {
  Update: 'updates.category.update',
  Event: 'updates.category.event',
  CnNews: 'updates.category.cnNews',
  Maintenance: 'updates.category.maintenance',
};

export const UPDATE_CATEGORY_STYLES: Record<UpdateCategory, { badge: string; iconBg: string }> = {
  Update: { badge: 'bg-accent-info text-canvas', iconBg: 'bg-accent-info/15 text-accent-info' },
  Event: { badge: 'bg-accent-secondary text-canvas', iconBg: 'bg-accent-secondary/15 text-accent-secondary' },
  CnNews: { badge: 'bg-rarity-ur text-canvas', iconBg: 'bg-rarity-ur/15 text-rarity-ur' },
  Maintenance: { badge: 'bg-subtle text-canvas', iconBg: 'bg-subtle/15 text-subtle' },
};

export const UPDATE_CATEGORY_ICONS: Record<UpdateCategory, ComponentType<SVGProps<SVGSVGElement>>> = {
  Update: GaugeIcon,
  Event: SparklesIcon,
  CnNews: BurstIcon,
  Maintenance: ShieldIcon,
};

export function formatUpdateDate(isoDate: string, locale: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
