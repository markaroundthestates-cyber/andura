// ══ FINISH EARLY CONFIRM — B004/D047 drill-down screen ════════════════════
// Per mockup andura-clasic.html L2377-2390 (#screen-confirm-finish-early).
// Universal destructive drill-down pattern (Daniel review 2026-05-11 §11
// LOCKED V1) — consistency cu logout/delete/reset/redo-onboarding/etc.
//
// Action: navigate('/app/antrenor/post-rpe') — partial summary built natural
// la PostRpe submit (uses sessionsHistory logged-pana-acum). NU pierzi
// progresul, coach foloseste datele logate. Cancel = back la /workout.

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flag } from 'lucide-react';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';
import { t } from '../../../../i18n/index.js';

export function FinishEarlyConfirm(): JSX.Element {
  const navigate = useNavigate();

  function handleConfirm(): void {
    // Carry an explicit finish-early intent flag into PostRpe. The user has
    // ALREADY confirmed cutting the session short here, so PostRpe must NOT
    // gate the save behind the second-workout-per-day "log another?" confirm
    // (that redundant re-confirm silently dropped the partial session when a
    // session was already logged today — Daniel audit 2026-06-05). The partial
    // finish-early session lands in sessionsHistory + bumps the streak just
    // like a normal Done, in one tap.
    navigate(gotoPath('post-rpe'), { state: { finishEarly: true } });
  }

  function handleCancel(): void {
    navigate(gotoPath('workout'));
  }

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="finish-early-confirm">
      <SubHeader
        title={t('confirm.finishEarly.title')}
        onBack={handleCancel}
        testIdBack="finish-early-confirm-back"
      />

      <div className="flex-1 overflow-y-auto pt-2 px-6 pb-6 flex flex-col items-center text-center">
        <div className="pulse-card w-16 h-16 !rounded-full flex items-center justify-center mb-5">
          <Flag className="w-7 h-7 text-ink" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-semibold text-ink mb-3">{t('confirm.finishEarly.heading')}</h2>
        <p className="text-sm text-ink2 leading-relaxed mb-2 max-w-sm">
          {t('confirm.finishEarly.body1')}
        </p>
        <p className="text-sm text-ink2 leading-relaxed mb-2 max-w-sm">
          {t('confirm.finishEarly.body2')}
        </p>

        <div className="w-full max-w-sm mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            data-testid="finish-early-confirm-accept"
            className="w-full py-4 pulse-grad-bg pulse-shine text-paper rounded-[14px] text-base font-semibold"
          >
            {t('confirm.finishEarly.acceptCta')}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            data-testid="finish-early-confirm-cancel"
            className="w-full py-4 border border-lineStrong rounded-[14px] text-base font-medium text-ink2"
          >
            {t('confirm.finishEarly.cancelCta')}
          </button>
        </div>
      </div>
    </section>
  );
}
