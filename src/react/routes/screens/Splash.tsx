// ══ SPLASH — Landing screen Phase 5 task_15 ══════════════════════════════
// Wordmark + tagline + CTA primary. Routes la auth (anon) sau antrenor
// (auth). Wording autonomous compose D024 LOCKED V1.

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';

export function Splash(): JSX.Element {
  const navigate = useNavigate();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  return (
    <section
      className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center p-6 text-center"
      data-testid="splash"
    >
      <div className="w-[72px] h-[72px] rounded-[22px] bg-ink text-paper flex items-center justify-center text-[32px] font-bold mb-6 tracking-tight">
        A
      </div>
      <h1 className="text-3xl font-bold text-ink mb-2 tracking-tight font-serif">
        Andura
      </h1>
      <p className="text-sm text-ink2 mb-8 max-w-xs">
        Antrenament cu cap. Facut in Romania.
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
    </section>
  );
}
