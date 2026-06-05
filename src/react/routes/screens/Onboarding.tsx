// ══ ONBOARDING — Big 6 Hard Typing 8-Step React Port ═════════════════════
// Phase 5 task_14 — onboarding flow MVP cu Big 6 hard typing (varsta + sex
// + obiectiv + frecventa + experienta + greutate + inaltime + summary).
//
// Pulse arc reskin (2026-05-29, GROUP A / A3) — the 8 step bodies follow
// Daniel's Pulse mockup (interfata-noua/screens-entry.jsx OnboardingScreen
// ~117-262): a per-step aqua Kicker eyebrow, big-number inputs for age/kg/cm
// (huge centered figure + unit + helper), a 2-tile sex picker, enriched choice
// rows for goal/frequency/experience (accent-tinted selected state + check
// affordance), and a summary review card. The brain is preserved verbatim:
// useOnboardingStore setField/finalize/validateOnboardingField, the per-step
// validation gate + Gigel-friendly toast, the finalize()+completed guard, the
// weight-timeline seed (seedFromProfileIfEmpty), the `onboarding-step-N` +
// per-control testids, and the round-dot progress (tests assert progress-dot-N
// + data-active — kept, NOT swapped for the mockup's bar). The mockup's English
// goal IDs map to the REAL RO store vocab (auto/forta/masa/slabire/mentenanta);
// frequency stays the real 2-5 union (the mockup's 2-6 stepper exceeds the
// store type). Token-only styling, no raw hex.
//
// Hygiene split (2026-05-31) — the 9 step bodies + the shared BigNumberField
// were extracted verbatim into ./onboarding/* (presentational only). This file
// keeps ALL the brain: the store hooks, the step-validation gate, the finalize
// + navigation + timeline-seed handlers. Children receive value + onChange via
// props; no hook/state moved. Rendered DOM is byte-identical.

import type { JSX } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOnboardingStore, validateOnboardingField } from '../../stores/onboardingStore';
import { useProgresStore } from '../../stores/progresStore';
import { Kicker } from '../../components/pulse/Kicker';
import { toast } from '../../lib/toast';
import { t } from '../../../i18n/index.js';
import { Step1, Step6, Step7Height } from './onboarding/NumericSteps';
import { Step2, StepTrainingType, Step3, Step4, Step5 } from './onboarding/ChoiceSteps';
import { Step8Summary } from './onboarding/Step8Summary';

/** Local ISO YYYY-MM-DD (date-only) — mirror LogWeight.todayIso (date-tz local). */
function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

