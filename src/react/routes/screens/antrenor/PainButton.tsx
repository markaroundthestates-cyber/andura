// ══ PAIN BUTTON — Phase 3 task_06 §B Rewrite Stub → Real ═════════════════
// Per spec §2 B pain region selector + intensity (1=usor / 2=mediu / 3=sever)
// + propagation pain context la workout-preview via location.state.
//
// CDL override pattern (D-LEGACY-035 + ADR-ENGINE-MATH-LOCKED-VALUES §9 §43-H2):
// pain context propagated synchron via location.state (in-session adapt) AND
// persisted append-only to DB('pain-cdl') so the Recovery Engine reads it on
// subsequent sessions (engine layer adapts volume per muscle group, avoid
// exercitii care irita zona). Prior version only propagated location.state
// (ephemeral) — nothing survived navigation, so muscleRecovery could never
// adapt future sessions. Persistence shim mirrors workoutStore logs writeback
// (commit 31f56293 persistSessionLogs): soft-fail at I/O boundary, newest-first
// unshift, rolling cap. Engines stay pure (ADR 026) — Date.now read here.
//
// Anti-force-typing (D-LEGACY-010 §AMENDED): region selection mandatory
// pentru Continue button (disabled cand region null), but "Salveaza si iesi"
// always vizibil ca escape hatch — NU forteaza completion.
//
// HIGH-GAMMA §F-pain-button-02: coach reassurance toast on confirm + closing
// italic safety messaging per mockup andura-clasic.html L1017-1021 verbatim
// "Siguranta e pe primul loc. Am ajustat restul sesiunii." toast + "Daca nu
// se potriveste niciuna, opreste sesiunea si consulta un medic." italic.
// Mandatory safety cues — NOT paternalistic per anti-paternalism D-LEGACY-061
// (informative, NU prescriptive).
//
// PAR-009 SubHeader consume — mockup andura-clasic.html L1013 sub-header
// verbatim title "Ma doare ceva" sticky top + back-btn. Body h1 "Unde te doare?"
// regresat la h2 (single h1 SubHeader pattern parity CevaNuMerge/EnergyCause).
//
// Cross-refs:
//   - DECISIONS.md §D-LEGACY-035 Pain/Discomfort Button CDL override
//   - DECISIONS.md §D-LEGACY-010 anti-force-typing
//   - DECISIONS.md §D-LEGACY-061 anti-paternalism
//   - DECISIONS.md §D-LEGACY-064 Romanian no-diacritics rule
//   - mockup andura-clasic.html#L1011-1023 screen-pain-button

import type { JSX } from 'react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { gotoPath } from '../../../lib/navigation';
import { toast } from '../../../lib/toast';
import { SubHeader } from '../../../components/SubHeader';
import { Ripple } from '../../../components/Ripple';
import { DB } from '../../../../db.js';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { edgeFlash, haptic } from '../../../lib/motion';
import { t } from '../../../../i18n/index.js';
import { isEnabled } from '../../../../util/featureFlags.js';
import { pinPain, clearPainPin, isPinnedPainful } from '../../../../engine/dp/painMemory.js';

export type BodyRegion =
  | 'gat'
  | 'umar-stang'
  | 'umar-drept'
  | 'spate'
  | 'lombar'
  | 'piept'
  | 'cot-stang'
  | 'cot-drept'
  | 'incheietura-stanga'
  | 'incheietura-dreapta'
  | 'sold'
  | 'genunchi-stang'
  | 'genunchi-drept'
  | 'glezna-stanga'
  | 'glezna-dreapta';

export type PainIntensity = 1 | 2 | 3;

// Region ID list stays canonical (engine + CDL persistence keys); the
// rendered label flows through painButton.regions.* sub-tree so the
// locale flip surfaces EN copy under default + RO opt-in.
const REGION_IDS: readonly BodyRegion[] = [
  'gat',
  'umar-stang',
  'umar-drept',
  'piept',
  'spate',
  'lombar',
  'cot-stang',
  'cot-drept',
  'incheietura-stanga',
  'incheietura-dreapta',
  'sold',
  'genunchi-stang',
  'genunchi-drept',
  'glezna-stanga',
  'glezna-dreapta',
];

function intensityLabel(level: PainIntensity): string {
  return t(`painButton.intensityLabels.${level}`);
}

