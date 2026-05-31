// ══ PULSE · AURORA BACKGROUND — TURBO (aggressive ambient backdrop) ════════
// The signature Pulse ambient layer, "Turbo" upgrade: 5 fast vivid blobs
// (volt / aqua / ember / violet) + two counter-rotating conic beam sets + a
// pulsing grid + a scanning light bar + a breathing color flash + a
// behind-content corona + a slow global hue drift — all under a readability
// scrim that keeps text crisp over the motion. Mounted ONCE behind every
// authenticated route (Layout shell).
//
// Layering (lives INSIDE the desktop phone bezel #root, which is a
// transform-containing block with overflow + border-radius):
//   - position: absolute; inset: 0; z-index: 0  → behind content, clipped by
//     the bezel's overflow + radius. pointer-events: none → never intercepts.
//   - aria-hidden — invisible to assistive tech.
//
// Tokens only: --volt/--aqua/--ember/--violet/--paper/--paper-2/--brick (all
// real foundation tokens in global.css). No raw hex except the dark vignette's
// translucent black (a shadow overlay, not a palette color).
//
// Motion safety: blob/beam/grid/scan/flash durations divide by
// max(var(--motion), <floor>) so the global motion scalar dials them down; the
// global prefers-reduced-motion block here collapses everything to one frame.
// Light-theme variants soften opacity + swap blend mode (multiply vs screen).
//
// Performance budget: pure CSS (blurred radials + conic gradients + transforms)
// — no canvas, no particles. will-change tags the moving layers for the GPU.

import type { JSX } from 'react';

