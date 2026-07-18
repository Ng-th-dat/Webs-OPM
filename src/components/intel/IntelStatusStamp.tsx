import type { CSSProperties } from 'react';
import type { IntelStatus } from '@/types/characterIntel';
import { INTEL_STATUS_LABEL_KEYS, INTEL_STATUS_STYLES } from '@/utils/characterIntel';
import { useTranslation } from '@/hooks/useTranslation';

interface IntelStatusStampProps {
  status: IntelStatus;
  className?: string;
  style?: CSSProperties;
}

export function IntelStatusStamp({ status, className = '', style }: IntelStatusStampProps) {
  const { t } = useTranslation();
  const styles = INTEL_STATUS_STYLES[status];

  return (
    <span
      style={style}
      className={`-rotate-6 select-none whitespace-nowrap rounded-md border-4 border-dashed bg-canvas/90 px-3 py-1 text-xs font-extrabold uppercase tracking-widest shadow-[2px_2px_0_rgba(0,0,0,0.35)] ${styles.stamp} ${className}`}
    >
      {t(INTEL_STATUS_LABEL_KEYS[status])}
    </span>
  );
}
