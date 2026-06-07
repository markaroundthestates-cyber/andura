// ══ LOG WEIGHT TESTS — task_16 §A mockup verbatim + persist ══════════════

import type { JSX } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LogWeight } from '../../../routes/screens/progres/LogWeight';
import { useProgresStore } from '../../../stores/progresStore';
import { setLocale, _resetI18nCache } from '../../../../i18n/index.js';

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderLogWeight() {
  return render(
    <MemoryRouter initialEntries={['/app/progres/log-weight']}>
      <Routes>
        <Route path="/app/progres/log-weight" element={<LogWeight />} />
        <Route path="/app/progres" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  // Wave E2 i18n wire — pin RO locale so the existing mockup-verbatim RO
  // assertions ("Logheaza greutate", "Greutate (kg)", "Salveaza", "Anuleaza",
  // "Inregistrarea este salvata local") remain stable. EN parity covered by
  // i18nNoRoLeak contract test.
  localStorage.clear();
  useProgresStore.setState({ weightLog: [], bodyData: [] });
  _resetI18nCache();
  setLocale('ro');
});

describe('LogWeight — render', () => {
  it('renders heading + mockup verbatim copy', () => {
    renderLogWeight();
    expect(
      screen.getByRole('heading', { name: /Logheaza greutate/i, level: 1 })
    ).toBeInTheDocument();
    expect(screen.getByText(/Greutate \(kg\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Inregistrarea este salvata local/i)).toBeInTheDocument();
  });

  it('renders kg input as type=text + inputMode=decimal (select-all-on-tap fix)', () => {
    // 2026-06-07 select-all-on-tap fix: type="number" .select() is a no-op, so
    // the field is now type="text" + inputMode="decimal" (numeric keypad kept).
    // The 30-250 range moved from HTML min/max to JS validation (kgError/valid).
    renderLogWeight();
    const kgInput = screen.getByTestId('weight-kg-input');
    expect(kgInput).toHaveAttribute('type', 'text');
    expect(kgInput).toHaveAttribute('inputmode', 'decimal');
    expect(kgInput).toHaveAttribute('placeholder', 'ex. 78.5');
  });

  it('renders date input defaulting today YYYY-MM-DD', () => {
    renderLogWeight();
    const dateInput = screen.getByTestId('weight-date-input') as HTMLInputElement;
    expect(dateInput.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  // U-15 — date input max=azi (anti data viitoare).
  it('date input has max attribute equal to today (blocks future dates)', () => {
    renderLogWeight();
    const dateInput = screen.getByTestId('weight-date-input') as HTMLInputElement;
    expect(dateInput).toHaveAttribute('max');
    expect(dateInput.getAttribute('max')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(dateInput.getAttribute('max')).toBe(dateInput.value);
  });

  it('renders Salveaza + Anuleaza buttons', () => {
    renderLogWeight();
    expect(screen.getByTestId('weight-save')).toBeInTheDocument();
    expect(screen.getByTestId('weight-cancel')).toBeInTheDocument();
  });
});

describe('LogWeight — validation', () => {
  it('Save disabled when kg empty', () => {
    renderLogWeight();
    expect(screen.getByTestId('weight-save')).toBeDisabled();
  });

  it('Save disabled when kg < 30 (below mockup min)', () => {
    renderLogWeight();
    fireEvent.change(screen.getByTestId('weight-kg-input'), { target: { value: '20' } });
    expect(screen.getByTestId('weight-save')).toBeDisabled();
  });

  it('Save disabled when kg > 250 (above mockup max)', () => {
    renderLogWeight();
    fireEvent.change(screen.getByTestId('weight-kg-input'), { target: { value: '300' } });
    expect(screen.getByTestId('weight-save')).toBeDisabled();
  });

  it('Save enabled when kg in range 30-250', () => {
    renderLogWeight();
    fireEvent.change(screen.getByTestId('weight-kg-input'), { target: { value: '78.5' } });
    expect(screen.getByTestId('weight-save')).not.toBeDisabled();
  });
});

describe('LogWeight — persist', () => {
  it('Save adds entry to progresStore.weightLog', () => {
    renderLogWeight();
    fireEvent.change(screen.getByTestId('weight-kg-input'), { target: { value: '78.5' } });
    fireEvent.click(screen.getByTestId('weight-save'));
    const log = useProgresStore.getState().weightLog;
    expect(log).toHaveLength(1);
    expect(log[0]!.kg).toBe(78.5);
    expect(log[0]!.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(typeof log[0]!.ts).toBe('number');
  });

  it('Save navigates back to /app/progres', () => {
    renderLogWeight();
    fireEvent.change(screen.getByTestId('weight-kg-input'), { target: { value: '80' } });
    fireEvent.click(screen.getByTestId('weight-save'));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/progres');
  });

  it('Cancel navigates back fara persist', () => {
    renderLogWeight();
    fireEvent.change(screen.getByTestId('weight-kg-input'), { target: { value: '80' } });
    fireEvent.click(screen.getByTestId('weight-cancel'));
    expect(useProgresStore.getState().weightLog).toHaveLength(0);
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/progres');
  });

  it('Back button (arrow) navigates back', () => {
    renderLogWeight();
    fireEvent.click(screen.getByTestId('log-weight-back'));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/progres');
  });
});

describe('LogWeight — U-10 upsert by date (no duplicate day rows)', () => {
  it('re-log same date overwrites entry (single row, latest kg)', () => {
    useProgresStore.getState().addWeightEntry({ kg: 80, date: '2026-05-25' });
    useProgresStore.getState().addWeightEntry({ kg: 79.5, date: '2026-05-25' });
    const log = useProgresStore.getState().weightLog;
    expect(log).toHaveLength(1);
    expect(log[0]!.kg).toBe(79.5);
    expect(log[0]!.date).toBe('2026-05-25');
  });

  it('different dates append as separate rows', () => {
    useProgresStore.getState().addWeightEntry({ kg: 80, date: '2026-05-24' });
    useProgresStore.getState().addWeightEntry({ kg: 79.5, date: '2026-05-25' });
    const log = useProgresStore.getState().weightLog;
    expect(log).toHaveLength(2);
    expect(log.map((e) => e.date)).toEqual(['2026-05-24', '2026-05-25']);
  });

  it('UI save twice same day yields one entry', () => {
    renderLogWeight();
    fireEvent.change(screen.getByTestId('weight-kg-input'), { target: { value: '78.5' } });
    fireEvent.click(screen.getByTestId('weight-save'));
    // second log same default date (today)
    useProgresStore.getState().addWeightEntry({
      kg: 77,
      date: useProgresStore.getState().weightLog[0]!.date,
    });
    expect(useProgresStore.getState().weightLog).toHaveLength(1);
    expect(useProgresStore.getState().weightLog[0]!.kg).toBe(77);
  });
});

describe('LogWeight — D-LEGACY-064 no-diacritics', () => {
  it('no diacritics in UI rendered text', () => {
    const { container } = renderLogWeight();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});

describe('LogWeight — A11Y HIGH chat5 form aria attributes', () => {
  it('kg input has aria-required + required attr', () => {
    renderLogWeight();
    const input = screen.getByTestId('weight-kg-input');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAttribute('required');
  });

  it('date input has aria-required + required attr', () => {
    renderLogWeight();
    const input = screen.getByTestId('weight-date-input');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAttribute('required');
  });

  it('kg input NO aria-invalid pe initial empty state', () => {
    renderLogWeight();
    const input = screen.getByTestId('weight-kg-input');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAttribute('aria-describedby');
    expect(screen.queryByTestId('weight-kg-error')).not.toBeInTheDocument();
  });

  it('kg input NO aria-invalid pe valid value 78.5', () => {
    renderLogWeight();
    const input = screen.getByTestId('weight-kg-input');
    fireEvent.change(input, { target: { value: '78.5' } });
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByTestId('weight-kg-error')).not.toBeInTheDocument();
  });

  it('kg input aria-invalid + aria-describedby + error mesaj cand kg < 30', () => {
    renderLogWeight();
    const input = screen.getByTestId('weight-kg-input');
    fireEvent.change(input, { target: { value: '20' } });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'weight-kg-error');
    const err = screen.getByTestId('weight-kg-error');
    expect(err).toHaveAttribute('id', 'weight-kg-error');
    expect(err).toHaveAttribute('role', 'alert');
    expect(err.textContent).toMatch(/Kg intre 30 si 250/);
  });

  it('kg input aria-invalid cand kg > 250', () => {
    renderLogWeight();
    const input = screen.getByTestId('weight-kg-input');
    fireEvent.change(input, { target: { value: '300' } });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByTestId('weight-kg-error').textContent).toMatch(/30 si 250/);
  });
});

// SELECT-ALL-ON-TAP + decimal-safe (2026-06-07, same fix as the set-log inputs):
// type="number" .select() is a no-op so tapping never selected-all → the first
// keystroke INSERTED into the prefilled value. type="text" + inputMode="decimal"
// keeps the numeric keypad AND makes onFocus .select() work.
describe('LogWeight — select-all-on-tap weigh-in input', () => {
  it('focus selects-all so the first keystroke replaces the whole value', () => {
    renderLogWeight();
    const input = screen.getByTestId('weight-kg-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '90' } });
    const selectSpy = vi.spyOn(input, 'select');
    fireEvent.focus(input);
    expect(selectSpy).toHaveBeenCalledTimes(1);
  });

  it('showing 90, tap + type 95 → 95 (not 9590)', () => {
    renderLogWeight();
    const input = screen.getByTestId('weight-kg-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '90' } });
    expect(input.value).toBe('90');
    fireEvent.focus(input);
    // select-all means the keystrokes replace the value → jsdom delivers "95".
    fireEvent.change(input, { target: { value: '95' } });
    expect(input.value).toBe('95');
  });

  it('one decimal (90.5) is preserved + saved verbatim', () => {
    renderLogWeight();
    const input = screen.getByTestId('weight-kg-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '90.5' } });
    expect(input.value).toBe('90.5');
    fireEvent.click(screen.getByTestId('weight-save'));
    expect(useProgresStore.getState().weightLog[0]!.kg).toBe(90.5);
  });

  it('letters are sanitized out (digits + one decimal only)', () => {
    renderLogWeight();
    const input = screen.getByTestId('weight-kg-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '7a8.5.5' } });
    expect(input.value).toBe('78.55');
  });
});
