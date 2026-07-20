const TICKS = Array.from({ length: 12 });
const CORNER_ANGLES = [0, 90, 180, 270];

interface VortexRingProps {
  reducedMotion: boolean;
  className?: string;
}

/**
 * A recreation of the game's own Ultimate-skill vortex — concentric HUD rings + radiating
 * spokes + cardinal diamond studs — reskinned in the site's gold/blue palette instead of the
 * in-game blue, and simplified to three SVG rings so it stays legible as background atmosphere
 * behind the spotlight cards rather than competing detail.
 */
export function VortexRing({ reducedMotion, className = '' }: VortexRingProps) {
  return (
    <div aria-hidden="true" className={`pointer-events-none ${className}`}>
      <div
        className="absolute inset-0 rounded-full blur-[60px]"
        style={{
          background: 'radial-gradient(circle, var(--color-accent-secondary) 0%, var(--color-glow-blue) 55%, transparent 75%)',
          opacity: 0.1,
        }}
      />

      <div
        className={`absolute inset-[10%] rounded-full opacity-[0.07] ${reducedMotion ? '' : 'animate-spin-slow'}`}
        style={{
          background: 'repeating-conic-gradient(var(--color-accent-secondary) 0deg 1.2deg, transparent 1.2deg 15deg)',
        }}
      />

      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full text-accent-secondary">
        <circle cx="100" cy="100" r="56" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.15" />

        <g className={reducedMotion ? '' : 'animate-spin-slow-reverse'} style={{ transformOrigin: '100px 100px' }}>
          <circle
            cx="100"
            cy="100"
            r="74"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="38 14 20 26 32 12"
            opacity="0.28"
          />
        </g>

        <g className={reducedMotion ? '' : 'animate-spin-slow'} style={{ transformOrigin: '100px 100px' }} opacity="0.22">
          <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="1 7" />
          {TICKS.map((_, index) => (
            <rect key={index} x="98.5" y="6" width="3" height="7" fill="currentColor" transform={`rotate(${index * 30} 100 100)`} />
          ))}
        </g>

        <g
          className={reducedMotion ? '' : 'animate-spin-slow-reverse'}
          style={{ transformOrigin: '100px 100px', animationDuration: '30s' }}
          stroke="var(--color-accent-info)"
          opacity="0.25"
        >
          {CORNER_ANGLES.map((angle) => (
            <rect
              key={angle}
              x="96"
              y="2"
              width="8"
              height="8"
              fill="none"
              strokeWidth="1.5"
              transform={`rotate(${angle} 100 100) rotate(45 100 6)`}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
