// ══ WORKOUT — Phase 3 task_08 State Machine UI Rewrite ═══════════════════
// Per spec §2 A wv2 state machine port React. 5 sub-zones conditional pe
// workoutStore.phase: 'logging' | 'rating' | 'rest' | 'transition' | 'idle'.
//
// Phase 3 monolithic (acceptable spec §B). Sub-components extract Phase 4+
// (SessionTimer / RestOverlay / SetLogInput / SetRatingButtons /
// ExitConfirmSheet / SessionPill).
//
// State machine transitions:
//   logging → (logSet) → rest (intermediate set) sau rest-then-transition (last
//   set of an exercise — Bug 1: the inter-exercise rest is now a REAL, skip-able
//   rest = the just-finished exercise's restSec) sau navigate post-rpe (last set
//   of last exercise — NO trailing rest)
//   rest (intermediate)      → (countdown end or skip) → logging (same exercise)
//   rest (inter-exercise)    → (countdown end or skip) → transition → advance
//   transition → (1.5s delay) → logging (next exercise)
//
// Wake lock: navigator.wakeLock.request('screen') on mount, release on unmount
// (fail silent — older browsers / non-secure context).
// Inactivity watch + anti-aggressive loading (LOCK 9) — Phase 4+ adds.
//
// Cross-refs:
//   - DECISIONS.md §D-LEGACY-027 Energy Adjustment
//   - DECISIONS.md §D-LEGACY-029 Adherence Engine
//   - DECISIONS.md §D-LEGACY-052 Andura Suflet (coach line)
//   - DECISIONS.md §D-LEGACY-064 Romanian no-diacritics rule
//   - mockup andura-clasic.html screen-workout wv2 reference

import type { JSX } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Images, ChevronDown } from 'lucide-react';
import { AparatLipsaSheet } from '../../../components/Workout/AparatLipsaSheet';
import { SwapPickSheet } from '../../../components/Workout/SwapPickSheet';
import { useWorkoutStore, getCurrentMode, energyLightForIntensityMod } from '../../../stores/workoutStore';
import type { ExerciseHistoryEntry } from '../../../stores/workoutStore';
import { INSESSION_RATING_TO_RPE } from '../../../stores/workoutStore.logic';
import { coachPick } from '../../../lib/coachVoice';
import { isPerHandLoad } from '../../../lib/exerciseDisplay';
import { getTodayWorkout, getPRDelta, getWhyExerciseSummary, resolveSessionTitle } from '../../../lib/engineWrappers';
import type { PlannedExercise, PlannedWorkoutOutput } from '../../../lib/engineWrappers';
import { gotoPath } from '../../../lib/navigation';
import { SessionTimer } from '../../../components/Workout/SessionTimer';
import { RestOverlay } from '../../../components/Workout/RestOverlay';
import { SetLogInput } from '../../../components/Workout/SetLogInput';
import { SetRatingButtons } from '../../../components/Workout/SetRatingButtons';
import { ExitConfirmSheet } from '../../../components/Workout/ExitConfirmSheet';
import { AaFrictionModal } from '../../../components/AaFrictionModal';
import { AnomalyConfirmModal } from '../../../components/Workout/AnomalyConfirmModal';
import { detectAggressiveLoad, deriveThresholds } from '../../../lib/aaFrictionDetect';
import type { AggressiveReason } from '../../../lib/aaFrictionDetect';
import { sanityCheckSet } from '../../../../engine/dp/anomalyGuard.js';
import type { SanityResult } from '../../../../engine/dp/anomalyGuard.js';
import { recordExerciseSkip } from '../../../../engine/dp/exercisePain.js';
import { getEngineSignals } from '../../../lib/engineSignalsAggregate';
import { InactivityPrompt } from '../../../components/Workout/InactivityPrompt';
import { PrFlash } from '../../../components/Workout/PrFlash';
import { TransitionScreen } from '../../../components/Workout/TransitionScreen';
import { WhyExerciseModal } from '../../../components/Workout/WhyExerciseModal';
import { SetHistoryChips } from '../../../components/Workout/SetHistoryChips';
import { WarmupRampCard, isWarmupResolved, type WarmupStep } from '../../../components/Workout/WarmupRampCard';
import { QuarantineNotice } from '../../../components/Workout/QuarantineNotice';
import { ExerciseActionsRow } from '../../../components/Workout/ExerciseActionsRow';
import { CoachNote } from '../../../components/Workout/CoachNote';
import { isEnabled } from '../../../../util/featureFlags.js';
import { confidenceTier, confidenceTierKey } from '../../../lib/coachConfidence';
import { whyForStatus } from '../../../lib/whyReason';
import { ExerciseMedia } from '../../../components/ExerciseMedia';
import { getExerciseCueKey } from '../../../lib/exerciseCues';
import { Kicker } from '../../../components/pulse/Kicker';
import { useCountUp } from '../../../hooks/useCountUp';
import { DP } from '../../../../engine/dp.js';
import { platesPerSide } from '../../../../engine/plateMath.js';
import { getExerciseMetadata } from '../../../../engine/exerciseLibrary.js';
import { getCurrentWeightKg } from '../../../lib/userTdee';
import { roundToEquipmentWeight, getNextWeight, getPrevWeight } from '../../../../config/weights.js';
import { ENGINE_WORKOUT_TITLE_FALLBACK, resolveIntensityFactors } from '../../../lib/scheduleAdapterAggregate';
import { t } from '../../../../i18n/index.js';
import { useWakeLock } from './workout/useWakeLock';
import { useWhyModalA11y } from './workout/useWhyModalA11y';
import { useInactivityWatch } from './workout/useInactivityWatch';
import { useWorkoutSwap } from './workout/useWorkoutSwap';
import { toast } from '../../../lib/toast';
import { debugLog } from '../../../lib/debugLog';

// Phase 4 task_17: WV2_FALLBACK retired. Workout consumer of
// engineWrappers.getTodayWorkout direct — empty state cand null (engine
// throw / DB unavailable / no planned workout today). Phase 5+ scheduleAdapter
// real aggregate replaces PHASE_4_DEMO_PUSH în engineWrappers.

type SetRating = ExerciseHistoryEntry['rating'];

// In-session coarse rating → RPE for DP.checkInSessionAdjust (responsive per-set
// autoregulation, Daniel 2026-05-30 rewrite). Now co-located with the persisted
// cross-session map RATING_TO_RPE in workoutStore.logic (TWO HORIZONS note +
// guard test there) so the two can never be edited apart. DISTINCT by design:
// persisted greu = 8.5 (cross-session fatigue gates), in-session greu = 10 (the
// live ease branch fires at RPE >= 9.5). Imported below.

