// ══ COACH REST CARD — Rest Day Mode ═══════════════════════════════════════
// Per mockup andura-clasic.html#L758 coach-rest-card.
// Rendered cand coachStore.schedContext === 'rest'.
//
// Phase 3 stub: static recovery message. Phase 5+ va wire din
// coachDirector.buildSession() restDay reason (lagging muscle group +
// readiness score).

import type { JSX } from 'react';

interface Props {
  onLightSession: () => void;
  onOverride: () => void;
}

export function CoachRestCard({ onLightSession, onOverride }: Props): JSX.Element {
  return (
    <div
      className="rounded-2xl p-4 mb-2.5 border"
      style={{ background: '#f5ebd0', borderColor: '#e6d49a' }}
      role="region"
      aria-label="Coach-ul recomanda azi - recuperare"
    >
      <div className="text-xs font-semibold tracking-wider uppercase" style={{ color: '#8a6d1f' }}>
        Coach-ul recomanda azi
      </div>
      <div className="text-xl font-bold mt-1 tracking-tight text-ink flex items-center gap-2.5">
        Zi de recuperare activa
      </div>
      <div className="font-serif italic mt-1.5 leading-relaxed text-sm text-ink2">
        &bdquo;Pectoralii si picioarele inca recupereaza &middot; readiness 32/100.&rdquo;
      </div>
      <div className="flex gap-3.5 mt-3.5 text-sm text-ink2">
        <span className="flex items-center gap-1.5">~ 15 min mobilitate</span>
        <span className="flex items-center gap-1.5">optional</span>
      </div>
      <button
        type="button"
        onClick={onLightSession}
        className="w-full mt-3.5 bg-transparent text-ink border border-line rounded-md py-2.5 font-medium"
      >
        Sesiune usoara mobilitate
      </button>
      <div className="text-center mt-2.5">
        <button
          type="button"
          onClick={onOverride}
          className="text-ink2 text-sm underline underline-offset-2"
        >
          Vreau totusi antrenament
        </button>
      </div>
    </div>
  );
}
