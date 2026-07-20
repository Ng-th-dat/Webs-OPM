import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Rarity, CharacterFaction, CharacterRank, ReleaseStatus, ReleaseTiming, SkillType } from '@main/types/character';
import { createCharacter, fetchCharacterById, updateCharacter } from '@/lib/characters';
import { AWAKENING_ELIGIBLE_RARITIES, RARITY_SWATCH } from '@/lib/rarity';
import {
  FACTION_OPTIONS,
  MONTH_ABBREVIATIONS,
  MONTH_OPTIONS,
  RANK_OPTIONS,
  RARITY_OPTIONS,
  RELEASE_STATUS_OPTIONS,
  ROLE_OPTIONS,
  SKILL_TYPE_OPTIONS,
  TIMING_OPTIONS,
  TYPE_OPTIONS,
} from '@/lib/badges';
import { XIcon } from '@/components/icons';
import { ImageUpload } from '@/components/ImageUpload';
import { BadgeSelect } from '@/components/BadgeSelect';
import { useToast } from '@/components/Toast';
import { useConfirm } from '@/components/ConfirmDialog';
import { buttonClasses } from '@/lib/buttonStyles';

const CORE_ROLE = 'Core';

interface SkillFormValue {
  description: string;
  descriptionVi: string;
  upgradedDescription: string;
  upgradedDescriptionVi: string;
  skillType: SkillType | '';
  cost: string;
  image: string;
}

interface AwakeningFormValue {
  tier: string;
  description: string;
  descriptionVi: string;
  requirement: string;
  image: string;
}

interface CoreFormValue {
  tier: string;
  name: string;
  description: string;
  descriptionVi: string;
  requirement: string;
  image: string;
}

interface FormState {
  name: string;
  slug: string;
  image: string;
  rarity: Rarity | '';
  type: string;
  faction: CharacterFaction | '';
  rank: CharacterRank | '';
  role: string;
  tags: string;
  releaseVersion: string;
  releaseStatus: ReleaseStatus | '';
  debutMonthAbbr: string;
  debutYear: string;
  debutTiming: ReleaseTiming | '';
  comebackMonthAbbr: string;
  comebackYear: string;
  comebackTiming: ReleaseTiming | '';
  passiveDescription: string;
  passiveDescriptionVi: string;
  passiveGoldDescription: string;
  passiveGoldDescriptionVi: string;
  passivePurpleDescription: string;
  passivePurpleDescriptionVi: string;
  passiveImage: string;
  strengths: string;
  weaknesses: string;
  recommendedUsage: string;
}

const EMPTY_SKILL: SkillFormValue = {
  description: '',
  descriptionVi: '',
  upgradedDescription: '',
  upgradedDescriptionVi: '',
  skillType: '',
  cost: '',
  image: '',
};

const EMPTY_AWAKENING: AwakeningFormValue = {
  tier: '1',
  description: '',
  descriptionVi: '',
  requirement: '',
  image: '',
};

const EMPTY_CORE: CoreFormValue = {
  tier: '1',
  name: '',
  description: '',
  descriptionVi: '',
  requirement: '',
  image: '',
};

const EMPTY_FORM: FormState = {
  name: '',
  slug: '',
  image: '',
  rarity: '',
  type: '',
  faction: '',
  rank: '',
  role: '',
  tags: '',
  releaseVersion: '',
  releaseStatus: '',
  debutMonthAbbr: '',
  debutYear: '',
  debutTiming: '',
  comebackMonthAbbr: '',
  comebackYear: '',
  comebackTiming: '',
  passiveDescription: '',
  passiveDescriptionVi: '',
  passiveGoldDescription: '',
  passiveGoldDescriptionVi: '',
  passivePurpleDescription: '',
  passivePurpleDescriptionVi: '',
  passiveImage: '',
  strengths: '',
  weaknesses: '',
  recommendedUsage: '',
};

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const inputClasses =
  'w-full rounded-xl border border-border bg-elevated px-3.5 py-2.5 text-sm text-foreground placeholder:text-subtle transition-colors duration-200 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/15 disabled:cursor-not-allowed disabled:opacity-60';

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
        {required && <span className="ml-1 text-danger">*</span>}
      </span>
      {children}
      {hint && <span className="text-xs text-subtle">{hint}</span>}
    </label>
  );
}

