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

import type { JSX, FocusEvent } from 'react';
import { Check, Pencil, Minus, Plus } from 'lucide-react';
import { Ripple } from '../Ripple';
import { haptic } from '../../lib/motion';
import { t } from '../../../i18n/index.js';

export type SetLogInputMode = 'editable' | 'tinta' | 'post-log';

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
}: SetLogInputProps): JSX.Element {
  // Smoke 2026-05-28 #4 — display number sau gol cand value=0/NaN. Inputul
  // "0" lipit nu putea fi sters (Daniel: "trebuie sa pun 022"). Acum gol →
  // user scrie direct 22.
  const kgDisplay = Number.isFinite(kg) && kg > 0 ? String(kg) : '';
  const repsDisplay = Number.isFinite(reps) && reps > 0 ? String(reps) : '';

  // Smoke 2026-05-28 #4 — selectAll la focus pentru paste-ready: user atinge
  // inputul si valoarea curenta e selectata, prima cifra tastata o inlocuieste.
  function handleFocus(e: FocusEvent<HTMLInputElement>): void {
    e.currentTarget.select();
  }

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
            className="font-display text-3xl font-bold text-ink"
            data-testid="setlog-tinta-reps"
          >
            {reps}
          </span>
          {/* Bodyweight: target is reps "cu greutatea corpului", NO barbell-
              style kg target. Loaded: "reps + Y kg" as before. */}
          {isBodyweight ? (
            <span className="text-sm text-ink2" data-testid="setlog-tinta-bw">
              {t('setLog.bodyweightTargetReps')}
            </span>
          ) : (
            <>
              <span className="text-sm text-ink2">{t('setLog.targetReps')}</span>
              <span
                className="font-display text-3xl font-bold text-ink ml-2"
                data-testid="setlog-tinta-kg"
              >
                {kg} kg
              </span>
            </>
          )}
        </div>

        <p className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-ink2 mb-2 text-center">
          {t('setLog.askDoneLabel')}
        </p>
        {/* Pulse NumDial pair (mockup interfata-noua/screens-workout.jsx NumDial)
            — each control is a --surface-2 tile: mono Kicker label on top, big
            − / value / + row, unit below. The free-type <input> is PRESERVED as
            the big center value (Maria 65 types); the ± dials are the thumb add. */}
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
            <div className="flex items-center justify-between gap-2 mt-2">
              <DialButton
                dir="down"
                onPress={() => onKgChange(stepValue(kg, -0.5, 0, 500))}
                ariaLabel={t('setLog.kgDecrease')}
                testId="setlog-tinta-kg-minus"
              />
              <input
                id="setlog-tinta-kg-input"
                type="number"
                inputMode="decimal"
                min={0}
                max={500}
                step={0.5}
                value={kgDisplay}
                onChange={(e) => onKgChange(e.target.value === '' ? 0 : Number(e.target.value))}
                onFocus={handleFocus}
                data-testid="setlog-tinta-kg-input"
                className="w-full min-w-0 bg-transparent border-none p-0 font-display text-[28px] font-bold text-ink text-center focus:outline-none"
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
            <div className="flex items-center justify-between gap-2 mt-2">
              <DialButton
                dir="down"
                onPress={() => onRepsChange(stepValue(reps, -1, 0, 100))}
                ariaLabel={t('setLog.repsDecrease')}
                testId="setlog-tinta-reps-minus"
              />
              <input
                id="setlog-tinta-reps-input"
                type="number"
                inputMode="numeric"
                min={0}
                max={100}
                step={1}
                value={repsDisplay}
                onChange={(e) => onRepsChange(e.target.value === '' ? 0 : Number(e.target.value))}
                onFocus={handleFocus}
                data-testid="setlog-tinta-reps-input"
                className="w-full min-w-0 bg-transparent border-none p-0 font-display text-[28px] font-bold text-ink text-center focus:outline-none"
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
            label, big − / value / + row on a --surface-2 tile. The free-type
            <input> is PRESERVED as the big center value; the ± dials are the
            thumb add. Editable bounds kg 1-500 loaded / 0-500 bodyweight. */}
        <div
          className="text-center rounded-2xl p-3"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}
        >
          <label className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-ink2 block" htmlFor="kg-input">
            {isBodyweight ? t('setLog.addedWeightLabel') : t('setLog.kgLabelRequired')}
          </label>
          <div className="flex items-center justify-between gap-2 mt-2">
            <DialButton
              dir="down"
              onPress={() => onKgChange(stepValue(kg, -0.5, isBodyweight ? 0 : 1, 500))}
              ariaLabel={isBodyweight ? t('setLog.addedWeightDecrease') : t('setLog.kgDecrease')}
              testId="kg-minus"
            />
            <input
              id="kg-input"
              type="number"
              required={!isBodyweight}
              aria-required={isBodyweight ? undefined : 'true'}
              aria-invalid={kgError ? 'true' : undefined}
              aria-describedby={kgError ? 'kg-input-error' : undefined}
              min={isBodyweight ? 0 : 1}
              max={500}
              value={kgDisplay}
              onChange={(e) => onKgChange(e.target.value === '' ? 0 : Number(e.target.value))}
              onFocus={handleFocus}
              data-testid="kg-input"
              className="w-full min-w-0 bg-transparent border-none p-0 font-display text-[28px] font-bold text-ink text-center focus:outline-none"
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
          <div className="flex items-center justify-between gap-2 mt-2">
            <DialButton
              dir="down"
              onPress={() => onRepsChange(stepValue(reps, -1, 1, 100))}
              ariaLabel={t('setLog.repsDecrease')}
              testId="reps-minus"
            />
            <input
              id="reps-input"
              type="number"
              required
              aria-required="true"
              aria-invalid={repsError ? 'true' : undefined}
              aria-describedby={repsError ? 'reps-input-error' : undefined}
              min={1}
              max={100}
              value={repsDisplay}
              onChange={(e) => onRepsChange(e.target.value === '' ? 0 : Number(e.target.value))}
              onFocus={handleFocus}
              data-testid="reps-input"
              className="w-full min-w-0 bg-transparent border-none p-0 font-display text-[28px] font-bold text-ink text-center focus:outline-none"
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
    </div>
  );
}
