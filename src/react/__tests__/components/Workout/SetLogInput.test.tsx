// SET LOG INPUT TESTS — §F-pass2-setloginput-01 + §F-pass2-setloginput-02
// state machine paradigm coverage (HIGH-DELTA 2026-05-22).
//
// Existing 'editable' default mode preserved verbatim (Workout.tsx existing
// callsite continues compile fara modificare). New 'tinta' pre-log + 'post-
// log' readonly modes covered + backward-compat baseline + a11y +
// no-diacritics.

import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SetLogInput } from '../../../components/Workout/SetLogInput';

function renderInput(overrides: Partial<Parameters<typeof SetLogInput>[0]> = {}) {
  const props = {
    kg: 22.5,
    reps: 10,
    onKgChange: vi.fn(),
    onRepsChange: vi.fn(),
    ...overrides,
  };
  return { props, ...render(<SetLogInput {...props} />) };
}

describe('SetLogInput — editable mode (default, backward compat)', () => {
  it('renders kg + reps inputs when mode omitted (default editable)', () => {
    renderInput();
    expect(screen.getByTestId('kg-input')).toBeInTheDocument();
    expect(screen.getByTestId('reps-input')).toBeInTheDocument();
  });

  it('renders kg + reps inputs when mode="editable" explicit', () => {
    renderInput({ mode: 'editable' });
    expect(screen.getByTestId('kg-input')).toBeInTheDocument();
    expect(screen.getByTestId('reps-input')).toBeInTheDocument();
  });

  it('kg input value reflects prop', () => {
    renderInput({ kg: 22.5 });
    expect((screen.getByTestId('kg-input') as HTMLInputElement).value).toBe('22.5');
  });

  it('reps input value reflects prop', () => {
    renderInput({ reps: 10 });
    expect((screen.getByTestId('reps-input') as HTMLInputElement).value).toBe('10');
  });

  it('kg change fires onKgChange with numeric value', () => {
    const onKgChange = vi.fn();
    renderInput({ onKgChange });
    fireEvent.change(screen.getByTestId('kg-input'), { target: { value: '25' } });
    expect(onKgChange).toHaveBeenCalledWith(25);
  });

  it('reps change fires onRepsChange with numeric value', () => {
    const onRepsChange = vi.fn();
    renderInput({ onRepsChange });
    fireEvent.change(screen.getByTestId('reps-input'), { target: { value: '12' } });
    expect(onRepsChange).toHaveBeenCalledWith(12);
  });

  it('label htmlFor association matches input id (a11y)', () => {
    renderInput();
    // A11Y HIGH chat5 — label text required marker. §F-pass2-setloginput-03
    // (LOW chat5 Wave 10) Romanian-first labels mockup verbatim: lowercase
    // "kg *" + "Repetari *" replacing English "Kg" / "Reps".
    // Wave E1 — EN default surfaces "kg *" + "Reps *"; RO opt-in keeps "Repetari *".
    const kgLabel = screen.getByText('kg *');
    const repsLabel = screen.getByText('Reps *');
    expect(kgLabel).toHaveAttribute('for', 'kg-input');
    expect(repsLabel).toHaveAttribute('for', 'reps-input');
  });

  it('editable mode does NOT render tinta block', () => {
    renderInput();
    expect(screen.queryByTestId('setlog-tinta')).not.toBeInTheDocument();
  });

  it('editable mode does NOT render post-log block', () => {
    renderInput();
    expect(screen.queryByTestId('setlog-postlog')).not.toBeInTheDocument();
  });
});

