// ══ RIPPLE — Material-style tap ripple (Wave C3 motion pass 2026-05-28) ═══
// Mount inside a position:relative parent (button/card). Captures pointerdown
// at the parent and spawns a single ripple dot at the tap coordinates. Each
// dot is a 12px circle that scales 0 → 4 and fades 0.55 → 0 over 520ms via
// the .andura-ripple-dot keyframe (global.css). Dots auto-remove after the
// animation ends.
//
// Why a component (vs a hook):
//   - Lives entirely in the DOM, no parent state churn.
//   - One <Ripple /> child per interactive surface = zero re-render cost.
//   - Color tints via CSS var --ripple-color (defaults to --brick).
//
// A11y: the ripple is decorative, aria-hidden + pointer-events: none so it
// never intercepts the click. Under prefers-reduced-motion the global * cap
// collapses the keyframe to instant, leaving a single 1-frame dot — visually
// quiet enough to read as "no animation" (better than mounting nothing because
// it preserves the same hit-target geometry for testing).
//
// Usage:
//   <button className="relative overflow-hidden press-feedback">
//     <Ripple />
//     Click me
//   </button>

import { useEffect, useRef, useState, type JSX, type PointerEvent } from 'react';

interface RippleProps {
  /** Tailwind/CSS color override via inline --ripple-color (defaults to --brick). */
  color?: string;
}

interface Dot {
  id: number;
  x: number;
  y: number;
}

let dotCounter = 0;

export function Ripple({ color }: RippleProps = {}): JSX.Element {
  const hostRef = useRef<HTMLSpanElement | null>(null);
  const [dots, setDots] = useState<Dot[]>([]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const parent = host.parentElement;
    if (!parent) return;

    function handle(e: PointerEvent | globalThis.PointerEvent): void {
      if (!host || !parent) return;
      const rect = parent.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = ++dotCounter;
      setDots((d) => [...d, { id, x, y }]);
      window.setTimeout(() => {
        setDots((d) => d.filter((dot) => dot.id !== id));
      }, 560);
    }

    parent.addEventListener('pointerdown', handle as EventListener);
    return () => {
      parent.removeEventListener('pointerdown', handle as EventListener);
    };
  }, []);

  return (
    <span
      ref={hostRef}
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={color ? ({ ['--ripple-color' as string]: color } as React.CSSProperties) : undefined}
    >
      {dots.map((dot) => (
        <span
          key={dot.id}
          className="andura-ripple-dot"
          style={{ left: `${dot.x}px`, top: `${dot.y}px` }}
        />
      ))}
    </span>
  );
}
