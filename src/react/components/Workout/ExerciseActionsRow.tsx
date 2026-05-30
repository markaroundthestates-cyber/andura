// ══ EXERCISE ACTIONS ROW — Workout in-session substitution row ═══════════
// Presentational extraction from Workout.tsx (zero behavior change). §F-workout-03
// — in-workout substitution row (Daniel 2026-05-12 Slice 1.7, mockup
// andura-clasic.html#L1457-1460 wv2-ex-actions). WP-5 moat: all three buttons
// produce an IN-PLACE named swap (toast with the alternative's name) instead of
// navigating away. "Aparat ocupat" → cascade excluding the busy machine; "Nu
// vreau" → ranked preference alternative + refusal counter; "Aparat lipsa"
// (Daniel smoke 2026-05-28 #17) → opens the 10-item picker sheet, persists
// wv2-missing-equipment (visible in Cont → AparateLipsa next mount), and
// recomposes the current exercise via resolveMissingSwap when the new list
// blocks its equipment. Three-column layout — labels kept short ("Lipsa") so
// the row stays single-line on Gigel's phone.
//
// All swap logic (resolveBusySwap/resolveRefusalSwap/resolveMissingSwap,
// refusal counter, toast, sheet open state) stays in the PARENT; this row just
// fires the three handlers.

import type { JSX } from 'react';
import { Users, Hand, PackageX } from 'lucide-react';
import { t } from '../../../i18n/index.js';

interface ExerciseActionsRowProps {
  onOcupat: () => void;
  onLipsa: () => void;
  onNuVreau: () => void;
}

export function ExerciseActionsRow({
  onOcupat,
  onLipsa,
  onNuVreau,
}: ExerciseActionsRowProps): JSX.Element {
  return (
    <div className="grid grid-cols-3 gap-2 mb-4" data-testid="wv2-ex-actions">
      <button
        type="button"
        onClick={onOcupat}
        data-testid="wv2-ex-action-ocupat"
        className="pulse-card pulse-card-tight flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-ink2 min-h-[44px]"
      >
        <Users className="w-4 h-4" aria-hidden="true" />
        {t('workout.actions.busy')}
      </button>
      <button
        type="button"
        onClick={onLipsa}
        data-testid="wv2-ex-action-lipsa"
        className="pulse-card pulse-card-tight flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-ink2 min-h-[44px]"
      >
        <PackageX className="w-4 h-4" aria-hidden="true" />
        {t('workout.actions.missing')}
      </button>
      <button
        type="button"
        onClick={onNuVreau}
        data-testid="wv2-ex-action-nuvreau"
        className="pulse-card pulse-card-tight flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-ink2 min-h-[44px]"
      >
        <Hand className="w-4 h-4" aria-hidden="true" />
        {t('workout.actions.refuse')}
      </button>
    </div>
  );
}
