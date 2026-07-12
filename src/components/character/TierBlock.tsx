import type { SkillType } from '@/types/character';
import { SkillCard, type TierAccent } from './SkillCard';
import { useTranslation } from '@/hooks/useTranslation';

export interface TierBlockProps {
  label: string;
  name?: string;
  description?: string;
  skillType?: SkillType;
  cost?: string;
  requirement?: string;
  tierAccent?: TierAccent;
  previousDescription?: string;
  image?: string;
}

export function TierBlock({
  label,
  name,
  description,
  skillType,
  cost,
  requirement,
  tierAccent,
  previousDescription,
  image,
}: TierBlockProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
      {description ? (
        <>
          <SkillCard
            name={name ?? ''}
            description={description}
            skillType={skillType}
            cost={cost}
            tierAccent={tierAccent}
            previousDescription={previousDescription}
            image={image}
          />
          {requirement && (
            <p className="text-xs font-medium uppercase tracking-wide text-subtle">
              {t('characterDetail.requirement', { value: requirement })}
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
}