describe('SetLogInput — §F-pass2-setloginput-01 tinta mode (pre-log)', () => {
  it('renders setlog-tinta block when mode="tinta"', () => {
    renderInput({ mode: 'tinta' });
    expect(screen.getByTestId('setlog-tinta')).toBeInTheDocument();
  });

  it('NU expune testids editable kg-input/reps-input in tinta (NU same DOM ca editable)', () => {
    renderInput({ mode: 'tinta' });
    expect(screen.queryByTestId('kg-input')).not.toBeInTheDocument();
    expect(screen.queryByTestId('reps-input')).not.toBeInTheDocument();
  });

  // Smoke 2026-05-28 #4 — tinta acum are inputuri pentru confirmare obligatorie.
  it('expune kg/reps inputs editable in tinta (smoke #4 confirmare obligatorie)', () => {
    renderInput({ mode: 'tinta', kg: 22.5, reps: 10 });
    expect(screen.getByTestId('setlog-tinta-kg-input')).toBeInTheDocument();
    expect(screen.getByTestId('setlog-tinta-reps-input')).toBeInTheDocument();
  });

  it('displays tinta reps value verbatim', () => {
    renderInput({ mode: 'tinta', reps: 10 });
    expect(screen.getByTestId('setlog-tinta-reps')).toHaveTextContent('10');
  });

  it('displays tinta kg value verbatim with "kg" suffix', () => {
    renderInput({ mode: 'tinta', kg: 22.5 });
    expect(screen.getByTestId('setlog-tinta-kg')).toHaveTextContent('22.5 kg');
  });

  // Audit 2026-06-12 — dumbbell loads are PER HAND engine-wide; the target must
  // SAY so. Real case: Hammer Curl 12.5/hand misread as a 25 two-dumbbell total.
  it('labels the tinta kg "/hand" when perHandLoad (dumbbell convention)', () => {
    renderInput({ mode: 'tinta', kg: 12.5, perHandLoad: true });
    expect(screen.getByTestId('setlog-tinta-kg')).toHaveTextContent('12.5 kg/hand');
  });

  it('keeps the plain "kg" suffix when perHandLoad is absent (legacy default)', () => {
    renderInput({ mode: 'tinta', kg: 60 });
    expect(screen.getByTestId('setlog-tinta-kg')).toHaveTextContent('60 kg');
    expect(screen.getByTestId('setlog-tinta-kg').textContent).not.toContain('/hand');
  });

  it('renders target kicker label (EN default "Target")', () => {
    renderInput({ mode: 'tinta' });
    expect(screen.getByTestId('setlog-tinta')).toHaveTextContent('Target');
  });

  // SMALLER DOCK (founder live 2026-06-12) — the target is now ONE slim inline
  // line "Target  10 × 22.5 kg" (the old two-display-numbers block + the "reps"
  // separator word were dropped to compact the dock). The reps entry tile still
  // carries the "Reps" label, so the reps concept stays labeled for entry.
  it('labels the reps entry tile (EN default "Reps")', () => {
    renderInput({ mode: 'tinta' });
    expect(screen.getByTestId('setlog-tinta')).toHaveTextContent('Reps');
  });

  it('renders confirm-set CTA button (EN default, smoke #4: confirmare obligatorie)', () => {
    renderInput({ mode: 'tinta' });
    const btn = screen.getByTestId('setlog-tinta-log-btn');
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent('Confirm set');
  });

  // SMALLER DOCK (founder live 2026-06-12) — the separate "How many did you do?"
  // prompt row was dropped to compact the dock; the kg/reps entry tiles (each
  // labeled) + the "Confirm set" CTA carry the confirmation affordance (smoke #4
  // "obliga sa confirmi" intact — the user still types/accepts then taps Confirm).
  // The target now reads as one inline line carrying BOTH reps and kg.
  it('renders the compact inline target with reps and kg on one line (smaller dock)', () => {
    renderInput({ mode: 'tinta', kg: 22.5, reps: 10 });
    const target = screen.getByTestId('setlog-tinta-target-display');
    expect(target).toHaveTextContent('10');
    expect(target).toHaveTextContent('22.5 kg');
  });

  it('tinta kg input pre-completat cu recomandarea', () => {
    renderInput({ mode: 'tinta', kg: 22.5 });
    const inp = screen.getByTestId('setlog-tinta-kg-input') as HTMLInputElement;
    expect(inp.value).toBe('22.5');
  });

  it('tinta reps input pre-completat cu recomandarea', () => {
    renderInput({ mode: 'tinta', reps: 10 });
    const inp = screen.getByTestId('setlog-tinta-reps-input') as HTMLInputElement;
    expect(inp.value).toBe('10');
  });

  it('tinta kg input pe 0 afiseaza placeholder gol (smoke #4: "022" fix)', () => {
    renderInput({ mode: 'tinta', kg: 0 });
    const inp = screen.getByTestId('setlog-tinta-kg-input') as HTMLInputElement;
    expect(inp.value).toBe('');
  });

  it('tinta modificare kg fires onKgChange', () => {
    const onKgChange = vi.fn();
    renderInput({ mode: 'tinta', onKgChange });
    fireEvent.change(screen.getByTestId('setlog-tinta-kg-input'), { target: { value: '25' } });
    expect(onKgChange).toHaveBeenCalledWith(25);
  });

  it('tinta modificare reps fires onRepsChange', () => {
    const onRepsChange = vi.fn();
    renderInput({ mode: 'tinta', onRepsChange });
    fireEvent.change(screen.getByTestId('setlog-tinta-reps-input'), { target: { value: '12' } });
    expect(onRepsChange).toHaveBeenCalledWith(12);
  });

  it('tinta CTA disabled cand reps invalid (0/empty)', () => {
    renderInput({ mode: 'tinta', reps: 0 });
    expect(screen.getByTestId('setlog-tinta-log-btn')).toBeDisabled();
  });

  it('tinta CTA enabled cand reps >= 1', () => {
    renderInput({ mode: 'tinta', reps: 1 });
    expect(screen.getByTestId('setlog-tinta-log-btn')).not.toBeDisabled();
  });

  it('CTA tap fires onLog callback', () => {
    const onLog = vi.fn();
    renderInput({ mode: 'tinta', onLog });
    fireEvent.click(screen.getByTestId('setlog-tinta-log-btn'));
    expect(onLog).toHaveBeenCalledTimes(1);
  });

  it('CTA defaults noop when onLog absent (no throw)', () => {
    renderInput({ mode: 'tinta' });
    expect(() => fireEvent.click(screen.getByTestId('setlog-tinta-log-btn'))).not.toThrow();
  });

  it('CTA tap target ≥44px (a11y WCAG 2.5.5)', () => {
    renderInput({ mode: 'tinta' });
    const btn = screen.getByTestId('setlog-tinta-log-btn');
    expect(btn.className).toMatch(/min-h-\[44px\]/);
  });

  it('tinta copy no diacritics', () => {
    renderInput({ mode: 'tinta' });
    const block = screen.getByTestId('setlog-tinta');
    expect(/[ăâîșțĂÂÎȘȚ]/.test(block.textContent ?? '')).toBe(false);
  });
});

