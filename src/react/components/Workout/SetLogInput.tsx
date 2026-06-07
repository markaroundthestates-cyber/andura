// ══ SET LOG INPUT — Workout kg/reps Inputs Component ═════════════════════
// Phase 4 task_12 §A extract din Workout.tsx log zone kg/reps inputs (~lines
// 178-205 prior). Pure presentational — 2 controlled number inputs cu
// labels + ids.
//
// Stateless: parent Workout.tsx owns kgInput/repsInput state + onKgChange/
// onRepsChange handlers (setKgInput(Number(e.target.value)) etc.).
//
// §F-pass2-setloginput-01 + §F-pass2-setloginput-02 (HIGH-DELTA 2026-05-22):
// adaugat `mode` prop cu 3 stari Daniel 2026-05-12 directive `doar tinta
// inainte de Logheaza`. Smoke 2026-05-28 #4 (Daniel verbatim): "sa te
// intrebe coach cate ai facut si cu ce greutate (pastrand ca baza ce a
// recomandat el) dar sa te oblige cumva sa confirmi" — modul `tinta` arata
// acum inputuri editable pre-completate cu recomandarea + buton "Confirma
// setul" (NU mai e display readonly cu "Logheaza setul"). User TREBUIE sa
// vada + atinga valorile pre-rating; valoarea logata = ce a confirmat el,
// NU tacit ce a recomandat coach-ul.
//
// §F-pass2-setloginput-03 (LOW chat5 Wave 10) — labels editable mode swap
// "Kg"/"Reps" English -> "kg"/"Repetari" Romanian mockup verbatim
// andura-clasic.html#L1380 (wv2-target-simple "10 repetari 22.5 kg" form
// intuitive lowercase units + Romanian full word).
//   - 'editable' (default) — paradigma curenta (backward compat), inputs
//     vizibile always. Existing callsites (Workout.tsx) compile fara
//     modificare. Default value preserves Phase 4 task_12 behavior.
//   - 'tinta' — pre-log state cu CONFIRMARE OBLIGATORIE (smoke 2026-05-28
//     #4): "Tinta X repetari Y kg" deasupra ca referinta + "Cate ai facut?"
//     label + kg/reps inputs editable pre-completate cu recomandarea + buton
//     "Confirma setul". User trebuie sa atinga butonul; daca modifica
//     valorile, valorile reale se logheaza, nu cele recomandate.
//   - 'post-log' — post-log readonly state: "Tu ai facut X repetari cu Y kg"
//     + pencil edit affordance. Tap pencil fires onEdit optional callback
//     (parent re-mounts component with mode='editable' for revision flow).
//     Mockup verbatim #L1384-1390 (wv2-postlog).
//
// Smoke 2026-05-28 #4 (Daniel verbatim): "nu pot sterge 0 din fata si
// trebuie sa pun 022" — editable + tinta inputs cand value=0 afiseaza
// placeholder empty (NU "0" lipit), iar la focus se selecteaza valoarea
// curenta (paste-ready). User poate scrie 22 direct fara sa stearga zero-ul.
//
// data-testid preserved verbatim (kg-input / reps-input) + htmlFor/id label
// associations pentru Workout.test.tsx baseline preserve + a11y compliance.
// New testids: setlog-tinta / setlog-tinta-reps / setlog-tinta-kg /
// setlog-tinta-log-btn / setlog-tinta-kg-input / setlog-tinta-reps-input /
// setlog-tinta-target-display / setlog-postlog / setlog-postlog-text /
// setlog-postlog-edit.

import type { JSX } from 'react';
import { Check, Pencil, Minus, Plus } from 'lucide-react';
import { Ripple } from '../Ripple';
import { NumberField } from '../ui/NumberField';
import { haptic } from '../../lib/motion';
import { t } from '../../../i18n/index.js';

export type SetLogInputMode = 'editable' | 'tinta' | 'post-log';

// CLIP FIX (2026-06-02, Daniel option B): the root cause was layout, not the
// spinner — with the ± buttons flanking the input ON THE SAME ROW inside a
// half-width tile, the number got only ~40px and a value like 186.5 clipped to
// "18". Option B stacks the layout: the number owns its OWN full-tile row
// (centered), the ± steppers sit on a row BELOW it — so the number can never be
// squeezed by the buttons. This style still hides the native WebKit/Firefox
// spinner arrows (same precedent as onboarding BigNumberField .onb-bignum) so
// the centered value isn't nudged by the spin control. CSS-only — no behavior /
// testid change.
const NUMDIAL_SPIN_RESET = (
  <style>{`.numdial-input::-webkit-inner-spin-button,.numdial-input::-webkit-outer-spin-button{-webkit-appearance:none;margin:0;}.numdial-input{-moz-appearance:textfield;}`}</style>
);