// ── Pain CDL append-only persistence (ADR §9 §43-H2) ───────────────────────
// DB('pain-cdl') key — append-only log the Recovery Engine reads next session.
// Cap matches legacy pain-button-log rolling window (src/pages/coach/
// painButton.js:43 PAIN_NOTES_WINDOW = 90).
export const PAIN_CDL_KEY = 'pain-cdl';
export const PAIN_CDL_MAX = 90;

export interface PainCdlEntry {
  type: 'pain';
  region: BodyRegion;
  intensity: PainIntensity;
  ts: number;
}

/**
 * Append a pain report to the append-only CDL store (newest-first). Soft-fails
 * at the I/O boundary (storage quota / SSR jsdom) preserving the zero-throw
 * render contract — mirrors workoutStore persistSessionLogs (commit 31f56293).
 */
export function persistPainCdl(region: BodyRegion, intensity: PainIntensity): void {
  try {
    const entry: PainCdlEntry = { type: 'pain', region, intensity, ts: Date.now() };
    const existing = DB.get<PainCdlEntry[]>(PAIN_CDL_KEY) ?? [];
    DB.set(PAIN_CDL_KEY, [entry, ...existing].slice(0, PAIN_CDL_MAX));
  } catch {
    // Soft-fail — recovery path tolerates missing pain CDL (conservative
    // baseline). Never block the safety-toast + navigation render path.
  }
}

