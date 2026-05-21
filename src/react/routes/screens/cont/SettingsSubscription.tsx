// ══ SETTINGS SUBSCRIPTION — Phase 6 task_11 Cont Sub-Screen ══════════════
// Mockup verbatim source: andura-clasic.html#screen-settings-subscription
// (L1969-1988). Beta gratuit info display + paywall placeholder post-Beta.
// UI shell V1 — ZERO upgrade flow live (Phase 7+ subscription tier real
// wire when IAP flows defined post-Beta launch).

import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Gift } from 'lucide-react';
import { gotoPath } from '../../../lib/navigation';

export function SettingsSubscription(): JSX.Element {
  const navigate = useNavigate();
  const [notified, setNotified] = useState(false);

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="settings-subscription">
      <header className="flex items-center gap-3 p-4 border-b border-line bg-paper sticky top-0 z-10">
        <button
          type="button"
          onClick={() => navigate(gotoPath('cont'))}
          aria-label="Inapoi"
          data-testid="settings-subscription-back"
          className="p-2 -ml-2 text-ink"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <h1 className="text-xl font-semibold text-ink">Abonament</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col items-center text-center">
        <div
          className="w-22 h-22 rounded-full flex items-center justify-center mb-5 p-5"
          style={{ background: 'var(--status-info-bg)' }}
        >
          <Sparkles className="w-9 h-9 text-brick" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-bold text-ink mb-2">In curand</h2>
        <p className="text-sm text-ink2 mb-6 leading-relaxed max-w-xs">
          Lucram la planuri de abonament transparente. Pana atunci, totul e
          gratuit pentru utilizatorii beta.
        </p>

        <div
          className="w-full bg-paper2 border border-line rounded-2xl p-4 flex items-center gap-3 mb-5"
          data-testid="subscription-beta-card"
        >
          <Gift className="w-5 h-5 text-brick flex-shrink-0" aria-hidden="true" />
          <div className="flex-1 text-left">
            <p className="font-semibold text-ink">Beta gratuit</p>
            <p className="text-xs text-ink2">Acces complet · fara card</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setNotified(true)}
          data-testid="subscription-notify-cta"
          className="text-sm text-brick font-semibold underline disabled:no-underline"
          disabled={notified}
        >
          {notified ? 'Te anuntam cand e gata' : 'Anunta-ma cand e gata'}
        </button>
      </div>
    </section>
  );
}
