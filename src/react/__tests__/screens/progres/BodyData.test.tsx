// ══ BODY DATA TESTS — task_16 §B measurements partial entry + persist ════
// Smoke 2026-05-28 bounds realiste per camp (biceps 25-60, talie 50-200, etc.)
// supersede vechea banda comuna 20-250 cm care accepta biceps 250cm absurd.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { BodyData } from '../../../routes/screens/progres/BodyData';
import { useProgresStore } from '../../../stores/progresStore';
import { setLocale, _resetI18nCache } from '../../../../i18n/index.js';

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderBodyData() {
  return render(
    <MemoryRouter initialEntries={['/app/progres/body-data']}>
      <Routes>
        <Route path="/app/progres/body-data" element={<BodyData />} />
        <Route path="/app/progres" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  // Wave E2 i18n wire — pin RO so existing mockup-verbatim RO assertions
  // ("Masuratori corp", "Talie", "Gat", "Salveaza", "Anuleaza", per-field
  // range error) remain stable. EN parity covered by i18nNoRoLeak.
  localStorage.clear();
  useProgresStore.setState({ weightLog: [], bodyData: [] });
  _resetI18nCache();
  setLocale('ro');
});

describe('BodyData — render', () => {
  it('renders heading "Masuratori corp"', () => {
    renderBodyData();
    expect(
      screen.getByRole('heading', { name: /Masuratori corp/i, level: 1 })
    ).toBeInTheDocument();
  });

  it('renders 6 measurement fields + 1 date field', () => {
    renderBodyData();
    expect(screen.getByTestId('bd-waistCm')).toBeInTheDocument();
    expect(screen.getByTestId('bd-neckCm')).toBeInTheDocument();
    expect(screen.getByTestId('bd-chestCm')).toBeInTheDocument();
    expect(screen.getByTestId('bd-hipsCm')).toBeInTheDocument();
    expect(screen.getByTestId('bd-bicepsCm')).toBeInTheDocument();
    expect(screen.getByTestId('bd-thighCm')).toBeInTheDocument();
    expect(screen.getByTestId('bd-date-input')).toBeInTheDocument();
  });

  it('renders Salveaza + Anuleaza buttons', () => {
    renderBodyData();
    expect(screen.getByTestId('body-data-save')).toBeInTheDocument();
    expect(screen.getByTestId('body-data-cancel')).toBeInTheDocument();
  });

  // U-15 — date input max=azi (anti data viitoare).
  it('date input has max attribute equal to today (blocks future dates)', () => {
    renderBodyData();
    const dateInput = screen.getByTestId('bd-date-input') as HTMLInputElement;
    expect(dateInput).toHaveAttribute('max');
    expect(dateInput.getAttribute('max')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(dateInput.getAttribute('max')).toBe(dateInput.value);
  });

  it('Save disabled cand no field filled (zero entries)', () => {
    renderBodyData();
    expect(screen.getByTestId('body-data-save')).toBeDisabled();
  });
});

describe('BodyData — partial entry support', () => {
  it('Save enabled cand at least 1 field filled', () => {
    renderBodyData();
    fireEvent.change(screen.getByTestId('bd-waistCm'), { target: { value: '85' } });
    expect(screen.getByTestId('body-data-save')).not.toBeDisabled();
  });

  it('persist partial entry — only filled fields stored', () => {
    renderBodyData();
    fireEvent.change(screen.getByTestId('bd-waistCm'), { target: { value: '85' } });
    fireEvent.change(screen.getByTestId('bd-bicepsCm'), { target: { value: '35' } });
    fireEvent.click(screen.getByTestId('body-data-save'));
    const data = useProgresStore.getState().bodyData;
    expect(data).toHaveLength(1);
    expect(data[0]!.waistCm).toBe(85);
    expect(data[0]!.bicepsCm).toBe(35);
    expect(data[0]!.chestCm).toBeUndefined();
    expect(data[0]!.hipsCm).toBeUndefined();
    expect(data[0]!.thighCm).toBeUndefined();
    expect(data[0]!.neckCm).toBeUndefined();
  });

  it('Save navigates back to /app/progres', () => {
    renderBodyData();
    fireEvent.change(screen.getByTestId('bd-waistCm'), { target: { value: '85' } });
    fireEvent.click(screen.getByTestId('body-data-save'));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/progres');
  });
});

describe('BodyData — full entry', () => {
  it('persist all 6 fields cand toate filled (inclusiv gat)', () => {
    renderBodyData();
    fireEvent.change(screen.getByTestId('bd-waistCm'), { target: { value: '85' } });
    fireEvent.change(screen.getByTestId('bd-neckCm'), { target: { value: '38' } });
    fireEvent.change(screen.getByTestId('bd-chestCm'), { target: { value: '102' } });
    fireEvent.change(screen.getByTestId('bd-hipsCm'), { target: { value: '95' } });
    fireEvent.change(screen.getByTestId('bd-bicepsCm'), { target: { value: '35' } });
    fireEvent.change(screen.getByTestId('bd-thighCm'), { target: { value: '58' } });
    fireEvent.click(screen.getByTestId('body-data-save'));
    const data = useProgresStore.getState().bodyData[0]!;
    expect(data.waistCm).toBe(85);
    expect(data.neckCm).toBe(38);
    expect(data.chestCm).toBe(102);
    expect(data.hipsCm).toBe(95);
    expect(data.bicepsCm).toBe(35);
    expect(data.thighCm).toBe(58);
  });
});

describe('BodyData — D-LEGACY-064 no-diacritics', () => {
  it('no diacritics in UI rendered text', () => {
    const { container } = renderBodyData();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});

describe('BodyData — A11Y HIGH chat5 form aria attributes', () => {
  it('measurement fields NO aria-invalid pe initial empty (partial-entry-OK)', () => {
    renderBodyData();
    expect(screen.getByTestId('bd-waistCm')).not.toHaveAttribute('aria-invalid');
    expect(screen.getByTestId('bd-chestCm')).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByTestId('bd-waistCm-error')).not.toBeInTheDocument();
  });

  it('measurement field NO aria-invalid pe valid value', () => {
    renderBodyData();
    fireEvent.change(screen.getByTestId('bd-waistCm'), { target: { value: '85' } });
    expect(screen.getByTestId('bd-waistCm')).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByTestId('bd-waistCm-error')).not.toBeInTheDocument();
  });

  it('talie out-of-range (sub 50) → aria-invalid + eroare banda 50-200', () => {
    renderBodyData();
    fireEvent.change(screen.getByTestId('bd-waistCm'), { target: { value: '40' } });
    const input = screen.getByTestId('bd-waistCm');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'bd-waistCm-error');
    const err = screen.getByTestId('bd-waistCm-error');
    expect(err).toHaveAttribute('id', 'bd-waistCm-error');
    expect(err).toHaveAttribute('role', 'alert');
    expect(err.textContent).toMatch(/50-200/);
  });
});

