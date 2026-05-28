// ══ SPLASH — Landing screen Phase 5 task_15 ══════════════════════════════
// Wordmark + tagline + CTA primary. Routes la auth (anon) sau antrenor
// (auth). Wording autonomous compose D024 LOCKED V1.
//
// §F-splash-06 (LOW chat5 Wave 10) — padding asimetric mockup verbatim
// 48/28/32 (pt-12 px-7 pb-8) per andura-clasic.html#L403 (mai mult top,
// custom horizontal). Aliniaza ritmul vertical splash cu intentia mockup.
//
// §F-splash-07 (MED chat5 Wave 16) — layout structure space-between cu 3
// children sections mockup andura-clasic.html#L403-419 verbatim aliniat:
// top spacer empty + brand wrapper (logo + wordmark + subtitle col gap-6)
// + bottom CTAs+footer stack. justify-between distributes vertical space
// → CTAs anchored at bottom (thumb-reach zone mobile UX best practice).
// Prior: justify-center force user look-then-reach to mid-screen tap.
//
// §F-splash-08 (MED chat5 Wave 12) — wordmark Inter sans (NU Lora serif).
// Mockup andura-clasic.html#L408 nu seteaza font-family (inherit body
// Inter); prod avea font-serif override → Lora redenderat la h1. Sterg
// font-serif → brand identity sans-serif aliniat mockup. Tracking-tight
// + font-bold preserva fidelitatea Inter wordmark.

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';

export function Splash(): JSX.Element {
  const navigate = useNavigate();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  return (
    <section
      className="min-h-screen bg-paper text-ink flex flex-col items-center justify-between pt-12 px-7 pb-8 text-center"
      data-testid="splash"
    >
      {/* §F-splash-07 — top spacer (mockup L404 empty div) enables
          space-between distribution; brand block stays centered visually. */}
      <div aria-hidden="true" />

      {/* §F-splash-07 — brand block: logo + wordmark + subtitle column.
          Mockup L405-411 gap:24px between logo-group and text-group.
          Entrance (2026-05-27): logo scaleIn, wordmark + tagline fadeInUp with a
          small stagger, CTAs fade last. Pure CSS on mount, auto-gated by the
          global prefers-reduced-motion block. */}
      <div className="flex flex-col items-center gap-6">
        <div className="animate-scale-in w-[72px] h-[72px] rounded-[22px] bg-ink text-paper flex items-center justify-center text-[32px] font-bold tracking-tight">
          A
        </div>
        <div>
          <h1
            className="animate-fade-in-up text-[42px] font-bold text-ink mb-2 tracking-tight"
            style={{ animationDelay: '80ms' }}
          >
            Andura
          </h1>
          {/* Tagline = coach-quote per mockup andura-clasic.html#L409
              (font-family Lora, font-style italic). Distinct de wordmark h1
              (F-splash-08 ramane Inter sans). */}
          <p
            className="animate-fade-in-up font-serif italic text-lg text-ink2 max-w-xs"
            style={{ animationDelay: '140ms' }}
          >
            Antrenorul tau personal,
            <br />
            fara zgomot.
          </p>
        </div>
      </div>

      {/* §F-splash-07 — bottom stack: CTAs + footer. Mockup L412-418
          width:100% column gap:12px. Footer below CTAs cu margin-top spacing. */}
      <div
        className="animate-fade-in-up w-full max-w-xs flex flex-col items-stretch gap-3"
        style={{ animationDelay: '220ms' }}
      >
        <button
          type="button"
          onClick={() => navigate(isAuthenticated ? '/app/antrenor' : '/auth')}
          data-testid="splash-cta"
          className="btn-primary-lift w-full py-4 bg-brick text-paper rounded-[14px] text-base font-semibold"
        >
          {isAuthenticated ? 'Continua' : 'Log In'}
        </button>
        {/* BUG #1 (CEO 2026-05-27) — "Creaza Cont" e o actiune primara pentru un
            user nou; o legatura subliniata slaba e prea ascunsa. Buton secundar
            proper (bordered, full-width), aliniat stilului secundar din Auth.tsx
            (border lineStrong + bg-paper2 + rounded-14) pentru consistenta
            cross-screen + prominenta corecta. UX polish 2026-05-28: btn-
            secondary-lift adauga hover hairline-brick + press scale parity
            cu primary, fara competa cu halo-ul primar. */}
        {!isAuthenticated && (
          <button
            type="button"
            onClick={() => navigate('/auth', { state: { mode: 'signup' } })}
            data-testid="splash-secondary"
            className="btn-secondary-lift w-full py-4 border border-lineStrong text-ink bg-paper2 rounded-[14px] text-base font-semibold"
          >
            Creaza Cont
          </button>
        )}
        <p
          className="mt-2 text-[11px] text-ink3 leading-relaxed"
          data-testid="splash-trust-footer"
        >
          Facut in Romania &middot; Datele tale raman ale tale
        </p>
      </div>
    </section>
  );
}
