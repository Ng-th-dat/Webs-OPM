/**
 * One button language for the whole Ops Deck: committing an action (primary/danger) gets
 * the angular `.ops-clip` corner from the topbar's "Add Character" button; everything lower
 * in the hierarchy (ghost, dashed "add another") stays soft-cornered so the clip reads as
 * "this does something now," not decoration slapped on every clickable element.
 */
export type ButtonVariant = 'primary' | 'danger' | 'ghost' | 'ghost-danger' | 'dashed';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'ops-clip bg-accent text-canvas shadow-elevated hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-elevated-lg active:translate-y-0 active:scale-[0.98]',
  danger:
    'ops-clip bg-danger text-white shadow-elevated hover:-translate-y-0.5 hover:bg-danger-hover hover:shadow-elevated-lg active:translate-y-0 active:scale-[0.98]',
  ghost: 'rounded-full text-muted hover:bg-elevated hover:text-foreground',
  'ghost-danger': 'rounded-full border border-danger/30 text-danger hover:bg-danger/10',
  dashed:
    'rounded-full border border-dashed border-border text-muted hover:-translate-y-0.5 hover:border-accent/50 hover:bg-accent/5 hover:text-accent',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-sm',
};

/** Works on `<button>`, `<Link>`, or `<NavLink>` — it's just a class string, not a component,
    since call sites need all three element types and gain nothing from a wrapper. */
export function buttonClasses(variant: ButtonVariant, size: ButtonSize = 'md', extra = ''): string {
  return `inline-flex items-center justify-center gap-1.5 font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${extra}`.trim();
}
