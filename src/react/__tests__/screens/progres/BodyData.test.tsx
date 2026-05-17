// ══ BODY DATA TESTS — task_16 §B measurements partial entry + persist ════

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { BodyData } from '../../../routes/screens/progres/BodyData';
import { useProgresStore } from '../../../stores/progresStore';

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
  useProgresStore.setState({ weightLog: [], bodyData: [] });
  localStorage.clear();
});

describe('BodyData — render', () => {
  it('renders heading "Masuratori corp"', () => {
    renderBodyData();
    expect(
      screen.getByRole('heading', { name: /Masuratori corp/i, level: 1 })
    ).toBeInTheDocument();
  });

  it('renders 5 measurement fields + 1 date field', () => {
    renderBodyData();
    expect(screen.getByTestId('bd-waistCm')).toBeInTheDocument();
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
    expect(data[0].waistCm).toBe(85);
    expect(data[0].bicepsCm).toBe(35);
    expect(data[0].chestCm).toBeUndefined();
    expect(data[0].hipsCm).toBeUndefined();
    expect(data[0].thighCm).toBeUndefined();
  });

  it('Save navigates back to /app/progres', () => {
    renderBodyData();
    fireEvent.change(screen.getByTestId('bd-waistCm'), { target: { value: '85' } });
    fireEvent.click(screen.getByTestId('body-data-save'));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/progres');
  });
});

describe('BodyData — full entry', () => {
  it('persist all 5 fields cand toate filled', () => {
    renderBodyData();
    fireEvent.change(screen.getByTestId('bd-waistCm'), { target: { value: '85' } });
    fireEvent.change(screen.getByTestId('bd-chestCm'), { target: { value: '102' } });
    fireEvent.change(screen.getByTestId('bd-hipsCm'), { target: { value: '95' } });
    fireEvent.change(screen.getByTestId('bd-bicepsCm'), { target: { value: '35' } });
    fireEvent.change(screen.getByTestId('bd-thighCm'), { target: { value: '58' } });
    fireEvent.click(screen.getByTestId('body-data-save'));
    const data = useProgresStore.getState().bodyData[0];
    expect(data.waistCm).toBe(85);
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
