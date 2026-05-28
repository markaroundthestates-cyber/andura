// ══ CONFETTI BURST — celebratory particle burst (Wave C3 2026-05-28) ══════
// Tiny, theme-aware confetti for PR/win moments. ~14 particles spawned from a
// single origin point, each given a random outward direction + rotation +
// scale via CSS vars consumed by the .andura-confetti-particle keyframe in
// global.css. Particles auto-clean after 900ms.
//
// Why this over react-confetti / canvas-confetti:
//   - Zero KB dependency (vanilla CSS keyframe, ~50 LoC component).
//   - Auto-collapses under prefers-reduced-motion (global * cap → 1 frame,
//     no spray).
//   - Colors derive from CSS palette tokens (--brick, --succ, --warn) so
//     each theme's confetti reads native (mov purple in dark, champagne in
//     luxury, gold in living-body, brick in clasic).
//
// Usage — render conditionally at the moment of celebration:
//   {prHit && <ConfettiBurst originSelector="[data-testid=summary-pr-banner]" />}
// or fire imperatively via fireConfettiAt(x, y) inside an onClick.
//
// A11y: pure decoration, aria-hidden, pointer-events: none. Critical: do NOT
// announce "celebration" via aria-live — the surrounding banner copy ("PR
// nou!") is the semantic announcement; confetti is icing.

import { useEffect, useState, type JSX } from 'react';

interface Particle {
  id: number;
  dx: number;
  dy: number;
  rot: number;
  scale: number;
  color: string;
  delayMs: number;
}

// Theme-aware palette draws: brick (primary), succ (win green), warn (gold).
// All three are defined in every palette block in global.css → confetti
// re-tints automatically when the user switches theme.
const COLOR_VARS: readonly string[] = ['var(--brick)', 'var(--succ)', 'var(--warn)', 'var(--deep)'];

let particleCounter = 0;

function makeParticles(count: number): Particle[] {
  const out: Particle[] = [];
  for (let i = 0; i < count; i++) {
    // Spread angle ±70° from upward (so the burst spreads in a fan, not a
    // circle). Magnitude 60-120px so distant particles read; gravity gives
    // them positive dy by the end of the tween.
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * (Math.PI * 0.78);
    const magnitude = 60 + Math.random() * 70;
    const dx = Math.cos(angle) * magnitude;
    const dy = Math.sin(angle) * magnitude + 60; // +60 = gravity fall offset
    const rot = (Math.random() - 0.5) * 540;
    const scale = 0.7 + Math.random() * 0.6;
    const color = COLOR_VARS[i % COLOR_VARS.length] ?? 'var(--brick)';
    const delayMs = Math.floor(Math.random() * 80); // organic stagger
    out.push({ id: ++particleCounter, dx, dy, rot, scale, color, delayMs });
  }
  return out;
}

interface ConfettiBurstProps {
  /** Number of particles. 14 is a tasteful default — not gaudy. */
  count?: number;
  /** Auto-cleanup delay (ms). 1000 covers the 900ms keyframe + tiny buffer. */
  cleanupMs?: number;
}

/**
 * Mount inside a `position: relative` host element to emit a burst from the
 * host's center. The burst plays exactly once per mount — re-trigger by
 * key-changing the component (`<ConfettiBurst key={prCount} />`).
 */
export function ConfettiBurst({ count = 14, cleanupMs = 1000 }: ConfettiBurstProps = {}): JSX.Element | null {
  const [particles, setParticles] = useState<Particle[]>(() => makeParticles(count));

  useEffect(() => {
    const handle = window.setTimeout(() => setParticles([]), cleanupMs);
    return () => window.clearTimeout(handle);
  }, [cleanupMs]);

  if (particles.length === 0) return null;

  return (
    <span
      aria-hidden="true"
      className="absolute left-1/2 top-1/2 pointer-events-none"
      style={{ width: 0, height: 0 }}
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="andura-confetti-particle"
          style={{
            background: p.color,
            animationDelay: `${p.delayMs}ms`,
            ['--confetti-dx' as string]: `${p.dx}px`,
            ['--confetti-dy' as string]: `${p.dy}px`,
            ['--confetti-rot' as string]: `${p.rot}deg`,
            ['--confetti-scale' as string]: `${p.scale}`,
          } as React.CSSProperties}
        />
      ))}
    </span>
  );
}
