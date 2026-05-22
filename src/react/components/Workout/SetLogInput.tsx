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
// inainte de Logheaza`:
//   - 'editable' (default) — paradigma curenta (backward compat), inputs
//     vizibile always. Existing callsites (Workout.tsx) compile fara
//     modificare. Default value preserves Phase 4 task_12 behavior.
//   - 'tinta' — pre-log state: large display "Tinta X repetari Y kg" +
//     "Logheaza setul" CTA. Inputs ascunsi. Mockup verbatim #L1377-1382
//     (wv2-target-simple). Tap CTA fires onLog optional callback.
//   - 'post-log' — post-log readonly state: "Tu ai facut X repetari cu Y kg"
//     + pencil edit affordance. Tap pencil fires onEdit optional callback
//     (parent re-mounts component with mode='editable' for revision flow).
//     Mockup verbatim #L1384-1390 (wv2-postlog).
//
// data-testid preserved verbatim (kg-input / reps-input) + htmlFor/id label
// associations pentru Workout.test.tsx baseline preserve + a11y compliance.
// New testids: setlog-tinta / setlog-tinta-reps / setlog-tinta-kg /
// setlog-tinta-log-btn / setlog-postlog / setlog-postlog-text /
// setlog-postlog-edit.

import type { JSX } from 'react';
import { Check, Pencil } from 'lucide-react';

export type SetLogInputMode = 'editable' | 'tinta' | 'post-log';

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
}

export function SetLogInput({
  kg,
  reps,
  onKgChange,
  onRepsChange,
  mode = 'editable',
  onLog,
  onEdit,
}: SetLogInputProps): JSX.Element {
  // §F-pass2-setloginput-01 — pre-log Tinta display + Logheaza CTA. Mockup
  // verbatim andura-clasic.html#L1377-1382 (wv2-target-simple).
  if (mode === 'tinta') {
    return (
      <div className="mb-6" data-testid="setlog-tinta">
        <p className="text-xs uppercase tracking-wide font-medium text-ink2 mb-2">
          Tinta
        </p>
        <div className="flex items-baseline gap-2 mb-4">
          <span
            className="text-3xl font-semibold text-ink"
            data-testid="setlog-tinta-reps"
          >
            {reps}
          </span>
          <span className="text-sm text-ink2">repetari</span>
          <span
            className="text-3xl font-semibold text-ink ml-2"
            data-testid="setlog-tinta-kg"
          >
            {kg} kg
          </span>
        </div>
        <button
          type="button"
          onClick={onLog}
          data-testid="setlog-tinta-log-btn"
          className="w-full flex items-center justify-center gap-2 p-3 bg-brick text-paper rounded-xl text-base font-semibold min-h-[44px]"
        >
          <Check className="w-5 h-5" aria-hidden="true" />
          Logheaza setul
        </button>
      </div>
    );
  }

  // §F-pass2-setloginput-02 — post-log readonly + pencil edit affordance.
  // Mockup verbatim #L1384-1390 (wv2-postlog).
  if (mode === 'post-log') {
    return (
      <div className="mb-6" data-testid="setlog-postlog">
        <p className="text-xs uppercase tracking-wide font-medium text-ink2 mb-2">
          Tu ai facut
        </p>
        <div className="flex items-center gap-2">
          <p className="flex-1 text-base text-ink" data-testid="setlog-postlog-text">
            <span className="text-3xl font-semibold">{reps}</span>
            <span className="text-sm text-ink2 mx-2">repetari cu</span>
            <span className="text-3xl font-semibold">{kg} kg</span>
          </p>
          <button
            type="button"
            onClick={onEdit}
            aria-label="Editeaza"
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
  const kgError =
    !Number.isFinite(kg) || kg < 1 || kg > 500
      ? 'Kg intre 1 si 500.'
      : null;
  const repsError =
    !Number.isFinite(reps) || reps < 1 || reps > 100
      ? 'Repetari intre 1 si 100.'
      : null;
  return (
    <div className="flex gap-3 mb-6">
      <div className="flex-1">
        <label className="text-sm text-ink2 block mb-1" htmlFor="kg-input">
          Kg *
        </label>
        <input
          id="kg-input"
          type="number"
          required
          aria-required="true"
          aria-invalid={kgError ? 'true' : undefined}
          aria-describedby={kgError ? 'kg-input-error' : undefined}
          min={1}
          max={500}
          value={kg}
          onChange={(e) => onKgChange(Number(e.target.value))}
          data-testid="kg-input"
          className="w-full p-3 border border-lineStrong rounded-xl bg-paper2"
        />
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
        <label className="text-sm text-ink2 block mb-1" htmlFor="reps-input">
          Reps *
        </label>
        <input
          id="reps-input"
          type="number"
          required
          aria-required="true"
          aria-invalid={repsError ? 'true' : undefined}
          aria-describedby={repsError ? 'reps-input-error' : undefined}
          min={1}
          max={100}
          value={reps}
          onChange={(e) => onRepsChange(Number(e.target.value))}
          data-testid="reps-input"
          className="w-full p-3 border border-lineStrong rounded-xl bg-paper2"
        />
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
