// ══ PROGRAM CHANGE CONFIRM — PAR-003 / D047 drill-down screen ═════════════
// Per mockup andura-clasic.html L2362-2375 (#screen-confirm-program-change).
// Universal destructive drill-down pattern per D047 LOCKED V1 RIP-OUT —
// consistency cu logout/delete/reset/redo-onboarding/schimba-faza/finish-early.
//
// Linkpoint: ObiectivSelector (Antrenor home) pick() navigates aici cu
// state.pendingGoal + pendingLabel + pendingSub. Accept = commit goal pe
// onboardingStore + back la /app/antrenor. Cancel = back fara commit (
// fallback safe). Same-goal pick blocked deja in selector (no-op guard).

import type { JSX } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import type { Goal } from '../../../stores/onboardingStore';

interface PendingState {
  pendingGoal?: Goal;
  pendingLabel?: string;
  pendingSub?: string;
}

export function ProgramChangeConfirm(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const setField = useOnboardingStore((s) => s.setField);

  const state = (location.state as PendingState | null) ?? null;
  const pendingGoal = state?.pendingGoal ?? null;
  const pendingLabel = state?.pendingLabel ?? '-';
  const pendingSub = state?.pendingSub ?? '';

  function handleConfirm(): void {
    if (pendingGoal) {
      setField('goal', pendingGoal);
    }
    navigate(gotoPath('antrenor'));
  }

  function handleCancel(): void {
    navigate(gotoPath('antrenor'));
  }

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="program-change-confirm">
      <SubHeader
        title="Schimba program"
        onBack={handleCancel}
        testIdBack="program-change-confirm-back"
      />

      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-paper2 border border-line flex items-center justify-center mb-5">
          <RefreshCw className="w-7 h-7 text-ink" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-semibold text-ink mb-3">Schimbi programul?</h2>
        <p className="text-sm text-ink2 leading-relaxed mb-2 max-w-sm">
          Coach-ul va regenera saptamana pe{' '}
          <b data-testid="program-change-confirm-name">{pendingLabel}</b>
          {pendingSub ? (
            <>
              {' ('}
              <span data-testid="program-change-confirm-sub">{pendingSub}</span>
              {')'}
            </>
          ) : null}
          .
        </p>
        <p className="text-sm text-ink2 leading-relaxed mb-2 max-w-sm">
          Sesiunile deja facute raman in istoric.
        </p>

        <div className="w-full max-w-sm mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            data-testid="program-change-confirm-accept"
            className="w-full py-4 bg-brick text-paper rounded-[14px] text-base font-semibold"
          >
            Confirma schimbarea
          </button>
          <button
            type="button"
            onClick={handleCancel}
            data-testid="program-change-confirm-cancel"
            className="w-full py-4 border border-lineStrong rounded-[14px] text-base font-medium text-ink2"
          >
            Anuleaza
          </button>
        </div>
      </div>
    </section>
  );
}
