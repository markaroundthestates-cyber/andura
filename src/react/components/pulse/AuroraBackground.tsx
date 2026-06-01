// ══ PULSE · AURORA BACKGROUND — TURBO (aggressive ambient backdrop) ════════
// The signature Pulse ambient layer: 5 vivid blobs (volt / aqua / ember /
// violet) that gently drift in position + two static conic beam glows + a
// static grid texture + a static light bar + a static color flash + a
// behind-content corona — all under a readability scrim that keeps text crisp.
// Mounted ONCE behind every authenticated route (Layout shell).
//
// COMPOSITOR-SAFETY (2026-06-01 black-flash fix): the ONLY animation left is
// the blobs' position translate (GPU-composited, no re-raster). Everything
// that previously re-rasterized or re-blended the whole layer every frame —
// the wrap's filter: hue-rotate(), the spinning screen-blended conic beams,
// the pulsing grid, the sweeping scan bar, the breathing flash/corona opacity,
// and the blobs' scale growth — was made STATIC. Animating a filter on this
// big blurred + screen-blended subtree, or animating opacity/transform on the
// screen-blended overlays, forced continuous full-layer re-rasterization that
// produced intermittent full-screen black flashes on mid/low GPUs while
// stationary on a screen (device-dependent). The look is preserved: same
// colors, same glow, same gentle drift — just no per-frame re-raster.
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
// Motion safety: the blob drift duration divides by max(var(--motion), <floor>)
// so the global motion scalar dials it down; the global prefers-reduced-motion
// block collapses it to one frame. Light-theme variants soften opacity + swap
// blend mode (multiply vs screen).
//
// Performance budget: pure CSS (blurred radials + conic gradients + transforms)
// — no canvas, no particles, no animated filters. will-change: transform on the
// blobs promotes them so the only live animation (position translate) stays on
// the compositor and never re-rasterizes.

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
          /* NO filter animation here. Animating filter: hue-rotate() on the whole
             wrap forced a full-layer re-rasterization of the entire blurred +
             screen-blended subtree EVERY frame, continuously — the classic
             compositor-thrash that produced intermittent full-screen black
             re-rasterization on mid/low GPUs while stationary on a screen
             (founder device-specific black-flash 2026-06-01). The aurora's
             colors come straight from the volt/aqua/ember/violet tokens, so the
             hue drift was never load-bearing for the look. */
        }

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
        /* Position drift only — NO scale/rotate. Translating a layer that is
           already promoted (will-change: transform) is GPU-composited and does
           NOT re-rasterize. Scaling a blur(52px) + screen-blended layer, by
           contrast, re-rasterizes it at new dimensions every frame (x5 blobs) —
           a real per-frame raster cost on weaker GPUs. Dropping the scale keeps
           the gentle aurora drift while removing the last re-raster vector. */
        @keyframes tb1 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(28vw,22vh); } }
        @keyframes tb2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-30vw,-20vh); } }
        @keyframes tb3 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(22vw,-26vh); } }
        @keyframes tb4 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-24vw,26vh); } }
        @keyframes tb5 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(26vw,-18vh); } }

        /* ── sweeping conic beams (two layers, opposite spin) ── */
        /* STATIC. Spinning these 200%x200% screen-blended conic layers forced a
           full re-blend (recomposite of everything beneath) every frame. Kept as
           a static beam glow so the colored shafts still read; no rotation. */
        .t-beams { position: absolute; top: 50%; left: 50%; width: 200%; height: 200%; transform: translate(-50%,-50%);
          pointer-events: none; mix-blend-mode: screen; opacity: .7;
          background: conic-gradient(from 0deg, transparent 0deg, color-mix(in oklab, var(--aqua) 22%, transparent) 18deg, transparent 40deg, transparent 180deg, color-mix(in oklab, var(--volt) 20%, transparent) 200deg, transparent 230deg); }
        .t-beams2 { transform: translate(-50%,-50%) rotate(90deg); opacity: .55;
          background: conic-gradient(from 90deg, transparent 0deg, color-mix(in oklab, var(--ember) 18%, transparent) 14deg, transparent 34deg, transparent 200deg, color-mix(in oklab, var(--violet) 18%, transparent) 220deg, transparent 250deg); }

        /* ── grid (STATIC) ──
           Pulsing opacity + scale on this screen-blended overlay re-blended the
           whole layer every frame. Kept static at a mid-pulse opacity so the
           subtle grid texture still reads. */
        .t-grid { position: absolute; inset: -50%; pointer-events: none; mix-blend-mode: screen; opacity: .12;
          background-image: linear-gradient(color-mix(in oklab, var(--aqua) 60%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--aqua) 60%, transparent) 1px, transparent 1px);
          background-size: 48px 48px; }

        /* ── light bar (STATIC) ──
           Sweeping a screen-blended bar across the layer re-blended every frame.
           Parked at rest as a soft top light; the static blob glow carries the
           ambient feel instead. */
        .t-scan { position: absolute; left: -30%; right: -30%; height: 42%; top: -42%; pointer-events: none; mix-blend-mode: screen;
          background: linear-gradient(180deg, transparent, color-mix(in oklab, var(--volt) 30%, transparent), transparent); }

        /* ── color flash + behind-content corona (STATIC) ──
           Breathing the opacity of these screen-blended full-inset layers forced
           a per-frame re-blend of everything beneath. Held at a steady glow:
           the corona stays lit, the brick flash sits at a faint constant tint. */
        .t-flash { position: absolute; inset: 0; pointer-events: none; mix-blend-mode: screen; opacity: .4;
          background: radial-gradient(120% 90% at 50% 50%, color-mix(in oklab, var(--brick) 22%, transparent), transparent 60%); }
        .t-corona { position: absolute; inset: 0; pointer-events: none; mix-blend-mode: screen; opacity: .8;
          background: radial-gradient(60% 40% at 30% 30%, color-mix(in oklab, var(--volt) 30%, transparent), transparent 70%),
                      radial-gradient(60% 40% at 75% 70%, color-mix(in oklab, var(--aqua) 30%, transparent), transparent 70%); }

        .t-grain { position: absolute; inset: 0; opacity: .07; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }

        /* ── READABILITY SCRIM — keeps text crisp over the motion ──
           The mockup (interfata-noua/bg.jsx) has NO paper scrim on dark — only an
           edge vignette + grain — so the green aurora reads vividly in the gaps
           between the translucent glass cards. The prior Turbo scrim washed
           --paper (near-black #090b13) center-out up to 38%, which crushed the
           blobs to a flat near-black field (founder bug 2026-06). On dark we now
           keep ONLY a faint outer paper feather (transparent core, light fade at
           the very edges) so the aurora stays visible while card text — which
           rides on its own translucent --surface fill (.pulse-card) — stays
           readable. Light theme keeps the stronger paper wash (bright base, blobs
           use multiply, text contrast needs the lift). */
        .t-scrim { position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(140% 110% at 50% 40%, transparent 72%, color-mix(in oklab, var(--paper) 26%, transparent) 100%); }
        [data-theme="light"] .t-scrim { background: radial-gradient(135% 105% at 50% 38%, color-mix(in oklab, var(--paper) 25%, transparent), color-mix(in oklab, var(--paper) 45%, transparent)); }
        /* Edge vignette — mockup parity (transparent 55% → black .45 at the
           corners). Frames the aurora + anchors the device screen without
           darkening the center where the green needs to breathe. */
        .t-vignette { position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(120% 90% at 50% 35%, transparent 55%, rgba(0,0,0,.45) 100%); }
        [data-theme="light"] .t-vignette { background: radial-gradient(120% 90% at 50% 35%, transparent 60%, rgba(40,50,90,.10) 100%); }

        /* motion-safety — the authoritative collapse */
        @media (prefers-reduced-motion: reduce) {
          .pulse-aurora-wrap.turbo, .t-blob, .t-beams, .t-grid, .t-scan, .t-flash, .t-corona { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