// Daniel spec 2026-05-30 — training-type step inserted at position 3 (after
// sex, before goal): it GATES the whole experience so it belongs early. Total
// steps 8 → 9 (goal/freq/exp/weight/height/summary each shift +1).
const TOTAL_STEPS = 9;

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export function Onboarding(): JSX.Element {
  const { step } = useParams<{ step: string }>();
  const navigate = useNavigate();
  const stepNum = Math.max(1, Math.min(TOTAL_STEPS, parseInt(step ?? '1', 10))) as Step;
  const data = useOnboardingStore((s) => s.data);
  const setField = useOnboardingStore((s) => s.setField);
  const finalize = useOnboardingStore((s) => s.finalize);

  const isLast = stepNum === TOTAL_STEPS;

  // §30-C1 Big 6 bounds gate — keystroke commits allowed (UX: user types
  // "1" → "16" → "32" without blocking each digit); validation gate fires
  // pe Continua attempt + surfaces Gigel-friendly toast. Defense-in-depth:
  // onboardingStore.setField rejects silently dacă final value out-of-range
  // (paste "999" la weight: store discards, UI shows toast on Continua).
  //
  // U-02 (CRIT) — block click-through gol: fiecare pas cere selectie/valoare
  // inainte de Continua (sex/goal/frecventa/experienta null → blocat). Fara
  // asta Gigel trecea 6 pasi fara input → finalize cu Big 6 null. finalize
  // are guard propriu (store) ca safety net defense-in-depth.
  // Resolve the store's semantic validation outcome (messageKey + params) to
  // localized copy at the React boundary via t() — the store emits keys, never
  // Romanian prose (i18n leak fix audit 09 store-evading).
  function resolveFieldCheck(
    check: ReturnType<typeof validateOnboardingField>,
  ): { ok: true } | { ok: false; reason: string } {
    if (check.ok) return { ok: true };
    return { ok: false, reason: t(check.messageKey, check.params) };
  }

  function validateCurrentStep(): { ok: true } | { ok: false; reason: string } {
    if (stepNum === 1) {
      if (data.age === null) return { ok: false, reason: t('onboarding.toast.completeAge') };
      return resolveFieldCheck(validateOnboardingField('age', data.age));
    }
    if (stepNum === 2 && data.sex === null) return { ok: false, reason: t('onboarding.toast.completeOption') };
    // Step 3 (NEW) — training type. Default 'gym' is always present (EMPTY seed),
    // so the gate never blocks; the explicit choice still commits via the tiles.
    if (stepNum === 3 && (data.trainingType ?? null) === null) {
      return { ok: false, reason: t('onboarding.toast.completeTrainingType') };
    }
    if (stepNum === 4 && data.goal === null) return { ok: false, reason: t('onboarding.toast.completeGoal') };
    if (stepNum === 5 && data.frequency === null) return { ok: false, reason: t('onboarding.toast.completeFrequency') };
    if (stepNum === 6 && data.experience === null) return { ok: false, reason: t('onboarding.toast.completeLevel') };
    if (stepNum === 7) {
      if (data.weight === null) return { ok: false, reason: t('onboarding.toast.completeWeight') };
      return resolveFieldCheck(validateOnboardingField('weight', data.weight));
    }
    if (stepNum === 8) {
      if (data.height === null) return { ok: false, reason: t('onboarding.toast.completeHeight') };
      return resolveFieldCheck(validateOnboardingField('height', data.height));
    }
    return { ok: true };
  }

  // Founder UX 2026-06-06 — the Continua button must LOOK disabled while the
  // current step is invalid (it already blocks the navigation + shows a toast,
  // but a green/active button on an out-of-range age read as "it's fine").
  // Pure read of the same gate (no toast side-effect) so the visual state
  // tracks validity exactly. The button stays clickable (keeps the explanatory
  // toast on tap) but carries aria-disabled + a dimmed style.
  const stepValid = validateCurrentStep().ok;

  function next(): void {
    const check = validateCurrentStep();
    if (!check.ok) {
      toast.show({ message: check.reason, variant: 'warning' });
      return;
    }
    if (isLast) {
      // U-02 (CRIT) — navigate DOAR daca finalize a reusit. finalize respinge
      // daca vreun Big 6 e null/out-of-range (stale state sau acces direct
      // /onboarding/7). Fara verificare, user ar ajunge in app ne-onboarded.
      finalize();
      if (useOnboardingStore.getState().completed) {
        // BUG #5 — seed timeline-ul de greutate din greutatea de onboarding cand
        // e gol, ca "Greutate (7 zile)" sa porneasca de la greutatea reala a
        // user-ului (NU disconnect intre profil si timeline). Idempotent: NU
        // suprascrie loguri reale daca user-ul a cantarit deja.
        const w = useOnboardingStore.getState().data.weight;
        if (w !== null) {
          useProgresStore.getState().seedFromProfileIfEmpty(w, todayIso());
        }
        navigate('/app/antrenor');
      } else {
        toast.show({ message: t('onboarding.toast.completeAll'), variant: 'warning' });
      }
    } else {
      navigate(`/onboarding/${stepNum + 1}`);
    }
  }

  function back(): void {
    if (stepNum > 1) navigate(`/onboarding/${stepNum - 1}`);
  }

  return (
    <section
      className="min-h-screen bg-paper text-ink flex flex-col p-6"
      data-testid={`onboarding-step-${stepNum}`}
    >
      {/* MED — round DOTS per mockup andura-clasic.html L489-498 (.progress-dot
          8px circle; current = brick + scale, done = brick, pending = line) +
          "N din TOTAL" counter at row end. Replaces prior thin-bar fill. */}
      <div className="flex items-center gap-2 mb-8">
        <div className="flex-1 flex items-center gap-1.5">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              data-testid={`progress-dot-${i + 1}`}
              data-active={i + 1 <= stepNum ? 'true' : 'false'}
              className={`w-2 h-2 rounded-full ${
                i + 1 === stepNum
                  ? 'bg-ink scale-150'
                  : i + 1 < stepNum
                    ? 'bg-brick'
                    : 'bg-line'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-ink3 font-medium">
          {t('onboarding.progress', { current: stepNum, total: TOTAL_STEPS })}
        </span>
      </div>

      {/* Pulse Kicker eyebrow — aqua mono "PASUL N" leads the per-step stagger
          so the eye lands on it first before the heading (mockup OnboardingScreen
          <Kicker color="var(--aqua)">STEP N</Kicker>). Reuses the existing
          stepKicker key (i18n parity). */}
      <div className="mb-1 animate-fade-in-up delay-0">
        <Kicker color="var(--aqua)">{t('onboarding.stepKicker', { n: stepNum })}</Kicker>
      </div>

      {/* Wave A5 — each step re-mounts under a key so the fade-in-up replays
          per navigation. Wrapping the active step lets the fade carry the
          whole "title + helper + options" block as a unit (cleaner than
          per-element animation that fights the staggered children inside). */}
      <div key={`onb-step-${stepNum}`} className="animate-fade-in-up delay-75">
        {stepNum === 1 && <Step1 value={data.age} onChange={(v) => setField('age', v)} />}
        {stepNum === 2 && <Step2 value={data.sex} onChange={(v) => setField('sex', v)} />}
        {stepNum === 3 && <StepTrainingType value={data.trainingType ?? 'gym'} onChange={(v) => setField('trainingType', v)} />}
        {stepNum === 4 && <Step3 value={data.goal} onChange={(v) => setField('goal', v)} />}
        {stepNum === 5 && <Step4 value={data.frequency} onChange={(v) => setField('frequency', v)} />}
        {stepNum === 6 && <Step5 value={data.experience} onChange={(v) => setField('experience', v)} />}
        {stepNum === 7 && <Step6 value={data.weight} onChange={(v) => setField('weight', v)} />}
        {stepNum === 8 && <Step7Height value={data.height} onChange={(v) => setField('height', v)} />}
        {stepNum === 9 && <Step8Summary data={data} />}
      </div>

      <div className="flex-1" />

      <div className="flex gap-3 mt-6">
        {stepNum > 1 && (
          <button
            type="button"
            onClick={back}
            data-testid="onb-back"
            className="btn-secondary-lift px-5 py-3 bg-paper2 border border-lineStrong text-ink rounded-xl text-sm font-semibold"
          >
            {t('onboarding.backCta')}
          </button>
        )}
        <button
          type="button"
          onClick={next}
          data-testid="onb-next"
          aria-disabled={!stepValid}
          className={`btn-primary-lift btn-grad press-feedback flex-1 px-5 py-3 text-base font-semibold${isLast ? ' option-selected-ring' : ''}${!stepValid ? ' opacity-50' : ''}`}
        >
          {isLast ? t('onboarding.finishCta') : t('onboarding.continueCta')}
        </button>
      </div>
    </section>
  );
}
