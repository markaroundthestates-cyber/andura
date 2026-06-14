// §obiectiv-tinta 2026-05-28 — ObiectivCard regression coverage.
// Daniel relocate "tot ce e la Obiectiv pe toate themes trebuie mutat la
// progres undeva" — Tinte personale moved from Cont > Profil si tinte
// (ephemeral local state) to Progres tab > ObiectivCard (persisted).

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ObiectivCard } from '../../../components/Progres/ObiectivCard';
import { useProgresStore } from '../../../stores/progresStore';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { setLocale, _resetI18nCache } from '../../../../i18n/index.js';
import * as flags from '../../../../util/featureFlags.js';

function renderCard() {
  return render(
    <MemoryRouter>
      <ObiectivCard />
    </MemoryRouter>
  );
}

beforeEach(() => {
  // §i18n 2026-05-28 — pin locale to RO for these assertions so the existing
  // RO-text matchers ("Obiectiv", "Tinta e sub greutatea sanatoasa", "~3 luni
  // la un ritm sanatos") remain stable. EN-locale parity is enforced
  // separately by the i18n bundle-integrity tests.
  _resetI18nCache();
  setLocale('ro');
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
  it('is labelled "Obiectiv" for assistive tech (no visible duplicate heading)', () => {
    // Fix A: the internal "Obiectiv" header was removed (the Progres zone
    // eyebrow already says it). The card keeps an accessible name via aria-label.
    renderCard();
    expect(screen.getByLabelText('Obiectiv')).toBeInTheDocument();
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

  it('pana in change persists full date (day-level) to progresStore', () => {
    // Daniel 2026-06-01 — deadline picker now <input type="date">; the user can
    // pick the DAY, not just month/year. The full YYYY-MM-DD is stored verbatim.
    renderCard();
    fireEvent.change(screen.getByTestId('obiectiv-target-month-input'), { target: { value: '2026-09-15' } });
    expect(useProgresStore.getState().targetObiectiv.month).toBe('2026-09-15');
  });

  it('cleared greutate tinta (empty) sets store back to null', () => {
    useProgresStore.getState().setTargetObiectiv({ weightKg: 75 });
    renderCard();
    fireEvent.change(screen.getByTestId('obiectiv-target-weight-input'), { target: { value: '' } });
    expect(useProgresStore.getState().targetObiectiv.weightKg).toBeNull();
  });
});

// SELECT-ALL-ON-TAP + decimal-safe (2026-06-07, same fix as the set-log kg/reps
// inputs): a type="number" .select() is a no-op so tapping never selected-all →
// the first keystroke INSERTED into the old value ("75"→"7580"). type="text" +
// inputMode="decimal" keeps the numeric keypad AND makes .select() work.
describe('ObiectivCard — select-all-on-tap target weight (type="number" fix)', () => {
  it('target weight input is type="text" + inputMode="decimal" (so .select() works)', () => {
    renderCard();
    const input = screen.getByTestId('obiectiv-target-weight-input') as HTMLInputElement;
    expect(input.type).toBe('text');
    expect(input).toHaveAttribute('inputmode', 'decimal');
  });

  it('focus selects-all so the first keystroke replaces the whole value', () => {
    useProgresStore.getState().setTargetObiectiv({ weightKg: 75 });
    renderCard();
    const input = screen.getByTestId('obiectiv-target-weight-input') as HTMLInputElement;
    const selectSpy = vi.spyOn(input, 'select');
    fireEvent.focus(input);
    expect(selectSpy).toHaveBeenCalledTimes(1);
  });

  it('showing 75, tap + type 80 → 80 (not 7580) in the field + store', () => {
    useProgresStore.getState().setTargetObiectiv({ weightKg: 75 });
    renderCard();
    const input = screen.getByTestId('obiectiv-target-weight-input') as HTMLInputElement;
    expect(input.value).toBe('75');
    fireEvent.focus(input);
    // select-all means the keystrokes replace the value → jsdom delivers "80".
    fireEvent.change(input, { target: { value: '80' } });
    expect(input.value).toBe('80');
    expect(useProgresStore.getState().targetObiectiv.weightKg).toBe(80);
  });

  it('one decimal (75.5) is preserved while typing + stored', () => {
    renderCard();
    const input = screen.getByTestId('obiectiv-target-weight-input') as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '75.' } });
    expect(input.value).toBe('75.');
    fireEvent.change(input, { target: { value: '75.5' } });
    expect(input.value).toBe('75.5');
    expect(useProgresStore.getState().targetObiectiv.weightKg).toBe(75.5);
  });

  it('letters + a second decimal point are sanitized out (first dot wins)', () => {
    renderCard();
    const input = screen.getByTestId('obiectiv-target-weight-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '7a5.5.5' } });
    expect(input.value).toBe('75.55');
  });
});

