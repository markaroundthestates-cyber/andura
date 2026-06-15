// ══ COACH REST CARD — Rest Day Mode ═══════════════════════════════════════
// Per mockup andura-clasic.html#L758 coach-rest-card.
// Rendered cand coachStore.schedContext === 'rest'.
//
// §F-pass2-coachrest-01 audit fix — wire fatiguedGroups + readinessScore din
// engine (muscleRecovery.getRecoveryByGroup + readiness.getComputedReadiness
// Score via coachDirectorAggregate.restReason). Fallback mockup parity copy
// cand restReason=null (T0 fresh user fără sesiuni logged).
//
// §F-pass2-coachrest-02 (HIGH-EPSILON 2026-05-22) — dynamic duration prop
// replaces hardcoded "~ 15 min mobilitate". Default 15 preserves mockup L763
// verbatim cand caller omits (T0 fresh / no plan yet).
//
// MED-FIX chat5 (2026-05-23) — fallback null path replaced hardcoded
// "Pectoralii si picioarele inca recupereaza · readiness 32/100." (Bugatti
// truth violation: muscle-group claim + fake numeric readiness shown la T0
// fresh users regardless of training history). Now: generic non-claim line
// "Astazi e zi de recuperare - corpul are nevoie de odihna." Sibling pattern
// la HIGH-3 CoachTodayCard 74650a5f. Supersedes "mockup verbatim cand null"
// preserve note (Bugatti truth > mockup verbatim - Gigel filter wins).

import type { JSX } from 'react';
import type { CoachRestReason } from '../../lib/engineWrappers';
import { t } from '../../../i18n/index.js';
import {
  READINESS_PR,
  READINESS_HIGH,
  READINESS_MED,
  READINESS_LOW,
} from '../../../engine/readiness.js';

/**
 * Map a raw readiness score to the engine's qualitative band `key` so the rest
 * card surfaces a label (reusing coachEngine.readiness.labels.*) instead of a
 * bare NN/100. Same band thresholds as getReadinessVerdict — no parallel scheme.
 * Rest context never PRs, so the top band resolves to SOLID, not PR_DAY.
 */
function readinessBandKey(score: number): string {
  if (score >= READINESS_PR) return 'SOLID';
  if (score >= READINESS_HIGH) return 'NORMAL';
  if (score >= READINESS_MED) return 'MODERATE';
  if (score >= READINESS_LOW) return 'LIGHT';
  return 'REST_RECOVER';
}

interface Props {
  onLightSession: () => void;
  onOverride: () => void;
  restReason?: CoachRestReason | null;
  // §F-pass2-coachrest-02 — dynamic duration from rest session plan; default
  // 15 mockup verbatim cand caller omits.
  durationMinutes?: number;
}

/**
 * Compose coach line din restReason. Generic non-claim fallback cand null
 * (T0 fresh): NO muscle-group claim, NO fake readiness number - Bugatti
 * truth invariant per MED-FIX chat5. Locale-aware via i18n bundle (RO
 * no-diacritics rule D-LEGACY-064 preserved on RO branch).
 */
function composeCoachLine(restReason: CoachRestReason | null | undefined): string {
  if (!restReason) {
    return t('coachRest.genericLine');
  }
  const { fatiguedGroups, readinessScore } = restReason;
  const groupsPart =
    fatiguedGroups.length === 0
      ? t('coachRest.musclesRecovering')
      : t('coachRest.groupsRecovering', { groups: fatiguedGroups.join(t('coachRest.andJoiner')) });
  const readinessPart =
    readinessScore === null
      ? ''
      : (() => {
          const labelKey = `coachEngine.readiness.labels.${readinessBandKey(readinessScore)}`;
          const label = t(labelKey);
          return t('coachRest.readinessSuffix', {
            label: label && label !== labelKey ? label : '',
          });
        })();
  return `${groupsPart}${readinessPart}.`;
}

export function CoachRestCard({
  onLightSession,
  onOverride,
  restReason,
  durationMinutes = 15,
}: Props): JSX.Element {
  const coachLine = composeCoachLine(restReason ?? null);
  return (
    <div
      className="pulse-card pulse-card-glow p-[18px] mb-2.5"
      style={{ ['--wash' as string]: 'var(--aqua)' }}
      role="region"
      aria-label={t('coachRest.ariaLabel')}
    >
      <div
        className="text-xs font-semibold tracking-wider uppercase"
        style={{ color: 'var(--status-neutral-text)' }}
      >
        {t('coachRest.kicker')}
      </div>
      <div className="text-xl font-bold mt-1 tracking-tight text-ink flex items-center gap-2.5">
        {t('coachRest.title')}
      </div>
      <div className="font-serif italic mt-1.5 leading-relaxed text-sm text-ink2">
        &ldquo;{coachLine}&rdquo;
      </div>
      <div className="flex gap-3.5 mt-3.5 text-sm text-ink2">
        <span className="flex items-center gap-1.5" data-testid="coach-rest-duration">
          {t('coachRest.durationLabel', { min: durationMinutes })}
        </span>
        <span className="flex items-center gap-1.5">{t('coachRest.optional')}</span>
      </div>
      <button
        type="button"
        onClick={onLightSession}
        className="w-full mt-3.5 bg-transparent text-ink border border-line rounded-full py-2.5 font-medium"
      >
        {t('coachRest.lightSessionCta')}
      </button>
      <div className="text-center mt-2.5">
        <button
          type="button"
          onClick={onOverride}
          className="text-ink2 text-sm underline underline-offset-2"
        >
          {t('coachRest.overrideCta')}
        </button>
      </div>
    </div>
  );
}
