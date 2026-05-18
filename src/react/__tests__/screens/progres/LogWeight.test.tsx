// ══ LOG WEIGHT TESTS — task_16 §A mockup verbatim + persist ══════════════

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LogWeight } from '../../../routes/screens/progres/LogWeight';
import { useProgresStore } from '../../../stores/progresStore';

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
  useProgresStore.setState({ weightLog: [], bodyData: [] });
  localStorage.clear();
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

  it('renders kg input cu placeholder + step + min/max attributes', () => {
    renderLogWeight();
    const kgInput = screen.getByTestId('weight-kg-input');
    expect(kgInput).toHaveAttribute('type', 'number');
    expect(kgInput).toHaveAttribute('placeholder', 'ex. 78.5');
    expect(kgInput).toHaveAttribute('step', '0.1');
    expect(kgInput).toHaveAttribute('min', '30');
    expect(kgInput).toHaveAttribute('max', '250');
  });

  it('renders date input defaulting today YYYY-MM-DD', () => {
    renderLogWeight();
    const dateInput = screen.getByTestId('weight-date-input') as HTMLInputElement;
    expect(dateInput.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
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

  it('Save enabled when kg în range 30-250', () => {
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

  it('Cancel navigates back fără persist', () => {
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

describe('LogWeight — D-LEGACY-064 no-diacritics', () => {
  it('no diacritics in UI rendered text', () => {
    const { container } = renderLogWeight();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