// PULSE RESKIN (Andura Pulse arc 2026-05-29, mockup interfata-noua/
// screens-workout.jsx NumDial :390-403) — ± stepper buttons that flank the
// type-input. Daniel "Maria 65 types" → the free-type <input> is PRESERVED
// (leading-0 fix + a11y bounds untouched); the dial is an ADDITIVE thumb-
// friendly affordance for quick nudges. Each tap clamps to bounds and rounds
// to the step grid (kg 0.5 increments = real gym plates, reps whole numbers).
// Tap delegates to the same onChange the input uses, so the parent state +
// validation stay the single source of truth.
function stepValue(current: number, delta: number, min: number, max: number): number {
  const base = Number.isFinite(current) ? current : 0;
  // Round to the step grid so a 0.5 nudge off a typed 22.3 lands on 22.5/22.0.
  const next = Math.round((base + delta) * 2) / 2;
  return Math.min(max, Math.max(min, next));
}

// SELECT-ALL-ON-TAP + decimal-safe text buffer now live in the shared
// components/ui/NumberField (extracted 2026-06-07 so the Progres inputs can
// reuse the same fix). It owns the type="number" .select() no-op fix described
// there.

interface DialButtonProps {
  dir: 'down' | 'up';
  onPress: () => void;
  ariaLabel: string;
  testId: string;
}

function DialButton({ dir, onPress, ariaLabel, testId }: DialButtonProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={() => {
        haptic(8);
        onPress();
      }}
      aria-label={ariaLabel}
      data-testid={testId}
      className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-[10px] text-ink transition-transform active:scale-[.92]"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--line)',
      }}
    >
      {dir === 'down' ? (
        <Minus className="w-4 h-4" aria-hidden="true" />
      ) : (
        <Plus className="w-4 h-4" aria-hidden="true" />
      )}
    </button>
  );
}

interface SetLogInputProps {
  kg: number;
  reps: number;
  onKgChange: (n: number) => void;
  onRepsChange: (n: number) => void;
  // Decoupled PRESCRIBED TARGET (Daniel P0 2026-06-05 "coach is a notepad"):
  // the read-only "Tinta" the coach prescribes for THIS set, distinct from the
  // editable kg/reps which are the user's ACTUAL ENTRY. The target display
  // (setlog-tinta-kg / setlog-tinta-reps) shows targetKg/targetReps so the
  // engine's re-prescription is always visible, even after the user edits their
  // logged numbers. When omitted, falls back to kg/reps (backward compat — the
  // 'editable'/'post-log' modes + legacy callsites without a target are byte-
  // identical). The editable steppers always render kg/reps.
  targetKg?: number;
  targetReps?: number;
  // §F-pass2-setloginput-01/02 — state machine mode (default 'editable'
  // pentru backward compat existing Workout.tsx wire).
  mode?: SetLogInputMode;
  onLog?: () => void; // 'tinta' mode CTA
  onEdit?: () => void; // 'post-log' mode pencil tap
  // Bodyweight model (bodyweightLoad.js) — when true, `kg` is the ADDED weight
  // (belt/dumbbell, default 0), NOT a barbell-style target. The target shows
  // "X reps cu greutatea corpului" and the kg field becomes an optional
  // "+ added weight" input (min 0). Default false = legacy loaded behavior.
  isBodyweight?: boolean;
}

