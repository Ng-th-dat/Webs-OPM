export const EFFECT_GLOSSARY: Record<string, string> = {
  'Total DMG Reduction':
    "A target's overall damage-reduction stat — lowering it makes that target take more damage from all sources.",
  'Specialized Direct DMG':
    "A damage type dealt straight to HP, tracked separately from a unit's standard ATK-based damage.",
  'Specialized Evasion': 'The chance to dodge Specialized Direct DMG specifically, separate from normal evasion.',
  'Non-Crit DMG Reduction': 'Reduces incoming damage from hits that are not critical strikes.',
  Unyielding: 'A protective effect that helps a unit resist being defeated outright.',
  'Specialized Unyielding': 'The Unyielding effect applied within the Specialized damage system.',
  'Specialized HP':
    "A separate HP pool, tracked apart from normal HP, that is depleted before a unit's real HP can be affected.",
  'Suppression Boost': 'A buff that increases the damage a unit deals; can be stripped by effects that remove it.',
  'Suppression Guard': 'A defensive buff that shields a unit; can be stripped by effects that remove it.',
  'Crit Resistance': 'Reduces the extra damage taken from critical hits.',
  'Specialized Speed': 'A speed boost within the Specialized system, affecting how early a unit acts in the turn order.',
  'Crit Rate': 'The chance for an attack to land as a critical hit.',
  'Crit DMG': 'The damage multiplier applied when an attack lands as a critical hit.',
};

export interface GlossaryEntry {
  term: string;
  definition: string;
}

export function getGlossaryEntries(...texts: (string | undefined)[]): GlossaryEntry[] {
  const matches = texts.filter((text): text is string => Boolean(text)).join(' ').match(/\[([^\]]+)\]/g) ?? [];
  const seen = new Set<string>();
  const entries: GlossaryEntry[] = [];

  for (const match of matches) {
    const term = match.slice(1, -1);
    const definition = EFFECT_GLOSSARY[term];
    if (!definition || seen.has(term)) continue;
    seen.add(term);
    entries.push({ term, definition });
  }

  return entries;
}
