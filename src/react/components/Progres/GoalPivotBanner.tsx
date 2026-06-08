// ══ GOAL PIVOT BANNER (#15 dp_auto_pivot_v1) — the LAST dark primitive's UI ══
//
// proposeGoalPivot (autoPivot.js) detects when a user is near their strength
// ceiling across most lifts AND stagnating, and PROPOSES moving off pure strength.
// The pure decision engine shipped behind dp_auto_pivot_v1 (default OFF) with NO
// live render-surface — this component is that surface (the LAST dark primitive's
// consumer). Wired into the Progres OBIECTIV zone (the goal hub), it renders:
//   • a Tier-2 banner (the discrete suggestion line) when the engine proposes;
//   • a Tier-3 confirm (the per-target wording) on choosing a productive move;
//   • on ACCEPT → sets the goal via the SAME path the goal selector uses
//     (setField('goal') + setPhaseOverride(phaseForGoal())), re-routing volume +
//     intensity through the existing goal modifiers;
//   • 'Raman pe forta' (decline) → no goal change, the prompt cools down.
//
// Anti-spam: the engine reuses pushBackTiers.evaluateReprompt (28d rolling / 60d
// post-goal-shift / 4-per-year cap) via getGoalPivotProposal; this component stamps
// the persisted bookkeeping (`dp-pivot-prompts`) on shown / accept / decline so it
// never nags. FLAG OFF → getGoalPivotProposal returns null → nothing renders (the
// banner is absent + no detection runs → byte-identical live path).
//
// Copy = i18n KEYS (coachPivot.*, en+ro parity, RO no-diacritics) — never hardcoded.

import type { JSX } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Sparkles, TrendingUp, ArrowRight } from 'lucide-react';
import { useOnboardingStore } from '../../stores/onboardingStore';
import type { Goal } from '../../stores/onboardingStore';
import {
  getGoalPivotProposal,
  recordGoalPivotShown,
  recordGoalPivotAccepted,
  recordGoalPivotDeclined,
} from '../../lib/engineWrappers';
import type { GoalPivotProposal } from '../../lib/engineWrappers';
import { phaseForGoal } from '../../lib/goalPhaseModel';
import { readUserMaintenanceTDEE } from '../../lib/userTdee';
import { setPhaseOverride } from '../../../util/phaseOverride.js';
import { SYS } from '../../../engine/sys.js';
import { Kicker } from '../pulse/Kicker';
import { haptic } from '../../lib/motion';
import { t } from '../../../i18n/index.js';

// The two productive pivot targets the wording offers (onboarding Goal ids).
type PivotTarget = 'masa' | 'mentenanta';
const CONFIRM_KEY: Record<PivotTarget, string> = {
  masa: 'coachPivot.confirmMasa',
  mentenanta: 'coachPivot.confirmMentenanta',
};
const OPTION_KEY: Record<PivotTarget, string> = {
  masa: 'coachPivot.optionMasa',
  mentenanta: 'coachPivot.optionMentenanta',
};