export function SetLogInput({
  kg,
  reps,
  onKgChange,
  onRepsChange,
  mode = 'editable',
  onLog,
  onEdit,
  isBodyweight = false,
  targetKg,
  targetReps,
}: SetLogInputProps): JSX.Element {
  // The PRESCRIBED target shown read-only above the actual-entry steppers. The
  // coach prescribes targetKg/targetReps; the user logs kg/reps. They are
  // DECOUPLED so the visible target reflects the engine's recommendation, not
  // the user's own typing (the "notepad" bug). Fallback to kg/reps keeps every
  // legacy callsite (no target passed) byte-identical.
  const displayTargetKg = targetReps !== undefined || targetKg !== undefined ? (targetKg ?? kg) : kg;
  const displayTargetReps = targetReps !== undefined || targetKg !== undefined ? (targetReps ?? reps) : reps;
  // Smoke 2026-05-28 #4 — display number sau gol cand value=0/NaN. The 0/empty
  // rule + select-all-on-focus + decimal-safe text buffer now live in
  // NumberField (the type="number" .select() no-op fix, 2026-06-07).

  if (mode === 'tinta') {
    // Smoke 2026-05-28 #4 — confirmare OBLIGATORIE pre-rating. Tinta ramane
    // afisata ca referinta sus; kg/reps editable pre-completate cu
    // recomandarea; butonul "Confirma setul" lasa user-ul sa accepte
    // recomandarea (tap fara modificare) sau sa o corecteze (modifica
    // valorile, apoi tap). Valoarea logata = ce e in inputuri la tap,
    // pasata prin onKgChange/onRepsChange in store-ul parintelui.
    return (
      <div className="pulse-card p-[18px] mb-6" data-testid="setlog-tinta">
        <p className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-center" style={{ color: 'var(--aqua)' }}>
          {t('setLog.targetLabel')}
        </p>
        <div className="flex items-baseline justify-center gap-2 mt-2 mb-4" data-testid="setlog-tinta-target-display">
          <span
            className="font-display text-2xl font-bold text-ink"
            data-testid="setlog-tinta-reps"
          >
            {displayTargetReps}
          </span>
          {/* Bodyweight: target is reps "cu greutatea corpului", NO barbell-
              style kg target. Loaded: "reps + Y kg" as before. The kg/reps
              shown here are the PRESCRIBED target (displayTargetReps/Kg), not
              the editable actual-entry below — so the coach's recommendation
              stays visible even after the user edits what they really lifted. */}
          {isBodyweight ? (
            <span className="text-sm text-ink2" data-testid="setlog-tinta-bw">
              {t('setLog.bodyweightTargetReps')}
            </span>
          ) : (
            <>
              <span className="text-sm text-ink2">{t('setLog.targetReps')}</span>
              <span
                className="font-display text-2xl font-bold text-ink ml-2"
                data-testid="setlog-tinta-kg"
              >
                {displayTargetKg} kg
              </span>
            </>
          )}
        </div>

        <p className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-ink2 mb-2 text-center">
          {t('setLog.askDoneLabel')}
        </p>
        {/* Pulse NumDial pair (mockup interfata-noua/screens-workout.jsx NumDial)
            — each control is a --surface-2 tile: mono Kicker label on top, the
            big value on its OWN row (option B, never clips), the − / + steppers
            on a row below. The free-type <input> is PRESERVED as the big value
            (Maria 65 types); the ± dials are the thumb add. */}
        <div className="flex gap-3 mb-4">
          <div
            className="flex-1 text-center rounded-2xl p-3"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}
          >
            <label
              className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-ink2 block"
              htmlFor="setlog-tinta-kg-input"
            >
              {isBodyweight ? t('setLog.addedWeightLabel') : t('setLog.kgLabel')}
            </label>
            {/* Option B (Daniel 2026-06-02): the number owns its OWN full-tile
                row (centered) so a 3+ digit / decimal value (186.5) can NEVER be
                clipped by the flanking buttons; the ± steppers sit on a row
                BELOW it. */}
            <NumberField
              id="setlog-tinta-kg-input"
              inputMode="decimal"
              allowDecimal
              value={kg}
              onChange={onKgChange}
              testId="setlog-tinta-kg-input"
              className="numdial-input w-full min-w-0 bg-transparent border-none px-0 py-1 mt-2 font-display text-[22px] leading-[1.35] font-bold text-ink text-center focus:outline-none"
            />
            <div className="flex items-center justify-between gap-2 mt-2">
              <DialButton
                dir="down"
                onPress={() => onKgChange(stepValue(kg, -0.5, 0, 500))}
                ariaLabel={t('setLog.kgDecrease')}
                testId="setlog-tinta-kg-minus"
              />
              <DialButton
                dir="up"
                onPress={() => onKgChange(stepValue(kg, 0.5, 0, 500))}
                ariaLabel={t('setLog.kgIncrease')}
                testId="setlog-tinta-kg-plus"
              />
            </div>
          </div>
          <div
            className="flex-1 text-center rounded-2xl p-3"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}
          >
            <label
              className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-ink2 block"
              htmlFor="setlog-tinta-reps-input"
            >
              {t('setLog.repsLabel')}
            </label>
            {/* Option B — number on its own full-tile row, ± below (never clips). */}
            <NumberField
              id="setlog-tinta-reps-input"
              inputMode="numeric"
              allowDecimal={false}
              value={reps}
              onChange={onRepsChange}
              testId="setlog-tinta-reps-input"
              className="numdial-input w-full min-w-0 bg-transparent border-none px-0 py-1 mt-2 font-display text-[22px] leading-[1.35] font-bold text-ink text-center focus:outline-none"
            />
            <div className="flex items-center justify-between gap-2 mt-2">
              <DialButton
                dir="down"
                onPress={() => onRepsChange(stepValue(reps, -1, 0, 100))}
                ariaLabel={t('setLog.repsDecrease')}
                testId="setlog-tinta-reps-minus"
              />
              <DialButton
                dir="up"
                onPress={() => onRepsChange(stepValue(reps, 1, 0, 100))}
                ariaLabel={t('setLog.repsIncrease')}
                testId="setlog-tinta-reps-plus"
              />
            </div>
          </div>
        </div>

        {/* Wave C3 (2026-05-28) — the "Confirma setul" CTA is the single most
            important tap in a workout. Layered feedback: (1) Ripple from tap
            point, (2) press-feedback scale-0.94, (3) brief haptic buzz on
            release (Android only), (4) the success-burst halo bloom sits behind
            the icon for a 600ms confirmation. Daniel "go wild" — but only the
            buttons that earn it (set logging is the ritual heartbeat). */}
        <button
          type="button"
          onClick={() => {
            haptic(12);
            onLog?.();
          }}
          disabled={!Number.isFinite(reps) || reps < 1}
          data-testid="setlog-tinta-log-btn"
          className="btn-primary-lift btn-grad press-feedback relative overflow-hidden w-full flex items-center justify-center gap-2 p-3 rounded-full text-base font-semibold min-h-[44px] disabled:opacity-50"
        >
          <Ripple color="rgba(255,255,255,0.55)" />
          <Check className="w-5 h-5 relative" aria-hidden="true" />
          <span className="relative">{t('setLog.confirmSetCta')}</span>
        </button>
        {NUMDIAL_SPIN_RESET}
      </div>
    );
  }

  // §F-pass2-setloginput-02 — post-log readonly + pencil edit affordance.
  // Mockup verbatim #L1384-1390 (wv2-postlog).
  if (mode === 'post-log') {
    return (
      <div className="pulse-card p-[18px] mb-6" data-testid="setlog-postlog">
        <p className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-ink2 mb-2">
          {t('setLog.youDidLabel')}
        </p>
        <div className="flex items-center gap-2">
          <p className="flex-1 text-base text-ink" data-testid="setlog-postlog-text">
            <span className="font-display text-3xl font-bold">{reps}</span>
            {/* Bodyweight: "X reps cu greutatea corpului (+ Y kg)" — Y omitted
                when 0 (pure bodyweight). Loaded: "X reps cu Y kg" as before. */}
            {isBodyweight ? (
              <>
                <span className="text-sm text-ink2 mx-2">{t('setLog.youDidBodyweight')}</span>
                {Number.isFinite(kg) && kg > 0 && (
                  <span className="font-display text-3xl font-bold">+{kg} kg</span>
                )}
              </>
            ) : (
              <>
                <span className="text-sm text-ink2 mx-2">{t('setLog.youDidRepsWith')}</span>
                <span className="font-display text-3xl font-bold">{kg} kg</span>
              </>
            )}
          </p>
          <button
            type="button"
            onClick={onEdit}
            aria-label={t('setLog.editAriaLabel')}
            data-testid="setlog-postlog-edit"
            className="p-2 rounded-full text-ink2 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <Pencil className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  // Default 'editable' — backward-compat behavior preserved verbatim Phase 4
  // task_12. Existing Workout.tsx callsite compiles fara modificare.
  //
  // A11Y HIGH chat5 fix — aria-required + aria-invalid + aria-describedby
  // pe kg/reps inputs pentru screen reader Maria/Gigel. Bounds: kg 1-500
  // (gym sanity max bench world record ~325kg), reps 1-100. Show error
  // doar cand value out-of-range typed (NU initial 0 default). WCAG SC
  // 3.3.1 + SC 3.3.3.
  // Bodyweight: kg is ADDED weight, valid from 0 (pure bodyweight) up. Loaded:
  // 1-500 gym sanity range (the a11y error spec).
  const kgError =
    !Number.isFinite(kg) || kg < (isBodyweight ? 0 : 1) || kg > 500
      ? t('setLog.kgError')
      : null;
  const repsError =
    !Number.isFinite(reps) || reps < 1 || reps > 100
      ? t('setLog.repsError')
      : null;
  return (
    <div className="flex gap-3 mb-6">
      <div className="flex-1">
        {/* Pulse NumDial tile (mockup screens-workout.jsx NumDial): mono Kicker
            label, the big value on its OWN row (option B, never clips), the
            − / + steppers on a row below, on a --surface-2 tile. The free-type
            <input> is PRESERVED as the big value; the ± dials are the thumb add.
            Editable bounds kg 1-500 loaded / 0-500 bodyweight. */}
        <div
          className="text-center rounded-2xl p-3"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}
        >
          <label className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-ink2 block" htmlFor="kg-input">
            {isBodyweight ? t('setLog.addedWeightLabel') : t('setLog.kgLabelRequired')}
          </label>
          {/* Option B — number on its own full-tile row, ± below (never clips). */}
          <NumberField
            id="kg-input"
            inputMode="decimal"
            allowDecimal
            value={kg}
            onChange={onKgChange}
            required={!isBodyweight}
            aria-required={isBodyweight ? undefined : 'true'}
            aria-invalid={kgError ? 'true' : undefined}
            aria-describedby={kgError ? 'kg-input-error' : undefined}
            testId="kg-input"
            className="numdial-input w-full min-w-0 bg-transparent border-none px-0 py-1 mt-2 font-display text-[22px] leading-[1.35] font-bold text-ink text-center focus:outline-none"
          />
          <div className="flex items-center justify-between gap-2 mt-2">
            <DialButton
              dir="down"
              onPress={() => onKgChange(stepValue(kg, -0.5, isBodyweight ? 0 : 1, 500))}
              ariaLabel={isBodyweight ? t('setLog.addedWeightDecrease') : t('setLog.kgDecrease')}
              testId="kg-minus"
            />
            <DialButton
              dir="up"
              onPress={() => onKgChange(stepValue(kg, 0.5, isBodyweight ? 0 : 1, 500))}
              ariaLabel={isBodyweight ? t('setLog.addedWeightIncrease') : t('setLog.kgIncrease')}
              testId="kg-plus"
            />
          </div>
        </div>
        {kgError && (
          <p
            id="kg-input-error"
            role="alert"
            data-testid="kg-input-error"
            className="mt-1 text-xs text-danger"
          >
            {kgError}
          </p>
        )}
      </div>
      <div className="flex-1">
        <div
          className="text-center rounded-2xl p-3"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}
        >
          <label className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-ink2 block" htmlFor="reps-input">
            {t('setLog.repsLabelRequired')}
          </label>
          {/* Option B — number on its own full-tile row, ± below (never clips). */}
          <NumberField
            id="reps-input"
            inputMode="numeric"
            allowDecimal={false}
            value={reps}
            onChange={onRepsChange}
            required
            aria-required="true"
            aria-invalid={repsError ? 'true' : undefined}
            aria-describedby={repsError ? 'reps-input-error' : undefined}
            testId="reps-input"
            className="numdial-input w-full min-w-0 bg-transparent border-none px-0 py-1 mt-2 font-display text-[22px] leading-[1.35] font-bold text-ink text-center focus:outline-none"
          />
          <div className="flex items-center justify-between gap-2 mt-2">
            <DialButton
              dir="down"
              onPress={() => onRepsChange(stepValue(reps, -1, 1, 100))}
              ariaLabel={t('setLog.repsDecrease')}
              testId="reps-minus"
            />
            <DialButton
              dir="up"
              onPress={() => onRepsChange(stepValue(reps, 1, 1, 100))}
              ariaLabel={t('setLog.repsIncrease')}
              testId="reps-plus"
            />
          </div>
        </div>
        {repsError && (
          <p
            id="reps-input-error"
            role="alert"
            data-testid="reps-input-error"
            className="mt-1 text-xs text-danger"
          >
            {repsError}
          </p>
        )}
      </div>
      {NUMDIAL_SPIN_RESET}
    </div>
  );
}