function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputClasses} />;
}

function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClasses} min-h-[5rem] resize-y`} />;
}

function Panel({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-card border border-border bg-surface p-4 shadow-elevated transition-shadow duration-300 sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

function RemovableRow({ onRemove, children }: { onRemove: () => void; children: ReactNode }) {
  return (
    <div className="relative rounded-xl border border-border bg-elevated/50 p-4">
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove"
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md text-subtle transition-colors duration-200 hover:bg-danger/10 hover:text-danger"
      >
        <XIcon className="h-4 w-4" />
      </button>
      <div className="flex flex-col gap-3 pr-8">{children}</div>
    </div>
  );
}

/** Live mirror of CharacterCard's rarity-glow identity, so an officer can see what they're
    building instead of guessing from a wall of form fields — also what fills the wide
    layout meaningfully instead of just stretching inputs to uncomfortable widths. */
function CharacterPreviewCard({ form, slugPreview }: { form: FormState; slugPreview: string }) {
  const rarityColor = form.rarity ? RARITY_SWATCH[form.rarity] : undefined;
  const chips = [form.type, form.faction, form.rank, form.role].filter(Boolean);
  const tags = form.tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  return (
    <aside className="xl:sticky xl:top-6 xl:self-start">
      <div
        className="ops-bracket flex flex-col gap-4 overflow-hidden rounded-card border bg-surface p-5 shadow-elevated transition-colors duration-300"
        style={{ borderColor: rarityColor ? `${rarityColor}66` : undefined }}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Live Preview</p>

        <div
          className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-xl bg-elevated transition-shadow duration-300"
          style={rarityColor ? { boxShadow: `0 0 0 2px ${rarityColor}55, 0 20px 36px -18px ${rarityColor}` } : undefined}
        >
          {form.image ? (
            <img src={form.image} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-5xl font-black text-subtle">{(form.name || '?').slice(0, 1).toUpperCase()}</span>
          )}
          {form.rarity && (
            <span
              className="absolute left-2 top-2 rounded-md px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-canvas shadow-elevated"
              style={{ backgroundColor: rarityColor }}
            >
              {form.rarity}
            </span>
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate text-base font-extrabold text-foreground">{form.name || 'Unnamed character'}</p>
          <p className="truncate text-xs text-subtle">/{slugPreview || 'slug'}</p>
        </div>

        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-border bg-elevated px-2 py-1 text-[10px] font-semibold text-muted"
              >
                {chip}
              </span>
            ))}
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span key={tag} className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-accent">
                {tag}
              </span>
            ))}
          </div>
        )}

        {form.releaseStatus && (
          <span className="w-fit rounded-full border border-border px-2 py-1 text-[10px] font-semibold text-muted">
            {form.releaseStatus} · v{form.releaseVersion || '?'}
          </span>
        )}
      </div>
    </aside>
  );
}

type SubmitStatus = { kind: 'idle' } | { kind: 'submitting' } | { kind: 'error'; message: string };

export function CharacterFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [skills, setSkills] = useState<SkillFormValue[]>([]);
  const [awakenings, setAwakenings] = useState<AwakeningFormValue[]>([]);
  const [cores, setCores] = useState<CoreFormValue[]>([]);
  const [status, setStatus] = useState<SubmitStatus>({ kind: 'idle' });
  const [loading, setLoading] = useState(isEditMode);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setLoadError(null);
    fetchCharacterById(id)
      .then((character) => {
        if (!character) {
          setLoadError(`No character found for "${id}"`);
          return;
        }
        setForm({
          name: character.name,
          slug: character.slug,
          image: character.image,
          rarity: character.rarity,
          type: character.type,
          faction: character.faction,
          rank: character.rank,
          role: character.role,
          tags: character.tags.join(', '),
          releaseVersion: character.releaseVersion,
          releaseStatus: character.releaseStatus,
          debutMonthAbbr: character.debutMonth ? MONTH_ABBREVIATIONS[character.debutMonth - 1] : '',
          debutYear: character.debutYear ? String(character.debutYear) : '',
          debutTiming: character.debutTiming ?? '',
          comebackMonthAbbr: character.comebackMonth ? MONTH_ABBREVIATIONS[character.comebackMonth - 1] : '',
          comebackYear: character.comebackYear ? String(character.comebackYear) : '',
          comebackTiming: character.comebackTiming ?? '',
          passiveDescription: character.passive.description,
          passiveDescriptionVi: character.passive.descriptionVi ?? '',
          passiveGoldDescription: character.passive.goldDescription ?? '',
          passiveGoldDescriptionVi: character.passive.goldDescriptionVi ?? '',
          passivePurpleDescription: character.passive.purpleDescription ?? '',
          passivePurpleDescriptionVi: character.passive.purpleDescriptionVi ?? '',
          passiveImage: character.passive.image ?? '',
          strengths: character.strengths.join('\n'),
          weaknesses: character.weaknesses.join('\n'),
          recommendedUsage: character.recommendedUsage,
        });
        setSlugTouched(true);
        setSkills(
          character.skills.map((skill) => ({
            description: skill.description,
            descriptionVi: skill.descriptionVi ?? '',
            upgradedDescription: skill.upgradedDescription ?? '',
            upgradedDescriptionVi: skill.upgradedDescriptionVi ?? '',
            skillType: skill.skillType ?? '',
            cost: skill.cost ?? '',
            image: skill.image ?? '',
          }))
        );
        setAwakenings(
          (character.awakenings ?? []).map((awakening) => ({
            tier: String(awakening.tier),
            description: awakening.description,
            descriptionVi: awakening.descriptionVi ?? '',
            requirement: awakening.requirement ?? '',
            image: awakening.image ?? '',
          }))
        );
        setCores(
          (character.core ?? []).map((core) => ({
            tier: String(core.tier),
            name: core.name,
            description: core.description,
            descriptionVi: core.descriptionVi ?? '',
            requirement: core.requirement ?? '',
            image: core.image ?? '',
          }))
        );
      })
      .catch((err: unknown) => setLoadError(err instanceof Error ? err.message : 'Failed to load character'))
      .finally(() => setLoading(false));
  }, [id]);

  const hasTierSection = form.rarity !== '' && AWAKENING_ELIGIBLE_RARITIES.includes(form.rarity as Rarity);
  const isCoreRole = form.role === CORE_ROLE;
  const showAwakenings = hasTierSection && !isCoreRole;
  const showCore = hasTierSection && isCoreRole;

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateSkill(index: number, patch: Partial<SkillFormValue>) {
    setSkills((current) => current.map((skill, i) => (i === index ? { ...skill, ...patch } : skill)));
  }

  function updateAwakening(index: number, patch: Partial<AwakeningFormValue>) {
    setAwakenings((current) => current.map((awakening, i) => (i === index ? { ...awakening, ...patch } : awakening)));
  }

  function updateCore(index: number, patch: Partial<CoreFormValue>) {
    setCores((current) => current.map((core, i) => (i === index ? { ...core, ...patch } : core)));
  }

  const slugPreview = useMemo(() => slugify(form.slug || form.name), [form.slug, form.name]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const slug = slugPreview;
    if (!slug) {
      setStatus({ kind: 'error', message: 'Name or slug is required' });
      return;
    }
    if (!form.rarity || !form.faction || !form.rank || !form.releaseStatus) {
      setStatus({ kind: 'error', message: 'Rarity, faction, rank, and release status are required' });
      return;
    }

    const payload = {
      name: form.name.trim(),
      slug,
      image: form.image,
      rarity: form.rarity,
      type: form.type,
      faction: form.faction,
      rank: form.rank,
      role: form.role,
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      skills: skills.map((skill) => ({
        description: skill.description.trim(),
        descriptionVi: skill.descriptionVi.trim() || undefined,
        upgradedDescription: skill.upgradedDescription.trim() || undefined,
        upgradedDescriptionVi: skill.upgradedDescriptionVi.trim() || undefined,
        skillType: skill.skillType || undefined,
        cost: skill.cost.trim() || undefined,
        image: skill.image || undefined,
      })),
      passive: {
        description: form.passiveDescription.trim(),
        descriptionVi: form.passiveDescriptionVi.trim() || undefined,
        goldDescription: form.passiveGoldDescription.trim() || undefined,
        goldDescriptionVi: form.passiveGoldDescriptionVi.trim() || undefined,
        purpleDescription: form.passivePurpleDescription.trim() || undefined,
        purpleDescriptionVi: form.passivePurpleDescriptionVi.trim() || undefined,
        image: form.passiveImage || undefined,
      },
      awakenings: showAwakenings
        ? awakenings.map((awakening) => ({
            tier: Number(awakening.tier),
            description: awakening.description.trim(),
            descriptionVi: awakening.descriptionVi.trim() || undefined,
            requirement: awakening.requirement.trim() || undefined,
            image: awakening.image || undefined,
          }))
        : undefined,
      core: showCore
        ? cores.map((core) => ({
            tier: Number(core.tier),
            name: core.name.trim(),
            description: core.description.trim(),
            descriptionVi: core.descriptionVi.trim() || undefined,
            requirement: core.requirement.trim() || undefined,
            image: core.image || undefined,
          }))
        : undefined,
      strengths: form.strengths.split('\n').map((line) => line.trim()).filter(Boolean),
      weaknesses: form.weaknesses.split('\n').map((line) => line.trim()).filter(Boolean),
      recommendedUsage: form.recommendedUsage.trim(),
      releaseVersion: form.releaseVersion.trim(),
      releaseStatus: form.releaseStatus,
      debutMonth: form.debutMonthAbbr
        ? MONTH_ABBREVIATIONS.indexOf(form.debutMonthAbbr as (typeof MONTH_ABBREVIATIONS)[number]) + 1
        : null,
      debutYear: form.debutMonthAbbr && form.debutYear ? Number(form.debutYear) : null,
      debutTiming: form.debutMonthAbbr ? form.debutTiming || 'Start of Month' : null,
      comebackMonth: form.comebackMonthAbbr
        ? MONTH_ABBREVIATIONS.indexOf(form.comebackMonthAbbr as (typeof MONTH_ABBREVIATIONS)[number]) + 1
        : null,
      comebackYear: form.comebackMonthAbbr && form.comebackYear ? Number(form.comebackYear) : null,
      comebackTiming: form.comebackMonthAbbr ? form.comebackTiming || 'Mid Month' : null,
    };

    const confirmed = await confirm(
      isEditMode
        ? { title: 'Save changes?', message: `This updates "${payload.name}" in Supabase right away.` }
        : { title: 'Add this character?', message: `"${payload.name}" will be added to Supabase right away.` }
    );
    if (!confirmed) return;

    setStatus({ kind: 'submitting' });
    try {
      if (isEditMode && id) {
        await updateCharacter(id, payload);
        showToast(`Saved changes to "${payload.name}"`, 'success');
      } else {
        await createCharacter(payload);
        showToast(`Added "${payload.name}" to Supabase`, 'success');
      }
      navigate('/characters');
    } catch (error) {
      setStatus({ kind: 'error', message: error instanceof Error ? error.message : 'Failed to save character' });
    }
  }

  if (isEditMode && loading) {
    return <p className="text-sm text-muted">Loading character…</p>;
  }

  if (isEditMode && loadError) {
    return <p className="text-sm text-danger">{loadError}</p>;
  }

  return (
    <div className="mx-auto max-w-[1600px]">
      <p className="mb-6 max-w-3xl text-sm text-muted">
        {isEditMode ? (
          <>
            Editing <span className="font-semibold text-foreground">{form.name}</span>. Changes write directly to
            Supabase.
          </>
        ) : (
          <>
            Writes directly to the <code className="rounded bg-elevated px-1 py-0.5">characters</code> table in
            Supabase. Images upload straight to Supabase Storage — enter a name first so uploads have a folder to go
            in.
          </>
        )}
      </p>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Panel title="Basic Info">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Name" required>
              <TextInput
                value={form.name}
                onChange={(event) => {
                  const name = event.target.value;
                  updateField('name', name);
                  if (!slugTouched) updateField('slug', slugify(name));
                }}
                placeholder="e.g. Genos"
              />
            </Field>
            <Field
              label="Slug"
              required
              hint={isEditMode ? "Locked after creation — it's the image storage folder name." : 'Used for the URL and the image storage folder.'}
            >
              <TextInput
                value={form.slug}
                disabled={isEditMode}
                onChange={(event) => {
                  setSlugTouched(true);
                  updateField('slug', event.target.value);
                }}
                placeholder="e.g. genos"
              />
            </Field>
            <Field label="Portrait">
              <ImageUpload slug={slugPreview} slot="portrait" value={form.image} onChange={(url) => updateField('image', url)} />
            </Field>
            <Field label="Release version" required>
              <TextInput
                value={form.releaseVersion}
                onChange={(event) => updateField('releaseVersion', event.target.value)}
                placeholder="e.g. 1.3"
              />
            </Field>
          </div>

          <div className="h-px bg-border" />

          <div className="flex flex-col gap-5">
            <Field label="Rarity" required>
              <BadgeSelect value={form.rarity} onChange={(value) => updateField('rarity', value as Rarity)} options={RARITY_OPTIONS} />
            </Field>
            <Field label="Type" required>
              <BadgeSelect value={form.type} onChange={(value) => updateField('type', value)} options={TYPE_OPTIONS} />
            </Field>
            <Field label="Faction" required>
              <BadgeSelect value={form.faction} onChange={(value) => updateField('faction', value as CharacterFaction)} options={FACTION_OPTIONS} />
            </Field>
            <Field label="Rank" required hint="Hero Association class or monster threat level.">
              <BadgeSelect value={form.rank} onChange={(value) => updateField('rank', value as CharacterRank)} options={RANK_OPTIONS} />
            </Field>
            <Field label="Role" required hint='Picking "Core" swaps the Awakening section below for a Core section.'>
              <BadgeSelect value={form.role} onChange={(value) => updateField('role', value)} options={ROLE_OPTIONS} />
            </Field>
            <Field label="Release status" required>
              <BadgeSelect value={form.releaseStatus} onChange={(value) => updateField('releaseStatus', value as ReleaseStatus)} options={RELEASE_STATUS_OPTIONS} />
            </Field>
          </div>

          <div className="h-px bg-border" />

          <Field label="Tags" hint="Comma-separated, e.g. Hero, Swordsman, S-Class">
            <TextInput value={form.tags} onChange={(event) => updateField('tags', event.target.value)} placeholder="Hero, Swordsman, S-Class" />
          </Field>
        </Panel>

        <Panel
          title="Release Timing (CN)"
          description="CN's timing only — SEA is derived automatically (CN + 4 months) for the homepage's upcoming-releases spotlight. Leave blank if not yet announced. Comeback holds only the current/next one; edit it again when the next comeback happens."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Debut month (CN)">
              <BadgeSelect
                value={form.debutMonthAbbr}
                onChange={(value) => updateField('debutMonthAbbr', value)}
                options={[{ value: '' }, ...MONTH_OPTIONS]}
              />
            </Field>
            <Field label="Debut year (CN)">
              <TextInput
                type="number"
                value={form.debutYear}
                onChange={(event) => updateField('debutYear', event.target.value)}
                placeholder="e.g. 2026"
              />
            </Field>
            <Field label="Debut timing (CN)">
              <BadgeSelect
                value={form.debutTiming}
                onChange={(value) => updateField('debutTiming', value as ReleaseTiming)}
                options={TIMING_OPTIONS}
              />
            </Field>
            <Field label="Comeback month (CN)">
              <BadgeSelect
                value={form.comebackMonthAbbr}
                onChange={(value) => updateField('comebackMonthAbbr', value)}
                options={[{ value: '' }, ...MONTH_OPTIONS]}
              />
            </Field>
            <Field label="Comeback year (CN)">
              <TextInput
                type="number"
                value={form.comebackYear}
                onChange={(event) => updateField('comebackYear', event.target.value)}
                placeholder="e.g. 2026"
              />
            </Field>
            <Field label="Comeback timing (CN)">
              <BadgeSelect
                value={form.comebackTiming}
                onChange={(value) => updateField('comebackTiming', value as ReleaseTiming)}
                options={TIMING_OPTIONS}
              />
            </Field>
          </div>
        </Panel>

        <Panel title="Skills" description="Basic attack skills and the ultimate. Passive and Awakening/Core have their own sections below.">
          {skills.map((skill, index) => (
            <RemovableRow key={index} onRemove={() => setSkills((current) => current.filter((_, i) => i !== index))}>
              <Field label="Skill type">
                <BadgeSelect value={skill.skillType} onChange={(value) => updateSkill(index, { skillType: value as SkillType })} options={SKILL_TYPE_OPTIONS} />
              </Field>
              <Field label="Cost" hint='e.g. "None" or "2 Energy"'>
                <TextInput value={skill.cost} onChange={(event) => updateSkill(index, { cost: event.target.value })} />
              </Field>
              <Field label="Icon">
                <ImageUpload
                  slug={slugPreview}
                  slot={`skill-${index + 1}`}
                  value={skill.image}
                  onChange={(url) => updateSkill(index, { image: url })}
                />
              </Field>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Description (EN)" required>
                  <TextArea value={skill.description} onChange={(event) => updateSkill(index, { description: event.target.value })} />
                </Field>
                <Field label="Description (VI)">
                  <TextArea value={skill.descriptionVi} onChange={(event) => updateSkill(index, { descriptionVi: event.target.value })} />
                </Field>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Upgraded description (EN)" hint="Ultimate-only: full effect once upgraded to 3-star.">
                  <TextArea value={skill.upgradedDescription} onChange={(event) => updateSkill(index, { upgradedDescription: event.target.value })} />
                </Field>
                <Field label="Upgraded description (VI)">
                  <TextArea value={skill.upgradedDescriptionVi} onChange={(event) => updateSkill(index, { upgradedDescriptionVi: event.target.value })} />
                </Field>
              </div>
            </RemovableRow>
          ))}
          <button
            type="button"
            onClick={() => setSkills((current) => [...current, { ...EMPTY_SKILL }])}
            className={`self-start ${buttonClasses('dashed', 'sm')}`}
          >
            + Add skill
          </button>
        </Panel>

        <Panel title="Passive">
          <Field label="Icon">
            <ImageUpload slug={slugPreview} slot="passive" value={form.passiveImage} onChange={(url) => updateField('passiveImage', url)} />
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Description (EN)" required>
              <TextArea value={form.passiveDescription} onChange={(event) => updateField('passiveDescription', event.target.value)} />
            </Field>
            <Field label="Description (VI)">
              <TextArea value={form.passiveDescriptionVi} onChange={(event) => updateField('passiveDescriptionVi', event.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Gold description (EN)" hint="Full effect at 5-star Gold.">
              <TextArea value={form.passiveGoldDescription} onChange={(event) => updateField('passiveGoldDescription', event.target.value)} />
            </Field>
            <Field label="Gold description (VI)">
              <TextArea value={form.passiveGoldDescriptionVi} onChange={(event) => updateField('passiveGoldDescriptionVi', event.target.value)} />
            </Field>
            <Field label="Purple description (EN)" hint="Full effect at 5-star Purple.">
              <TextArea value={form.passivePurpleDescription} onChange={(event) => updateField('passivePurpleDescription', event.target.value)} />
            </Field>
            <Field label="Purple description (VI)">
              <TextArea value={form.passivePurpleDescriptionVi} onChange={(event) => updateField('passivePurpleDescriptionVi', event.target.value)} />
            </Field>
          </div>
        </Panel>

        {showAwakenings && (
          <Panel title="Awakening" description="Only shown for SSR+/UR/UR+ rarity with a non-Core role. Tier 1 and Tier 2 only.">
            {awakenings.map((awakening, index) => (
              <RemovableRow key={index} onRemove={() => setAwakenings((current) => current.filter((_, i) => i !== index))}>
                <Field label="Tier" required>
                  <TextInput type="number" min={1} max={2} value={awakening.tier} onChange={(event) => updateAwakening(index, { tier: event.target.value })} />
                </Field>
                <Field label="Art">
                  <ImageUpload
                    slug={slugPreview}
                    slot={`awaken-${awakening.tier}`}
                    value={awakening.image}
                    onChange={(url) => updateAwakening(index, { image: url })}
                  />
                </Field>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Description (EN)" required>
                    <TextArea value={awakening.description} onChange={(event) => updateAwakening(index, { description: event.target.value })} />
                  </Field>
                  <Field label="Description (VI)">
                    <TextArea value={awakening.descriptionVi} onChange={(event) => updateAwakening(index, { descriptionVi: event.target.value })} />
                  </Field>
                </div>
                <Field label="Requirement">
                  <TextInput value={awakening.requirement} onChange={(event) => updateAwakening(index, { requirement: event.target.value })} />
                </Field>
              </RemovableRow>
            ))}
            {awakenings.length < 2 && (
              <button
                type="button"
                onClick={() => setAwakenings((current) => [...current, { ...EMPTY_AWAKENING, tier: String(current.length + 1) }])}
                className={`self-start ${buttonClasses('dashed', 'sm')}`}
              >
                + Add awakening tier
              </button>
            )}
          </Panel>
        )}

        {showCore && (
          <Panel title="Core" description="Shown instead of Awakening for Core-role characters (same rarity gate).">
            {cores.map((core, index) => (
              <RemovableRow key={index} onRemove={() => setCores((current) => current.filter((_, i) => i !== index))}>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[6rem_1fr]">
                  <Field label="Tier" required>
                    <TextInput type="number" min={1} value={core.tier} onChange={(event) => updateCore(index, { tier: event.target.value })} />
                  </Field>
                  <Field label="Name" required>
                    <TextInput value={core.name} onChange={(event) => updateCore(index, { name: event.target.value })} />
                  </Field>
                </div>
                <Field label="Art">
                  <ImageUpload
                    slug={slugPreview}
                    slot={`core-${core.tier}`}
                    value={core.image}
                    onChange={(url) => updateCore(index, { image: url })}
                  />
                </Field>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Description (EN)" required>
                    <TextArea value={core.description} onChange={(event) => updateCore(index, { description: event.target.value })} />
                  </Field>
                  <Field label="Description (VI)">
                    <TextArea value={core.descriptionVi} onChange={(event) => updateCore(index, { descriptionVi: event.target.value })} />
                  </Field>
                </div>
                <Field label="Requirement">
                  <TextInput value={core.requirement} onChange={(event) => updateCore(index, { requirement: event.target.value })} />
                </Field>
              </RemovableRow>
            ))}
            <button
              type="button"
              onClick={() => setCores((current) => [...current, { ...EMPTY_CORE, tier: String(current.length + 1) }])}
              className={`self-start ${buttonClasses('dashed', 'sm')}`}
            >
              + Add core tier
            </button>
          </Panel>
        )}

        <Panel title="Analysis" description="Optional — can be filled in later.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Strengths" hint="One per line">
              <TextArea value={form.strengths} onChange={(event) => updateField('strengths', event.target.value)} />
            </Field>
            <Field label="Weaknesses" hint="One per line">
              <TextArea value={form.weaknesses} onChange={(event) => updateField('weaknesses', event.target.value)} />
            </Field>
          </div>
          <Field label="Recommended usage">
            <TextArea value={form.recommendedUsage} onChange={(event) => updateField('recommendedUsage', event.target.value)} />
          </Field>
        </Panel>

        {status.kind === 'error' && (
          <div className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
            {status.message}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={status.kind === 'submitting'}
            className={`self-start ${buttonClasses('primary', 'lg')}`}
          >
            {status.kind === 'submitting' ? 'Saving…' : isEditMode ? 'Save changes' : 'Save character'}
          </button>
          {isEditMode && (
            <button
              type="button"
              onClick={() => navigate('/characters')}
              className={`self-start ${buttonClasses('ghost', 'lg')}`}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <CharacterPreviewCard form={form} slugPreview={slugPreview} />
      </div>
    </div>
  );
}
