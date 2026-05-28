// §obiectiv-tinta 2026-05-28 — ObiectivCard regression coverage.
// Daniel relocate "tot ce e la Obiectiv pe toate themes trebuie mutat la
// progres undeva" — Tinte personale moved from Cont > Profil si tinte
// (ephemeral local state) to Progres tab > ObiectivCard (persisted).

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ObiectivCard } from '../../../components/Progres/ObiectivCard';
import { useProgresStore } from '../../../stores/progresStore';
import { useOnboardingStore } from '../../../stores/onboardingStore';

function renderCard() {
  return render(
    <MemoryRouter>
      <ObiectivCard />
    </MemoryRouter>
  );
}

beforeEach(() => {
  useProgresStore.getState().reset();
  useOnboardingStore.setState({
    data: {
      age: 31,
      sex: 'm',
      goal: 'masa',
      frequency: '4',
      experience: 'intermediar',
      weight: 81,
      height: 175,
    },
    completed: true,
    completedAt: Date.now(),
  });
});

describe('ObiectivCard — render + interactions', () => {
  it('renders heading "Obiectiv"', () => {
    renderCard();
    expect(screen.getByText('Obiectiv')).toBeInTheDocument();
  });

  it('renders greutate tinta + pana in inputs', () => {
    renderCard();
    expect(screen.getByTestId('obiectiv-target-weight-input')).toBeInTheDocument();
    expect(screen.getByTestId('obiectiv-target-month-input')).toBeInTheDocument();
  });

  it('ETA + avertisment ascunse pana la introducerea greutatii tinta', () => {
    renderCard();
    expect(screen.queryByTestId('obiectiv-eta')).toBeNull();
    expect(screen.queryByTestId('obiectiv-warning')).toBeNull();
  });

  it('greutate tinta change persists to progresStore', () => {
    renderCard();
    fireEvent.change(screen.getByTestId('obiectiv-target-weight-input'), { target: { value: '75' } });
    expect(useProgresStore.getState().targetObiectiv.weightKg).toBe(75);
  });

  it('pana in change persists to progresStore', () => {
    renderCard();
    fireEvent.change(screen.getByTestId('obiectiv-target-month-input'), { target: { value: '2026-09' } });
    expect(useProgresStore.getState().targetObiectiv.month).toBe('2026-09');
  });

  it('cleared greutate tinta (empty) sets store back to null', () => {
    useProgresStore.getState().setTargetObiectiv({ weightKg: 75 });
    renderCard();
    fireEvent.change(screen.getByTestId('obiectiv-target-weight-input'), { target: { value: '' } });
    expect(useProgresStore.getState().targetObiectiv.weightKg).toBeNull();
  });
});

describe('ObiectivCard — ETA wiring (BUG #8 safe-rate)', () => {
  it('ETA realista la ritm sanatos — 81 -> 75 kg = -6kg / 0.5 = 12 sapt ≈ ~3 luni', () => {
    renderCard();
    fireEvent.change(screen.getByTestId('obiectiv-target-weight-input'), { target: { value: '75' } });
    expect(screen.getByTestId('obiectiv-eta').textContent).toMatch(/~3 luni la un ritm sanatos/);
  });

  it('ETA in saptamani pentru tinta apropiata (<8 sapt)', () => {
    renderCard();
    fireEvent.change(screen.getByTestId('obiectiv-target-weight-input'), { target: { value: '78' } });
    expect(screen.getByTestId('obiectiv-eta').textContent).toMatch(/~6 saptamani la un ritm sanatos/);
  });

  it('BUG #8 — tinta agresiva da orizont lung, NU "~1 luna"', () => {
    renderCard();
    fireEvent.change(screen.getByTestId('obiectiv-target-weight-input'), { target: { value: '60' } });
    const txt = screen.getByTestId('obiectiv-eta').textContent ?? '';
    expect(txt).toMatch(/~10 luni la un ritm sanatos/);
    expect(txt).not.toMatch(/~1 luna/);
  });

  it('BUG #8 — tinta subponderala (sub BMI 18.5) → avertisment + suprima ETA', () => {
    renderCard();
    fireEvent.change(screen.getByTestId('obiectiv-target-weight-input'), { target: { value: '31' } });
    const warn = screen.getByTestId('obiectiv-warning');
    expect(warn.textContent).toMatch(/Tinta e sub greutatea sanatoasa/);
    expect(warn.textContent).toMatch(/~56\.7 kg minim/);
    expect(warn.textContent).toMatch(/Alege o tinta sanatoasa/);
    expect(screen.queryByTestId('obiectiv-eta')).toBeNull();
  });

  it('tinta ~= greutatea curenta → "Esti deja la tinta"', () => {
    renderCard();
    fireEvent.change(screen.getByTestId('obiectiv-target-weight-input'), { target: { value: '81' } });
    expect(screen.getByTestId('obiectiv-at-target')).toBeInTheDocument();
  });

  it('greutate curenta from latest log overrides onboarding seed (cross-screen continuity)', () => {
    // 70 kg log > 81 kg onboarding seed (getCurrentWeightKg picks latest log).
    useProgresStore.getState().addWeightEntry({ kg: 70, date: '2026-05-27' });
    renderCard();
    // From 70 to 75 = +5 kg / 0.25 (gain) = 20 sapt ≈ ~5 luni.
    fireEvent.change(screen.getByTestId('obiectiv-target-weight-input'), { target: { value: '75' } });
    expect(screen.getByTestId('obiectiv-eta').textContent).toMatch(/~5 luni/);
  });
});

describe('ObiectivCard — persistence round-trip (store hydrate)', () => {
  it('renders persisted target on mount', () => {
    useProgresStore.getState().setTargetObiectiv({ weightKg: 75, month: '2026-09' });
    renderCard();
    expect((screen.getByTestId('obiectiv-target-weight-input') as HTMLInputElement).value).toBe('75');
    expect((screen.getByTestId('obiectiv-target-month-input') as HTMLInputElement).value).toBe('2026-09');
  });
});

describe('ObiectivCard — RO no-diacritics rule (D-LEGACY-064)', () => {
  it('no diacritics in user-facing copy', () => {
    useProgresStore.getState().setTargetObiectiv({ weightKg: 31 });
    renderCard();
    const text = document.body.textContent ?? '';
    // ASCII-only check on Romanian letters with diacritics.
    expect(text).not.toMatch(/[ăâîșțĂÂÎȘȚ]/);
  });
});
