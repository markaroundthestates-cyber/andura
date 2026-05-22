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
    const kgLabel = screen.getByText('Kg');
    const repsLabel = screen.getByText('Reps');
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

  it('hides editable inputs in tinta mode', () => {
    renderInput({ mode: 'tinta' });
    expect(screen.queryByTestId('kg-input')).not.toBeInTheDocument();
    expect(screen.queryByTestId('reps-input')).not.toBeInTheDocument();
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

  it('renders "Logheaza setul" CTA button', () => {
    renderInput({ mode: 'tinta' });
    const btn = screen.getByTestId('setlog-tinta-log-btn');
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent('Logheaza setul');
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