export function PainButton(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const setSessionContext = useWorkoutStore((s) => s.setSessionContext);
  const sessionStart = useWorkoutStore((s) => s.sessionStart);
  const [region, setRegion] = useState<BodyRegion | null>(null);
  const [intensity, setIntensity] = useState<PainIntensity>(1);

  // Daniel smoke 2026-05-28 #18 verbatim "trebuie dupa sa se adapteze in timp
  // real si sa continue antrenamentul cu varianta ajustata, nu sa ma puna sa
  // il deschid iar". Pain reported MID-session now goes straight back to the
  // active Workout (skipping the workout-preview re-confirmation friction) —
  // sessionContext is set in the store so Workout.tsx can apply 'minus'
  // intensity to remaining sets without restarting. Pre-session entry (no live
  // session) keeps the historical preview route so the user sees the adapted
  // session before starting fresh.
  // `inSession` detection: a live session has sessionStart populated (set by
  // Workout.tsx mount-init or paused-resume) and was reached via the ⋯ menu's
  // pain action. Location state `from:'workout'` is a defensive secondary
  // signal in case the route is hit elsewhere.
  const navState = location.state as { from?: string; activeExercise?: string } | null;
  const fromState = navState?.from;
  const inSession = sessionStart !== null || fromState === 'workout';
  // #64 the ACTIVE exercise the ⋯ pain action was opened from (engine key, #41) —
  // threaded via location.state from Workout.tsx handleGoPain. Used to pin a durable
  // pain memory so the exercise is proactively substituted next session (flag-gated).
  const activeExercise = navState?.activeExercise;
  // #64 clear-UX ("No longer hurts" / "Nu ma mai doare") — reversible: deletes the
  // pin so the exercise returns to normal selection next session. Shown only when
  // the active exercise is currently pinned (flag-gated). Placement here is the
  // natural pain surface; the design pass owns the final coach-surface placement.
  const showClearPin =
    isEnabled('dp_pain_memory_v1') &&
    typeof activeExercise === 'string' &&
    !!activeExercise &&
    isPinnedPainful(activeExercise);

  function handleContinue(): void {
    if (!region) return;
    // §43-H2: persist pain to append-only CDL so Recovery Engine adapts future
    // sessions (not just this one via location.state).
    persistPainCdl(region, intensity);
    // #64 PERSISTENT pain memory (dp_pain_memory_v1, default OFF → no-op): pin the
    // ACTIVE exercise as painful so it is PROACTIVELY substituted next session until
    // the user clears the pin. Quota-guarded inside pinPain (never throws). Only when
    // a live session supplied the active exercise (the ⋯ pain action from Workout).
    if (isEnabled('dp_pain_memory_v1') && typeof activeExercise === 'string' && activeExercise) {
      pinPain(activeExercise, { region, intensity });
    }
    // Wave C3 (2026-05-28) — tactile + visual confirmation that the pain report
    // was registered. Soft haptic buzz (10ms — Material "subtle confirm"), then
    // a brief brick-tinted edge flash so the user feels "they heard me" without
    // the pop being startling. Both helpers no-op on desktop / under
    // prefers-reduced-motion (vestibular safety, Maria 65).
    haptic(10);
    edgeFlash('var(--brick)');
    // §F-pain-button-02 reassurance toast — verbatim mockup L1017-1019.
    toast.show({
      message: t('painButton.reassureToast'),
      variant: 'success',
    });
    if (inSession) {
      // Daniel smoke 2026-05-28 #18 — in-session adapt: persist pain context
      // on the store + return to workout (no preview round-trip). Workout.tsx
      // applies the 'minus' intensity to remaining sets via engineIntensityMod
      // override + the pain CDL feeds the next session through the pipeline.
      setSessionContext({
        intensityMod: 'minus',
        painContext: { region, intensity },
      });
      navigate(gotoPath('workout'));
      return;
    }
    navigate(gotoPath('workout-preview'), {
      state: { painContext: { region, intensity }, intensityMod: 'minus' },
    });
  }

  function handleExit(): void {
    navigate(gotoPath('antrenor'));
  }

  // #64 clear the durable pain pin for the active exercise (reversible). Toast +
  // return to the workout so the next session re-prescribes the original lift.
  function handleClearPin(): void {
    if (typeof activeExercise !== 'string' || !activeExercise) return;
    clearPainPin(activeExercise);
    haptic(10);
    toast.show({ message: t('painButton.clearPinToast'), variant: 'success' });
    navigate(inSession ? gotoPath('workout') : gotoPath('antrenor'));
  }

  function handleBack(): void {
    navigate(-1);
  }

  const continueDisabled = region === null;

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="pain-button">
      <SubHeader
        title={t('painButton.subHeaderTitle')}
        onBack={handleBack}
        testIdBack="pain-button-back"
      />
      <div className="p-6 flex-1 animate-card-rise">
      <h2 className="font-display text-2xl font-bold text-ink tracking-tight mb-2">{t('painButton.heading')}</h2>
      <p className="text-base text-ink2 mb-6">{t('painButton.subtitle')}</p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {REGION_IDS.map((id) => {
          const selected = region === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setRegion(id)}
              data-region={id}
              aria-pressed={selected}
              className={
                selected
                  ? 'press-feedback p-3 rounded-2xl border bg-brick text-paper border-brick'
                  : 'press-feedback pulse-card p-3 text-ink'
              }
            >
              <span className="text-sm font-medium">{t(`painButton.regions.${id}`)}</span>
            </button>
          );
        })}
      </div>

      <div className="mb-6">
        <p className="text-base text-ink mb-3">{t('painButton.intensityPrompt')}</p>
        <div className="flex gap-3">
          {([1, 2, 3] as const).map((lvl) => {
            const selected = intensity === lvl;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => setIntensity(lvl)}
                data-intensity={lvl}
                aria-pressed={selected}
                className={
                  selected
                    ? 'press-feedback flex-1 py-3 rounded-2xl border bg-brick text-paper border-brick'
                    : 'press-feedback pulse-card flex-1 py-3 text-ink'
                }
              >
                <span className="text-base font-medium">{intensityLabel(lvl)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={handleContinue}
        disabled={continueDisabled}
        data-testid="pain-continue"
        className="press-feedback pulse-grad-bg pulse-shine relative overflow-hidden w-full py-4 text-paper rounded-[14px] text-base font-semibold disabled:opacity-50"
      >
        <Ripple color="rgba(255,255,255,0.5)" />
        <span className="relative">{t('painButton.continueCta')}</span>
      </button>
      <button
        type="button"
        onClick={handleExit}
        data-testid="pain-exit"
        className="w-full mt-3 py-3 text-ink2 text-sm"
      >
        {t('painButton.exitCta')}
      </button>
      {showClearPin && (
        <button
          type="button"
          onClick={handleClearPin}
          data-testid="pain-clear-pin"
          className="w-full mt-2 py-3 text-green text-sm font-medium"
        >
          {t('painButton.clearPinCta')}
        </button>
      )}
      {/* §F-pain-button-02 closing italic — verbatim mockup L1021. Safety
          cue NU paternalistic per D-LEGACY-061 (informativ daca presets nu se
          potrivesc). Lora serif italic matches mockup typography. */}
      <p
        className="mt-6 text-sm text-ink3 italic font-serif leading-relaxed"
        data-testid="pain-medical-cue"
      >
        {t('painButton.medicalCue')}
      </p>
      </div>
    </section>
  );
}
