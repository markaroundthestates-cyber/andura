// ══ PULSE · READINESS ORB — hero readiness indicator ══════════════════════
// Ported from the Pulse mockup (interfata-noua/ui.jsx ReadinessOrb ~116-140).
// A living hero gauge for the Antrenor (Coach) home: a volt→aqua `Ring` wraps
// two counter-rotating blurred conic auras + a pure-opacity breathing core,
// with an animated count-up score and a localized label at the center.
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
// global prefers-reduced-motion block collapses them (the authoritative
// motion-safety mechanism). Token-only colors (volt/aqua).
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
  /** When true, exposes a `data-can-pr` PR-primed cue (consumed downstream).
   *  Forced false when empty (no fabricated PR signal). */
  canPR?: boolean;
}

export function ReadinessOrb({
  score = 80,
  label = '',
  canPR = false,
}: ReadinessOrbProps): JSX.Element {
  // Honest empty state: no real readiness yet → no number. The orb stays
  // present + breathing (living hero), but shows an em-dash, ring at 0,
  // neutral canPR (NOT the volt PR cue), and slightly reduced opacity.
  const isEmpty = score === null || score === undefined;
  // Real count-up (rounded int) — animates once per score change, snaps under
  // reduced motion. Clamp the ring fill to a valid 0-100 percentage. When empty,
  // count up from a fixed 0 so the hook stays unconditional (rules-of-hooks).
  const display = useCountUp(isEmpty ? 0 : score);
  const pct = isEmpty ? 0 : Math.min(100, Math.max(0, score));

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
      {/* Decorative living layers: two counter-rotating blurred conic auras +
          a breathing (pure-opacity) core. All aria-hidden. */}
      <span className="orb-aura" aria-hidden="true" />
      <span className="orb-aura2" aria-hidden="true" />
      <span className="orb-core" aria-hidden="true" />
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
        .orb-aura {
          position: absolute; width: 182px; height: 182px; border-radius: 50%;
          background: conic-gradient(from 0deg, transparent 0deg, color-mix(in oklab, var(--aqua) 45%, transparent) 90deg, transparent 200deg);
          filter: blur(7px); opacity: .55;
          animation: auraSpin calc(8s / max(var(--motion), .3)) linear infinite;
        }
        .orb-aura2 {
          position: absolute; width: 160px; height: 160px; border-radius: 50%;
          background: conic-gradient(from 180deg, transparent 0deg, color-mix(in oklab, var(--volt) 40%, transparent) 70deg, transparent 160deg);
          filter: blur(6px); opacity: .4;
          animation: auraSpinRev calc(11s / max(var(--motion), .3)) linear infinite;
        }
        .orb-core {
          position: absolute; width: 118px; height: 118px; border-radius: 50%;
          background: radial-gradient(circle, color-mix(in oklab, var(--aqua) 24%, transparent), transparent 70%);
          animation: glowBreath calc(3.6s / max(var(--motion), .3)) ease-in-out infinite;
        }
        @keyframes auraSpin { to { transform: rotate(360deg); } }
        @keyframes auraSpinRev { to { transform: rotate(-360deg); } }
        @keyframes glowBreath { 0%, 100% { opacity: .45; } 50% { opacity: 1; } }
        [data-calm="1"] .orb-aura, [data-calm="1"] .orb-aura2, [data-calm="1"] .orb-core {
          animation: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .orb-aura, .orb-aura2, .orb-core {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