describe('ObiectivCard — ETA wiring (BUG #8 safe-rate)', () => {
  it('ETA realista la ritm sanatos — 81 -> 75 kg = -6kg / 0.5 = 12 sapt ≈ ~3 luni', () => {
    renderCard();
    fireEvent.change(screen.getByTestId('obiectiv-target-weight-input'), { target: { value: '75' } });
    // The projected date (etaByDate) now sits between the horizon and the suffix.
    expect(screen.getByTestId('obiectiv-eta').textContent).toMatch(/~3 luni.*la un ritm sanatos/);
  });

  it('ETA in saptamani pentru tinta apropiata (<8 sapt)', () => {
    renderCard();
    fireEvent.change(screen.getByTestId('obiectiv-target-weight-input'), { target: { value: '78' } });
    expect(screen.getByTestId('obiectiv-eta').textContent).toMatch(/~6 saptamani.*la un ritm sanatos/);
  });

  it('BUG #8 — tinta agresiva da orizont lung, NU "~1 luna"', () => {
    renderCard();
    fireEvent.change(screen.getByTestId('obiectiv-target-weight-input'), { target: { value: '60' } });
    const txt = screen.getByTestId('obiectiv-eta').textContent ?? '';
    expect(txt).toMatch(/~10 luni.*la un ritm sanatos/);
    expect(txt).not.toMatch(/~1 luna\b/);
  });

  it('BUG #8 — tinta subponderala (banda BMI 17-18.5) → avertisment + suprima ETA', () => {
    // 54kg/175cm → BMI 17.6 (sub 18.5 sanatos DAR peste floor-ul HARD 17 = 52.1kg)
    // → trece clamp-ul, persista, dar afiseaza warning subhealthy + suprima ETA.
    renderCard();
    fireEvent.change(screen.getByTestId('obiectiv-target-weight-input'), { target: { value: '54' } });
    const warn = screen.getByTestId('obiectiv-warning');
    expect(warn.textContent).toMatch(/Tinta e sub greutatea sanatoasa/);
    expect(warn.textContent).toMatch(/~56\.7 kg minim/);
    expect(warn.textContent).toMatch(/Alege o tinta sanatoasa/);
    expect(screen.queryByTestId('obiectiv-eta')).toBeNull();
  });

  it('§obiectiv-floor 2026-06-01 — tinta letala (sub BMI 17) → clamp la floor + warning + NU persista valoarea letala', () => {
    // 31kg/175cm → BMI 10.1, letal. Floor BMI 17 la 175cm = 17×1.75² = 52.1kg.
    // Clamp: store primeste 52.1 (NU 31), warning vizibil, valoarea letala respinsa.
    renderCard();
    fireEvent.change(screen.getByTestId('obiectiv-target-weight-input'), { target: { value: '31' } });
    expect(useProgresStore.getState().targetObiectiv.weightKg).toBe(52.1);
    const warn = screen.getByTestId('obiectiv-clamped-warning');
    expect(warn.textContent).toMatch(/31 kg e periculoasa/);
    expect(warn.textContent).toMatch(/52\.1 kg/);
  });

  it('§obiectiv-floor 2026-06-01 — tinta normala (peste floor) → persista intacta, fara clamp warning', () => {
    renderCard();
    fireEvent.change(screen.getByTestId('obiectiv-target-weight-input'), { target: { value: '75' } });
    expect(useProgresStore.getState().targetObiectiv.weightKg).toBe(75);
    expect(screen.queryByTestId('obiectiv-clamped-warning')).toBeNull();
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
  it('renders persisted full-date target on mount', () => {
    useProgresStore.getState().setTargetObiectiv({ weightKg: 75, month: '2026-09-15' });
    renderCard();
    expect((screen.getByTestId('obiectiv-target-weight-input') as HTMLInputElement).value).toBe('75');
    expect((screen.getByTestId('obiectiv-target-month-input') as HTMLInputElement).value).toBe('2026-09-15');
  });

  it('hydrates legacy month-only (YYYY-MM) deadline by defaulting to day 01', () => {
    // Pre-existing stored goals saved before the date picker landed only have
    // YYYY-MM. <input type="date"> needs a full date to render a value, so we
    // default the day to 01 for display (stored value untouched until edited).
    useProgresStore.getState().setTargetObiectiv({ weightKg: 75, month: '2026-09' });
    renderCard();
    expect((screen.getByTestId('obiectiv-target-month-input') as HTMLInputElement).value).toBe('2026-09-01');
  });
});

// #74 goal-realism push-back (dp_goal_realism_v1, default OFF).
describe('ObiectivCard — #74 goal-realism reframe (dp_goal_realism_v1)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    try { localStorage.removeItem('goalRealism-shown'); } catch { /* ignore */ }
  });

  it('flag OFF → NO reframe renders even on an unrealistic goal (byte-identical)', () => {
    // 81 -> 63 by a near deadline = ~2.5%/wk (unrealistic) — yet flag OFF = silent.
    // (default flipped ON 2026-06-14; pin OFF explicitly to keep the OFF path covered)
    vi.spyOn(flags, 'isEnabled').mockImplementation(() => false);
    useProgresStore.getState().setTargetObiectiv({ weightKg: 63, month: '2026-08-07' });
    renderCard();
    expect(screen.queryByTestId('goal-realism-reframe')).toBeNull();
  });

  it('flag ON + unrealistic timeline → reframe shows the realistic range', () => {
    vi.spyOn(flags, 'isEnabled').mockImplementation((id: string) => id === 'dp_goal_realism_v1');
    // 81 -> 63 (-18kg) by ~7 weeks out = ~2.5%/wk → unrealistic.
    useProgresStore.getState().setTargetObiectiv({ weightKg: 63, month: '2026-07-27' });
    renderCard();
    const reframe = screen.getByTestId('goal-realism-reframe');
    expect(reframe).toBeInTheDocument();
    expect(reframe.textContent).toMatch(/saptamana/); // ranges-not-verdicts tone
    expect(screen.getByTestId('goal-realism-dismiss')).toBeInTheDocument();
  });

  it('flag ON + realistic plan → no reframe (no nag)', () => {
    vi.spyOn(flags, 'isEnabled').mockImplementation((id: string) => id === 'dp_goal_realism_v1');
    // 81 -> 75 (-6kg) far out → safe pace → silent.
    useProgresStore.getState().setTargetObiectiv({ weightKg: 75, month: '2027-06-01' });
    renderCard();
    expect(screen.queryByTestId('goal-realism-reframe')).toBeNull();
  });

  it('flag ON + dismiss → reframe goes away', () => {
    vi.spyOn(flags, 'isEnabled').mockImplementation((id: string) => id === 'dp_goal_realism_v1');
    useProgresStore.getState().setTargetObiectiv({ weightKg: 63, month: '2026-07-27' });
    renderCard();
    fireEvent.click(screen.getByTestId('goal-realism-dismiss'));
    expect(screen.queryByTestId('goal-realism-reframe')).toBeNull();
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