export function Workout(): JSX.Element {
  const navigate = useNavigate();
  // §44-C1 — primitive subscriptions feed getCurrentMode tagged FSM view.
  // Mount-init gates on mode.kind=idle (pre-start condition).
  const exIdx = useWorkoutStore((s) => s.exIdx);
  const phase = useWorkoutStore((s) => s.phase);
  const history = useWorkoutStore((s) => s.history);
  const sessionStart = useWorkoutStore((s) => s.sessionStart);
  const pausedSnapshot = useWorkoutStore((s) => s.pausedSnapshot);
  const lastSession = useWorkoutStore((s) => s.lastSession);
  // FIX 2 (Daniel audit 2026-06-05) — "has trained before" must derive from the
  // durable session history, not the transient lastSession (null after deletes /
  // certain flows). A returning user with prior sessions must NEVER see the
  // first-session/baseline copy.
  const sessionsHistory = useWorkoutStore((s) => s.sessionsHistory);
  const startSession = useWorkoutStore((s) => s.startSession);
  const logSet = useWorkoutStore((s) => s.logSet);
  const setPhase = useWorkoutStore((s) => s.setPhase);
  const advanceExercise = useWorkoutStore((s) => s.advanceExercise);
  const pauseSession = useWorkoutStore((s) => s.pauseSession);
  const discardSession = useWorkoutStore((s) => s.discardSession);
  const markPRHit = useWorkoutStore((s) => s.markPRHit);
  const swapExercise = useWorkoutStore((s) => s.swapExercise);
  // Founder swap redesign 2026-06-05 — drop/restore exercise (pick-list).
  const dropExercise = useWorkoutStore((s) => s.dropExercise);
  const restoreExercise = useWorkoutStore((s) => s.restoreExercise);
  const droppedExercises = useWorkoutStore((s) => s.droppedExercises);
  // Daniel smoke 2026-05-28 (#2 + #6) — per-exIdx refusal-tried set + mutation.
  const refusalTriedByEx = useWorkoutStore((s) => s.refusalTriedByEx);
  const markRefusalTried = useWorkoutStore((s) => s.markRefusalTried);
  // Daniel smoke 2026-05-28 (#18) — sessionContext.painContext set by PainButton
  // in-session flow triggers the intensityMod override below (minus on remaining
  // sets) — no workout-preview round-trip, no session reset.
  const sessionContext = useWorkoutStore((s) => s.sessionContext);

  // Phase 6 task_02 Option C: async getTodayWorkout — 3-state useState pattern
  // per DECISIONS.md §D027 (null=loading, []=empty/rest day, [...]=session).
  const [exercises, setExercises] = useState<readonly PlannedExercise[] | null>(null);
  // HIGH-CODE-05 fix: capture real workoutTitle pentru pauseSession truth.
  // Empty string default cand engine null/loading → store fallback la
  // '(sesiune nedefinita)' explicit marker NU 'Push' lie.
  const [workoutTitle, setWorkoutTitle] = useState<string>('');
  // C3 — ENGINE intensityMod baseline (deload output from the pipeline). This
  // is the adaptive signal applied to weight; the EnergyCheck self-report no
  // longer multiplies weight separately (it now feeds the engine VIA readiness,
  // C2). 'normal' default until the async plan resolves.
  const [engineIntensityMod, setEngineIntensityMod] = useState<PlannedWorkoutOutput['intensityMod']>('normal');
  // F2 #4 — Energy Adjustment direction + tier-gated magnitude (|pct| ≤ 0.15).
  // RECONCILE only: it supplies the MAGNITUDE for the existing in-session ±%
  // scale below, replacing the flat ×0.8/×1.15 constants — it does NOT add a
  // new multiplier or a new trigger. null until the async plan resolves / when
  // the engine emits no adjustment → the scale keeps its legacy constant.
  const [energyAdjustment, setEnergyAdjustment] =
    useState<PlannedWorkoutOutput['energyAdjustment']>(null);
  // WARM-UP RAMP (in-workout, gym-log arc follow-up 2026-06-12). The engine's
  // primer ladder (warmup.warmupSets, behind dp_warmup_ramp_v1) was preview-only
  // text; WarmupRampCard below walks it set-by-set with SHORT own rests. Empty
  // when the flag is off / no ramp emitted → the card never renders.
  const [warmupSets, setWarmupSets] = useState<ReadonlyArray<WarmupStep>>([]);
  useEffect(() => {
    let cancelled = false;
    getTodayWorkout().then((planned) => {
      if (!cancelled) {
        setExercises(planned?.exercises ?? []);
        setWarmupSets(planned?.warmup?.warmupSets ?? []);
        // No real engine title (sentinel) → derive the localized title from the
        // engine SESSION TYPE (PUSH/PULL/...), so a paused PULL session reads
        // "Pull" in ResumeSessionCard instead of a generic label (and never the
        // old hardcoded "Push" lie). A real engine title passes through untouched.
        const rawTitle = planned?.workoutTitle;
        setWorkoutTitle(
          rawTitle && rawTitle !== ENGINE_WORKOUT_TITLE_FALLBACK
            ? rawTitle
            : resolveSessionTitle(planned?.sessionType),
        );
        setEngineIntensityMod(planned?.intensityMod ?? 'normal');
        setEnergyAdjustment(planned?.energyAdjustment ?? null);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const hasWorkout = exercises !== null && exercises.length > 0;

  // Bound exIdx în caz session state contamination (NU index past array).
  // 3-state guard: exercises===null → loading state; [] → empty state branch;
  // [...] → session UI branch. safeExIdx + currentExercise defensive-default
  // for loading/empty states.
  const safeExIdx = hasWorkout && exercises !== null ? Math.min(exIdx, exercises.length - 1) : 0;
  const defaultExercise: PlannedExercise = { id: '', name: '', sets: 0, targetReps: 0, targetKg: 0, restSec: 0 };
  const currentExercise: PlannedExercise = (hasWorkout && exercises !== null
    ? exercises[safeExIdx]
    : undefined) ?? defaultExercise;
  // First-session baseline note: when there is NO prior history for this
  // exercise (DP.getState lastW === 0 — the exact condition under which
  // checkInSessionAdjust returns {adjust:false}), the per-set autoregulation
  // has nothing to adapt from. Surface a brief, non-technical note so the user
  // understands why the targets are not adapting yet, instead of leaving them
  // wondering. Loaded exercises only (bodyweight has its own rep-based flow).
  // Gate on the ENGINE key (engineName), not the RO display name. DP keys its
  // state on the English canonical; reading it under the display name returned a
  // cold-start (lastW===0) even for an exercise the user has logged → the
  // "first session" copy showed for returning users (Daniel P0 name-key bug,
  // 2026-06-05). Additionally suppress the copy entirely for anyone who has
  // trained before (sessionsHistory.length>0): the note literally says "First
  // session", so even a brand-new exercise must not call a returning user a
  // first-timer — derive "trained before" from durable history, NOT lastSession.
  const noExerciseHistory =
    hasWorkout &&
    sessionsHistory.length === 0 &&
    !currentExercise.isBodyweight &&
    currentExercise.name !== '' &&
    DP.getState(currentExercise.engineName ?? currentExercise.name).lastW === 0;

  // #7 metric-type of the current exercise (always stamped at the compose
  // boundary). 'time'/'distance' = an isometric hold logged in seconds, 'carry' =
  // a loaded carry (load + seconds). 'reps' (default) = the unchanged weight ×
  // reps path. Drives the SetLogInput metric rendering + the seconds capture.
  const currentMetricType = currentExercise.metricType ?? 'reps';
  const isMetricExercise = currentMetricType === 'time' || currentMetricType === 'distance' || currentMetricType === 'carry';

  // #63 coach-confidence subtle line (flag dp_coach_confidence_v1, default OFF).
  // Maps the carried per-exercise posterior sigma (F5-W0 confidence) to ONE gentle
  // qualitative tier line. Flag OFF → null → nothing renders (byte-identical). No
  // number/sigma/jargon ever leaves the helper — only an i18n key + {exercise}.
  const confidenceLine: string | null = useMemo(() => {
    if (!hasWorkout || !isEnabled('dp_coach_confidence_v1')) return null;
    const conf = currentExercise.confidence;
    if (!conf) return null;
    const tier = confidenceTier(conf.sigma, conf.n);
    return t(confidenceTierKey(tier), { exercise: currentExercise.name });
  }, [hasWorkout, currentExercise.confidence, currentExercise.name]);
  // Apply the ENGINE intensityMod baseline (deload output) to target kg. This
  // is the COARSE deload-state modifier (±%), distinct from readiness: as of
  // the wiring fix, today's readiness already shapes the per-exercise targetKg
  // UPSTREAM in the pipeline — scheduleAdapterAggregate.toPlannedExercise calls
  // DP.getSmartRecommendation(name, readinessScore, ...), which holds the weight
  // on an INCREASE day when readiness < 60. So targetKg arrives readiness-gated;
  // this block layers only the deload baseline on top (no double-count — the two
  // signals are different: per-exercise progression gate vs whole-session deload).
  // F2 #4 RECONCILE — the deload-magnitude is no longer a flat hardcoded
  // constant: when the Energy Adjustment engine emits a tier-gated asymmetric
  // magnitude (|pct| ≤ 0.15) it REPLACES the legacy ×0.8 / ×1.15 literals on the
  // SAME single scale (NOT a third multiplier, NOT a new trigger — the
  // intensityMod 3-state below still GATES whether any scale happens). DOWN
  // supplies the 'minus' factor, UP the 'plus' factor; absent / NONE → the legacy
  // constant fallback (byte-identical). Engine magnitude ≤ 15% < the old flat
  // 20% down, so the net swing is SMALLER, never additive. Round 0.5 (incremente
  // reale sala). 'normal' / no deload → target neschimbat.
  //
  // Daniel smoke 2026-05-28 #18 — mid-session pain override: when PainButton
  // posted a sessionContext with intensityMod='minus' + painContext, the
  // remaining sets must lighten without restarting. sessionContext wins over
  // the engine baseline ONLY when it carries pain (the pre-session intensityMod
  // path still uses sessionContext too, identical end-state — this is honest).
  // 'minus' wins as the conservative pick (we never STACK; max-magnitude rule).
  const intensityMod =
    sessionContext?.painContext !== null && sessionContext?.painContext !== undefined
      ? 'minus'
      : engineIntensityMod;
  // For a BODYWEIGHT exercise, targetKg is the ADDED weight (default 0). The
  // deload ±% modifier applies to EXTERNAL load — scaling a 0-added bodyweight
  // target does nothing, and we don't want to inflate/deflate a small added
  // weight by 20% (a deload on bodyweight = fewer reps, an engine concern). So
  // bodyweight exercises keep their added weight unchanged here.
  // Snap fix (Daniel 2026-06-01) — the intensityMod ±% branches do LOCAL
  // arithmetic on the engine target, which lands on 0.5 increments the machine
  // can't be set to (e.g. 22.5 * 1.15 = 25.875 → 26 kg, but the dumbbells are
  // 25 / 27.5 — never 26). Snap the locally-computed deload/overload weight to
  // the exercise's real equipment grid via roundToEquipmentWeight. The 'normal'
  // and bodyweight branches pass the engine target straight through (already
  // equipment-snapped upstream by DP.recommend / getSmartRecommendation) — left
  // untouched per the engine-owns-snapping contract.
  // F2 #4 — resolve the ±% scale FACTOR from the engine magnitude (reconcile),
  // with the legacy flat constants as the fallback when the engine emits no
  // matching direction (pure helper resolveIntensityFactors).
  const { minus: minusFactor, plus: plusFactor } = resolveIntensityFactors(energyAdjustment ?? null);
  const targetKg =
    currentExercise.isBodyweight
      ? currentExercise.targetKg
      : intensityMod === 'minus'
      ? roundToEquipmentWeight(currentExercise.targetKg * minusFactor, currentExercise.engineName ?? currentExercise.name)
      : intensityMod === 'plus'
      ? roundToEquipmentWeight(currentExercise.targetKg * plusFactor, currentExercise.engineName ?? currentExercise.name)
      : currentExercise.targetKg;
  const currentSetIdx = hasWorkout ? history[safeExIdx]?.length ?? 0 : 0;
  const isLastSetOfExercise =
    hasWorkout && currentSetIdx + 1 >= currentExercise.sets;
  // Founder UX 2026-06-06 — index of the next exercise with REAL work left: not
  // dropped, and not already completed (full set history). After restoreExercise
  // jumps the cursor BACK to an earlier slot, the slots AHEAD of it may already
  // be done — finishing the restored exercise must NOT earn a trailing rest +
  // transition to an already-completed exercise. The session is effectively over
  // once no slot after the current one still needs sets. -1 = nothing follows.
  const nextActiveIdx =
    hasWorkout && exercises !== null
      ? (() => {
          for (let i = safeExIdx + 1; i < exercises.length; i++) {
            if (droppedExercises[i]) continue;
            const ex = exercises[i];
            const done = history[i]?.length ?? 0;
            if (ex && done < ex.sets) return i;
          }
          return -1;
        })()
      : -1;
  const isLastExercise = hasWorkout && exercises !== null && nextActiveIdx === -1;

  const [kgInput, setKgInput] = useState<number>(targetKg);
  const [repsInput, setRepsInput] = useState<number>(currentExercise.targetReps);
  // Plate-math hint (2026-06-10, Daniel-approved): "70 kg" on a barbell is not
  // actionable on the gym floor — show "Bara 20 + 25 / parte". BARBELL-only by
  // design (Smith bars vary per gym; stack machines show their own pin) + EXACT
  // decompositions only (platesPerSide returns null otherwise → no hint, never a
  // wrong one). Tracks the user's CURRENT entry so editing the kg live-updates.
  const plateHint = useMemo<string | null>(() => {
    if (currentExercise.isBodyweight) return null;
    const engineName = currentExercise.engineName ?? currentExercise.name;
    if (getExerciseMetadata(engineName)?.equipment_type !== 'barbell') return null;
    const d = platesPerSide(kgInput);
    if (!d) return null;
    return d.perSide.length === 0
      ? t('workout.plateBarOnly', { bar: d.barKg })
      : t('workout.plateHint', { bar: d.barKg, plates: d.perSide.join('+') });
  }, [currentExercise.isBodyweight, currentExercise.engineName, currentExercise.name, kgInput]);
  // #7 metric-set capture — the performed DURATION in seconds for a time/carry
  // exercise (Plank/Dead Hang/Farmer's Walk). Seeded from the prescribed target
  // (currentExercise.targetSec) or a sane default; only consumed when the current
  // exercise's metricType is time/carry (reps sets ignore it). Reset per set in
  // the same effect that resets repsInput.
  const [durationInput, setDurationInput] = useState<number>(currentExercise.targetSec ?? 30);
  // Audit fix (shared current-recommended-load) — autoregulation and the
  // AaFriction over-recommendation check must read/write ONE recommended load,
  // not drift between `kgInput` (autoreg writes) and the stale per-exercise
  // `targetKg` (friction read). recKg/recReps START at the per-exercise target
  // and get bumped by in-session autoregulation; AaFriction evaluates the
  // user's entered load against THIS value (not the original target), and the
  // engine's own up-ramp computes from THIS value (no stale baseline overshoot).
  const [recKg, setRecKg] = useState<number>(targetKg);
  const [recReps, setRecReps] = useState<number>(currentExercise.targetReps);
  // Audit fix (input-guard) — true once the user manually edits the kg/reps for
  // the current set. Autoregulation pre-fills the NEXT set only when the field
  // is still at its untouched recommended default; a user-typed value is never
  // clobbered. Reset per set (effect keyed on safeExIdx + currentSetIdx).
  const [inputDirty, setInputDirty] = useState(false);
  // Perf isolation: the per-second elapsed clock no longer lives here (it drove
  // a whole-subtree re-render once a second). It now lives in the
  // <SessionElapsed> leaf inside SessionTimer, fed the raw sessionStart.
  const [restCountdown, setRestCountdown] = useState(0);
  // Bug 1 — inter-exercise rest. The LAST set of an exercise now also earns a
  // real, skip-able rest (the just-finished exercise's restSec), instead of
  // jumping straight to the transition splash. This ref marks that the rest
  // currently running is an INTER-EXERCISE rest: when it ends (countdown 0) or
  // the user skips, the screen must run the transition + advanceExercise()
  // flow rather than returning to logging on the SAME exercise. A ref (not
  // state) so the countdown effect reads the live value without re-subscribing.
  const pendingAdvanceRef = useRef(false);
  // F-pass2-restoverlay-01 — initial rest total seconds at moment rest phase
  // entered (drives SVGCountdownRing progress ratio). Reset alongside
  // setRestCountdown so ring shows full track at rest entry.
  const [restInitialSec, setRestInitialSec] = useState(0);
  const [exitSheetOpen, setExitSheetOpen] = useState(false);
  // Phase 4 task_14: LOCK 9 aaFrictionModal state — pending rating cand
  // triggered + reason pentru REASON_LABEL display în modal.
  const [aaModalOpen, setAaModalOpen] = useState(false);
  const [aaReason, setAaReason] = useState<AggressiveReason | null>(null);
  const [aaPendingRating, setAaPendingRating] = useState<SetRating | null>(null);
  // #5/A anomaly / fat-finger guard — confirm sheet state. When sanityCheckSet
  // flags an implausible entered value (×10 typo / past the physical ceiling /
  // reps>50), hold the rating + show a confirm. Quarantine, never reject.
  const [anomalyResult, setAnomalyResult] = useState<SanityResult | null>(null);
  const [anomalyPendingRating, setAnomalyPendingRating] = useState<SetRating | null>(null);
  // Carries an anomaly "Da, corect" confirmation through the (possible) AA modal
  // into performLogSet so calibration learns from a user-confirmed real outlier.
  const aaConfirmedRef = useRef(false);
  // §F-pass2-setloginput-02 — SetLogInput parent state machine wire (deferred
  // tactical sibling per e02f0b94 "Parent state machine wire tactical sibling").
  // Mockup wv2 two-step within the logging phase (andura-clasic.html#L1463-1485):
  //   pre-log `tinta` (Tinta X repetari Y kg + "Logheaza setul" CTA) →
  //   post-log readonly "Tu ai facut X repetari cu Y kg" + pencil + rating row.
  // `setLogged` flips on Logheaza (onLog); `editing` is the pencil revise escape
  // (onEdit) surfacing the editable inputs (React-port a11y editable mode kept).
  // FSM (logging/rest/transition + timers + LOCK 9 aaFriction) untouched — this
  // is purely the inner log-zone UI. Reset per new set via effect below.
  const [setLogged, setSetLogged] = useState(false);
  const [editing, setEditing] = useState(false);
  // §F-workout-05 — "why this exercise?" help-circle (mockup openWhyExercise
  // andura-clasic.html#L1449). Null = closed; string = whyEngine summary shown
  // in a bottom-sheet explainer. Built on tap so it reflects current readiness.
  const [whyText, setWhyText] = useState<string | null>(null);
  // Fix #2 — in-session RPE auto-correction notice (DP.checkInSessionAdjust).
  // Null = no adjustment surfaced; string = the engine's honest localized message
  // (e.g. "Ai dat greu - coboram la 8 reps pe setul urmator", or a weight twin in
  // STRENGTH phase). Shown in the log zone for the NEXT set; cleared on advance.
  const [adjustNotice, setAdjustNotice] = useState<string | null>(null);
  // Pulse arc 2026-05-29 (blueprint C3-c) — mid-session PR celebration. Set at
  // the EXISTING getPRDelta/markPRHit moment in performLogSet (we do NOT add a
  // second detection path); cleared on overlay dismiss. Carries the exercise +
  // positive kg delta the mockup PrFlash shows. The PostSummary PR banner stays
  // the durable record — this is the in-the-moment hit only.
  // kind 'pr' = a real record over valid history (confetti); 'calibration' (8) = a
  // first-rep / massive-manual-jump over a bad cold-start — a calm "level set" reper,
  // never a confetti record and never a PR-wall anchor.
  const [prFlash, setPrFlash] = useState<{ exercise: string; deltaKg: number; kind: 'pr' | 'calibration' } | null>(null);
  // Design ADDENDUM 1 — exercise demo accordion open/close (presentation-only).
  // The demo media is no longer a static card; it lives behind a pulse-card row
  // (play icon + eyebrow + secondary line + chevron) that slides the placeholder
  // open BENEATH it on tap. Collapsed by default so the log zone stays compact;
  // the user expands only when they want to see the movement.
  const [demoOpen, setDemoOpen] = useState(false);
  // Collapse the demo accordion when the exercise changes — otherwise it
  // persisted expanded onto the next movement (audit MED-01).
  useEffect(() => {
    setDemoOpen(false);
  }, [safeExIdx]);
  // ── Z-WAR + warm-up-gating dock state (founder live 2026-06-12) ────────────
  // The logging dock is the LOWEST chrome layer — it must NEVER cover an
  // interactive surface and must NOT render before the warm-up is resolved. Two
  // signals the dock-render gate (overlayOpen + warmupResolved) needs but which
  // live inside children:
  //   (1) headerMenuOpen — the ⋯ "Optiuni sesiune" sheet's open state is local to
  //       SessionTimer; mirrored here via onMenuOpenChange so the dock yields.
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  //   (2) warmupResolved — the WarmupRampCard owns its own done/dismiss memory
  //       (sessionStorage, keyed on sessionStart). Seed from isWarmupResolved so
  //       the dock is correctly hidden-or-shown from the FIRST render (no flash of
  //       the dock under a fresh warm-up card — founder: "daca user o vede inainte
  //       de warmup nu mai face warmup"); the card's onResolved flips it on the
  //       in-session done/skip/dismiss. Re-seeded when the session changes so a NEW
  //       session re-gates on its fresh warm-up.
  const [warmupResolved, setWarmupResolved] = useState(() => isWarmupResolved(sessionStart));
  useEffect(() => {
    setWarmupResolved(isWarmupResolved(sessionStart));
  }, [sessionStart]);
  // Init session on mount when there is NO live or paused session to continue.
  // §44-C1 originally started only on 'idle', but a returning user always has a
  // prior `lastSession`, which makes getCurrentMode report 'finished' (NOT idle)
  // → startSession never fired → sessionStart stayed null → persistSessionLogs
  // early-returned at finish → the engine `logs` key was NEVER written for ANY
  // returning user (Daniel P0 2026-06-05: "coach never adapts" — DP/recovery ran
  // permanently input-starved). A stale finished session must NOT block a new
  // one. Resume case is mode=paused/active — Antrenor calls resumeSession()
  // before navigate, so mount-time mode is active → we keep the live session.
  useEffect(() => {
    const mountMode = getCurrentMode({
      phase,
      sessionStart,
      pausedSnapshot,
      lastSession,
      exIdx,
    });
    if (mountMode.kind === 'idle' || mountMode.kind === 'finished') {
      startSession(Date.now());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Session timer — extracted to <SessionElapsed> leaf (perf isolation). The
  // 1Hz tick used to setElapsed here, re-rendering the whole active-session
  // subtree once a second; it is now confined to the leaf rendered by the
  // memoized SessionTimer.

  // Bug 1 — run the next-exercise reveal then advance. The transition splash
  // (TransitionScreen, next exercise name + coach line) is preserved; after its
  // brief delay advanceExercise() moves to the next exercise (and resets phase
  // to logging). Used by BOTH the inter-exercise rest end and the rest-skip.
  // pendingAdvanceRef cleared first so it can never double-fire advanceExercise.
  const runTransitionToNext = useCallback((): void => {
    pendingAdvanceRef.current = false;
    setPhase('transition');
    window.setTimeout(() => {
      advanceExercise();
    }, 1500);
  }, [setPhase, advanceExercise]);

  // Rest countdown — when it reaches 0, either advance to the next exercise (an
  // inter-exercise rest, pendingAdvanceRef) or return to logging on the same
  // exercise (an intermediate-set rest).
  useEffect(() => {
    if (phase !== 'rest') return;
    const interval = setInterval(() => {
      setRestCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (pendingAdvanceRef.current) {
            runTransitionToNext();
          } else {
            setPhase('logging');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, setPhase, runTransitionToNext]);

  // Wake lock acquire on mount + release on unmount (+ visibilitychange
  // re-acquire) — fail silent. Extracted to useWakeLock (behavior preserved).
  useWakeLock();

  // Reset kg/reps inputs when advancing exercise. U-03: kg target reflects
  // session intensityMod (targetKg derived above) — depend on it so an
  // adapted target rehydrates on exercise change. Fix #2: also clear the
  // in-session adjust notice — an auto-correction is scoped to the exercise it
  // fired on; carrying it onto the next exercise would mislead.
  useEffect(() => {
    setKgInput(targetKg);
    setRepsInput(currentExercise.targetReps);
    // #7 — seed the seconds entry from the prescribed duration on exercise change
    // (time/carry only; reps sets never read durationInput).
    setDurationInput(currentExercise.targetSec ?? 30);
    // Shared current-recommended-load resets to the per-exercise target on
    // exercise change — in-session autoreg bumps it from here within the set run.
    setRecKg(targetKg);
    setRecReps(currentExercise.targetReps);
    setAdjustNotice(null);
  }, [safeExIdx, targetKg, currentExercise.targetReps, currentExercise.targetSec]);

  // §F-pass2-setloginput-02 — each new set begins at pre-log `tinta`. Keyed on
  // exercise (safeExIdx) + set index (currentSetIdx bumps when a set logs into
  // history), so post-rest next-set returns to the target display + Logheaza.
  useEffect(() => {
    setSetLogged(false);
    setEditing(false);
    // New set starts at its untouched recommended default — autoreg may pre-fill
    // it; the user-touched guard clears so the next manual edit re-arms it.
    setInputDirty(false);
  }, [safeExIdx, currentSetIdx]);

  // D107 phase 1 — permanent interaction-log: record the engine recommendation
  // SHOWN for the current set (the recKg/recReps the user sees in SetLogInput).
  // Fires on exercise/set change and whenever autoreg bumps the shared rec. The
  // tap/log events later capture what the user actually did vs this rec — the
  // raw material the later self-evaluation phase mines. No-op when flag OFF;
  // never throws (debugLog fully wrapped).
  //
  // F3 (Daniel live 2026-06-10) — STALE-REC FLASH guard. recKg/recReps are state
  // that LAGS one render behind the exercise: on an exercise transition the effect
  // fires once with the PREVIOUS exercise's recKg (before the reset effect's
  // setRecKg commits), then again with the reconciled value — a visible wrong-weight
  // flash + a double-logged `rec`. On a transition the EXERCISE-SYNCED target
  // (targetKg/targetReps, recomputed from currentExercise every render) is the
  // correct shown rec (recKg is reset to it); within an exercise recKg is the truth
  // (autoreg may have bumped it). Pick the synced value on a transition, dedupe by
  // (exIdx,setIdx,kg,reps) so the post-reset re-render does not emit the same slot
  // twice → exactly one rec event per set, never stale.
  //
  // (5) 2026-06-11 — a SWAP replaces exercises[safeExIdx] IN PLACE, so the index
  // is UNCHANGED while the exercise identity (and targetKg) flips. Keying the
  // transition on safeExIdx alone made isTransition=false on a swap → the first
  // rec emitted the PREVIOUS exercise's stale recKg (Y Raise "rec 40x6" = Incline
  // DB's value), then the reset effect re-rendered with the correct value (double
  // emit, first stale). Key the transition on the exercise IDENTITY (index + engine
  // key) so a swap-in-place is a transition too → the first (and only) rec carries
  // the swapped exercise's own synced target.
  const recEmitRef = useRef<{ identity: string; sig: string }>({ identity: '', sig: '' });
  // (7) 2026-06-11 — set by performLogSet when checkInSessionAdjust returned a real
  // in-session correction; the NEXT set's rec was produced by that adjustment, so its
  // source is 'in_session_adjustment' (not 'coldstart'). Read + cleared on emit.
  const recFromInSessionRef = useRef(false);
  const currentEngineKey = currentExercise.engineName ?? currentExercise.name;
  // Dumbbell loads are per hand (engine-wide convention) — label the target so
  // "12.5 kg" on a DB lift cannot read as the two-dumbbell total (audit 2026-06-12).
  const perHandLoad = !currentExercise.isBodyweight && isPerHandLoad(currentEngineKey);
  // V2 dock height, MEASURED (Daniel live 2026-06-12: the rail's last card —
  // e.g. the disclaimer — was clipped under the dock; the 210px estimate only
  // covered the compact 'tinta' mode, the editable-steppers dock is ~330px).
  // ResizeObserver keeps the rail's bottom padding equal to the real dock at
  // every mode/viewport; jsdom (tests) has no RO → keep the 210 fallback.
  const [dockH, setDockH] = useState(210);
  const dockRO = useRef<ResizeObserver | null>(null);
  const attachDock = useCallback((el: HTMLDivElement | null) => {
    dockRO.current?.disconnect();
    dockRO.current = null;
    if (el) {
      const apply = () => {
        if (el.offsetHeight > 0) {
          setDockH(el.offsetHeight);
          // scroll-padding clearance (founder live + CI E2E 2026-06-12): native
          // scrollIntoView — and Playwright's pre-click scroll — aims the target
          // at the viewport EDGE, which the fixed dock covers, so a mid-rail tap
          // (e.g. "Aparat ocupat") landed under the dock and the dock swallowed
          // it. html + .app-scroll consume this var as scroll-padding-bottom so
          // every programmatic scroll clears the dock by its REAL height.
          document.documentElement.style.setProperty('--dock-clearance', `${el.offsetHeight + 12}px`);
        }
      };
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(apply);
        ro.observe(el);
        dockRO.current = ro;
      }
      apply();
    } else {
      document.documentElement.style.removeProperty('--dock-clearance');
    }
  }, []);
  useEffect(() => {
    if (!hasWorkout) return;
    const identity = `${safeExIdx}:${currentEngineKey}`;
    const isTransition = identity !== recEmitRef.current.identity;
    const shownKg = isTransition ? targetKg : recKg;
    const shownReps = isTransition ? currentExercise.targetReps : recReps;
    const sig = `${identity}:${currentSetIdx}:${shownKg}:${shownReps}`;
    if (sig === recEmitRef.current.sig) return; // post-reset re-render — already logged
    recEmitRef.current = { identity, sig };
    // source = whether this starting rec is a cold-start (no prior engine state
    // for this exercise → lastW===0) vs adapted from history. Cheap: DP.getState
    // on the ENGINE key is already read for noExerciseHistory above. Bodyweight
    // has no external-load state, so it reports 'history' (its rep flow adapts).
    // 'in_session_adjustment' (7) wins when the rec for this set was the engine's
    // live correction from the set just logged — the flag is consumed here so it
    // labels exactly one rec then falls back to the durable coldstart/history read.
    let source: 'coldstart' | 'history' | 'in_session_adjustment' = 'history';
    try {
      if (!currentExercise.isBodyweight && currentExercise.name !== '') {
        source =
          DP.getState(currentEngineKey).lastW === 0 ? 'coldstart' : 'history';
      }
    } catch {
      /* omit on any failure — capture must never break the screen */
    }
    // An in-session correction only labels the next set of the SAME exercise (not a
    // transition, where the flag is stale from the previous exercise).
    if (recFromInSessionRef.current && !isTransition) {
      source = 'in_session_adjustment';
    }
    recFromInSessionRef.current = false;
    debugLog.event(
      'rec',
      { exercise: currentExercise.name, setIdx: currentSetIdx + 1, recKg: shownKg, recReps: shownReps, source },
      { route: '/app/antrenor/workout', exercise: currentExercise.name, setIdx: currentSetIdx + 1, shownKg, shownReps },
      sessionStart ?? undefined,
      currentEngineKey,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeExIdx, currentEngineKey, currentSetIdx, recKg, recReps]);

  // Phase 4 task_15 §A: inactivity watch (interval 30s + > 7 min prompt) +
  // bumpActivity reset — extracted to useInactivityWatch (behavior preserved,
  // effect order #8 unchanged at this position).
  const { inactivityPromptOpen, bumpActivity } = useInactivityWatch();

  // U-04 (MED) — why-modal a11y (auto-focus + Escape + Tab-trap + restore) +
  // whyDismissRef ownership — extracted to useWhyModalA11y (behavior preserved,
  // effect order #9 unchanged at this position; effect deps stay [whyText]).
  const whyDismissRef = useWhyModalA11y(whyText, setWhyText);

  // Pulse arc 2026-05-29 (blueprint C3-g) — live session volume = Σ kg×reps
  // across every logged set so far (the mockup's count-up header stat). Derived
  // from the real `history` store slice (NOT a mocked number); recomputes each
  // time a set lands. useCountUp must run at top level (rules-of-hooks) above
  // the loading/empty early returns; history is [] pre-session so it reads 0.
  const liveVolumeKg = Object.values(history).reduce(
    (acc, sets) => acc + sets.reduce((s, set) => s + set.kg * set.reps, 0),
    0,
  );
  const liveVolumeDisplay = useCountUp(Math.round(liveVolumeKg));

  function performLogSet(rating: SetRating, userConfirmed = false): void {
    // Bodyweight model: kgInput is the ADDED weight (belt/dumbbell, default 0).
    // The TRAINING load that PR/volume/progression must use is the EFFECTIVE
    // load = bodyweight x fraction + added. We persist `kg` = effective so every
    // downstream consumer (PR engine, session volume, DP logs) is correct with
    // zero per-consumer change; `addedKg` preserves what the user entered for
    // honest display. Loaded exercises: effective == kgInput (unchanged).
    const effKg = currentExercise.isBodyweight
      ? Math.max(
          0,
          Math.round(
            ((Number(getCurrentWeightKg()) > 0
              ? Number(getCurrentWeightKg()) * (currentExercise.bwFraction ?? 0)
              : 0) +
              (Number.isFinite(kgInput) ? kgInput : 0)) * 2,
          ) / 2,
        )
      : kgInput;

    // (6) 2026-06-11 — DETERMINISTIC manual-override. `inputDirty` only means "the
    // field was touched THIS set", but the input carries the PRIOR set's value as a
    // prefill, so re-logging an untouched 24 (over a 22.5 rec) read override:false
    // even though the entry differed from the prescription. Decide at LOG TIME on
    // the actual discrepancy instead: the load is overridden when it differs from
    // the recommended load by AT LEAST HALF the equipment increment around the rec
    // (a sub-half-step rounding wobble is NOT an override), OR the reps differ from
    // the prescription. Bodyweight has no load ladder → fall back to the reps diff +
    // the touched-field signal. Used for BOTH the telemetry `wasManualOverride` and
    // the engine's in-session DOWN anchor (which still gates on below-rec itself).
    const overrideThresholdKg = (() => {
      try {
        if (currentExercise.isBodyweight || !(recKg > 0)) return Infinity;
        const ex = currentExercise.engineName ?? currentExercise.name;
        const up = getNextWeight(recKg, ex) - recKg;
        const down = recKg - getPrevWeight(recKg, ex);
        const step = Math.min(up > 0 ? up : Infinity, down > 0 ? down : Infinity);
        return Number.isFinite(step) && step > 0 ? step / 2 : Infinity;
      } catch {
        return Infinity; // never block logging on a ladder lookup failure
      }
    })();
    const kgIsOverride =
      Number.isFinite(overrideThresholdKg) && Math.abs(effKg - recKg) >= overrideThresholdKg;
    const repsIsOverride = recReps > 0 && repsInput !== recReps;
    // Bodyweight (no load ladder) keeps the touched-field signal as the load proxy.
    const wasManualOverride = currentExercise.isBodyweight
      ? inputDirty || repsIsOverride
      : kgIsOverride || repsIsOverride;

    // CALIBRATION signal, computed ONCE at log time (gym-log arc 2026-06-11):
    // a benchmark set over a cold-start rec (no durable engine state yet) or a
    // massive manual jump (>= 1.5x rec) is a LEVEL-SET, not a beaten record. The
    // flag rides the logged entry into the durable `logs` row so detectPR
    // (prEngine) excludes it from prevBest — a false anchor (Face Pull 9→27→36)
    // never becomes the record to beat. The PR-flash block below reuses this.
    let setIsCalibration = false;
    if (!currentExercise.isBodyweight) {
      try {
        const coldStartNow = DP.getState(currentExercise.engineName ?? currentExercise.name).lastW === 0;
        const massiveJump = recKg > 0 && effKg >= recKg * 1.5;
        setIsCalibration = coldStartNow || massiveJump;
      } catch {
        /* treat as not-calibration on any failure — never break logging */
      }
    }

    logSet(safeExIdx, {
      kg: effKg,
      reps: repsInput,
      rating,
      ...(setIsCalibration ? { calibration: true } : {}),
      // Capture the engine identity AT LOG TIME from the live screen (authoritative
      // here). This frees PostRpe's logs writeback from re-deriving the engine key
      // via a fresh getTodayWorkout() at finish — which drifted (midnight null
      // plan / unseen swap / reordered slots) and stranded logs under the RO
      // display name → DP cold-started forever (Daniel P0 2026-06-06).
      engineName: currentExercise.engineName ?? currentExercise.name,
      exerciseName: currentExercise.name,
      ...(currentExercise.isBodyweight ? { addedKg: kgInput } : {}),
      // #7 metric capture — persist the performed seconds for a time/carry set so
      // recovery/engine see a real performed set with the right metric. Absent on
      // reps sets (the common case) → every kg/reps consumer is unchanged.
      ...(isMetricExercise ? { durationSec: durationInput } : {}),
    });

    // D107 — permanent interaction-log: the set the user just logged paired
    // with the recommendation ACTIVE for that set + the computed discrepancy, so
    // RECOMMENDED-vs-ENTERED is visible at a glance (the fuel for calibrating the
    // engine). recKg/recReps = what Andura recommended; effKg/repsInput = what
    // the user entered; deltaKg/deltaReps = the discrepancy; wasManualOverride =
    // the user edited the prefilled target (inputDirty). No-op when the
    // `andura-debug` flag is OFF; never throws (debugLog is fully wrapped).
    debugLog.event(
      'log',
      {
        exercise: currentExercise.name,
        setIdx: currentSetIdx + 1,
        // Canonical D107 names (clearer for the future calibration engine); the
        // recKg/recReps aliases are kept so prior consumers/exports stay readable.
        prescribedKg: recKg,
        prescribedReps: recReps,
        recKg,
        recReps,
        enteredKg: effKg,
        enteredReps: repsInput,
        rating,
        deltaKg: effKg - recKg,
        deltaReps: repsInput - recReps,
        // (6) deterministic: differs from the rec by >= half the equipment step, or
        // the reps differ — not merely "the field was touched" (which a prefill
        // satisfied even when the value matched the prescription).
        wasManualOverride,
        // Pre-workout readiness bucket (energy traffic-light derived from the live
        // intensityMod) — the missing fatigue-aware context field. Raw bucket, not
        // a reverse-mapped RPE (a future engine isn't locked to today's mapping).
        readiness: energyLightForIntensityMod(engineIntensityMod),
        // Keep the phase-1 `kg`/`reps` keys so prior consumers/exports stay readable.
        kg: effKg,
        reps: repsInput,
      },
      { route: '/app/antrenor/workout', exercise: currentExercise.name, setIdx: currentSetIdx + 1, shownKg: recKg, shownReps: recReps },
      sessionStart ?? undefined,
      currentExercise.engineName ?? currentExercise.name,
    );

    // Phase 4 task_10: PR detection wire — call engineWrappers.getPRDelta
    // post logSet. Compose history for engine (per-exercise flat list cu
    // baseline + previous sets). markPRHit propagates flag + prData la
    // PostSummary F11 banner (Trophy lucide + exercise name + deltaKg).
    // PR is detected against the EFFECTIVE load (h.kg already effective), so a
    // pure-bodyweight rep PR (added 0) now fires instead of being killed by the
    // detectPR w<=0 guard.
    // exerciseName = RO DISPLAY name (shown in the PR celebration banner/flash).
    // engineKey = ENGLISH canonical the engine (DP getLogs/getState/
    // checkInSessionAdjust + PR records) keys on. Using the RO display for the
    // engine lookups stranded every PR / in-session adjustment under a name the
    // engine never reads (Daniel P0 2026-06-05) → progression never moved. Split
    // them: engine reads use engineKey, the user-facing PR copy keeps the display.
    const exerciseName = currentExercise.name;
    const engineKey = currentExercise.engineName ?? currentExercise.name;
    const exerciseHistory =
      history[safeExIdx]?.map((h) => ({
        ex: engineKey,
        w: h.kg,
        reps: h.reps,
      })) ?? [];
    const delta = getPRDelta(
      engineKey,
      { w: effKg, reps: repsInput },
      exerciseHistory
    );
    if (delta) {
      // (8) PR vs CALIBRATION — a "PR" detected when the rec had NO real history
      // (cold-start) or the user typed a huge manual jump over it is NOT a record:
      // it is the user calibrating Andura's bad seed (Face Pull 9->27->32->36 fired
      // 3 false confetti PRs because the cold-start was 3-4x too low). A cold-start
      // PR-wall anchor would also poison future progression (the fake record becomes
      // the bar to beat). So: skip the durable PR record (markPRHit) AND show a calm
      // "calibrated level" badge instead of the confetti, leaving REAL PRs (over a
      // valid history, modest deviation) fully intact.
      //   - coldStart: no durable engine state for this lift (lastW===0; written
      //     only at session finish, so it reflects PRIOR sessions, not this one).
      //   - massiveOverride: the user manually typed >= 1.5x the recommended load.
      // (8) computed ONCE above (the hoisted setIsCalibration, which also rides
      // the logged entry into the durable logs row for prEngine's prevBest
      // exclusion) — coldStart (lastW===0, written only at session finish) OR a
      // massive manual jump (>= 1.5x rec, judged by magnitude, not inputDirty).
      const isCalibration = setIsCalibration;
      if (isCalibration) {
        // Calibration reper, not a record — no PR-wall anchor, no confetti.
        if (delta.deltaKg > 0) {
          setPrFlash({ exercise: exerciseName, deltaKg: delta.deltaKg, kind: 'calibration' });
        }
      } else {
        markPRHit({
          exercise: exerciseName,
          deltaKg: delta.deltaKg,
          kg: delta.kg,
          type: delta.type,
          deltaPct: delta.deltaPct,
          oneRMEstimate: delta.oneRMEstimate,
        });
        // Pulse C3-c — fire the mid-session PR celebration at the SAME detection
        // moment (no second path). The mockup PrFlash shows a positive kg delta,
        // so we surface it for weight PRs with a real kg gain; volume/reps PRs
        // (deltaKg 0) still flow to the PostSummary banner via markPRHit above.
        if (delta.deltaKg > 0) {
          setPrFlash({ exercise: exerciseName, deltaKg: delta.deltaKg, kind: 'pr' });
        }
      }
    }

    // Fix #2 — in-session RPE auto-correction (DP.checkInSessionAdjust, was dead
    // code — never wired into the screen). Only meaningful when a NEXT set
    // follows (the engine drops/bumps the upcoming set's weight). Compose the
    // per-set rating history = prior logged sets + the just-logged one (the
    // hook `history` won't reflect this set synchronously, same pattern as the
    // getPRDelta history build above). Map coarse ratings to RPE via the
    // in-session map (greu->10 so 2x-hard fires the DOWN path). The engine reads
    // prior-session lastW from DB — when the user has no history it returns
    // {adjust:false} and we no-op (honest: nothing to recalibrate against).
    // Bodyweight: the DP in-session "drop to X kg" recalibration is about
    // EXTERNAL load — it doesn't translate to a bodyweight movement (where the
    // adjustment is fewer reps). Skip the weight pre-fill + notice for BW so we
    // never tell a user doing 0-added push-ups to "switch to 50 kg".
    if (!isLastSetOfExercise && !currentExercise.isBodyweight) {
      const ratedSets = [...(history[safeExIdx] ?? []), { kg: kgInput, reps: repsInput, rating }];
      const recentRPEs = ratedSets.map((s) => INSESSION_RATING_TO_RPE[s.rating]);
      const recentReps = ratedSets.map((s) => s.reps);
      // Pass the RECOMMENDATION for the set just logged (targetKg/targetReps) +
      // the NEXT set index so the engine can measure performance deviation and
      // apply the fatigue taper. The engine decides phase-aware whether to move
      // weight (newKg) or reps (newReps, weight held = holdKg).
      const adjust = DP.checkInSessionAdjust(engineKey, recentRPEs, recentReps, {
        // Shared current-recommended-load: feed the engine the LIVE rec (recKg/
        // recReps), not the stale per-exercise target — so a prior in-session
        // bump is the baseline for the next bump (the up-ramp never computes
        // from a stale value). recKg/recReps start at the target on exercise
        // change, so set 1 still uses the target.
        recKg,
        recReps,
        loggedKg: effKg, // the load the user ACTUALLY logged this set
        // F1 — did the user MANUALLY set a load that DIFFERS from the prescription?
        // (6) deterministic (>= half-step or reps diff), not the touched-field
        // signal — a sticky prefill that differed from the rec read as no-override
        // before, so the engine never saw the deliberate deviation. The engine's
        // DOWN anchor still gates on entered being below rec itself.
        wasManualOverride,
        setIdx: currentSetIdx + 1,
        // #5/A — when the user explicitly confirmed a flagged outlier, let the
        // engine learn from it; otherwise the engine self-skips calibration on a
        // suspect value (belt-and-suspenders to the UI confirm gate).
        userConfirmed,
      }) as {
        adjust: boolean;
        dir?: 'down' | 'up';
        newKg?: number;
        newReps?: number;
        holdKg?: number;
        msg?: string;
      };
      if (adjust.adjust) {
        // (7) a real UP/DOWN correction makes the next set's rec the engine's live
        // in-session value — flag it so the rec-emit effect labels that rec
        // `in_session_adjustment` (not the stale `coldstart`/`history` derived from
        // durable DP state, only written at session finish). Gated on dir so a
        // no-direction no-op never sets a flag that would mislabel a later set;
        // consumed + cleared on the next emit.
        if (adjust.dir === 'up' || adjust.dir === 'down') {
          recFromInSessionRef.current = true;
        }
        // Update the SHARED current-recommended-load first — this is the single
        // source of truth that the next set's AaFriction over-recommendation
        // check evaluates against (so the friction boundary moves with the
        // autoreg-raised rec, never the stale target). This always tracks the
        // engine's correction.
        if (typeof adjust.newKg === 'number') setRecKg(adjust.newKg);
        if (typeof adjust.newReps === 'number') setRecReps(adjust.newReps);
        // Pre-fill the next set's input with the engine's correction + surface
        // the honest message (NU a silent change) — but ONLY when the user has
        // not manually typed their own next-set value (inputDirty). A user edit
        // is intent; autoreg must not clobber it. Weight autoregulation moves
        // kgInput; rep autoregulation moves repsInput (and holds the weight).
        if (!inputDirty) {
          if (typeof adjust.newKg === 'number') setKgInput(adjust.newKg);
          if (typeof adjust.newReps === 'number') setRepsInput(adjust.newReps);
        }
        setAdjustNotice(adjust.msg ?? null);
      } else {
        setAdjustNotice(null);
      }

      // D107 — capture the engine's post-input RE-RECOMMENDATION for the NEXT
      // set: "after you entered X and rated Y, Andura now recommends Z" (or that
      // it held). fromRecKg/fromRecReps = the rec active for the set just logged
      // (recKg/recReps before any mutation above); toRecKg/toRecReps = the next
      // set's rec (the engine's correction, falling back to the held value).
      // dir = 'up' | 'down' | 'hold'. This makes the engine's response-to-input
      // visible step by step. No-op when flag OFF; never throws.
      debugLog.event(
        'adjust',
        {
          exercise: currentExercise.name,
          setIdx: currentSetIdx + 1,
          fromRecKg: recKg,
          fromRecReps: recReps,
          enteredKg: effKg,
          rating,
          toRecKg: adjust.adjust && typeof adjust.newKg === 'number' ? adjust.newKg : recKg,
          toRecReps: adjust.adjust && typeof adjust.newReps === 'number' ? adjust.newReps : recReps,
          dir: adjust.adjust ? (adjust.dir ?? 'up') : 'hold',
          reason: adjust.adjust ? (adjust.msg ?? null) : 'no-adjust',
        },
        { route: '/app/antrenor/workout', exercise: currentExercise.name, setIdx: currentSetIdx + 1, shownKg: recKg, shownReps: recReps },
        sessionStart ?? undefined,
        currentExercise.engineName ?? currentExercise.name,
      );
    }

    if (isLastSetOfExercise) {
      if (isLastExercise) {
        // Session done — straight to post-rpe, NO trailing rest (no-op preserved).
        navigate(gotoPath('post-rpe'));
        return;
      }
      // Bug 1 — the LAST set of a (non-final) exercise now earns a real,
      // skip-able rest first (the just-finished exercise's restSec), then the
      // transition reveal + advance. Mark pendingAdvanceRef so the rest end (or
      // rest skip) runs runTransitionToNext instead of returning to logging.
      pendingAdvanceRef.current = true;
      setRestCountdown(currentExercise.restSec);
      setRestInitialSec(currentExercise.restSec);
      setPhase('rest');
      return;
    }
    pendingAdvanceRef.current = false;
    setRestCountdown(currentExercise.restSec);
    setRestInitialSec(currentExercise.restSec);
    setPhase('rest');
  }

  function handleLogSet(rating: SetRating): void {
    bumpActivity();
    // #5/A anomaly / fat-finger guard (runs FIRST — an implausible TYPO is more
    // fundamental than an aggressive-but-real load). Bodyweight sets carry no
    // external load to bound on the weight axis (reps still checked). Reference
    // the user's prior logged load for this lift (the ×10-jump anchor) + the
    // exercise cap + bodyweight (the physical ceiling). On a flag, hold the rating
    // and ask "sigur?" — quarantine, never reject.
    // #7 — a time/carry set has no weight × reps to sanity-check (reps may be 0,
    // the load may legitimately be 0 for a bodyweight hold). Skip the fat-finger
    // guard (which bounds reps/weight) and log the performed seconds directly.
    if (isMetricExercise) {
      proceedAfterAnomaly(rating);
      return;
    }
    const engineKeyForGuard = currentExercise.engineName ?? currentExercise.name;
    const priorLogs = DP.getLogs(engineKeyForGuard, 1) as Array<{ w?: number }>;
    const sanity = sanityCheckSet({
      ex: engineKeyForGuard,
      w: currentExercise.isBodyweight ? 0 : kgInput,
      reps: repsInput,
      lastLoggedW: priorLogs[0]?.w ?? null,
      maxKg: (DP.MAX_KG as Record<string, number>)[engineKeyForGuard] ?? null,
      bwKg: Number(getCurrentWeightKg()) || null,
      sex: 'm',
    });
    if (!sanity.ok) {
      setAnomalyResult(sanity);
      setAnomalyPendingRating(rating);
      return;
    }
    proceedAfterAnomaly(rating);
  }

  // The AA-friction check + log, after the anomaly guard has cleared (or was not
  // triggered). Split out so the anomaly confirm can re-enter the same path.
  function proceedAfterAnomaly(rating: SetRating, userConfirmed = false): void {
    // Carry the anomaly-confirm decision through the AA modal (if it fires) into
    // the final performLogSet so calibration learns from a CONFIRMED outlier.
    aaConfirmedRef.current = userConfirmed;
    // #7 — the AA over-aggression friction check bounds weight × reps; a time/
    // carry set has neither, so skip it and log the seconds set directly.
    if (isMetricExercise) {
      performLogSet(rating, userConfirmed);
      return;
    }
    // Phase 4 task_14: LOCK 9 aaFrictionDetect pre-check. Compose set sample
    // history din current exercise + new set candidate. Cand trigger →
    // suspend state machine (NU logSet/rest/transition), show modal.
    //
    // Phase 6 task_07: wire engine signals → derive thresholds dynamic per
    // vitality/adherence state. Replaces implicit Phase 5 DEFAULT_THRESHOLDS
    // fallback cu engine-derived thresholds (laxer pe high signals, stricter
    // pe low signals). Per DECISIONS.md §D027 anti-recurrence: stores actual
    // slice = `streak` + `sessionsHistory` (NU streakDays/sessionsLast30Days
    // sketch v1 fabricated).
    const samples = (history[safeExIdx] ?? []).map((h) => ({
      kg: h.kg,
      reps: h.reps,
      timestamp: h.timestamp ?? 0,
    }));
    const signals = getEngineSignals();
    const thresholds = deriveThresholds({
      vitalityScore: signals.vitalityScore,
      adherenceScore: signals.adherenceScore,
    });
    // 06.AA.010 — thread the engine's adapted recommendation into the friction
    // check so an over-recommendation overshoot fires even with NO set history
    // (first set, fresh install). Was previously never passed → silent gap.
    // Audit fix (shared current-recommended-load): pass `recKg` (the SHARED rec
    // that in-session autoregulation bumps), NOT the stale per-exercise
    // `targetKg`. On set 1 recKg === targetKg, so first-set behaviour is
    // unchanged; on later sets the friction boundary tracks the autoreg-raised
    // rec instead of drifting from it.
    const check = detectAggressiveLoad(samples, {
      kg: kgInput,
      reps: repsInput,
      timestamp: Date.now(),
    }, thresholds, recKg);
    if (check.trigger && check.reason) {
      setAaReason(check.reason);
      setAaPendingRating(rating);
      setAaModalOpen(true);
      return;
    }
    performLogSet(rating, userConfirmed);
  }

  function handleAaForceContinue(): void {
    setAaModalOpen(false);
    if (aaPendingRating !== null) {
      performLogSet(aaPendingRating, aaConfirmedRef.current);
      setAaPendingRating(null);
      setAaReason(null);
    }
  }

  function handleAaAcknowledge(): void {
    setAaModalOpen(false);
    if (aaPendingRating !== null) {
      performLogSet(aaPendingRating, aaConfirmedRef.current);
      setAaPendingRating(null);
      setAaReason(null);
      // Phase 4 task_14 §C: "Pauza +30s" = ai mers mai greu decat de obicei →
      // recuperare normala A EXERCITIULUI + 30s extra (NU 30s flat care
      // inlocuieste pauza). performLogSet deja a setat phase=rest pentru
      // intermediate sets; override countdown la restSec+30 here. Last set of
      // exercise scenarios (transition / post-rpe navigate) NU touch rest — no-op.
      const extendedRest = currentExercise.restSec + 30;
      setRestCountdown(extendedRest);
      setRestInitialSec(extendedRest);
    }
  }

  // #5/A — "Da, corect": the user confirms the flagged value is real. Log as-is,
  // marking userConfirmed so calibration accepts it (anti-paternalism: never drop
  // a confirmed entry). The AA-friction check still runs after.
  function handleAnomalyConfirm(): void {
    setAnomalyResult(null);
    if (anomalyPendingRating !== null) {
      const r = anomalyPendingRating;
      setAnomalyPendingRating(null);
      proceedAfterAnomaly(r, true);
    }
  }

  // #5/A — "Am gresit → X": the user mistyped. Apply the suggested correction to
  // the editable field and DISMISS — the corrected value is now visible in the
  // input, and the user re-taps the rating to log it (avoids logging a stale
  // pre-correction value through React's async state batching). When no
  // suggestion exists, just dismiss so the user re-enters manually.
  function handleAnomalyFix(suggested: number | null): void {
    const result = anomalyResult;
    setAnomalyResult(null);
    setAnomalyPendingRating(null);
    if (suggested == null || result == null) return;
    if (result.field === 'reps') {
      setRepsInput(suggested);
    } else {
      setKgInput(suggested);
    }
    setInputDirty(true);
  }

  function handleSkipRest(): void {
    bumpActivity();
    setRestCountdown(0);
    // Bug 1 — skipping an INTER-EXERCISE rest must still reveal + advance to the
    // next exercise (not return to logging on the finished one). Intermediate-set
    // skip behaves as before (back to logging).
    if (pendingAdvanceRef.current) {
      runTransitionToNext();
      return;
    }
    setPhase('logging');
  }

  // Shared finish-the-current-exercise mover. Last exercise → post-rpe (the
  // session is done); otherwise advanceExercise() moves to the next exercise.
  // advanceExercise only bumps exIdx — it never touches history[*], so the real
  // logged sets of THIS exercise (and every earlier one) stay intact and NO
  // empty/duplicate entry is created. Used by the ⋯ "Sari exercitiul" menu and
  // by the early-finish path below.
  const advanceOrFinish = useCallback((): void => {
    if (isLastExercise) {
      navigate(gotoPath('post-rpe'));
      return;
    }
    advanceExercise();
  }, [isLastExercise, navigate, advanceExercise]);

  // P-05 (MED) — ⋯ menu "Sari exercitiul curent". Daca e ultimul exercitiu →
  // post-rpe (finish, ca last set); altfel advanceExercise (next, fara
  // penalizare per copy mockup). bumpActivity reseteaza inactivity watch.
  // useCallback: passed to memoized SessionTimer — stable ref keeps memo intact.
  const handleSkipExercise = useCallback((): void => {
    bumpActivity();
    // D107 — record the skip (no-op when collect gate OFF; never throws).
    debugLog.event(
      'skip',
      { from: currentExercise.name },
      undefined,
      sessionStart ?? undefined,
      currentExercise.engineName ?? currentExercise.name,
    );
    // #8/D — durable, SYNCED per-exercise skip counter (dp-exercise-pain). Additive
    // state (always written, like dp-cal-factors); only the READ in poolForGroup is
    // flag-gated (dp_pain_deprioritize_v1). Quota-guarded, never throws.
    recordExerciseSkip(currentExercise.engineName ?? currentExercise.name);
    advanceOrFinish();
  }, [bumpActivity, advanceOrFinish, currentExercise.name, currentExercise.engineName, sessionStart]);

  // Founder swap redesign 2026-06-05 — in-session substitution for the CURRENT
  // exercise. "Aparat ocupat" + "Nu vreau" open a SHORT manual pick-list sheet
  // (handleOcupat/handleNuVreau → pickSheet); the user picks a row (handlePickRow)
  // or drops the exercise (handleDropExercise). Aparat lipsa stays a direct
  // equipment swap. All useCallback/useState (no effects) so effect order holds.
  const {
    aparatLipsaSheetOpen,
    pickSheet,
    handleOcupat,
    handleNuVreau: handleRefusalSwap,
    handlePickRow,
    handleDropExercise,
    handleClosePick,
    handleOpenAparatLipsa,
    handleCloseAparatLipsa,
    handleAparatLipsaConfirm,
  } = useWorkoutSwap({
    exercises,
    safeExIdx,
    currentExercise,
    refusalTriedByEx,
    markRefusalTried,
    swapExercise,
    dropExercise,
    setExercises,
    bumpActivity,
    advanceOrFinish,
    navigate,
  });

  // P0 (Daniel 2026-06-04) — "Nu vreau" decision split. The refusal SWAP (a
  // fresh same-muscle alternative restarted at set 1) is only honest when the
  // user has NOT started this exercise: it means "I don't want to DO this
  // movement, give me a substitute". Once at least one set is already logged for
  // the current slot, "Nu vreau" means "I'm done with this one, skip the
  // remaining set(s)" — finishing the exercise WITH its real logged sets, not
  // refusing it. Offering a brand-new alternative there made the coach feel dumb
  // and polluted history with a restarted, never-performed exercise.
  //
  // "Already started" = >=1 set logged for the current exercise this session
  // (currentSetIdx === history[safeExIdx].length). Started → finish now (keep
  // the logged sets, advanceOrFinish to next / post-rpe) with a calm supportive
  // toast, NO swap call, NO injected alternative. Not started → the legitimate
  // refusal swap is unchanged. Equipment-busy ("Aparat ocupat") + Aparat lipsa
  // paths are untouched — those are real mid-set machine substitutions.
  const handleNuVreau = useCallback((): void => {
    bumpActivity();
    // Daniel 2026-06-04 refinement: finishing early is right only when you've done
    // a MEANINGFUL chunk (3/4 → done). But skipping after just 1/5 and abandoning
    // the exercise leaves you undertrained — so a LOW-completion skip falls to the
    // legitimate same-muscle swap (you still get the volume). Threshold: mostly
    // done = at least half the prescribed sets, OR already on the last set.
    const prescribed = hasWorkout ? currentExercise.sets : 0;
    const mostlyDone =
      currentSetIdx >= Math.ceil(prescribed / 2) || currentSetIdx + 1 >= prescribed;
    if (currentSetIdx >= 1 && mostlyDone) {
      advanceOrFinish();
      toast.show({
        message: t('workout.swap.finishedEarly'),
        variant: 'success',
      });
      return;
    }
    handleRefusalSwap();
  }, [bumpActivity, currentSetIdx, hasWorkout, currentExercise, advanceOrFinish, handleRefusalSwap]);

  // Founder swap redesign 2026-06-05 — bring a dropped exercise back (its machine
  // freed up). restoreExercise clears the drop marker + jumps the session to that
  // slot fresh. The dropped exercise's identity is shown in the skipped strip.
  const handleRestoreExercise = useCallback(
    (slotIdx: number, name: string): void => {
      bumpActivity();
      restoreExercise(slotIdx);
      toast.show({ message: t('workout.swap.restored', { name }), variant: 'success' });
    },
    [bumpActivity, restoreExercise],
  );
  // Stable, render-ordered list of dropped slots for the skipped strip.
  const droppedSlots = useMemo(
    () =>
      Object.entries(droppedExercises)
        .map(([k, v]) => ({ slotIdx: Number(k), ...v }))
        .sort((a, b) => a.slotIdx - b.slotIdx),
    [droppedExercises],
  );

  // §F-workout-05 — open the why-exercise explainer. Builds engine context on
  // tap (current readiness + recommendation kg vs last logged kg) so the verdict
  // reflects live state. Engine null → why.unavailable fallback copy.
  // RE-U-03 — paseaza targetKg ADAPTAT (U-03 intensityMod -20%/+15%), NU
  // baseline-ul currentExercise.targetKg, ca explainerul sa fie consistent cu
  // tinta afisata in SetLogInput (kgInput) pe sesiuni adaptate.
  function handleOpenWhy(): void {
    bumpActivity();
    // #56 moat "why?" (flag dp_moat_why_v1, default OFF) — when ON, prefer the
    // engine's REAL decision reason (recReason.status carried via F5-W0) over the
    // coarse kg-vs-last re-guess. One plain sentence, on tap, never invented:
    // an unmapped/absent status falls through to the existing categorical summary.
    if (isEnabled('dp_moat_why_v1')) {
      const reasonKey = whyForStatus(currentExercise.recReason?.status);
      if (reasonKey !== null) {
        setWhyText(t(reasonKey, { exercise: currentExercise.name }));
        return;
      }
    }
    const sets = history[safeExIdx] ?? [];
    const lastWeightKg = sets.length > 0 ? sets[sets.length - 1]!.kg : null;
    const summary = getWhyExerciseSummary({
      name: currentExercise.name,
      recommendationKg: targetKg,
      lastWeightKg,
    });
    setWhyText(summary ?? t('why.unavailable'));
  }

  // useCallback: passed to memoized SessionTimer (onCancelSession) + ExitConfirmSheet
  // + InactivityPrompt — stable ref keeps the memoized header intact.
  const handleExit = useCallback((action: 'continue' | 'pause' | 'discard' | 'finish-early'): void => {
    if (action === 'continue') {
      setExitSheetOpen(false);
      return;
    }
    if (action === 'pause') {
      // HIGH-CODE-05 fix: pass real workoutTitle NU hardcoded 'Push' lie.
      pauseSession(workoutTitle);
      navigate(gotoPath('antrenor'));
      return;
    }
    if (action === 'finish-early') {
      // §B004 D047 Stage 3 — drill-down friction layer before partial-finish.
      // FinishEarlyConfirm → navigate post-rpe → PostRpe submit builds summary
      // din byDay logat pana acum (NU pierzi progresul).
      setExitSheetOpen(false);
      navigate(gotoPath('finish-early-confirm'));
      return;
    }
    // READINESS SURVIVES CANCEL (founder live 2026-06-12) — the CONFIRMED
    // energy-check is a DAY-keyed fact (readiness.js keys by tod()), independent
    // of the session lifecycle: the user genuinely reported their energy today, so
    // cancelling a started workout must NOT re-prompt them the same day. We
    // therefore DO NOT clear today's readiness on discard (the prior
    // clearTodayReadiness() here was the re-prompt bug — Antrenor's energyCheckDone
    // gate reads getTodayReadiness(), so wiping it forced a second prompt). The
    // value persists for the calendar day; a NEW day re-prompts; recovery /
    // recommendation shaping read the persisted score. discardSession() still
    // clears the transient session/sessionEnergy slice.
    discardSession();
    navigate(gotoPath('antrenor'));
  }, [pauseSession, workoutTitle, navigate, discardSession]);

  // Stable callbacks for the memoized SessionTimer header (perf isolation).
  // Hooks declared above the loading/empty early returns so order is stable.
  const handleOpenExitSheet = useCallback((): void => setExitSheetOpen(true), []);
  // Daniel smoke 2026-05-28 #18 — tag origin so PainButton flows back to the
  // active Workout (no workout-preview re-confirmation friction). Defensive
  // signal — sessionStart!=null already gates PainButton.inSession but the tag
  // covers edge cases (paused / freshly-resumed sessions etc.).
  const handleGoPain = useCallback(
    // #64 carry the ACTIVE exercise's ENGINE key (EN canonical) so PainButton can
    // pin a durable pain memory keyed by the exercise the ⋯ pain action opened from
    // (the pin store is engine-name-keyed, #41). Reuses the existing location.state
    // channel (no new store thread).
    (): void => navigate(gotoPath('pain-button'), {
      state: {
        from: 'workout',
        activeExercise: currentExercise.engineName ?? currentExercise.name,
      },
    }),
    [navigate, currentExercise.engineName, currentExercise.name],
  );
  const handleGoFinishEarly = useCallback(
    (): void => navigate(gotoPath('finish-early-confirm')),
    [navigate]
  );
  const handleCancelSession = useCallback((): void => handleExit('discard'), [handleExit]);

  // Phase 6 task_02 Option C: loading state pe async pipeline resolve
  // (exercises===null → 8-adapter chain pending). Per DECISIONS.md §D027.
  // Early return must precede exercises[index] access — TS strict guard.
  if (exercises === null) {
    return (
      <section
        className="min-h-screen p-6 flex flex-col items-center justify-center text-center"
        data-testid="workout"
        data-phase="loading"
      >
        <p className="text-sm text-ink2" data-testid="workout-loading">
          {t('workout.loading')}
        </p>
      </section>
    );
  }

  // Phase 4 task_17: empty state cand getTodayWorkout returns null (engine
  // throw / DB unavailable / no planned workout today). Render simple
  // anchor + back-to-antrenor CTA — Phase 5+ wire la calendar override la
  // pick alt workout sau showInactivityPrompt-style soft re-engage.
  if (!hasWorkout) {
    return (
      <section
        className="min-h-screen p-6 flex flex-col items-center justify-center text-center"
        data-testid="workout"
        data-phase="empty"
      >
        <h1 className="text-2xl font-bold text-ink mb-2">
          {t('workout.empty.title')}
        </h1>
        <p className="text-sm text-ink2 mb-6" data-testid="workout-empty-body">
          {t('workout.empty.body')}
        </p>
        <button
          type="button"
          onClick={() => navigate(gotoPath('antrenor'))}
          data-testid="workout-empty-back"
          className="px-6 py-3 pulse-grad-bg pulse-shine text-paper rounded-[14px] text-base font-semibold"
        >
          {t('workout.empty.backCta')}
        </button>
      </section>
    );
  }

  // Past empty/loading guard — exercises is non-null array. Use nextActiveIdx so
  // the up-next preview + transition reveal name the next NON-dropped exercise
  // (a dropped trailing slot is skipped, never previewed).
  const nextExercise = nextActiveIdx >= 0 ? exercises[nextActiveIdx] : undefined;

  // P-11 (LOW) — global progress (SessionTimer wv2-progress block). setsTotal =
  // sum planned sets; setsDone = current ordinal advancing through the session.
  //
  // Daniel smoke 2026-05-28 verbatim "logheaza setul + sar pauza, counter sta
  // la 1/17 in loc sa avanseze". The prior formula counted only LOGGED entries
  // (Σ history[*].length) — that bumps on rating, then freezes through rest +
  // skip-pause + the first half of the next set, advancing again only on the
  // NEXT rating. Visually the counter feels stuck between rate → skip-pause
  // even though you've clearly moved to the next set.
  //
  // Fix: align to the mockup `setIdx-1` flow that ALSO bumps when you start the
  // next set. We add 1 to the logged count while the user is on a not-yet-rated
  // set (phase=logging|idle|rating) and keep just the logged count during rest/
  // transition (one set finished, waiting for the timer or the swap delay).
  // Net effect through one set:
  //   logging set 1 (history=0) -> ordinal 1   (you're on set 1)
  //   rate set 1   (history=1, phase=rest)   -> ordinal 1 (set 1 done)
  //   skip pause   (history=1, phase=logging) -> ordinal 2 (now on set 2)
  //   rate set 2   (history=2, phase=rest)   -> ordinal 2 (set 2 done)
  // The bar fills smoothly each transition (rating OR skip-pause), matching
  // Daniel's intuition + mockup wv2 setIdx semantic.
  const setsTotal = exercises.reduce((acc, ex) => acc + ex.sets, 0);
  const loggedSoFar = Object.values(history).reduce((acc, sets) => acc + sets.length, 0);
  const isMidSet = phase === 'logging' || phase === 'idle' || phase === 'rating';
  // Clamp to setsTotal so the +1 doesn't overshoot on the very last set the
  // moment phase is still 'logging' but loggedSoFar already equals setsTotal-1
  // (the +1 is the in-progress set itself — fine; the clamp guards rare double-
  // count edges like a re-render race after the final navigate).
  const setsDone = Math.min(setsTotal, loggedSoFar + (isMidSet ? 1 : 0));

  // ── DOCK YIELDS TO EVERYTHING (Z-WAR fix, founder live 2026-06-12) ──────────
  // The fixed logging dock is the LOWEST chrome layer: it must NEVER cover an
  // interactive surface. Belt #1 is THIS auto-hide predicate — while ANY blocking
  // surface is open, the dock unmounts entirely (belt #2 is the z-index floor:
  // dock z-10, every overlay z-40..60 — see the dock + RestOverlay/sheets). The
  // founder evidence (dock covering the exit menu, the "Nu vreau" alternatives
  // list, and the extended-rest button) all trace to the dock outliving these.
  //
  // overlayOpen = the EXHAUSTIVE list of in-session blocking surfaces. NEXT
  // OVERLAY AUTHOR: when you add a sheet/menu/dialog that should sit ABOVE the
  // dock, add its open-state flag HERE (and give it z-40+). The surfaces today:
  //   - headerMenuOpen   ⋯ "Optiuni sesiune" sheet            (SessionTimer, z-50)
  //   - exitSheetOpen    exit / pause / discard / finish sheet (ExitConfirmSheet, z-50)
  //   - aaModalOpen      aggressive-load friction modal        (AaFrictionModal)
  //   - anomalyResult    fat-finger / outlier confirm          (AnomalyConfirmModal, z-60)
  //   - aparatLipsaSheetOpen  in-session "aparat lipsa" picker (AparatLipsaSheet, z-50)
  //   - pickSheet.open   swap / "Nu vreau" alternatives picker (SwapPickSheet, z-50)
  //   - whyText !== null "why this exercise?" explainer sheet  (WhyExerciseModal, z-50)
  //   - prFlash          mid-session PR celebration burst       (PrFlash, z-48)
  // NOT in this list (deliberate):
  //   - RestOverlay — the REST PHASE itself hides the dock (the dock only renders
  //     in logging/idle/rating, never phase==='rest'), so the dock is already gone.
  //   - InactivityPrompt — a small NON-blocking floating nudge (z-50, above the
  //     dock via the z-floor); the user is MEANT to keep logging to dismiss it
  //     (tapping the dock's Confirm bumps activity → prompt closes), so hiding the
  //     dock would remove that affordance. The z-floor keeps it from being covered.
  //   - demo accordion (demoOpen) — INLINE in the scroll rail, not an overlay.
  const overlayOpen =
    headerMenuOpen ||
    exitSheetOpen ||
    aaModalOpen ||
    anomalyResult !== null ||
    aparatLipsaSheetOpen ||
    pickSheet.open ||
    whyText !== null ||
    prFlash !== null;

  // ── WARM-UP GATING (founder: "daca user o vede inainte de warmup nu mai face
  // warmup") ─────────────────────────────────────────────────────────────────
  // While the WarmupRampCard is ACTIVELY rendered (the SAME condition as its
  // render below) and NOT yet resolved, the dock does not render at all. On
  // done OR skip OR dismiss the card unmounts and warmupResolved flips → the dock
  // appears. The card-render condition is hoisted here (single source) so the
  // gate and the card can never disagree.
  const warmupCardShown =
    phase === 'logging' &&
    safeExIdx === 0 &&
    (history[safeExIdx]?.length ?? 0) === 0 &&
    warmupSets.length > 0 &&
    sessionStart !== null;
  const warmupActive = warmupCardShown && !warmupResolved;

  // The dock renders only when NOTHING is blocking it (no overlay up, warm-up
  // resolved/absent). Belt-and-suspenders with the z-floor below.
  const dockVisible = !overlayOpen && !warmupActive;

  // DESKTOP MONSTER fix (founder live 2026-06-12, his irony: "pe desktop fa-o sa-mi
  // acopere toate 3 monitoarele") — portal the dock into #root, NOT document.body.
  // #root is the device-screen element (transform-free; position:relative on
  // desktop ≥768px). Mobile: #root has no transform → position:fixed still pins to
  // the viewport (byte-identical phone). Desktop: .app-fixed-column flips fixed→
  // absolute and now anchors to #root (the 402px bezel frame) instead of the whole
  // browser window — so the dock sits INSIDE the phone, not spanning the monitor.
  // #root is also ABOVE Layout's .animate-page-enter wrapper, so the dock STILL
  // escapes that wrapper's transform (the original reason it was portaled out of
  // the route). Fallback to document.body for jsdom (no #root) so RTL `screen`
  // queries still reach the dock. The body branch only runs in tests.
  const dockPortalTarget =
    (typeof document !== 'undefined' && document.getElementById('root')) || document.body;

  return (
    <section
      className="min-h-screen relative"
      data-testid="workout"
      data-phase={phase}
    >
      <SessionTimer
        exerciseName={currentExercise.name}
        exIdx={safeExIdx}
        totalExercises={exercises.length}
        sessionStart={sessionStart}
        onExit={handleOpenExitSheet}
        // P-05 (MED) — wire ⋯ menu actions (SessionTimer construit dar necablat):
        // pain → pain-button, skip → advance/finish, finish-early → drill-down,
        // cancel → discard + Antrenor. onToggleSound nelegat intentionat (NU
        // exista subsistem sunet/vibratie de comutat — ar fi buton fals).
        onPain={handleGoPain}
        onSkipExercise={handleSkipExercise}
        onFinishEarly={handleGoFinishEarly}
        onCancelSession={handleCancelSession}
        // Z-WAR (2026-06-12) — mirror the ⋯ menu open/close so the logging dock
        // yields (overlayOpen predicate) while the "Optiuni sesiune" sheet is up.
        onMenuOpenChange={setHeaderMenuOpen}
        // P-11 (LOW) — global progress bar (seturi cumulate + exercitiu curent).
        setsDone={setsDone}
        setsTotal={setsTotal}
        exerciseCount={safeExIdx + 1}
        exerciseTotal={exercises.length}
      />

      {/* Log zone — V2 COACH RAIL (design-pass 2026-06-12, mockup
          02-coach-insession.html Variant 2 "Coach Rail"). Founder verbatim
          "Varianta 2 imi place mai mult". Presentation-only restructure of the
          SAME logging FSM: a SCROLLING context rail (warm-up first, then the
          exercise hero, set history, demo, swap) flows under a FIXED bottom
          LOGGING DOCK that keeps "target + steppers + Confirm" always thumb-
          reachable. The dock + scroll rail are both children of #log-zone so
          every existing testid + the canonical "Set X/Y" text stay under it
          (Workout.test contract); the dock is position:fixed so it visually
          lifts to the bottom thumb zone. BottomNav is HIDDEN on this route
          (Layout `!inSession && <BottomNav/>`), so the dock owns the bottom edge
          (+ safe-area) with no collision.
          The viewport-ancestor transform/filter/contain lesson (bezel) is kept:
          the dock uses plain `fixed` + the existing `.app-fixed-column` centering
          (no new transform on an ancestor). */}
      {(phase === 'logging' || phase === 'idle' || phase === 'rating') && (
        <div className="relative" data-testid="log-zone">
        {/* ── SCROLLING CONTEXT RAIL ─────────────────────────────────────────
            Padded bottom by the MEASURED dock height (+ breathing room +
            safe-area) so the last context card always clears the fixed dock —
            the dock grows to ~330px in editable-steppers mode, so a hardcoded
            estimate clipped the rail's last card (Daniel live 2026-06-12). */}
        <div
          className="px-6 pt-6"
          style={{ paddingBottom: `calc(${dockH + 24}px + env(safe-area-inset-bottom, 0px))` }}
        >
          {/* WARM-UP RAMP card SURFACES FIRST (mockup Variant 2 idea (b): the
              warm-up is the first card in the flow, before the working sets —
              "exact unde o cauti"). Self-contained (own stepper+countdown, zero
              FSM/logSet/DP touch). Shown only on the FIRST exercise before any
              working set is logged; done/dismiss is per-session (sessionStorage
              keyed on sessionStart). Was previously mid-rail; moved to the top
              of the context rail per the Coach Rail hierarchy. */}
          {warmupCardShown && sessionStart !== null && (
            <WarmupRampCard
              steps={warmupSets}
              sessionKey={sessionStart}
              // Warm-up-gating (2026-06-12): the card owns its done/skip/dismiss
              // memory; this flips the parent's warmupResolved so the LOGGING DOCK
              // (hidden while warm-up is active) appears the instant warm-up ends.
              onResolved={() => setWarmupResolved(true)}
            />
          )}

          {/* Pulse arc 2026-05-29 (blueprint C3-g) — live volume count-up chip.
              Σ kg×reps so far, mono-styled like the mockup header stat. Lives in
              the log-zone (re-renders per set) so SessionTimer's React.memo +
              perf isolation stay intact. aria-hidden: the number is ambient
              motivation, not a screen-reader announcement (sets/reps already
              read). */}
          <div className="flex items-center justify-between mb-2.5" aria-hidden="true">
            <Kicker color="var(--aqua)">
              {t('workout.progress.exercisesLabel_other', {
                done: safeExIdx + 1,
                total: exercises.length,
              })}
            </Kicker>
            <span className="font-mono text-[11px] text-ink3" data-testid="workout-live-volume">
              <span className="font-semibold" style={{ color: 'var(--aqua)' }}>
                {liveVolumeDisplay.toLocaleString('en-US')}
              </span>{' '}
              {t('workout.liveVolumeLabel')}
            </span>
          </div>

          {/* §F-workout-05 — current exercise name + "why this exercise?"
              help-circle (mockup andura-clasic.html#L1447-1451 wv2-exname →
              openWhyExercise). Surfaces whyEngine categorical explainer.

              Design pass 2026-06-11 (Daniel CEO "ecranul sa respire") — the
              current exercise is now the unmistakable HERO of the screen: a
              larger display name + the "Set X/Y" progress moved UP beside it as
              a clear pill, so "what am I doing + which set" read together at a
              glance on the gym floor. The why-trigger keeps its 44px touch
              target. Secondary chrome (demo / swap / volume) sits quieter below.
              testids + the canonical setLabel text are preserved. */}
          <div className="mb-5" data-testid="wv2-exname">
            <Kicker color="var(--aqua)">{t('workout.currentExercise')}</Kicker>
            <div className="flex items-start gap-2 mt-1.5">
              <h2 className="flex-1 min-w-0 font-display text-[1.75rem] leading-[1.12] font-bold text-ink">
                {currentExercise.name}
              </h2>
              <button
                type="button"
                onClick={handleOpenWhy}
                aria-label={t('workout.whyAriaLabel')}
                data-testid="wv2-why-trigger"
                className="mt-0.5 w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full transition-transform active:scale-90"
                style={{
                  color: 'var(--aqua)',
                  background: 'color-mix(in oklab, var(--aqua) 16%, transparent)',
                  border: '1px solid color-mix(in oklab, var(--aqua) 40%, transparent)',
                }}
              >
                <HelpCircle className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            {/* Subtitle (equipment/setup) under the exercise name per mockup
                andura-clasic.html#L1450 wv2-ex-sub. Rendered only cand the
                planned exercise carries a display sub (RO display map). */}
            {currentExercise.sub && (
              <p className="text-sm text-ink2 mt-1" data-testid="wv2-ex-sub">
                {currentExercise.sub}
              </p>
            )}
            {/* Set progress, elevated into the hero (was a faint line above the
                log card). A small volt-tinted pill so "Set X/Y" is perceptible
                at arm's length. Canonical setLabel text preserved for the RTL
                contract (log-zone contains "Set 1/4"). */}
            <p
              className="inline-flex items-center mt-3 px-3 py-1 rounded-full font-mono text-[11px] tracking-[0.08em] uppercase"
              style={{
                color: 'var(--brick)',
                background: 'color-mix(in oklab, var(--brick) 12%, transparent)',
                border: '1px solid color-mix(in oklab, var(--brick) 28%, transparent)',
              }}
            >
              {t('workout.setLabel', { current: currentSetIdx + 1, total: currentExercise.sets })}
            </p>
          </div>

          {/* Design ADDENDUM 1 — exercise demo accordion. Collapsed = a pulse-card
              ROW (play icon + "EXERCISE DEMO" mono eyebrow + "Tap to watch the
              form" secondary line + a chevron that rotates 180deg on open).
              Expanded = the ExerciseMedia 'card' placeholder slides open BENEATH
              the row. Gigel mid-set sees the movement only when he wants it; the
              log zone stays compact otherwise.

              Wave A4 (Daniel 2026-05-28 #11) — ExerciseMedia is unchanged: the
              'card' variant is full-width 16:9 and today renders the muscle-
              group placeholder + "Imagine in curand" honest copy. Once URLs land
              in exerciseMedia.ts, the live image/gif swaps in without churn. */}
          <div className="mb-4 pulse-card overflow-hidden animate-fade-in-up">
            <button
              type="button"
              onClick={() => setDemoOpen((v) => !v)}
              aria-expanded={demoOpen}
              data-testid="workout-demo-toggle"
              className="w-full flex items-center gap-3 p-3 text-left transition-transform active:scale-[.99]"
            >
              <span
                aria-hidden="true"
                className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full"
                style={{
                  color: 'var(--volt)',
                  background: 'color-mix(in oklab, var(--volt) 14%, transparent)',
                  border: '1px solid color-mix(in oklab, var(--volt) 36%, transparent)',
                }}
              >
                <Images className="w-4 h-4" strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span className="flex-1 min-w-0">
                <Kicker color="var(--volt)">{t('workout.demo.eyebrow')}</Kicker>
                <span className="block text-sm text-ink2 mt-0.5">{t('workout.demo.tapToWatch')}</span>
              </span>
              <ChevronDown
                aria-hidden="true"
                strokeWidth={1.8}
                className={`w-5 h-5 flex-shrink-0 text-ink2 transition-transform duration-300 ${demoOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {demoOpen && (
              <div className="px-3 pb-3 animate-fade-in-up" data-testid="workout-demo-panel">
                <ExerciseMedia
                  engineName={currentExercise.engineName ?? currentExercise.name}
                  variant="card"
                  testId="workout-exercise-media"
                />
                {/* Form cue (Daniel 2026-06-02) — short canonical technique
                    line UNDER the demo image, for the curated compound set
                    (src/react/lib/exerciseCues.ts). Graceful: no cue for this
                    exercise → render nothing (no empty box). */}
                {(() => {
                  const cueKey = getExerciseCueKey(currentExercise.engineName ?? currentExercise.name);
                  return cueKey ? (
                    <p
                      className="mt-3 text-xs leading-snug text-ink3"
                      data-testid="exercise-form-cue"
                    >
                      {t(cueKey)}
                    </p>
                  ) : null;
                })()}
              </div>
            )}
          </div>

          {/* §F-workout-03 — in-workout substitution row (Daniel 2026-05-12
              Slice 1.7, mockup andura-clasic.html#L1457-1460 wv2-ex-actions).
              WP-5 moat: all three buttons produce an IN-PLACE named swap (toast
              with the alternative's name) instead of navigating away. "Aparat
              ocupat" → cascade excluding the busy machine; "Nu vreau" → ranked
              preference alternative + refusal counter; "Aparat lipsa" (Daniel
              smoke 2026-05-28 #17) → opens the 10-item picker sheet, persists
              wv2-missing-equipment (visible in Cont → AparateLipsa next mount),
              and recomposes the current exercise via resolveMissingSwap when
              the new list blocks its equipment. Three-column layout — labels
              kept short ("Lipsa") so the row stays single-line on Gigel's phone. */}
          <ExerciseActionsRow
            onOcupat={handleOcupat}
            onLipsa={handleOpenAparatLipsa}
            onNuVreau={handleNuVreau}
          />

          {/* Founder swap redesign 2026-06-05 — skipped-exercises strip. An
              exercise dropped via the pick-list "I don't want to do this" row
              stays RETRIEVABLE: when the machine frees up the user taps "Adauga
              la loc" to bring it back (restoreExercise jumps the session to it
              fresh). Least-intrusive: a compact chip row, shown only when there
              is something to restore. */}
          {droppedSlots.length > 0 && (
            <div className="mb-4" data-testid="skipped-strip">
              <p className="text-xs font-medium text-ink3 mb-1.5">
                {t('workout.swap.skippedTitle')}
              </p>
              <div className="flex flex-wrap gap-2">
                {droppedSlots.map((slot) => (
                  <button
                    key={slot.slotIdx}
                    type="button"
                    onClick={() => handleRestoreExercise(slot.slotIdx, slot.name)}
                    data-testid={`skipped-restore-${slot.slotIdx}`}
                    className="pulse-card pulse-card-tight flex items-center gap-1.5 px-3 py-1.5 text-xs text-ink2"
                  >
                    <span className="font-medium text-ink truncate max-w-[10rem]">{slot.name}</span>
                    <span className="text-brick">{t('workout.swap.skippedRestore')}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bug 2 — "Up next" hint on the LAST set of the current exercise (and
              not the final exercise of the session). Lets the user walk to the
              next machine before finishing this set. Gated so it shows only when
              there is a real next exercise to name. */}
          {isLastSetOfExercise && !isLastExercise && nextExercise && (
            <p
              className="text-xs font-medium mb-2"
              style={{ color: 'var(--aqua-ink)' }}
              data-testid="workout-up-next"
            >
              {t('workout.upNext', { name: nextExercise.name })}
            </p>
          )}

          {/* In-session responsive autoregulation notice. DP.checkInSessionAdjust
              eased/raised the NEXT set's target (reps in masa, weight in STRENGTH)
              from THIS set's rating + performance vs target; surfaced honestly so the
              change is never silent. role="status" announces the recalibration. */}
          {adjustNotice !== null && (
            <CoachNote testId="insession-adjust-notice" message={adjustNotice} />
          )}

          {/* First-session baseline note. No prior history for this exercise →
              per-set autoregulation has nothing to adapt from (checkInSessionAdjust
              returns {adjust:false}), so we explain WHY the targets are not adapting
              yet instead of leaving the user wondering. Shown only in the no-history
              case (NOT every set forever); hidden once an adjust notice surfaces. */}
          {noExerciseHistory && adjustNotice === null && (
            <CoachNote testId="baseline-note" message={t('workout.adjust.baselineNote')} />
          )}

          {/* #63 coach-confidence subtle line (flag dp_coach_confidence_v1, default
              OFF). One quiet qualitative readout of how well Andura "knows" this
              lift ("inca te invat" → "te-am prins"), reusing the CoachNote shell
              (role="status"). Parent-gated: confidenceLine is null when the flag is
              OFF or no posterior is carried → byte-identical. ZERO number/jargon. */}
          {confidenceLine !== null && (
            <CoachNote testId="coach-confidence-note" message={confidenceLine} />
          )}

          {/* Set history previous — re-skinned to the mockup .set-chip glowing
              done/active/pending progress row (interfata-noua/screens-workout.jsx
              L254-260). One chip per planned set: logged sets = filled volt +
              check (kg x reps x rating preserved as title/aria-label so the data
              is not lost), the current set glows (active), the rest are muted
              pending numbers. Logic + per-set testids (set-history-{i}) kept. */}
          <SetHistoryChips
            totalSets={currentExercise.sets}
            loggedSets={history[safeExIdx] ?? []}
            currentSetIdx={currentSetIdx}
            isBodyweight={currentExercise.isBodyweight ?? false}
          />

          {/* #65 outlier-quarantine surface — a calm, no-guilt note on any set
              the detector quarantined (still in the log; learning suppressed) +
              a one-tap "that was real" that re-feeds it to learning. Renders
              nothing when the ledger is empty (the common case). */}
          <QuarantineNotice engineName={currentExercise.engineName ?? currentExercise.name} />
        </div>
        {/* ── END SCROLLING CONTEXT RAIL ─────────────────────────────────── */}

        {/* ── FIXED LOGGING DOCK (mockup Variant 2 idea (a)) ─────────────────
            The single most important action — "target + steppers + Confirm" —
            is pinned to the bottom thumb zone, ALWAYS reachable, while the
            context above scrolls under it.

            PORTALED TO #root (constraint #3 — the bezel lesson; founder live
            2026-06-12 DESKTOP MONSTER fix). The routed content is wrapped by
            Layout in `.animate-page-enter`, whose page-enter animation leaves a
            `transform` (even at the identity matrix) that establishes a containing
            block for `position:fixed` descendants — so a `fixed` dock INSIDE the
            route would anchor to that wrapper's box (full content height), not the
            viewport, and at a short (740px) viewport it pushed the Confirm CTA
            below the fold. #root sits ABOVE that wrapper, so the dock still escapes
            the transform; and because #root is the device-screen element (relative,
            transform-free on desktop), the .app-fixed-column fixed→absolute desktop
            flip anchors the dock INSIDE the 402px bezel frame instead of spanning
            the whole monitor (the founder's "3 monitoare" bug — it was portaled to
            document.body, which has no positioned ancestor → absolute spanned the
            window). Mobile keeps position:fixed → viewport-pinned, byte-identical.
            The portal is transparent to the test suite (jsdom has no #root → the
            dockPortalTarget fallback is document.body, so every setlog / rating
            testid stays reachable); "Set X/Y" lives in the hero (scroll rail), not
            here, so #log-zone keeps its asserted text. BottomNav is hidden in-
            session → no collision; the dock owns the bottom edge + safe-area.

            Z-WAR (founder live 2026-06-12): the dock is the LOWEST chrome layer.
            (1) AUTO-HIDE — gated on `dockVisible` (= !overlayOpen && !warmupActive)
            so it UNMOUNTS while any blocking surface (exit menu, "Nu vreau" picker,
            rest, ⋯ menu, …) is up or warm-up is pending. (2) Z-FLOOR — z-10 (was
            z-30), strictly BELOW every in-session overlay (RestOverlay z-40,
            sheets/menus z-50, anomaly z-60), so even if a future overlay shares the
            dock's stacking context it can never tie/cover it. */}
        {dockVisible && createPortal(
        <div
          ref={attachDock}
          className="app-fixed-column app-fixed-column--inset fixed bottom-0 z-10 px-1 pt-4 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] [&>*:last-child]:mb-0 pointer-events-none [&>*]:pointer-events-auto"
          data-testid="log-dock"
          style={{
            // height:auto OPTS OUT of the desktop bezel rule `#root > * {
            // height:100% }` (written when the shell was #root's ONLY child) —
            // without it the portaled dock became a full-screen child: card
            // pinned to the TOP, opaque gradient blacking the page, and the
            // div swallowing every click (founder desktop screenshot + the CI
            // E2E "log-dock intercepts pointer events" red, 2026-06-12). The
            // pointer-events none/auto split (className) keeps the pt-4 fade
            // strip + gutters click-through; only the real cards catch taps.
            height: 'auto',
            minHeight: 0,
            // Soft top-fade into the page surface so the dock reads as part of
            // the glass (mirrors the BottomNav fade), plus a faint top-edge
            // shadow lifting it above the scrolling context.
            background: 'linear-gradient(180deg, transparent, var(--paper) 26%)',
            boxShadow: '0 -10px 30px -16px color-mix(in oklab, var(--paper) 80%, black)',
          }}
        >
          {/* §F-pass2-setloginput-02 — mockup wv2 two-step (andura-clasic.html
              #L1463-1485). Pre-log `tinta` (target + Logheaza CTA) → post-log
              readonly "Tu ai facut..." + pencil revise + rating row. `editing`
              = pencil escape to editable inputs. SetLogInput renders its OWN
              pulse-card (per mode) so it IS the dock card — no extra wrapper card
              (no card-in-card, keeps the dock compact). */}
          <SetLogInput
            kg={kgInput}
            reps={repsInput}
            // DECOUPLE target from entry (Daniel P0 2026-06-05 "coach is a
            // notepad"): the read-only "Tinta" shows the engine's PRESCRIBED
            // recommendation for this set (recKg/recReps — the SHARED current-
            // recommended-load that DP.checkInSessionAdjust re-prescribes after
            // each rated set, ALWAYS, regardless of inputDirty). The editable
            // steppers below keep kgInput/repsInput = the user's ACTUAL ENTRY.
            // So a Hard/Easy rating visibly moves the TARGET even when the user
            // edited their logged numbers — the coach is seen reacting.
            targetKg={recKg}
            targetReps={recReps}
            perHandLoad={perHandLoad}
            isBodyweight={currentExercise.isBodyweight ?? false}
            plateHint={plateHint}
            // #7 metric-type rendering — a time/carry exercise shows a seconds
            // input (+ a load tile for carries) instead of kg/reps. Reps sets
            // pass 'reps' (the default) → byte-identical kg/reps tiles.
            metricType={currentMetricType}
            durationSec={durationInput}
            onDurationChange={(n) => {
              bumpActivity();
              setInputDirty(true);
              setDurationInput(n);
            }}
            {...(currentExercise.targetSec !== undefined ? { targetSec: currentExercise.targetSec } : {})}
            mode={editing ? 'editable' : setLogged ? 'post-log' : 'tinta'}
            onLog={() => {
              bumpActivity();
              setSetLogged(true);
            }}
            onEdit={() => {
              bumpActivity();
              setEditing(true);
            }}
            onKgChange={(n) => {
              bumpActivity();
              setInputDirty(true);
              setKgInput(n);
            }}
            onRepsChange={(n) => {
              bumpActivity();
              setInputDirty(true);
              setRepsInput(n);
            }}
          />

          {/* Rating row appears only after Logheaza (post-log) or while revising
              (editing). Pre-log tinta hides it per mockup wv2. */}
          {(setLogged || editing) && <SetRatingButtons onRate={handleLogSet} />}
        </div>,
        dockPortalTarget,
        )}
        {/* ── END FIXED LOGGING DOCK (portaled to #root) ──────────────────── */}
        </div>
      )}

      {phase === 'rest' && (
        <RestOverlay
          countdownSec={restCountdown}
          initialRestSec={restInitialSec}
          onSkip={handleSkipRest}
          // §F-pass2-restoverlay-03 (MED Wave 11) — pass current exercise
          // name pentru contextual cue "Pauza · {name} recupereaza" mockup
          // pattern. Empty fallback when ai un workout fara nume (defensive).
          currentExerciseName={currentExercise.name}
          // BUG preview (2026-06-03) — on the inter-exercise rest (last set just
          // logged, pendingAdvanceRef set) show the NEXT exercise so the user knows
          // what's coming; intermediate-set rests pass undefined (no spurious next).
          nextExerciseName={pendingAdvanceRef.current ? nextExercise?.name : undefined}
        />
      )}

      {/* Transition phase — Wave C3 (2026-05-28): each line rolls/fades in with
          a small stagger so the next-exercise reveal feels intentional, not a
          static splash. The screen-level backdrop fades in, then the label,
          name, and coach line cascade. Auto-collapses under reduced motion. */}
      {phase === 'transition' && (
        <TransitionScreen
          nextExerciseName={nextExercise?.name}
          coachLine={coachPick('transition', undefined, 0)}
        />
      )}

      <ExitConfirmSheet
        open={exitSheetOpen}
        exIdx={safeExIdx}
        totalExercises={exercises.length}
        onChoose={handleExit}
      />

      <AaFrictionModal
        open={aaModalOpen}
        reason={aaReason}
        onAcknowledge={handleAaAcknowledge}
        onForceContinue={handleAaForceContinue}
      />

      {/* #5/A anomaly / fat-finger confirm — quarantines an implausible entry
          (×10 typo / past ceiling / reps>50) with a "sigur?" sheet. */}
      <AnomalyConfirmModal
        open={anomalyResult !== null}
        result={anomalyResult}
        value={anomalyResult?.field === 'reps' ? repsInput : kgInput}
        onConfirm={handleAnomalyConfirm}
        onFix={handleAnomalyFix}
      />

      {/* Pulse arc 2026-05-29 (blueprint C3-c) — mid-session PR celebration,
          fired at the existing markPRHit moment in performLogSet. Transient +
          auto-dismissing (never traps focus, never permanently blocks exit);
          the PostSummary PR banner remains the durable record. Keyed on the
          exercise so back-to-back PRs each re-trigger the burst. */}
      {prFlash && (
        <PrFlash
          key={`${prFlash.kind}:${prFlash.exercise}`}
          exercise={prFlash.exercise}
          deltaKg={prFlash.deltaKg}
          variant={prFlash.kind}
          onClose={() => setPrFlash(null)}
        />
      )}

      <InactivityPrompt
        open={inactivityPromptOpen}
        onContinue={bumpActivity}
        onSaveExit={() => {
          // HIGH-CODE-05 fix: pass real workoutTitle NU hardcoded 'Push' lie.
          pauseSession(workoutTitle);
          navigate(gotoPath('antrenor'));
        }}
      />

      {/* Daniel smoke 2026-05-28 #17 — in-session Aparat lipsa picker. Saves
          to wv2-missing-equipment so Cont → AparateLipsa hydrates fresh on
          its next mount; if the new list blocks this exercise's equipment,
          handleAparatLipsaConfirm swaps it in-place (resolveMissingSwap). */}
      <AparatLipsaSheet
        open={aparatLipsaSheetOpen}
        onConfirm={handleAparatLipsaConfirm}
        onClose={handleCloseAparatLipsa}
      />

      {/* Founder swap redesign 2026-06-05 — manual swap pick-list. "Aparat
          ocupat" / "Nu vreau" open this short ranked same-muscle list (row 1 =
          smart pre-pick, exactly one bodyweight fallback) + a separated drop row
          that removes the exercise from today's session (recoverable below). */}
      <SwapPickSheet
        open={pickSheet.open}
        muscleGroup={pickSheet.muscleGroup}
        originalName={pickSheet.originalName}
        rows={pickSheet.rows}
        onPick={handlePickRow}
        onDrop={handleDropExercise}
        onClose={handleClosePick}
      />

      {/* §F-workout-05 — why-exercise explainer bottom sheet. Mockup
          andura-clasic.html#L1449 openWhyExercise → whyEngine categorical
          summary. Backdrop tap or "Am inteles" closes. */}
      {whyText !== null && (
        <WhyExerciseModal
          whyText={whyText}
          exerciseName={currentExercise.name}
          dismissRef={whyDismissRef}
          onClose={() => setWhyText(null)}
        />
      )}
    </section>
  );
}
