// ══ AA FRICTION MODAL — LOCK 9 Per-Set Safety Acknowledge ════════════════
// Phase 4 task_14 §B — blocking centered modal cand aaFrictionDetect
// triggers pre-set. User must choose Continui oricum sau Pauza 30s. Backdrop
// NU dismiss (LOCK 9 safety gate strict).
//
// WORDING DISCIPLINE Phase 4: per-set context wording absent în mockup
// verbatim (mockup aaFrictionModal.js scope = session-level reduce plan
// pattern, different from per-set fast/jump/spike detection task_14 spec).
// Placeholders used pentru Daniel CEO wording review pre-Beta. RAPORT §6
// WORDING BACKLOG flag.
//
// Cross-refs:
//   - DECISIONS.md §D-LEGACY-040 LOCK 9 anti-aggressive loading safety
//   - mockup andura-clasic.html line 105-127 .session-pill style precedent
//     (centered modal NU bottom sheet — V1 LOCKED zero-modals exception
//     pentru safety blocking gate confirmed pre-Beta SC)

import type { JSX } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { AggressiveReason } from '../lib/aaFrictionDetect';

interface AaFrictionModalProps {
  open: boolean;
  reason: AggressiveReason | null;
  onAcknowledge: () => void; // Pauza 30s — accept safety advice
  onForceContinue: () => void; // Continui oricum — override
}

// Phase 4 PLACEHOLDER RO copy — Daniel CEO wording review pre-Beta gate.
// Mockup verbatim absent per-set context (mockup aaFrictionModal.js =
// session-level scope). DACĂ Daniel propose final copy → replace inline +
// drop placeholder marker.
const PLACEHOLDER = {
  title: 'PLACEHOLDER_RO_TEXT_LOCK9_TITLE_TBD',
  body: 'PLACEHOLDER_RO_TEXT_LOCK9_BODY_TBD',
  buttonPause: 'PLACEHOLDER_RO_TEXT_LOCK9_PAUSE_TBD',
  buttonContinue: 'PLACEHOLDER_RO_TEXT_LOCK9_CONTINUE_TBD',
} as const;

const REASON_LABEL: Record<AggressiveReason, string> = {
  fast_sets: 'PLACEHOLDER_RO_TEXT_LOCK9_REASON_FAST_TBD',
  kg_jump: 'PLACEHOLDER_RO_TEXT_LOCK9_REASON_KG_TBD',
  rep_spike: 'PLACEHOLDER_RO_TEXT_LOCK9_REASON_REPS_TBD',
};

export function AaFrictionModal({
  open,
  reason,
  onAcknowledge,
  onForceContinue,
}: AaFrictionModalProps): JSX.Element | null {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-6"
      data-testid="aa-friction-backdrop"
      // Backdrop NU dismiss tap — LOCK 9 blocking safety gate.
    >
      <div
        className="bg-paper rounded-2xl p-6 w-full max-w-md"
        data-testid="aa-friction-modal"
        role="dialog"
        aria-labelledby="aa-friction-title"
        aria-modal="true"
      >
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle className="w-6 h-6 text-brick" aria-hidden="true" />
          <h2
            id="aa-friction-title"
            className="text-base font-bold text-ink"
            data-testid="aa-friction-title"
          >
            {PLACEHOLDER.title}
          </h2>
        </div>
        <p className="text-sm text-ink2 mb-4" data-testid="aa-friction-body">
          {PLACEHOLDER.body}
        </p>
        {reason && (
          <p
            className="text-xs text-ink2 mb-4 italic"
            data-testid="aa-friction-reason"
            data-reason={reason}
          >
            {REASON_LABEL[reason]}
          </p>
        )}
        <button
          type="button"
          onClick={onAcknowledge}
          data-testid="aa-friction-pause"
          className="w-full py-3 bg-ink text-paper rounded-xl text-base font-semibold mb-2"
        >
          {PLACEHOLDER.buttonPause}
        </button>
        <button
          type="button"
          onClick={onForceContinue}
          data-testid="aa-friction-continue"
          className="w-full py-2 text-brick text-sm"
        >
          {PLACEHOLDER.buttonContinue}
        </button>
      </div>
    </div>
  );
}
