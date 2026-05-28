// ══ RESET COACH CONFIRM — B011/D047 drill-down screen ════════════════════
// Per mockup andura-clasic.html L2125-2137 (#screen-confirm-reset-coach).
// Universal destructive drill-down pattern (mockup §11 LOCKED V1).
//
// Wipes coach AI learning state (CDL tiers + pattern learning + accelerated
// learning logs + aa cooldowns) via `coachReset.resetCoachState()`. Preserves
// workout logs, weight logs, user profile, phase-log (mockup verbatim
// "Datele tale de antrenament raman intacte. Ireversibil.").

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCcw } from 'lucide-react';
import { gotoPath } from '../../../lib/navigation';
import { resetCoachState } from '../../../../util/coachReset.js';
import { SubHeader } from '../../../components/SubHeader';
import { t } from '../../../../i18n/index.js';

export function ResetCoachConfirm(): JSX.Element {
  const navigate = useNavigate();

  function handleConfirm(): void {
    resetCoachState();
    navigate(gotoPath('settings-prefs'));
  }

  function handleCancel(): void {
    navigate(gotoPath('settings-prefs'));
  }

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="reset-coach-confirm">
      <SubHeader
        title={t('confirm.resetCoach.title')}
        onBack={handleCancel}
        testIdBack="reset-coach-confirm-back"
      />

      <div className="flex-1 overflow-y-auto pt-2 px-6 pb-6 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-paper2 border border-line flex items-center justify-center mb-5">
          <RefreshCcw className="w-7 h-7 text-ink" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-semibold text-ink mb-3">{t('confirm.resetCoach.heading')}</h2>
        <p className="text-sm text-ink2 leading-relaxed mb-2 max-w-sm">
          {t('confirm.resetCoach.body1')}
        </p>
        <p className="text-sm text-ink2 leading-relaxed mb-2 max-w-sm">
          {t('confirm.resetCoach.body2')}
        </p>

        <div className="w-full max-w-sm mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            data-testid="reset-coach-confirm-accept"
            className="w-full py-4 bg-brick text-paper rounded-[14px] text-base font-semibold"
          >
            {t('confirm.resetCoach.acceptCta')}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            data-testid="reset-coach-confirm-cancel"
            className="w-full py-4 border border-lineStrong rounded-[14px] text-base font-medium text-ink2"
          >
            {t('confirm.resetCoach.cancelCta')}
          </button>
        </div>
      </div>
    </section>
  );
}
