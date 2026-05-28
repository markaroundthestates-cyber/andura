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

interface RegionOption {
  id: BodyRegion;
  label: string;
}

const REGIONS: readonly RegionOption[] = [
  { id: 'gat', label: 'Gat' },
  { id: 'umar-stang', label: 'Umar stang' },
  { id: 'umar-drept', label: 'Umar drept' },
  { id: 'piept', label: 'Piept' },
  { id: 'spate', label: 'Spate' },
  { id: 'lombar', label: 'Lombar' },
  { id: 'cot-stang', label: 'Cot stang' },
  { id: 'cot-drept', label: 'Cot drept' },
  { id: 'incheietura-stanga', label: 'Incheietura stanga' },
  { id: 'incheietura-dreapta', label: 'Incheietura dreapta' },
  { id: 'sold', label: 'Sold' },
  { id: 'genunchi-stang', label: 'Genunchi stang' },
  { id: 'genunchi-drept', label: 'Genunchi drept' },
  { id: 'glezna-stanga', label: 'Glezna stanga' },
  { id: 'glezna-dreapta', label: 'Glezna dreapta' },
];

const INTENSITY_LABELS: Record<PainIntensity, string> = {
  1: 'Usor',
  2: 'Mediu',
  3: 'Sever',
};

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
  const fromState = (location.state as { from?: string } | null)?.from;
  const inSession = sessionStart !== null || fromState === 'workout';

  function handleContinue(): void {
    if (!region) return;
    // §43-H2: persist pain to append-only CDL so Recovery Engine adapts future
    // sessions (not just this one via location.state).
    persistPainCdl(region, intensity);
    // Wave C3 (2026-05-28) — tactile + visual confirmation that the pain report
    // was registered. Soft haptic buzz (10ms — Material "subtle confirm"), then
    // a brief brick-tinted edge flash so the user feels "they heard me" without
    // the pop being startling. Both helpers no-op on desktop / under
    // prefers-reduced-motion (vestibular safety, Maria 65).
    haptic(10);
    edgeFlash('var(--brick)');
    // §F-pain-button-02 reassurance toast — verbatim mockup L1017-1019.
    toast.show({
      message: 'Siguranta e pe primul loc. Am ajustat restul sesiunii.',
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

  function handleBack(): void {
    navigate(-1);
  }

  const continueDisabled = region === null;

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="pain-button">
      <SubHeader
        title="Ma doare ceva"
        onBack={handleBack}
        testIdBack="pain-button-back"
      />
      <div className="p-6 flex-1">
      <h2 className="text-2xl font-bold text-ink mb-2">Unde te doare?</h2>
      <p className="text-base text-ink2 mb-6">Coach evita exercitii care irita zona.</p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {REGIONS.map((r) => {
          const selected = region === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setRegion(r.id)}
              data-region={r.id}
              aria-pressed={selected}
              className={
                selected
                  ? 'press-feedback p-3 rounded-xl border bg-brick text-paper border-brick'
                  : 'press-feedback p-3 rounded-xl border bg-paper2 border-lineStrong text-ink'
              }
            >
              <span className="text-sm font-medium">{r.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mb-6">
        <p className="text-base text-ink mb-3">Cat de tare?</p>
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
                    ? 'press-feedback flex-1 py-3 rounded-xl border bg-brick text-paper border-brick'
                    : 'press-feedback flex-1 py-3 rounded-xl border bg-paper2 border-lineStrong text-ink'
                }
              >
                <span className="text-base font-medium">{INTENSITY_LABELS[lvl]}</span>
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
        className="press-feedback relative overflow-hidden w-full py-4 bg-brick text-paper rounded-[14px] text-base font-semibold disabled:opacity-50"
      >
        <Ripple color="rgba(255,255,255,0.5)" />
        <span className="relative">Continui adaptat</span>
      </button>
      <button
        type="button"
        onClick={handleExit}
        data-testid="pain-exit"
        className="w-full mt-3 py-3 text-ink2 text-sm"
      >
        Salveaza si iesi
      </button>
      {/* §F-pain-button-02 closing italic — verbatim mockup L1021. Safety
          cue NU paternalistic per D-LEGACY-061 (informativ daca presets nu se
          potrivesc). Lora serif italic matches mockup typography. */}
      <p
        className="mt-6 text-sm text-ink3 italic font-serif leading-relaxed"
        data-testid="pain-medical-cue"
      >
        Daca nu se potriveste niciuna, opreste sesiunea si consulta un medic.
      </p>
      </div>
    </section>
  );
}
