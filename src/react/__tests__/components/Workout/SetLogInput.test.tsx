// SET LOG INPUT TESTS — §F-pass2-setloginput-01 + §F-pass2-setloginput-02
// state machine paradigm coverage (HIGH-DELTA 2026-05-22).
//
// Existing 'editable' default mode preserved verbatim (Workout.tsx existing
// callsite continues compile fara modificare). New 'tinta' pre-log + 'post-
// log' readonly modes covered + backward-compat baseline + a11y +
// no-diacritics.

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

  it('renders target kicker label (EN default "Target")', () => {
    renderInput({ mode: 'tinta' });
    expect(screen.getByTestId('setlog-tinta')).toHaveTextContent('Target');
  });

  it('renders "reps" sep label (EN default)', () => {
    renderInput({ mode: 'tinta' });
    expect(screen.getByTestId('setlog-tinta')).toHaveTextContent('reps');
  });

  it('renders confirm-set CTA button (EN default, smoke #4: confirmare obligatorie)', () => {
    renderInput({ mode: 'tinta' });
    const btn = screen.getByTestId('setlog-tinta-log-btn');
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent('Confirm set');
  });

  it('renders "How many did you do?" label deasupra inputs (EN default, smoke #4)', () => {
    renderInput({ mode: 'tinta' });
    expect(screen.getByTestId('setlog-tinta')).toHaveTextContent('How many did you do?');
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
