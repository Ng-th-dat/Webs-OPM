import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useCharacters } from '@/hooks/useCharacters';
import { useMasteryMaterialImages } from '@/hooks/useMasteryMaterialImages';
import { calculateMasteryUpgrade } from '@/utils/masteryCalculator';
import { MASTERY_TIERS } from '@/data/mastery';
import { RARITY_GLOW } from '@/utils/rarity';
import {
  MASTERY_ABOUT_KEYS,
  MASTERY_BRANCH_LABEL_KEYS,
  MASTERY_BRANCH_STYLES,
  MASTERY_STAT_ICONS,
  fillRequirementTemplate,
} from '@/utils/mastery';
import type { MasteryBranch } from '@/types/mastery';
import type { Character } from '@/types/character';
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  ImageIcon,
  StarIcon,
  XIcon,
} from '@/components/common/icons';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { SearchInput } from '@/components/common/SearchInput';
import { CharacterPortrait } from '@/components/character/CharacterPortrait';

const BRANCHES: MasteryBranch[] = ['type', 'faction', 'level'];
const TIER_BAR_SEGMENTS = Array.from({ length: 10 }, (_, i) => i + 1);
const TRAINING_RULE_KEYS = [
  'mastery.info.trainingRule1',
  'mastery.info.trainingRule2',
  'mastery.info.trainingRule3',
] as const;

function MasteryInfoModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="animate-backdrop-in fixed inset-0 z-[100] flex items-center justify-center bg-canvas/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mastery-info-title"
        onClick={(event) => event.stopPropagation()}
        className="animate-modal-in relative flex max-h-[85vh] w-full max-w-lg flex-col gap-5 overflow-y-auto rounded-card border border-border bg-surface p-6 shadow-2xl shadow-black/40 sm:p-7"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.closeMenu')}
          className="absolute right-4 top-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-subtle transition-colors duration-200 hover:bg-elevated hover:text-foreground"
        >
          <XIcon className="h-4 w-4" />
        </button>

        <h2 id="mastery-info-title" className="pr-8 text-lg font-extrabold tracking-tight text-foreground">
          {t('mastery.info.title')}
        </h2>

        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wide text-accent-info">
            {t('mastery.info.specTitle')}
          </h3>
          <p className="text-sm leading-relaxed text-muted">{t('mastery.info.specAtk')}</p>
          <p className="text-sm leading-relaxed text-muted">{t('mastery.info.specDef')}</p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wide text-accent-info">
            {t('mastery.info.trainingTitle')}
          </h3>
          <ol className="flex flex-col gap-2">
            {TRAINING_RULE_KEYS.map((key, index) => (
              <li key={key} className="flex gap-2 text-sm leading-relaxed text-muted">
                <span className="shrink-0 font-bold text-foreground">{index + 1}.</span>
                <span>{t(key)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

function CharacterPickerCard({
  character,
  isSelected,
  onSelect,
}: {
  character: Character;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const glowStyle = { '--card-glow': RARITY_GLOW[character.rarity] } as CSSProperties;

  return (
    <button
      type="button"
      onClick={onSelect}
      style={glowStyle}
      className={`group relative flex aspect-[3/4] w-full overflow-hidden rounded-card border transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-16px_var(--card-glow)] ${
        isSelected ? 'border-accent' : 'border-border hover:border-accent/40'
      }`}
    >
      <CharacterPortrait
        name={character.name}
        rarity={character.rarity}
        image={character.image}
        fit="cover"
        className="absolute inset-0 h-full w-full rounded-none border-0 text-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-canvas via-canvas/60 to-transparent"
      />
      {/* line-clamp only truncates on a plain block, not a flex item directly — see CharacterCard */}
      <div className="relative mt-auto px-2 py-2">
        <h4 className="line-clamp-2 text-left text-xs font-extrabold italic uppercase leading-tight tracking-wide text-foreground">
          {character.name}
        </h4>
      </div>
      {isSelected && (
        <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-canvas">
          <CheckIcon className="h-3 w-3" />
        </span>
      )}
    </button>
  );
}

function CharacterPickerModal({
  characters,
  selectedId,
  onSelect,
  onClose,
}: {
  characters: Character[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const filtered = useMemo(
    () => characters.filter((character) => character.name.toLowerCase().includes(query.trim().toLowerCase())),
    [characters, query]
  );

  return (
    <div
      className="animate-backdrop-in fixed inset-0 z-[100] flex items-center justify-center bg-canvas/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="character-picker-title"
        onClick={(event) => event.stopPropagation()}
        className="animate-modal-in flex max-h-[85vh] w-full max-w-2xl flex-col gap-4 rounded-card border border-border bg-surface p-5 shadow-2xl shadow-black/40 sm:p-6"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 id="character-picker-title" className="text-lg font-extrabold tracking-tight text-foreground">
            {t('mastery.requirements.changeHero')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.closeMenu')}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-subtle transition-colors duration-200 hover:bg-elevated hover:text-foreground"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <SearchInput value={query} onChange={setQuery} placeholder={t('mastery.requirements.searchHero')} />

        {filtered.length > 0 ? (
          <div className="grid grid-cols-3 gap-3 overflow-y-auto pr-1 sm:grid-cols-4">
            {filtered.map((character) => (
              <CharacterPickerCard
                key={character.id}
                character={character}
                isSelected={character.id === selectedId}
                onSelect={() => {
                  onSelect(character.id);
                  onClose();
                }}
              />
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-muted">{t('mastery.requirements.noResults')}</p>
        )}
      </div>
    </div>
  );
}

function BranchIntroCard({ branch }: { branch: MasteryBranch }) {
  const { t } = useTranslation();
  const style = MASTERY_BRANCH_STYLES[branch];
  const Icon = style.icon;

  return (
    <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-5">
      <span className={`flex h-11 w-11 items-center justify-center rounded-lg border bg-elevated ${style.iconWrap}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-foreground">{t(MASTERY_BRANCH_LABEL_KEYS[branch])}</h3>
        <p className="text-sm leading-relaxed text-muted">{t(MASTERY_ABOUT_KEYS[branch])}</p>
      </div>
    </div>
  );
}

function TierBar({ fromTier, toTier, branch }: { fromTier: number; toTier: number; branch: MasteryBranch }) {
  const style = MASTERY_BRANCH_STYLES[branch];

  return (
    <div className="flex gap-1">
      {TIER_BAR_SEGMENTS.map((tier) => {
        const filled = tier > fromTier && tier <= toTier;
        return <span key={tier} className={`h-1.5 flex-1 rounded-full ${filled ? style.bar : 'bg-elevated'}`} />;
      })}
    </div>
  );
}

function StatGainRow({
  stat,
  fromValue,
  toValue,
  branch,
}: {
  stat: string;
  fromValue: number;
  toValue: number;
  branch: MasteryBranch;
}) {
  const style = MASTERY_BRANCH_STYLES[branch];
  const Icon = MASTERY_STAT_ICONS[stat] ?? StarIcon;

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-canvas/40 px-4 py-3">
      <span className="flex items-center gap-2.5">
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-elevated ${style.iconWrap}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="text-xs font-bold uppercase tracking-wide text-muted">{stat}</span>
      </span>
      <span className="flex items-center gap-2 text-sm">
        <span className="text-subtle">{fromValue.toLocaleString()}</span>
        <ArrowRightIcon className="h-3.5 w-3.5 shrink-0 text-subtle" />
        <span className={`font-extrabold ${style.text}`}>{toValue.toLocaleString()}</span>
      </span>
    </div>
  );
}

function TierStepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-elevated px-1.5 py-1.5">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease tier"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-lg font-bold text-foreground transition-colors duration-150 hover:bg-canvas disabled:opacity-30 disabled:hover:bg-transparent"
      >
        −
      </button>
      <span className="text-sm font-bold text-foreground">{label}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase tier"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-lg font-bold text-foreground transition-colors duration-150 hover:bg-canvas disabled:opacity-30 disabled:hover:bg-transparent"
      >
        +
      </button>
    </div>
  );
}

function MaterialCard({
  name,
  quantity,
  accentClass,
  imageUrl,
}: {
  name: string;
  quantity: number;
  accentClass: string;
  imageUrl?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-card border border-border bg-canvas/40 p-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-elevated">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImageIcon className="h-4 w-4 text-subtle" />
        )}
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm text-muted">{name}</span>
        <span className={`text-sm font-bold ${accentClass}`}>×{quantity.toLocaleString()}</span>
      </div>
    </div>
  );
}

function RequirementRow({
  tier,
  conditions,
  branch,
  character,
}: {
  tier: number;
  conditions: string[];
  branch: MasteryBranch;
  character: Character | null;
}) {
  const { t } = useTranslation();
  const style = MASTERY_BRANCH_STYLES[branch];

  return (
    <div className="flex flex-col gap-3 rounded-card border border-border/60 bg-canvas/40 p-4 sm:flex-row sm:gap-6">
      <div className="flex shrink-0 items-center gap-2 sm:w-28">
        <StarIcon className={`h-4 w-4 ${style.text}`} />
        <span className="text-sm font-bold text-foreground">{t('mastery.form.tier', { tier })}</span>
      </div>
      <ul className="flex flex-1 flex-col gap-1.5">
        {conditions.map((condition) => (
          <li key={condition} className="flex items-start gap-2 text-sm leading-relaxed text-muted">
            <CheckIcon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${style.text}`} />
            <span>{fillRequirementTemplate(condition, character, t)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MasteryPage() {
  const { t } = useTranslation();
  const { characters, loading: charactersLoading, error: charactersError } = useCharacters();
  const { images: materialImages } = useMasteryMaterialImages();

  const [branch, setBranch] = useState<MasteryBranch>('type');
  const [fromTier, setFromTier] = useState(0);
  const [toTier, setToTier] = useState(10);
  const [infoOpen, setInfoOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);

  const style = MASTERY_BRANCH_STYLES[branch];

  const sortedCharacters = useMemo(
    () => [...characters].sort((a, b) => a.name.localeCompare(b.name)),
    [characters]
  );

  useEffect(() => {
    if (!selectedCharacterId && sortedCharacters.length > 0) {
      setSelectedCharacterId(sortedCharacters[0].id);
    }
  }, [sortedCharacters, selectedCharacterId]);

  const selectedCharacter = sortedCharacters.find((character) => character.id === selectedCharacterId) ?? null;

  const result = useMemo(() => calculateMasteryUpgrade({ branch, fromTier, toTier }), [branch, fromTier, toTier]);

  const tiers = MASTERY_TIERS[branch];
  const hasRequirements = tiers.every((tier) => tier.requirements);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-8 sm:py-20">
      <div className="mb-10 flex flex-col gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-accent-info">
          {t('mastery.eyebrow')}
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {t('mastery.title')}
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted">{t('mastery.description')}</p>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-subtle">
          {t('mastery.about.title')}
        </h2>
        <button
          type="button"
          onClick={() => setInfoOpen(true)}
          aria-label={t('mastery.info.trigger')}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-elevated text-[11px] font-bold text-subtle transition-colors duration-200 hover:border-accent-info/50 hover:text-accent-info"
        >
          ?
        </button>
      </div>
      <p className="mb-4 text-sm leading-relaxed text-muted">{t('mastery.about.arenaOnly')}</p>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {BRANCHES.map((option) => (
          <BranchIntroCard key={option} branch={option} />
        ))}
      </div>

      {infoOpen && <MasteryInfoModal onClose={() => setInfoOpen(false)} />}

      <div className="mb-8 flex flex-wrap gap-3">
        {BRANCHES.map((option) => {
          const optionStyle = MASTERY_BRANCH_STYLES[option];
          const Icon = optionStyle.icon;
          const isActive = branch === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={isActive}
              onClick={() => setBranch(option)}
              style={isActive ? { boxShadow: `0 0 16px ${optionStyle.glow}` } : undefined}
              className={`flex min-h-[44px] items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition duration-200 ${
                isActive
                  ? `${optionStyle.border} ${optionStyle.text} bg-elevated`
                  : 'border-transparent text-subtle opacity-70 hover:opacity-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              {t(MASTERY_BRANCH_LABEL_KEYS[option])}
            </button>
          );
        })}
      </div>

      <div className="mb-8 rounded-3xl border border-border bg-surface p-6 sm:p-8">
        <h2 className={`mb-5 text-sm font-extrabold uppercase tracking-[0.2em] ${style.text}`}>
          {t('mastery.result.title')}
        </h2>

        <div className="flex flex-col gap-5 rounded-2xl border border-border bg-canvas/60 p-5 sm:p-6">
          <TierBar fromTier={fromTier} toTier={toTier} branch={branch} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                {t('mastery.form.fromTier')}
              </span>
              <TierStepper
                label={fromTier === 0 ? t('mastery.form.notStarted') : t('mastery.form.tier', { tier: fromTier })}
                value={fromTier}
                min={0}
                max={toTier}
                onChange={setFromTier}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                {t('mastery.form.toTier')}
              </span>
              <TierStepper
                label={t('mastery.form.tier', { tier: toTier })}
                value={toTier}
                min={Math.max(1, fromTier)}
                max={10}
                onChange={setToTier}
              />
            </div>
          </div>

          <div className="h-px bg-border" />

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
              {t('mastery.result.statGain')}
            </h3>
            <div className="flex flex-col gap-2">
              {result.statGain.map((stat) => (
                <StatGainRow
                  key={stat.stat}
                  stat={stat.stat}
                  fromValue={stat.fromValue}
                  toValue={stat.toValue}
                  branch={branch}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
              {t('mastery.result.materials')}
            </h3>
            {result.materials.length > 0 ? (
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {result.materials.map((material) => (
                  <MaterialCard
                    key={material.materialId}
                    name={material.materialName}
                    quantity={material.quantity}
                    accentClass={style.text}
                    imageUrl={materialImages[material.materialId]}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">{t('mastery.result.noMaterials')}</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className={`text-sm font-extrabold uppercase tracking-[0.2em] ${style.text}`}>
            {t('mastery.requirements.title')}
          </h2>

          {hasRequirements && sortedCharacters.length > 0 && (
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                {t('mastery.requirements.characterLabel')}
              </span>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                style={{ boxShadow: `0 0 0 1px rgba(255,255,255,0.05), 0 6px 16px -8px ${style.glow}` }}
                className="flex items-center gap-2 rounded-full border border-border bg-elevated py-1 pl-1 pr-3 transition-colors duration-200 hover:border-accent/40"
              >
                {selectedCharacter && (
                  <CharacterPortrait
                    name={selectedCharacter.name}
                    rarity={selectedCharacter.rarity}
                    image={selectedCharacter.image}
                    className="h-8 w-8 rounded-full"
                  />
                )}
                <span className="text-sm font-bold text-foreground">{selectedCharacter?.name}</span>
                <ChevronDownIcon className={`h-3.5 w-3.5 shrink-0 ${style.text}`} />
              </button>
            </div>
          )}
        </div>

        {pickerOpen && (
          <CharacterPickerModal
            characters={sortedCharacters}
            selectedId={selectedCharacterId}
            onSelect={setSelectedCharacterId}
            onClose={() => setPickerOpen(false)}
          />
        )}

        {hasRequirements && charactersLoading ? (
          <LoadingState label={t('common.loading')} />
        ) : hasRequirements && charactersError ? (
          <EmptyState
            icon={AlertTriangleIcon}
            title={t('common.errorTitle')}
            description={t('common.errorDescription')}
          />
        ) : hasRequirements ? (
          <div className="flex flex-col gap-3">
            {tiers.map((tier) => (
              <RequirementRow
                key={tier.tier}
                tier={tier.tier}
                conditions={tier.requirements!}
                branch={branch}
                character={selectedCharacter}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-canvas/40 p-6 text-center">
            <p className="text-sm text-muted">{t('common.comingSoon')}</p>
          </div>
        )}
      </div>
    </section>
  );
}
