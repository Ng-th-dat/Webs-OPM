interface VortexRingProps {
  reducedMotion: boolean;
  className?: string;
}

/**
 * A quiet nod to the game's own Ultimate-skill vortex — a soft blurred glow plus one slow-spinning
 * dashed ring — atmosphere behind the spotlight cards, not a focal element in its own right.
 * (Pared back from an earlier multi-ring/spoke/tick version that read as too busy for the hero.)
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

      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full text-accent-secondary">
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
            opacity="0.18"
          />
        </g>
      </svg>
    </div>
  );
}
