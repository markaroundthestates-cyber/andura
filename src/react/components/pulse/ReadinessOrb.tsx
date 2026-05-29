// ══ PULSE · READINESS ORB — hero readiness indicator ══════════════════════
// Ported from the Pulse mockup (interfata-noua/ui.jsx ReadinessOrb ~116-140).
// A living hero gauge for the Antrenor (Coach) home: a volt→aqua `Ring` wraps
// a breathing core + two counter-rotating auras + halo pulse rings, with an
// animated count-up score and a localized label at the center.
//
// Reuse over re-invent:
//   - The center number uses the REAL `useCountUp` hook (reduced-motion safe,
//     snaps to final value in tests/SSR) — NOT the mockup's window.useCountUp.
//   - The ring is the real Pulse `Ring` with gradId="pulse".
//
// i18n: the center label is a `label` PROP (caller passes t('antrenor.readiness…')
// or similar) — never a hardcoded English string (D-LEGACY-064: RO carries no
// diacritics; here it is the caller's responsibility).
//
// Motion safety: every looping animation divides its duration by
// max(var(--motion), .3) so the global motion scalar dials it down; the
// global prefers-reduced-motion block collapses them, and a [data-calm="1"]
// hard-stop is declared in the scoped <style>. Token-only colors (volt/aqua).
//
// A11y: the orb decoration layers are aria-hidden; the score + label are real
// text. `canPR` only flips a cosmetic accent (no semantic-only signal).
//
// Usage:
//   <ReadinessOrb score={coach.readiness.score} label={t('antrenor.readinessLabel')} canPR={coach.readiness.canPR} />

import type { JSX } from 'react';
import { useCountUp } from '../../hooks/useCountUp';
import { Ring } from './Ring';

interface ReadinessOrbProps {
  /** Readiness score 0-100 (drives both ring fill + count-up). `null`/absent →
   *  honest empty state (em-dash, ring 0, neutral aqua, dimmed) — the engine
   *  refuses a readiness verdict without history, so we NEVER fabricate a
   *  number. The orb still breathes (it is the living hero). */
  score?: number | null;
  /** Localized center label (e.g. "readiness"). Required so no English leaks. */
  label?: string;
  /** When true, tints the halo toward volt (PR-primed cue). Ignored when empty. */
  canPR?: boolean;
}

export function ReadinessOrb({
  score = 80,
  label = '',
  canPR = false,
}: ReadinessOrbProps): JSX.Element {
  // Honest empty state: no real readiness yet → no number. The orb stays
  // present + breathing (living hero), but shows an em-dash, ring at 0,
  // neutral aqua pulse (NOT the volt PR cue), and slightly reduced opacity.
  const isEmpty = score === null || score === undefined;
  // Real count-up (rounded int) — animates once per score change, snaps under
  // reduced motion. Clamp the ring fill to a valid 0-100 percentage. When empty,
  // count up from a fixed 0 so the hook stays unconditional (rules-of-hooks).
  const display = useCountUp(isEmpty ? 0 : score);
  const pct = isEmpty ? 0 : Math.min(100, Math.max(0, score));
  // PR-primed → lean the brighter pulse ring toward volt (the "charged" cue).
  // Empty state forces neutral aqua (no fabricated PR signal).
  const pulseColor = !isEmpty && canPR ? 'var(--volt)' : 'var(--aqua)';

  return (
    <div
      style={{
        position: 'relative',
        display: 'grid',
        placeItems: 'center',
        width: 168,
        height: 168,
        opacity: isEmpty ? 0.7 : 1,
      }}
      data-testid="readiness-orb"
      data-can-pr={!isEmpty && canPR ? 'true' : 'false'}
      data-empty={isEmpty ? 'true' : 'false'}
    >
      {/* Decorative living layers: breathing core + counter-rotating auras +
          two staggered halo pulse rings. All aria-hidden. */}
      <span className="orb-core" aria-hidden="true" />
      <span className="orb-aura" aria-hidden="true" />
      <span className="orb-aura2" aria-hidden="true" />
      <span className="orb-pulse" aria-hidden="true" />
      <span className="orb-pulse p2" aria-hidden="true" />
      <Ring size={150} stroke={11} pct={pct} gradId="pulse">
        <div style={{ textAlign: 'center' }}>
          <div
            className="font-display"
            style={{ fontSize: 52, fontWeight: 700, lineHeight: 1 }}
            data-testid="readiness-orb-score"
          >
            {isEmpty ? '—' : display}
          </div>
          {label && (
            <div
              className="font-mono"
              style={{
                marginTop: 4,
                fontSize: 10.5,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--ink-3)',
              }}
              data-testid="readiness-orb-label"
            >
              {label}
            </div>
          )}
        </div>
      </Ring>
      <style>{`
        .orb-core {
          position: absolute; width: 118px; height: 118px; border-radius: 50%;
          background: radial-gradient(circle, color-mix(in oklab, var(--aqua) 22%, transparent), transparent 72%);
          animation: orbBreath calc(4s / max(var(--motion), .3)) ease-in-out infinite;
        }
        .orb-aura, .orb-aura2 {
          position: absolute; width: 158px; height: 158px; border-radius: 50%;
          background: conic-gradient(from 0deg, transparent 0deg, color-mix(in oklab, var(--volt) 38%, transparent) 80deg, transparent 200deg);
          filter: blur(8px); opacity: .5;
          animation: orbSpin calc(11s / max(var(--motion), .3)) linear infinite;
        }
        .orb-aura2 {
          background: conic-gradient(from 140deg, transparent 0deg, color-mix(in oklab, var(--aqua) 40%, transparent) 90deg, transparent 220deg);
          animation: orbSpinRev calc(14s / max(var(--motion), .3)) linear infinite;
        }
        .orb-pulse {
          position: absolute; width: 150px; height: 150px; border-radius: 50%;
          border: 1.5px solid color-mix(in oklab, var(--aqua) 50%, transparent);
          animation: orbPulseRing calc(2.8s / max(var(--motion), .3)) ease-out infinite;
        }
        .orb-pulse.p2 {
          animation-delay: calc(1.4s / max(var(--motion), .3));
          border-color: color-mix(in oklab, ${pulseColor} 45%, transparent);
        }
        @keyframes orbBreath { 0%, 100% { transform: scale(.94); opacity: .7; } 50% { transform: scale(1.06); opacity: 1; } }
        @keyframes orbSpin { to { transform: rotate(360deg); } }
        @keyframes orbSpinRev { to { transform: rotate(-360deg); } }
        @keyframes orbPulseRing { 0% { transform: scale(.82); opacity: .55; } 70%, 100% { transform: scale(1.18); opacity: 0; } }
        [data-calm="1"] .orb-core,
        [data-calm="1"] .orb-aura,
        [data-calm="1"] .orb-aura2,
        [data-calm="1"] .orb-pulse {
          animation: none !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .orb-core, .orb-aura, .orb-aura2, .orb-pulse {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
