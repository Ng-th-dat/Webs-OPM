import { Badge } from './Badge';
import { useTranslation } from '@/hooks/useTranslation';
import { useSeo } from '@/hooks/useSeo';
import { truncateDescription } from '@/utils/seo';

interface LegalSection {
  title: string;
  body: string;
}

interface LegalPageProps {
  eyebrow: string;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
  contactLabel: string;
}

export function LegalPage({ eyebrow, title, updated, intro, sections, contactLabel }: LegalPageProps) {
  const { t } = useTranslation();
  useSeo({ title, description: truncateDescription(intro) });

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-8 sm:py-20">
      <div className="mb-10 flex flex-col gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-accent-info">
          {eyebrow}
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
        <span className="text-xs font-medium text-subtle">{updated}</span>
        <p className="text-base leading-relaxed text-muted">{intro}</p>
      </div>

      <div className="flex flex-col gap-5">
        {sections.map((section) => (
          <div key={section.title} className="rounded-card border border-border bg-surface p-5">
            <h2 className="text-base font-semibold text-foreground">{section.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{section.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-card border border-dashed border-border bg-surface px-5 py-4">
        <span className="text-sm font-medium text-foreground">{contactLabel}</span>
        <Badge>{t('common.comingSoon')}</Badge>
      </div>
    </section>
  );
}
