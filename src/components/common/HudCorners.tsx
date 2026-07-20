type CornerPosition = 'tl' | 'tr' | 'bl' | 'br';

const CORNER_CLASSES: Record<CornerPosition, string> = {
  tl: 'left-3 top-3 border-l-2 border-t-2',
  tr: 'right-3 top-3 border-r-2 border-t-2',
  bl: 'left-3 bottom-3 border-l-2 border-b-2',
  br: 'right-3 bottom-3 border-r-2 border-b-2',
};

const POSITIONS = Object.keys(CORNER_CLASSES) as CornerPosition[];

/** Four HUD-style targeting-reticle corner brackets, absolutely positioned over a `relative` parent. */
export function HudCorners({ className = 'border-accent-secondary/60' }: { className?: string }) {
  return (
    <>
      {POSITIONS.map((position) => (
        <span
          key={position}
          aria-hidden="true"
          className={`pointer-events-none absolute h-4 w-4 ${CORNER_CLASSES[position]} ${className}`}
        />
      ))}
    </>
  );
}
