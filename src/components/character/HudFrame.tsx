import type { Rarity } from '@/types/character';
import { RARITY_STYLES } from '@/utils/rarity';

interface HudFrameProps {
  rarity: Rarity;
  className?: string;
}

const TICKS = Array.from({ length: 8 });

export function HudFrame({ rarity, className = '' }: HudFrameProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 200"
      className={`pointer-events-none ${RARITY_STYLES[rarity]} ${className}`}
    >
      <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.35" />

      <g className="animate-spin-slow-reverse" style={{ transformOrigin: '100px 100px' }}>
        <circle
          cx="100"
          cy="100"
          r="82"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="46 18 22 30 36 14"
          opacity="0.7"
        />
      </g>

      <g className="animate-spin-slow" style={{ transformOrigin: '100px 100px' }}>
        <circle
          cx="100"
          cy="100"
          r="94"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="1 7"
          opacity="0.5"
        />
        {TICKS.map((_, index) => (
          <rect
            key={index}
            x="98.5"
            y="2"
            width="3"
            height="6"
            fill="currentColor"
            transform={`rotate(${index * 45} 100 100)`}
          />
        ))}
      </g>
    </svg>
  );
}