// DECOUPLED prescribed-target vs actual-entry (Daniel P0 2026-06-05 "coach is a
// notepad"): the read-only "Tinta" must show the engine's PRESCRIBED target
// (targetKg/targetReps), NOT the editable kg/reps the user logs. The editable
// steppers always render kg/reps (the actual entry). When no target props are
// passed the display falls back to kg/reps (backward compat).
describe('SetLogInput — decoupled prescribed target vs actual entry', () => {
  it('tinta target display shows targetKg/targetReps, NOT the editable kg/reps', () => {
    // User logged 8x20 (kg/reps) but the coach prescribed 10x50 (target).
    renderInput({ mode: 'tinta', kg: 20, reps: 8, targetKg: 50, targetReps: 10 });
    // Read-only target = the prescription.
    expect(screen.getByTestId('setlog-tinta-reps')).toHaveTextContent('10');
    expect(screen.getByTestId('setlog-tinta-kg')).toHaveTextContent('50 kg');
    // Editable entry = the user's actual numbers (NOT mirrored from target).
    expect((screen.getByTestId('setlog-tinta-kg-input') as HTMLInputElement).value).toBe('20');
    expect((screen.getByTestId('setlog-tinta-reps-input') as HTMLInputElement).value).toBe('8');
  });

  it('target display falls back to kg/reps when no target props passed (backward compat)', () => {
    renderInput({ mode: 'tinta', kg: 22.5, reps: 10 });
    expect(screen.getByTestId('setlog-tinta-reps')).toHaveTextContent('10');
    expect(screen.getByTestId('setlog-tinta-kg')).toHaveTextContent('22.5 kg');
  });

  it('editing the entry input does not change the displayed target (steppers control kg, not target)', () => {
    const onKgChange = vi.fn();
    renderInput({ mode: 'tinta', kg: 50, reps: 10, targetKg: 50, targetReps: 10, onKgChange });
    // The user types their real lift into the entry; onKgChange fires (parent owns
    // state) but the read-only target prop is unchanged → display stays 50 kg.
    fireEvent.change(screen.getByTestId('setlog-tinta-kg-input'), { target: { value: '8' } });
    expect(onKgChange).toHaveBeenCalledWith(8);
    expect(screen.getByTestId('setlog-tinta-kg')).toHaveTextContent('50 kg');
  });

  it('bodyweight target uses targetReps for the read-only reps target', () => {
    renderInput({ mode: 'tinta', kg: 0, reps: 6, targetReps: 12, isBodyweight: true });
    expect(screen.getByTestId('setlog-tinta-reps')).toHaveTextContent('12');
    expect(screen.getByTestId('setlog-tinta-bw')).toBeInTheDocument();
  });
});

