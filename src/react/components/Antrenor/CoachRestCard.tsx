// ══ COACH REST CARD — Rest Day Mode ═══════════════════════════════════════
// Per mockup andura-clasic.html#L758 coach-rest-card.
// Rendered cand coachStore.schedContext === 'rest'.
//
// §F-pass2-coachrest-01 audit fix — wire fatiguedGroups + readinessScore din
// engine (muscleRecovery.getRecoveryByGroup + readiness.getComputedReadiness
// Score via coachDirectorAggregate.restReason). Fallback mockup parity copy
// cand restReason=null (T0 fresh user fără sesiuni logged).

import type { JSX } from 'react';
import type { CoachRestReason } from '../../lib/engineWrappers';

interface Props {
  onLightSession: () => void;
  onOverride: () => void;
  restReason?: CoachRestReason | null;
}

/**
 * Compose coach line din restReason. Fallback mockup verbatim cand null
 * (T0 fresh). Output NO_DIACRITICS_RULE compliant per Andura RO style.
 */
function composeCoachLine(restReason: CoachRestReason | null | undefined): string {
  if (!restReason) {
    return 'Pectoralii si picioarele inca recupereaza · readiness 32/100.';
  }
  const { fatiguedGroups, readinessScore } = restReason;
  const groupsPart =
    fatiguedGroups.length === 0
      ? 'Muschii recupereaza'
      : `${fatiguedGroups.join(' si ')} inca recupereaza`;
  const readinessPart =
    readinessScore === null
      ? ''
      : ` · readiness ${readinessScore}/100`;
  return `${groupsPart}${readinessPart}.`;
}

export function CoachRestCard({ onLightSession, onOverride, restReason }: Props): JSX.Element {
  const coachLine = composeCoachLine(restReason ?? null);
  return (
    <div
      className="rounded-2xl p-4 mb-2.5 border"
      style={{
        background: 'var(--status-neutral-bg)',
        borderColor: 'var(--status-neutral-border)',
      }}
      role="region"
      aria-label="Coach-ul recomanda azi - recuperare"
    >
      <div
        className="text-xs font-semibold tracking-wider uppercase"
        style={{ color: 'var(--status-neutral-text)' }}
      >
        Coach-ul recomanda azi
      </div>
      <div className="text-xl font-bold mt-1 tracking-tight text-ink flex items-center gap-2.5">
        Zi de recuperare activa
      </div>
      <div className="font-serif italic mt-1.5 leading-relaxed text-sm text-ink2">
        &bdquo;{coachLine}&rdquo;
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
