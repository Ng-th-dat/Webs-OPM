import { Link } from 'react-router-dom';
import type { GameUpdateEntry } from '@/types/gameUpdate';
import {
  UPDATE_CATEGORY_ICONS,
  UPDATE_CATEGORY_LABEL_KEYS,
  UPDATE_CATEGORY_STYLES,
  formatUpdateDate,
} from '@/utils/gameUpdates';
import { SERVER_LABEL_KEYS, SERVER_STYLES } from '@/utils/releaseSchedule';
import { useTranslation } from '@/hooks/useTranslation';

interface UpdateCardProps {
  entry: GameUpdateEntry;
}

export function UpdateCard({ entry }: UpdateCardProps) {
  const { t, language } = useTranslation();
  const style = UPDATE_CATEGORY_STYLES[entry.category];
  const Icon = UPDATE_CATEGORY_ICONS[entry.category];

  return (
    <Link
      to={`/updates/${entry.slug}`}
      className="group flex flex-col overflow-hidden rounded-card border border-border bg-surface transition duration-300 hover:-translate-y-1 hover:border-accent-info/30"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-elevated">
        {entry.image ? (
          <img
            src={entry.image}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center ${style.iconBg}`}>
            <Icon className="h-10 w-10" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style.badge}`}
          >
            {t(UPDATE_CATEGORY_LABEL_KEYS[entry.category])}
          </span>
          {entry.server && (
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${SERVER_STYLES[entry.server]}`}
            >
              {t(SERVER_LABEL_KEYS[entry.server])}
            </span>
          )}
          <span className="text-[11px] font-medium text-subtle">
            {formatUpdateDate(entry.date, language)}
          </span>
        </div>

        <h3 className="line-clamp-2 text-base font-bold text-foreground transition-colors duration-200 group-hover:text-accent-info">
          {entry.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted">{entry.description}</p>
      </div>
    </Link>
  );
}