export function GoalPivotBanner(): JSX.Element | null {
  const setField = useOnboardingStore((s) => s.setField);
  // Read the proposal once at mount (flag OFF → null → nothing renders). The
  // engine is read-only here; persistence happens on the explicit actions below.
  const [proposal, setProposal] = useState<GoalPivotProposal | null>(null);
  // Tier-3 confirm: the target whose confirm wording is showing (null = Tier-2).
  const [confirming, setConfirming] = useState<PivotTarget | null>(null);
  // Why-line reveal (tap "De ce?") — inline, matching the Progres card language.
  const [showWhy, setShowWhy] = useState(false);
  // Once the user resolves this prompt (accept/decline) we hide it for this view.
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const p = getGoalPivotProposal();
    if (p) {
      // Stamp "shown" ONCE when the banner first surfaces (the 28d rolling +
      // per-year cap anchors). Guarded by the mount effect (fires once).
      recordGoalPivotShown();
      setProposal(p);
    }
  }, []);

  const targets = useMemo<PivotTarget[]>(
    () => (proposal?.targets ?? []).filter((g): g is PivotTarget => g === 'masa' || g === 'mentenanta'),
    [proposal],
  );

  if (!proposal || dismissed || targets.length === 0) return null;

  function commitGoal(g: Goal): void {
    setField('goal', g);
    // Mirror the goal-selector commit: sync the phase override so the TDEE/PHASE
    // surfaces reflect the new phase (phaseForGoal: masa→BULK / mentenanta→
    // MAINTENANCE). Per-user TDEE snapshot; legacy SYS.estimateTDEE cold-start only.
    const tdee =
      readUserMaintenanceTDEE() ??
      (typeof SYS?.estimateTDEE === 'function' ? SYS.estimateTDEE() : 2000);
    setPhaseOverride(phaseForGoal(g), tdee);
  }

  function handleAccept(g: PivotTarget): void {
    haptic(12);
    commitGoal(g);
    recordGoalPivotAccepted();
    setDismissed(true);
  }

  function handleDecline(): void {
    haptic(8);
    // 'Raman pe forta' — no goal change; the decline IS the cooldown.
    recordGoalPivotDeclined();
    setDismissed(true);
  }

  return (
    <section
      className="pulse-card pulse-card-glow overflow-hidden p-[18px] mb-5 animate-card-rise"
      role="region"
      aria-label={t('coachPivot.ariaLabel')}
      data-testid="goal-pivot-banner"
      style={{ ['--wash' as string]: 'var(--ember)' }}
    >
      <div className="relative">
        <Kicker color="var(--ember)">{t('coachPivot.kicker')}</Kicker>
      </div>

      {confirming === null ? (
        <>
          {/* Tier-2 — the discrete suggestion line + the offered moves. */}
          <p
            className="relative flex items-start gap-2 mt-2 text-sm leading-relaxed text-ink2"
            data-testid="goal-pivot-banner-text"
          >
            <Sparkles
              className="w-4 h-4 mt-0.5 shrink-0"
              aria-hidden="true"
              style={{ color: 'var(--ember)' }}
            />
            <span>{t('coachPivot.banner')}</span>
          </p>

          <div className="relative flex flex-col gap-2.5 mt-3.5">
            {targets.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => {
                  haptic(8);
                  setConfirming(g);
                }}
                data-testid={`goal-pivot-option-${g}`}
                className="press-feedback w-full rounded-full py-3 font-semibold text-sm flex items-center justify-center gap-2 border text-ink"
                style={{
                  borderColor: 'color-mix(in oklab, var(--ember) 45%, transparent)',
                  background: 'color-mix(in oklab, var(--ember) 8%, transparent)',
                }}
              >
                <TrendingUp className="w-4 h-4" aria-hidden="true" />
                {t(OPTION_KEY[g])}
              </button>
            ))}
            {/* 'Raman pe forta' — decline → cooldown, no goal change. */}
            <button
              type="button"
              onClick={handleDecline}
              data-testid="goal-pivot-decline"
              className="press-feedback w-full rounded-full py-3 font-medium text-sm text-ink2 border"
              style={{ borderColor: 'var(--line-strong)' }}
            >
              {t('coachPivot.optionForta')}
            </button>
          </div>

          {/* Why-line on tap — the honest "near your natural ceiling" explanation. */}
          <div className="relative mt-3 text-center">
            <button
              type="button"
              onClick={() => setShowWhy((v) => !v)}
              data-testid="goal-pivot-why-cta"
              aria-expanded={showWhy}
              className="text-xs underline underline-offset-2 text-ink3"
            >
              {t('coachPivot.whyCta')}
            </button>
          </div>
          {showWhy && (
            <p
              className="relative mt-2 text-xs leading-relaxed text-ink3"
              data-testid="goal-pivot-why-line"
            >
              {t('coachPivot.whyLine')}
            </p>
          )}
        </>
      ) : (
        <>
          {/* Tier-3 — the per-target confirm wording + accept/cancel. */}
          <p
            className="relative mt-2 text-sm leading-relaxed text-ink"
            data-testid="goal-pivot-confirm-text"
          >
            {t(CONFIRM_KEY[confirming])}
          </p>
          <div className="relative flex flex-col gap-2.5 mt-3.5">
            <button
              type="button"
              onClick={() => handleAccept(confirming)}
              data-testid="goal-pivot-confirm-accept"
              className="btn-primary-lift press-feedback pulse-grad-bg pulse-shine relative overflow-hidden w-full rounded-full py-3 font-semibold flex items-center justify-center gap-2"
              style={{ color: 'var(--on-accent)' }}
            >
              <span className="relative">{t('coachPivot.confirmYes')}</span>
              <ArrowRight className="relative w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => {
                haptic(8);
                setConfirming(null);
              }}
              data-testid="goal-pivot-confirm-cancel"
              className="press-feedback w-full rounded-full py-3 font-medium text-sm text-ink2 border"
              style={{ borderColor: 'var(--line-strong)' }}
            >
              {t('coachPivot.confirmCancel')}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
