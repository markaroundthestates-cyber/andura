// ══ BACKGROUND AURORA — Ambient palette-aware blobs (Daniel "in background
//    vreau animatii" 2026-05-28) ════════════════════════════════════════════
//
// Three large soft radial blobs drift very slowly behind the app shell. The
// blobs adopt the active palette's accent tokens via color-mix(var(--brick)…)
// so each theme (Clasic brick, Brain Coach violet, Luxury champagne, Living
// Body amber-gold) gets its own ambient mood "for free". Drift via transform
// translate + rotate over 28-44s (well below vestibular discomfort thresholds);
// auto-collapsed by the global prefers-reduced-motion block in global.css.
//
// Layering:
//   - position: fixed, inset: 0, pointer-events: none.
//   - z-index: -10 so the layer sits behind #root content (z-index: 1 in
//     global.css) without any chance of intercepting clicks.
//   - overflow: hidden on the wrapper so blob translate doesn't cause horizontal
//     scrollbars.
//
// Performance budget (Maria 65 phone + iOS jank guardrails):
//   - Exactly 3 blobs (no particle systems, no canvas).
//   - blur(80px) via CSS filter — single composite pass per blob; will-change:
//     transform tags the layer for GPU.
//   - Opacity capped 0.08-0.12 (light) / 0.10-0.14 (dark) — reads as "the
//     surface is alive" peripheral motion, never foreground noise.
//   - aria-hidden + role="presentation" — invisible to AT.
//
// Surgical: this is a NEW additive component; nothing else changes. Drop into
// Layout shell once and every authenticated route inherits the ambient layer.

import type { JSX } from 'react';

export function BackgroundAurora(): JSX.Element {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      data-testid="background-aurora"
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: -10 }}
    >
      {/* Blob 1 — primary accent (brick / violet / champagne / gold per palette).
          Anchored top-left, drifts diagonally toward center over 32s. */}
      <span
        aria-hidden="true"
        className="absolute animate-aurora-1 will-change-transform"
        style={{
          top: '-15%',
          left: '-10%',
          width: '60vw',
          height: '60vw',
          maxWidth: '720px',
          maxHeight: '720px',
          borderRadius: '9999px',
          filter: 'blur(80px)',
          background:
            'radial-gradient(circle, color-mix(in oklab, var(--brick) 65%, transparent) 0%, transparent 70%)',
          opacity: 0.12,
        }}
      />
      {/* Blob 2 — olive (energy/cardio accent token). Anchored bottom-right,
          drifts counter-clockwise to balance Blob 1. 38s cycle so the two
          never read as synced. */}
      <span
        aria-hidden="true"
        className="absolute animate-aurora-2 will-change-transform"
        style={{
          bottom: '-20%',
          right: '-15%',
          width: '70vw',
          height: '70vw',
          maxWidth: '820px',
          maxHeight: '820px',
          borderRadius: '9999px',
          filter: 'blur(80px)',
          background:
            'radial-gradient(circle, color-mix(in oklab, var(--olive) 55%, transparent) 0%, transparent 70%)',
          opacity: 0.10,
        }}
      />
      {/* Blob 3 — deep (rest/recovery accent token). Anchored mid-right,
          smaller + slower (44s) for visual depth. */}
      <span
        aria-hidden="true"
        className="absolute animate-aurora-3 will-change-transform"
        style={{
          top: '35%',
          right: '-20%',
          width: '50vw',
          height: '50vw',
          maxWidth: '560px',
          maxHeight: '560px',
          borderRadius: '9999px',
          filter: 'blur(80px)',
          background:
            'radial-gradient(circle, color-mix(in oklab, var(--deep) 50%, transparent) 0%, transparent 70%)',
          opacity: 0.08,
        }}
      />
    </div>
  );
}
