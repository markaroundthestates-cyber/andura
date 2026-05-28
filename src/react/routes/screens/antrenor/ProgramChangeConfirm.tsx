// ══ PROGRAM CHANGE CONFIRM — PAR-003 / D047 drill-down screen ═════════════
// Per mockup andura-clasic.html L2362-2375 (#screen-confirm-program-change).
// Universal destructive drill-down pattern per D047 LOCKED V1 RIP-OUT —
// consistency cu logout/delete/reset/redo-onboarding/schimba-faza/finish-early.
//
// Linkpoint: ObiectivGoalCard (Progres tab, §obiectiv-relocate 2026-05-28)
// pick() navigates aici cu state.pendingGoal + pendingLabel + pendingSub +
// returnTo='progres'. Accept = commit goal pe onboardingStore + back la
// returnTo tab. Cancel = back fara commit. Same-goal pick blocked deja in
// selector (no-op guard).

import type { JSX } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import type { Goal } from '../../../stores/onboardingStore';
import { t } from '../../../../i18n/index.js';

interface PendingState {
  pendingGoal?: Goal;
  pendingLabel?: string;
  pendingSub?: string;
  /**
   * §obiectiv-relocate 2026-05-28 — Daniel verbatim "muta aia cu Obiectiv de
   * la Coach la progres". Goal selector relocated la Progres > ObiectivGoalCard;
   * back/confirm trebuie sa intoarca la tab-ul originator (Progres acum).
   * Antrenor selector decommissioned 2026-05-28 but state.returnTo defaults la
   * 'antrenor' pentru orice caller legacy / NU breaks invocation pattern.
   */
  returnTo?: 'antrenor' | 'progres';
}

export function ProgramChangeConfirm(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const setField = useOnboardingStore((s) => s.setField);

  const state = (location.state as PendingState | null) ?? null;
  const pendingGoal = state?.pendingGoal ?? null;
  const pendingLabel = state?.pendingLabel ?? '-';
  const pendingSub = state?.pendingSub ?? '';
  const returnTo = state?.returnTo ?? 'antrenor';

  function handleConfirm(): void {
    if (pendingGoal) {
      setField('goal', pendingGoal);
    }
    navigate(gotoPath(returnTo));
  }

  function handleCancel(): void {
    navigate(gotoPath(returnTo));
  }

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="program-change-confirm">
      <SubHeader
        title={t('confirm.programChange.title')}
        onBack={handleCancel}
        testIdBack="program-change-confirm-back"
      />

      <div className="flex-1 overflow-y-auto pt-2 px-6 pb-6 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-paper2 border border-line flex items-center justify-center mb-5">
          <RefreshCw className="w-7 h-7 text-ink" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-semibold text-ink mb-3">{t('confirm.programChange.heading')}</h2>
        <p className="text-sm text-ink2 leading-relaxed mb-2 max-w-sm">
          {t('confirm.programChange.body1Prefix')}
          <b data-testid="program-change-confirm-name">{pendingLabel}</b>
          {pendingSub ? (
            <>
              {' ('}
              <span data-testid="program-change-confirm-sub">{pendingSub}</span>
              {')'}
            </>
          ) : null}
          {t('confirm.programChange.body1Suffix')}
        </p>
        <p className="text-sm text-ink2 leading-relaxed mb-2 max-w-sm">
          {t('confirm.programChange.body2')}
        </p>

        <div className="w-full max-w-sm mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            data-testid="program-change-confirm-accept"
            className="w-full py-4 bg-brick text-paper rounded-[14px] text-base font-semibold"
          >
            {t('confirm.programChange.acceptCta')}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            data-testid="program-change-confirm-cancel"
            className="w-full py-4 border border-lineStrong rounded-[14px] text-base font-medium text-ink2"
          >
            {t('confirm.programChange.cancelCta')}
          </button>
        </div>
      </div>
    </section>
  );
}
