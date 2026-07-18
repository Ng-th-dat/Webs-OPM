import { useEffect, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';

const DURATION_MS = 600;

/** Counts up from 0 to `target` on mount/when target changes — jumps straight to the final value under prefers-reduced-motion. */
export function useCountUp(target: number): number {
  const reducedMotion = useReducedMotion();
  const [value, setValue] = useState(reducedMotion ? target : 0);

  useEffect(() => {
    if (reducedMotion) {
      setValue(target);
      return;
    }

    let frameId: number;
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - start) / DURATION_MS, 1);
      setValue(Math.round(target * progress));
      if (progress < 1) frameId = requestAnimationFrame(tick);
    }

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [target, reducedMotion]);

  return value;
}
