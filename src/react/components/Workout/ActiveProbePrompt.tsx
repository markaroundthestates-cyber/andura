// ══ ACTIVE PROBE PROMPT — opt-in calibration-set affordance ══════════════
// #1/H active probing (flag dp_active_probing_v1). When DP.getSmartRecommendation
// is UNCERTAIN about a lift (wide Kalman posterior + fresh readiness) it attaches
// an `activeProbe` descriptor = a deliberate high-information "set de calibrare" it
// wants to OFFER. This surface renders it as an OPT-IN affordance:
//   - a small "Vrei un set de calibrare?" prompt with Accept / Dismiss,
//   - on accept → the suggested all-out set (kg x reps) is shown as a suggestion,
//   - NEVER forced, NEVER blocks the normal set (it is a descriptor only — the
//     main prescription kg/reps/sets is untouched).
// Mirrors the CoachNote volt-card shell. Copy is resolved via i18n (the engine
// emits a structured noteKind token, never RO copy). role="status" announces it.

import type { JSX } from 'react';
import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { t } from '../../../i18n/index.js';

interface ActiveProbe {
  kg: number;
  reps: number;
  sigma?: number;
  noteKind?: string;
}

interface ActiveProbePromptProps {
  probe: ActiveProbe;
  testId?: string;
}

const VOLT_CARD_STYLE = {
  background: 'color-mix(in oklab, var(--volt) 11%, var(--surface))',
  border: '1px solid color-mix(in oklab, var(--volt) 32%, transparent)',
} as const;

export function ActiveProbePrompt({ probe, testId = 'active-probe-prompt' }: ActiveProbePromptProps): JSX.Element | null {
  // 'prompt' = the offer (accept/dismiss); 'accepted' = show the suggested set;
  // 'dismissed' = nothing renders (opt-in, the user said not now).
  const [state, setState] = useState<'prompt' | 'accepted' | 'dismissed'>('prompt');
  if (state === 'dismissed') return null;

  // Resolve the localized note from the engine's structured token (defensive
  // fallback to the calibration copy when the kind is missing/unknown).
  const noteKey = probe.noteKind === 'calibration' || !probe.noteKind
    ? 'workout.activeProbe.calibration'
    : `workout.activeProbe.${probe.noteKind}`;

  return (
    <div
      className="animate-fade-in-up mb-3 flex flex-col gap-2 p-3 rounded-2xl text-sm text-ink"
      data-testid={testId}
      role="status"
      style={VOLT_CARD_STYLE}
    >
      <div className="flex items-start gap-2.5">
        <FlaskConical
          className="w-4 h-4 flex-shrink-0 mt-0.5"
          aria-hidden="true"
          style={{ color: 'var(--volt-deep)' }}
        />
        <span className="font-serif italic">
          {state === 'accepted' ? t(noteKey) : t('workout.activeProbe.prompt')}
        </span>
      </div>

      {state === 'accepted' ? (
        <span className="pl-6 text-xs opacity-80" data-testid="active-probe-suggested">
          {t('workout.activeProbe.suggested', { kg: probe.kg, reps: probe.reps })}
        </span>
      ) : (
        <div className="flex gap-2 pl-6">
          <button
            type="button"
            data-testid="active-probe-accept"
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{ background: 'var(--volt)', color: 'var(--volt-ink, #08130a)' }}
            onClick={() => setState('accepted')}
          >
            {t('workout.activeProbe.accept')}
          </button>
          <button
            type="button"
            data-testid="active-probe-dismiss"
            className="px-3 py-1 rounded-full text-xs opacity-70"
            onClick={() => setState('dismissed')}
          >
            {t('workout.activeProbe.dismiss')}
          </button>
        </div>
      )}
    </div>
  );
}