describe('SetLogInput — §F-pass2-setloginput-02 post-log mode (readonly + edit)', () => {
  it('renders setlog-postlog block when mode="post-log"', () => {
    renderInput({ mode: 'post-log' });
    expect(screen.getByTestId('setlog-postlog')).toBeInTheDocument();
  });

  it('hides editable inputs in post-log mode', () => {
    renderInput({ mode: 'post-log' });
    expect(screen.queryByTestId('kg-input')).not.toBeInTheDocument();
    expect(screen.queryByTestId('reps-input')).not.toBeInTheDocument();
  });

  it('renders post-log kicker label (EN default "You did")', () => {
    renderInput({ mode: 'post-log' });
    expect(screen.getByTestId('setlog-postlog')).toHaveTextContent('You did');
  });

  it('displays post-log reps + kg verbatim', () => {
    renderInput({ mode: 'post-log', reps: 10, kg: 22.5 });
    const text = screen.getByTestId('setlog-postlog-text');
    expect(text).toHaveTextContent('10');
    expect(text).toHaveTextContent('22.5 kg');
  });

  it('renders pencil edit affordance', () => {
    renderInput({ mode: 'post-log' });
    expect(screen.getByTestId('setlog-postlog-edit')).toBeInTheDocument();
  });

  it('pencil tap fires onEdit callback', () => {
    const onEdit = vi.fn();
    renderInput({ mode: 'post-log', onEdit });
    fireEvent.click(screen.getByTestId('setlog-postlog-edit'));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('pencil defaults noop when onEdit absent (no throw)', () => {
    renderInput({ mode: 'post-log' });
    expect(() => fireEvent.click(screen.getByTestId('setlog-postlog-edit'))).not.toThrow();
  });

  it('pencil aria-label "Edit" present (EN default)', () => {
    renderInput({ mode: 'post-log' });
    expect(screen.getByTestId('setlog-postlog-edit')).toHaveAttribute('aria-label', 'Edit');
  });

  it('pencil tap target ≥44px (a11y WCAG 2.5.5)', () => {
    renderInput({ mode: 'post-log' });
    const btn = screen.getByTestId('setlog-postlog-edit');
    expect(btn.className).toMatch(/min-w-\[44px\]/);
    expect(btn.className).toMatch(/min-h-\[44px\]/);
  });

  it('post-log copy no diacritics', () => {
    renderInput({ mode: 'post-log' });
    const block = screen.getByTestId('setlog-postlog');
    expect(/[ăâîșțĂÂÎȘȚ]/.test(block.textContent ?? '')).toBe(false);
  });
});

// CLIP FIX (2026-06-02) — native number-input spinner arrows stole horizontal
// room inside the narrow centered NumDial tiles, clipping multi-digit values
// (a 25 kg target showed only "2"). Fix hides the spinners via a `numdial-input`
// class + scoped <style> reset so 2-4 digit values render fully. jsdom can't
// render pseudo-element spinners, so we assert the structural guarantees: the
// reset class is present on the inputs, the spin-reset <style> ships, and a
// multi-digit value sits in the input value verbatim (not truncated).
describe('SetLogInput — multi-digit clip fix (spinner reset)', () => {
  it('editable kg input carries numdial-input class (spinner reset target)', () => {
    renderInput();
    expect(screen.getByTestId('kg-input').className).toMatch(/numdial-input/);
  });

  it('editable reps input carries numdial-input class', () => {
    renderInput();
    expect(screen.getByTestId('reps-input').className).toMatch(/numdial-input/);
  });

  it('editable mode ships spinner-reset <style> hiding webkit spin buttons', () => {
    const { container } = renderInput();
    const style = container.querySelector('style');
    expect(style).not.toBeNull();
    expect(style?.textContent).toMatch(/-webkit-inner-spin-button/);
    expect(style?.textContent).toMatch(/-webkit-appearance:\s*none/);
  });

  it('editable kg input renders a 2-digit value (25) in full, not clipped', () => {
    renderInput({ kg: 25, reps: 8 });
    // The whole "25" is the input value — the spinner-clip bug truncated the
    // visible digits to "2"; the reset keeps all digits in the centered field.
    expect((screen.getByTestId('kg-input') as HTMLInputElement).value).toBe('25');
  });

  it('editable kg input renders a 3-digit value (100) in full', () => {
    renderInput({ kg: 100, reps: 8 });
    expect((screen.getByTestId('kg-input') as HTMLInputElement).value).toBe('100');
  });

  it('tinta kg/reps inputs carry numdial-input class + ship spinner reset', () => {
    const { container } = renderInput({ mode: 'tinta', kg: 25, reps: 8 });
    expect(screen.getByTestId('setlog-tinta-kg-input').className).toMatch(/numdial-input/);
    expect(screen.getByTestId('setlog-tinta-reps-input').className).toMatch(/numdial-input/);
    expect(container.querySelector('style')?.textContent).toMatch(/-webkit-inner-spin-button/);
    expect((screen.getByTestId('setlog-tinta-kg-input') as HTMLInputElement).value).toBe('25');
  });

  // Option B (Daniel 2026-06-02): the number sits on its OWN row, the ± steppers
  // on a row BELOW it — so a 3+ digit / decimal value can never be squeezed by
  // the buttons. The decimal 186.5 is the case the screenshot clipped to "18".
  it('editable kg input renders a decimal value (186.5) in full, not clipped', () => {
    renderInput({ kg: 186.5, reps: 8 });
    expect((screen.getByTestId('kg-input') as HTMLInputElement).value).toBe('186.5');
  });

  it('option B: kg input precedes its ± stepper row (number owns its own row)', () => {
    renderInput({ kg: 186.5, reps: 8 });
    const input = screen.getByTestId('kg-input');
    const minus = screen.getByTestId('kg-minus');
    const plus = screen.getByTestId('kg-plus');
    // The input is NOT a sibling sandwiched between the two buttons (the old
    // one-row layout); it precedes the row that holds both steppers.
    expect(input.compareDocumentPosition(minus) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(input.compareDocumentPosition(plus) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // Both steppers share one parent row that does NOT contain the input.
    const stepperRow = minus.parentElement;
    expect(stepperRow).toBe(plus.parentElement);
    expect(stepperRow?.contains(input)).toBe(false);
  });

  it('option B: tinta kg input precedes its ± stepper row', () => {
    renderInput({ mode: 'tinta', kg: 186.5, reps: 8 });
    const input = screen.getByTestId('setlog-tinta-kg-input');
    const minus = screen.getByTestId('setlog-tinta-kg-minus');
    const plus = screen.getByTestId('setlog-tinta-kg-plus');
    expect(input.compareDocumentPosition(minus) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const stepperRow = minus.parentElement;
    expect(stepperRow).toBe(plus.parentElement);
    expect(stepperRow?.contains(input)).toBe(false);
    expect((input as HTMLInputElement).value).toBe('186.5');
  });
});

describe('SetLogInput — A11Y HIGH chat5 editable mode aria attributes', () => {
  it('kg input has aria-required + required', () => {
    renderInput();
    const input = screen.getByTestId('kg-input');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAttribute('required');
  });

  it('reps input has aria-required + required', () => {
    renderInput();
    const input = screen.getByTestId('reps-input');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAttribute('required');
  });

  it('kg + reps NO aria-invalid pe valid props 22.5/10', () => {
    renderInput({ kg: 22.5, reps: 10 });
    expect(screen.getByTestId('kg-input')).not.toHaveAttribute('aria-invalid');
    expect(screen.getByTestId('reps-input')).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByTestId('kg-input-error')).not.toBeInTheDocument();
    expect(screen.queryByTestId('reps-input-error')).not.toBeInTheDocument();
  });

  it('kg input aria-invalid + error cand kg < 1 (0 default)', () => {
    renderInput({ kg: 0, reps: 10 });
    const input = screen.getByTestId('kg-input');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'kg-input-error');
    const err = screen.getByTestId('kg-input-error');
    expect(err).toHaveAttribute('id', 'kg-input-error');
    expect(err).toHaveAttribute('role', 'alert');
    // Wave E1 — EN default error copy "Kg between 1 and 500."; RO opt-in keeps original.
    expect(err.textContent).toMatch(/Kg between 1 and 500/);
  });

  it('kg input aria-invalid cand kg > 500', () => {
    renderInput({ kg: 600, reps: 10 });
    expect(screen.getByTestId('kg-input')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByTestId('kg-input-error').textContent).toMatch(/1 and 500/);
  });

  it('reps input aria-invalid + error cand reps < 1', () => {
    renderInput({ kg: 22.5, reps: 0 });
    const input = screen.getByTestId('reps-input');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'reps-input-error');
    // Wave E1 — EN default error copy.
    expect(screen.getByTestId('reps-input-error').textContent).toMatch(/Reps between 1 and 100/);
  });

  it('reps input aria-invalid cand reps > 100', () => {
    renderInput({ kg: 22.5, reps: 150 });
    expect(screen.getByTestId('reps-input')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByTestId('reps-input-error').textContent).toMatch(/1 and 100/);
  });

  it('editable mode error text no diacritics', () => {
    const { container } = renderInput({ kg: 0, reps: 0 });
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });

  // Smoke 2026-05-28 #4 — "022" fix: 0 NU se afiseaza ca "0" lipit; user
  // poate sa scrie 22 direct fara sa stearga zero-ul.
  it('editable kg input cu prop 0 afiseaza placeholder gol (smoke #4)', () => {
    renderInput({ kg: 0, reps: 10 });
    expect((screen.getByTestId('kg-input') as HTMLInputElement).value).toBe('');
  });

  it('editable reps input cu prop 0 afiseaza placeholder gol (smoke #4)', () => {
    renderInput({ kg: 22.5, reps: 0 });
    expect((screen.getByTestId('reps-input') as HTMLInputElement).value).toBe('');
  });

  it('editable kg input stergere → emite 0 (NU NaN)', () => {
    const onKgChange = vi.fn();
    renderInput({ onKgChange });
    fireEvent.change(screen.getByTestId('kg-input'), { target: { value: '' } });
    expect(onKgChange).toHaveBeenCalledWith(0);
  });
});

// SELECT-ALL-ON-TAP + DECIMAL BUFFER (2026-06-07, Daniel live "aveam 90, vreau
// 95, se face 9590.0"): the fields used type="number" + onFocus .select(), but
// .select() is a NO-OP on type="number" in most browsers → tapping never
// selected-all → the first keystroke INSERTED into the old value. Fix:
// type="text" + inputMode (numeric keypad kept) so .select() works, + a local
// text buffer so an in-progress decimal ("9.") survives the parent re-render.

// Controlled harness mirroring the REAL parent (Workout.tsx owns kg/reps as
// NUMBERS). Lets us assert the buffer round-trips through the parent and that
// external setters (the ± steppers, target prefill) resync the field.
function ControlledSetLog({
  initialKg = 90,
  initialReps = 10,
  ...rest
}: { initialKg?: number; initialReps?: number } & Partial<Parameters<typeof SetLogInput>[0]>) {
  const [kg, setKg] = useState(initialKg);
  const [reps, setReps] = useState(initialReps);
  return (
    <>
      <SetLogInput kg={kg} reps={reps} onKgChange={setKg} onRepsChange={setReps} {...rest} />
      <span data-testid="probe-kg">{kg}</span>
      <span data-testid="probe-reps">{reps}</span>
      <button data-testid="ext-set-kg-186-5" onClick={() => setKg(186.5)}>
        ext kg
      </button>
    </>
  );
}

describe('SetLogInput — select-all-on-tap + decimal buffer (type="number" .select() fix)', () => {
  it('kg + reps inputs are type="text" (so .select() works) with the numeric inputMode kept', () => {
    renderInput();
    const kgInput = screen.getByTestId('kg-input') as HTMLInputElement;
    const repsInput = screen.getByTestId('reps-input') as HTMLInputElement;
    expect(kgInput.type).toBe('text');
    expect(repsInput.type).toBe('text');
    expect(kgInput).toHaveAttribute('inputmode', 'decimal');
    expect(repsInput).toHaveAttribute('inputmode', 'numeric');
  });

  it('tinta kg + reps inputs are type="text" with numeric inputMode kept', () => {
    renderInput({ mode: 'tinta', kg: 90, reps: 10 });
    const kgInput = screen.getByTestId('setlog-tinta-kg-input') as HTMLInputElement;
    const repsInput = screen.getByTestId('setlog-tinta-reps-input') as HTMLInputElement;
    expect(kgInput.type).toBe('text');
    expect(repsInput.type).toBe('text');
    expect(kgInput).toHaveAttribute('inputmode', 'decimal');
    expect(repsInput).toHaveAttribute('inputmode', 'numeric');
  });

  it('focus calls .select() on the kg field (select-all so first keystroke replaces)', () => {
    renderInput({ kg: 90 });
    const kgInput = screen.getByTestId('kg-input') as HTMLInputElement;
    const selectSpy = vi.spyOn(kgInput, 'select');
    fireEvent.focus(kgInput);
    expect(selectSpy).toHaveBeenCalledTimes(1);
  });

  it('value shown at 90 → typing "95" yields 95 (NOT 9590 — the bug)', () => {
    // The browser select-all-on-focus means the keystrokes replace the whole
    // value; jsdom delivers that as a change whose target.value is the
    // post-replacement string "95". The buffer must take it verbatim → 95.
    render(<ControlledSetLog initialKg={90} />);
    const kgInput = screen.getByTestId('kg-input') as HTMLInputElement;
    expect(kgInput.value).toBe('90');
    fireEvent.focus(kgInput);
    fireEvent.change(kgInput, { target: { value: '95' } });
    expect(kgInput.value).toBe('95');
    expect(screen.getByTestId('probe-kg')).toHaveTextContent('95');
  });

  it('typing "9.5" preserves the decimal (not stripped on re-render) and yields 9.5', () => {
    render(<ControlledSetLog initialKg={90} />);
    const kgInput = screen.getByTestId('kg-input') as HTMLInputElement;
    fireEvent.focus(kgInput);
    // Mid-typing: the trailing "." must survive the parent re-render (the naive
    // controlled value={String(kg)} stripped it so you could never type "9.5").
    fireEvent.change(kgInput, { target: { value: '9' } });
    fireEvent.change(kgInput, { target: { value: '9.' } });
    expect(kgInput.value).toBe('9.');
    fireEvent.change(kgInput, { target: { value: '9.5' } });
    expect(kgInput.value).toBe('9.5');
    expect(screen.getByTestId('probe-kg')).toHaveTextContent('9.5');
  });

  it('typing a real plate weight 186.5 round-trips through the parent verbatim', () => {
    render(<ControlledSetLog initialKg={90} />);
    const kgInput = screen.getByTestId('kg-input') as HTMLInputElement;
    fireEvent.focus(kgInput);
    fireEvent.change(kgInput, { target: { value: '186.5' } });
    expect(kgInput.value).toBe('186.5');
    expect(screen.getByTestId('probe-kg')).toHaveTextContent('186.5');
  });

  it('kg sanitizes letters + a second decimal point out (first dot wins)', () => {
    render(<ControlledSetLog initialKg={90} />);
    const kgInput = screen.getByTestId('kg-input') as HTMLInputElement;
    fireEvent.focus(kgInput);
    fireEvent.change(kgInput, { target: { value: '1a2.3.4' } });
    expect(kgInput.value).toBe('12.34');
  });

  it('reps rejects a decimal point entirely (whole numbers only)', () => {
    render(<ControlledSetLog initialReps={10} />);
    const repsInput = screen.getByTestId('reps-input') as HTMLInputElement;
    fireEvent.focus(repsInput);
    fireEvent.change(repsInput, { target: { value: '12.5' } });
    expect(repsInput.value).toBe('125');
    expect(screen.getByTestId('probe-reps')).toHaveTextContent('125');
  });

  it('the ± stepper resyncs the buffer (external change overwrites the field)', () => {
    render(<ControlledSetLog initialKg={90} />);
    const kgInput = screen.getByTestId('kg-input') as HTMLInputElement;
    fireEvent.click(screen.getByTestId('kg-plus'));
    // 90 + 0.5 → 90.5, and the field reflects the parent's new value.
    expect(screen.getByTestId('probe-kg')).toHaveTextContent('90.5');
    expect(kgInput.value).toBe('90.5');
    fireEvent.click(screen.getByTestId('kg-minus'));
    expect(kgInput.value).toBe('90');
  });

  it('an external prefill (target change) resyncs the buffer to the new value', () => {
    render(<ControlledSetLog initialKg={90} />);
    const kgInput = screen.getByTestId('kg-input') as HTMLInputElement;
    fireEvent.click(screen.getByTestId('ext-set-kg-186-5'));
    expect(kgInput.value).toBe('186.5');
  });

  it('clearing the field emits 0 and shows empty (smoke #4 "022" fix preserved)', () => {
    render(<ControlledSetLog initialKg={90} />);
    const kgInput = screen.getByTestId('kg-input') as HTMLInputElement;
    fireEvent.focus(kgInput);
    fireEvent.change(kgInput, { target: { value: '' } });
    expect(kgInput.value).toBe('');
    expect(screen.getByTestId('probe-kg')).toHaveTextContent('0');
  });
});
