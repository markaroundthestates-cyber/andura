// ══ PULSE · AURORA BACKGROUND — living app-shell backdrop ══════════════════
// Ported from the Pulse mockup (interfata-noua/bg.jsx AuroraBackground). The
// signature Pulse ambient layer: three large blurred aurora blobs
// (volt / aqua / ember) drifting on slow loops, a slowly-rotating conic depth
// sweep, a fine static grain, and a vignette. Mounted ONCE behind every
// authenticated route (Layout shell).
//
// Replaces the simpler `BackgroundAurora` (brick/olive/deep, no grain/depth/
// vignette). This is the Pulse-correct version using the volt/aqua/ember
// tokens the Phase-1 foundation introduced.
//
// Layering (lives INSIDE the desktop phone bezel #root, which is a
// transform-containing block with overflow + border-radius):
//   - position: absolute; inset: 0; z-index: 0  → behind content (content is
//     elevated by the page-enter wrapper / cards), clipped by the bezel's
//     overflow + radius. pointer-events: none → never intercepts clicks.
//   - aria-hidden — invisible to assistive tech.
//
// Token substitution (deliberate, documented): the mockup's wrapper used a
// `--bg-grad` var that does NOT exist in the foundation. We base the wrapper on
// the real --paper → --paper-2 radial instead, and inline the grain opacity
// (the mockup's --grain-opacity is also not a foundation token). All blob /
// depth / vignette colors flow through real tokens (--volt/--aqua/--ember) —
// no raw hex except the dark vignette's translucent black (matching the
// mockup; it is a shadow overlay, not a palette color).
//
// Motion safety: blob drifts + conic spin divide their durations by
// max(var(--motion), .25) so the global motion scalar dials them down; the
// global prefers-reduced-motion block in global.css collapses them to a single
// frame, and a [data-calm="1"] hard-stop (motion=0) is declared here too.
// Light-theme variants soften opacity + swap blend mode (multiply vs screen).
//
// Performance budget (Maria 65 phone): 3 blurred blobs + 1 conic + grain +
// vignette — no canvas, no particles. blur via CSS filter, will-change:
// transform tags the blobs for GPU.

import type { JSX } from 'react';

export function AuroraBackground(): JSX.Element {
  return (
    <div className="pulse-aurora-wrap" aria-hidden="true" data-testid="pulse-aurora">
      <div className="pulse-aurora-blob b1" />
      <div className="pulse-aurora-blob b2" />
      <div className="pulse-aurora-blob b3" />
      <div className="pulse-aurora-depth" />
      <div className="pulse-aurora-grain" />
      <div className="pulse-aurora-vignette" />
      <style>{`
        .pulse-aurora-wrap {
          position: absolute; inset: 0; overflow: hidden; pointer-events: none;
          z-index: 0;
          /* Foundation token base (mockup --bg-grad does not exist here). */
          background: radial-gradient(120% 80% at 50% -10%, var(--paper-2), var(--paper) 70%);
        }
        .pulse-aurora-blob {
          position: absolute; border-radius: 50%; filter: blur(64px);
          will-change: transform; mix-blend-mode: screen;
        }
        [data-theme="light"] .pulse-aurora-blob { mix-blend-mode: multiply; filter: blur(80px); }
        .pulse-aurora-blob.b1 {
          top: -14%; left: -16%; width: 75%; height: 55%;
          background: radial-gradient(circle, color-mix(in oklab, var(--volt) 60%, transparent), transparent 68%);
          opacity: .30;
          animation: pulseAurora1 calc(34s / max(var(--motion), .25)) ease-in-out infinite;
        }
        .pulse-aurora-blob.b2 {
          bottom: -18%; right: -18%; width: 80%; height: 60%;
          background: radial-gradient(circle, color-mix(in oklab, var(--aqua) 60%, transparent), transparent 68%);
          opacity: .28;
          animation: pulseAurora2 calc(42s / max(var(--motion), .25)) ease-in-out infinite;
        }
        .pulse-aurora-blob.b3 {
          top: 28%; left: 30%; width: 55%; height: 50%;
          background: radial-gradient(circle, color-mix(in oklab, var(--ember) 55%, transparent), transparent 70%);
          opacity: .18;
          animation: pulseAurora3 calc(38s / max(var(--motion), .25)) ease-in-out infinite;
        }
        [data-theme="light"] .pulse-aurora-blob.b1 { opacity: .22; }
        [data-theme="light"] .pulse-aurora-blob.b2 { opacity: .20; }
        [data-theme="light"] .pulse-aurora-blob.b3 { opacity: .14; }
        .pulse-aurora-depth {
          position: absolute; top: 50%; left: 50%; width: 170%; height: 170%;
          transform: translate(-50%, -50%); pointer-events: none; mix-blend-mode: screen;
          background: conic-gradient(from 0deg, transparent, color-mix(in oklab, var(--aqua) 9%, transparent), transparent 38%, color-mix(in oklab, var(--volt) 8%, transparent), transparent 72%);
          animation: pulseAuroraConic calc(64s / max(var(--motion), .3)) linear infinite;
          opacity: .6;
        }
        [data-theme="light"] .pulse-aurora-depth { mix-blend-mode: normal; opacity: .4; }
        .pulse-aurora-grain {
          position: absolute; inset: 0; pointer-events: none; opacity: .05;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
        .pulse-aurora-vignette {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(120% 90% at 50% 35%, transparent 55%, rgba(0,0,0,.45) 100%);
        }
        [data-theme="light"] .pulse-aurora-vignette {
          background: radial-gradient(120% 90% at 50% 35%, transparent 60%, rgba(40,50,90,.10) 100%);
        }
        @keyframes pulseAurora1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(6%, 8%) scale(1.12); }
        }
        @keyframes pulseAurora2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-8%, -5%) scale(1.08); }
        }
        @keyframes pulseAurora3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-5%, 7%) scale(1.15); }
        }
        @keyframes pulseAuroraConic { to { transform: translate(-50%, -50%) rotate(360deg); } }
        [data-calm="1"] .pulse-aurora-blob,
        [data-calm="1"] .pulse-aurora-depth {
          animation: none !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .pulse-aurora-blob, .pulse-aurora-depth { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
