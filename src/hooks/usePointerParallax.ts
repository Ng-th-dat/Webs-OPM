import { useEffect, useRef, useState } from 'react';

interface ParallaxOffset {
  x: number;
  y: number;
}

/** Normalized (-1..1) pointer offset from the top-left of the attached element — resets to 0,0 when disabled or the pointer leaves. */
export function usePointerParallax<T extends HTMLElement>(enabled: boolean) {
  const ref = useRef<T>(null);
  const [offset, setOffset] = useState<ParallaxOffset>({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) {
      setOffset({ x: 0, y: 0 });
      return;
    }

    const node = ref.current;
    if (!node) return;

    function handlePointerMove(event: PointerEvent) {
      const rect = node!.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      setOffset({ x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) });
    }

    function handlePointerLeave() {
      setOffset({ x: 0, y: 0 });
    }

    node.addEventListener('pointermove', handlePointerMove);
    node.addEventListener('pointerleave', handlePointerLeave);
    return () => {
      node.removeEventListener('pointermove', handlePointerMove);
      node.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [enabled]);

  return { ref, offset };
}