export function AuroraBackground(): JSX.Element {
  return (
    <div className="pulse-aurora-wrap turbo" aria-hidden="true" data-testid="pulse-aurora">
      <div className="t-blob tb1" />
      <div className="t-blob tb2" />
      <div className="t-blob tb3" />
      <div className="t-blob tb4" />
      <div className="t-blob tb5" />
      <div className="t-beams" />
      <div className="t-beams t-beams2" />
      <div className="t-grid" />
      <div className="t-scan" />
      <div className="t-flash" />
      <div className="t-corona" />
      <div className="t-grain" />
      <div className="t-scrim" />
      <div className="t-vignette" />
      <style>{`
        .pulse-aurora-wrap.turbo {
          position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0;
          background: radial-gradient(120% 80% at 50% -10%, var(--paper-2), var(--paper) 70%);
          animation: tHue 14s linear infinite;
        }
        @keyframes tHue { 0%,100% { filter: hue-rotate(0deg); } 50% { filter: hue-rotate(26deg); } }

        /* ── fast, vivid blobs ── */
        .t-blob { position: absolute; border-radius: 50%; filter: blur(52px); will-change: transform; mix-blend-mode: screen; }
        [data-theme="light"] .t-blob { mix-blend-mode: multiply; filter: blur(70px); }
        .tb1 { top: -18%; left: -18%; width: 72%; height: 56%; opacity: .7;
          background: radial-gradient(circle, color-mix(in oklab, var(--volt) 78%, transparent), transparent 66%);
          animation: tb1 calc(9s / max(var(--motion), .5)) ease-in-out infinite; }
        .tb2 { bottom: -22%; right: -20%; width: 82%; height: 62%; opacity: .62;
          background: radial-gradient(circle, color-mix(in oklab, var(--aqua) 78%, transparent), transparent 66%);
          animation: tb2 calc(11s / max(var(--motion), .5)) ease-in-out infinite; }
        .tb3 { top: 24%; left: 26%; width: 60%; height: 55%; opacity: .4;
          background: radial-gradient(circle, color-mix(in oklab, var(--ember) 72%, transparent), transparent 68%);
          animation: tb3 calc(8s / max(var(--motion), .5)) ease-in-out infinite; }
        .tb4 { top: -10%; right: -10%; width: 55%; height: 50%; opacity: .4;
          background: radial-gradient(circle, color-mix(in oklab, var(--violet) 75%, transparent), transparent 68%);
          animation: tb4 calc(10.5s / max(var(--motion), .5)) ease-in-out infinite; }
        .tb5 { bottom: -12%; left: -8%; width: 58%; height: 52%; opacity: .42;
          background: radial-gradient(circle, color-mix(in oklab, var(--aqua) 70%, transparent), transparent 68%);
          animation: tb5 calc(7.5s / max(var(--motion), .5)) ease-in-out infinite; }
        [data-theme="light"] .tb1 { opacity: .4; } [data-theme="light"] .tb2 { opacity: .36; }
        [data-theme="light"] .tb3 { opacity: .26; } [data-theme="light"] .tb4 { opacity: .26; }
        [data-theme="light"] .tb5 { opacity: .28; }
        @keyframes tb1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(28vw,22vh) scale(1.5); } }
        @keyframes tb2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-30vw,-20vh) scale(1.55); } }
        @keyframes tb3 { 0%,100% { transform: translate(0,0) scale(1) rotate(0); } 50% { transform: translate(22vw,-26vh) scale(1.6) rotate(60deg); } }
        @keyframes tb4 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-24vw,26vh) scale(1.45); } }
        @keyframes tb5 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(26vw,-18vh) scale(1.5); } }

        /* ── sweeping conic beams (two layers, opposite spin) ── */
        .t-beams { position: absolute; top: 50%; left: 50%; width: 200%; height: 200%; transform: translate(-50%,-50%);
          pointer-events: none; mix-blend-mode: screen; opacity: .7;
          background: conic-gradient(from 0deg, transparent 0deg, color-mix(in oklab, var(--aqua) 22%, transparent) 18deg, transparent 40deg, transparent 180deg, color-mix(in oklab, var(--volt) 20%, transparent) 200deg, transparent 230deg);
          animation: tSpin calc(12s / max(var(--motion), .4)) linear infinite; }
        .t-beams2 { opacity: .55;
          background: conic-gradient(from 90deg, transparent 0deg, color-mix(in oklab, var(--ember) 18%, transparent) 14deg, transparent 34deg, transparent 200deg, color-mix(in oklab, var(--violet) 18%, transparent) 220deg, transparent 250deg);
          animation: tSpinRev calc(18s / max(var(--motion), .4)) linear infinite; }
        @keyframes tSpin { to { transform: translate(-50%,-50%) rotate(360deg); } }
        @keyframes tSpinRev { to { transform: translate(-50%,-50%) rotate(-360deg); } }

        /* ── pulsing grid ── */
        .t-grid { position: absolute; inset: -50%; pointer-events: none; mix-blend-mode: screen; opacity: .12;
          background-image: linear-gradient(color-mix(in oklab, var(--aqua) 60%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--aqua) 60%, transparent) 1px, transparent 1px);
          background-size: 48px 48px; animation: tGrid calc(6s / max(var(--motion), .4)) ease-in-out infinite; }
        @keyframes tGrid { 0%,100% { opacity: .06; transform: scale(1); } 50% { opacity: .18; transform: scale(1.06); } }

        /* ── scanning light bar ── */
        .t-scan { position: absolute; left: -30%; right: -30%; height: 42%; top: -42%; pointer-events: none; mix-blend-mode: screen;
          background: linear-gradient(180deg, transparent, color-mix(in oklab, var(--volt) 30%, transparent), transparent);
          animation: tScan calc(4.5s / max(var(--motion), .4)) ease-in-out infinite; }
        @keyframes tScan { 0% { transform: translateY(0); } 100% { transform: translateY(340%); } }

        /* ── breathing color flash + behind-content corona ── */
        .t-flash { position: absolute; inset: 0; pointer-events: none; mix-blend-mode: screen; opacity: 0; will-change: opacity;
          background: radial-gradient(120% 90% at 50% 50%, color-mix(in oklab, var(--brick) 22%, transparent), transparent 60%);
          animation: tFlash calc(5s / max(var(--motion), .4)) ease-in-out infinite; }
        .t-corona { position: absolute; inset: 0; pointer-events: none; mix-blend-mode: screen;
          background: radial-gradient(60% 40% at 30% 30%, color-mix(in oklab, var(--volt) 30%, transparent), transparent 70%),
                      radial-gradient(60% 40% at 75% 70%, color-mix(in oklab, var(--aqua) 30%, transparent), transparent 70%);
          animation: tFlash calc(6.5s / max(var(--motion), .4)) ease-in-out infinite; }
        @keyframes tFlash { 0%,100% { opacity: 0; } 50% { opacity: .8; } }

        .t-grain { position: absolute; inset: 0; opacity: .07; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }

        /* ── READABILITY SCRIM — keeps text crisp over the motion ── */
        .t-scrim { position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(135% 105% at 50% 38%, transparent 0%, color-mix(in oklab, var(--paper) 22%, transparent) 62%, color-mix(in oklab, var(--paper) 38%, transparent) 100%); }
        [data-theme="light"] .t-scrim { background: radial-gradient(135% 105% at 50% 38%, color-mix(in oklab, var(--paper) 25%, transparent), color-mix(in oklab, var(--paper) 45%, transparent)); }
        .t-vignette { position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(120% 90% at 50% 35%, transparent 48%, rgba(0,0,0,.5) 100%); }
        [data-theme="light"] .t-vignette { background: radial-gradient(120% 90% at 50% 35%, transparent 60%, rgba(40,50,90,.10) 100%); }

        /* motion-safety — the authoritative collapse */
        @media (prefers-reduced-motion: reduce) {
          .pulse-aurora-wrap.turbo, .t-blob, .t-beams, .t-grid, .t-scan, .t-flash, .t-corona { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
