// ══ SPLASH — Landing screen Phase 5 task_15 ══════════════════════════════
// Wordmark + tagline + CTA primary. Routes la auth (anon) sau antrenor
// (auth). Wording autonomous compose D024 LOCKED V1.
//
// §F-splash-06 (LOW chat5 Wave 10) — padding asimetric mockup verbatim
// 48/28/32 (pt-12 px-7 pb-8) per andura-clasic.html#L403 (mai mult top,
// custom horizontal). Aliniaza ritmul vertical splash cu intentia mockup.
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
      className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center pt-12 px-7 pb-8 text-center"
      data-testid="splash"
    >
      <div className="w-[72px] h-[72px] rounded-[22px] bg-ink text-paper flex items-center justify-center text-[32px] font-bold mb-6 tracking-tight">
        A
      </div>
      <h1 className="text-[42px] font-bold text-ink mb-2 tracking-tight">
        Andura
      </h1>
      <p className="text-lg text-ink2 mb-8 max-w-xs">
        Antrenorul tau personal,
        <br />
        fara zgomot.
      </p>
      <button
        type="button"
        onClick={() => navigate(isAuthenticated ? '/app/antrenor' : '/auth')}
        data-testid="splash-cta"
        className="w-full max-w-xs py-4 bg-brick text-paper rounded-xl text-base font-semibold"
      >
        {isAuthenticated ? 'Continua' : 'Incepe'}
      </button>
      {!isAuthenticated && (
        <button
          type="button"
          onClick={() => navigate('/auth')}
          data-testid="splash-secondary"
          className="mt-3 text-sm text-ink2 underline"
        >
          Am deja cont
        </button>
      )}
      <p
        className="mt-8 text-[11px] text-ink3 max-w-xs leading-relaxed"
        data-testid="splash-trust-footer"
      >
        Facut in Romania &middot; Datele tale raman ale tale
      </p>
    </section>
  );
}