describe('BodyData — bounds realiste per camp (smoke 2026-05-28)', () => {
  it('biceps 250cm absurd respins (banda 20-60)', () => {
    renderBodyData();
    fireEvent.change(screen.getByTestId('bd-bicepsCm'), { target: { value: '250' } });
    const err = screen.getByTestId('bd-bicepsCm-error');
    expect(err.textContent).toMatch(/20-60/);
    expect(screen.getByTestId('bd-bicepsCm')).toHaveAttribute('aria-invalid', 'true');
  });

  it('biceps in banda (35) acceptat', () => {
    renderBodyData();
    fireEvent.change(screen.getByTestId('bd-bicepsCm'), { target: { value: '35' } });
    expect(screen.getByTestId('bd-bicepsCm')).not.toHaveAttribute('aria-invalid');
  });

  it('gat 100cm absurd respins (banda 25-60)', () => {
    renderBodyData();
    fireEvent.change(screen.getByTestId('bd-neckCm'), { target: { value: '100' } });
    const err = screen.getByTestId('bd-neckCm-error');
    expect(err.textContent).toMatch(/25-60/);
  });

  it('coapsa 200cm absurd respins (banda 30-90)', () => {
    renderBodyData();
    fireEvent.change(screen.getByTestId('bd-thighCm'), { target: { value: '200' } });
    const err = screen.getByTestId('bd-thighCm-error');
    expect(err.textContent).toMatch(/30-90/);
  });

  it('piept 300cm respins (banda 60-150)', () => {
    renderBodyData();
    fireEvent.change(screen.getByTestId('bd-chestCm'), { target: { value: '300' } });
    expect(screen.getByTestId('bd-chestCm-error').textContent).toMatch(/60-150/);
  });

  it('save disabled cand orice camp out-of-range', () => {
    renderBodyData();
    // un camp valid + un camp invalid → save disabled (NU corupem store-ul cu mix)
    fireEvent.change(screen.getByTestId('bd-waistCm'), { target: { value: '85' } });
    fireEvent.change(screen.getByTestId('bd-bicepsCm'), { target: { value: '250' } });
    expect(screen.getByTestId('body-data-save')).toBeDisabled();
  });

  it('save NU persista campul out-of-range (defense)', () => {
    renderBodyData();
    fireEvent.change(screen.getByTestId('bd-waistCm'), { target: { value: '85' } });
    // bypass disabled check via direct invocation (click pe disabled = no-op),
    // dar daca cumva save trece, campul out-of-range NU se persista.
    fireEvent.change(screen.getByTestId('bd-bicepsCm'), { target: { value: '5' } });
    fireEvent.click(screen.getByTestId('body-data-save'));
    const data = useProgresStore.getState().bodyData;
    // disabled blocks save → 0 intrari
    expect(data).toHaveLength(0);
  });
});
