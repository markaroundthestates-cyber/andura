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
    const kgLabel = screen.getByText('kg *');
    const repsLabel = screen.getByText('Repetari *');
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

  it('renders "Tinta" kicker label', () => {
    renderInput({ mode: 'tinta' });
    expect(screen.getByTestId('setlog-tinta')).toHaveTextContent('Tinta');
  });

  it('renders "repetari" sep label', () => {
    renderInput({ mode: 'tinta' });
    expect(screen.getByTestId('setlog-tinta')).toHaveTextContent('repetari');
  });

  it('renders "Confirma setul" CTA button (smoke #4: confirmare obligatorie)', () => {
    renderInput({ mode: 'tinta' });
    const btn = screen.getByTestId('setlog-tinta-log-btn');
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent('Confirma setul');
  });

  it('renders "Cate ai facut?" label deasupra inputs (smoke #4)', () => {
    renderInput({ mode: 'tinta' });
    expect(screen.getByTestId('setlog-tinta')).toHaveTextContent('Cate ai facut?');
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

  it('renders "Tu ai facut" kicker label', () => {
    renderInput({ mode: 'post-log' });
    expect(screen.getByTestId('setlog-postlog')).toHaveTextContent('Tu ai facut');
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

  it('pencil aria-label "Editeaza" present', () => {
    renderInput({ mode: 'post-log' });
    expect(screen.getByTestId('setlog-postlog-edit')).toHaveAttribute('aria-label', 'Editeaza');
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
    expect(err.textContent).toMatch(/Kg intre 1 si 500/);
  });

  it('kg input aria-invalid cand kg > 500', () => {
    renderInput({ kg: 600, reps: 10 });
    expect(screen.getByTestId('kg-input')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByTestId('kg-input-error').textContent).toMatch(/1 si 500/);
  });

  it('reps input aria-invalid + error cand reps < 1', () => {
    renderInput({ kg: 22.5, reps: 0 });
    const input = screen.getByTestId('reps-input');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'reps-input-error');
    expect(screen.getByTestId('reps-input-error').textContent).toMatch(/Repetari intre 1 si 100/);
  });

  it('reps input aria-invalid cand reps > 100', () => {
    renderInput({ kg: 22.5, reps: 150 });
    expect(screen.getByTestId('reps-input')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByTestId('reps-input-error').textContent).toMatch(/1 si 100/);
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
