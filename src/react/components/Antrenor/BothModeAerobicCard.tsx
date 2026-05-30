// ══ BOTH-MODE AEROBIC CARD — aerobic logging inside the gym Coach ═════════
//
// Rendered on the Antrenor tab when onboarding.trainingType === 'both': the gym
// experience stays fully intact above, and this card adds the ability to log an
// aerobic class too. It shows "Clase saptamana asta" (count vs the onboarding
// frequency target) + a CTA that opens the SAME class logger as the aerobic-only
// dashboard (reused, not duplicated).

import type { JSX } from 'react';
import { useState } from 'react';
import { Plus, HeartPulse } from 'lucide-react';
import { Kicker } from '../pulse/Kicker';
import { ClassLogger } from './AerobicCoach';
import { useAerobicStore, countClassesThisWeek } from '../../stores/aerobicStore';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { t } from '../../../i18n/index.js';

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function BothModeAerobicCard(): JSX.Element {
  const sessions = useAerobicStore((s) => s.sessions);
  const frequency = useOnboardingStore((s) => s.data.frequency);
  const [loggerOpen, setLoggerOpen] = useState(false);

  const classesThisWeek = countClassesThisWeek(sessions, new Date());
  const weeklyTarget = frequency != null ? Number(frequency) : null;

  return (
    <div
      className="pulse-card pulse-card-tight overflow-hidden p-4 my-4"
      data-testid="both-aerobic-card"
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <HeartPulse className="w-4 h-4" style={{ color: 'var(--aqua-deep)' }} aria-hidden="true" />
          <Kicker color="var(--aqua)">{t('antrenor.aerobic.weekKicker')}</Kicker>
        </div>
        <span className="text-sm font-semibold text-ink" data-testid="both-aerobic-week-val">
          {weeklyTarget != null
            ? t('antrenor.aerobic.weekCountTarget', { count: classesThisWeek, target: weeklyTarget })
            : t('antrenor.aerobic.weekCount', { count: classesThisWeek })}
        </span>
      </div>

      {loggerOpen ? (
        <ClassLogger dateISO={todayIso()} onDone={() => setLoggerOpen(false)} />
      ) : (
        <button
          type="button"
          onClick={() => setLoggerOpen(true)}
          data-testid="both-aerobic-log-cta"
          className="btn-secondary-lift press-feedback w-full mt-1 px-4 py-3 bg-paper2 border border-lineStrong text-ink rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          {t('antrenor.aerobic.logCta')}
        </button>
      )}
    </div>
  );
}
