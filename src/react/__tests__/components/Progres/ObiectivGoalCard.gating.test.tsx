// ══ OBIECTIV GOAL CARD — phase GATING tests (2026-05-30) ════════════════════
// Target weight = master intent: a clear direction makes contradicting goals
// unselectable (grayed + untappable + aria-disabled). Changing the target so the
// currently selected goal becomes disabled auto-switches to AUTO (clears the
// phase-override) + surfaces a prompt note.

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ObiectivGoalCard } from '../../../components/Progres/ObiectivGoalCard';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { useProgresStore } from '../../../stores/progresStore';
import { setLocale, _resetI18nCache } from '../../../../i18n/index.js';

beforeEach(() => {
  try { localStorage.removeItem('sf.locale'); } catch { /* noop */ }
  _resetI18nCache();
  setLocale('ro');
  useOnboardingStore.getState().reset();
  useProgresStore.getState().reset();
  localStorage.clear();
});

function renderCard() {
  return render(
    <MemoryRouter initialEntries={['/app/progres']}>
      <Routes>
        <Route path="/app/progres" element={<ObiectivGoalCard />} />
        <Route path="/app/antrenor/program-change-confirm" element={<div data-testid="probe" />} />
      </Routes>
    </MemoryRouter>,
  );
}

function setCurrentWeight(kg: number): void {
  useProgresStore.setState((s) => ({
    weightLog: [{ kg, date: '2026-05-30', ts: Date.now() }, ...s.weightLog],
  }));
}

describe('ObiectivGoalCard gating — LOSE target', () => {
  it('disables masa/mentenanta/forta, keeps auto+slabire selectable', () => {
    setCurrentWeight(110);
    useProgresStore.getState().setTargetObiectiv({ weightKg: 90 }); // LOSE
    useOnboardingStore.getState().setField('goal', 'slabire');
    renderCard();

    expect(screen.getByTestId('obiectiv-row-slabire')).not.toBeDisabled();
    expect(screen.getByTestId('obiectiv-row-auto')).not.toBeDisabled();
    expect(screen.getByTestId('obiectiv-row-masa')).toBeDisabled();
    expect(screen.getByTestId('obiectiv-row-masa')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByTestId('obiectiv-row-mentenanta')).toBeDisabled();
    expect(screen.getByTestId('obiectiv-row-forta')).toBeDisabled();
  });

  it('clicking a disabled option is a no-op (no navigation)', () => {
    setCurrentWeight(110);
    useProgresStore.getState().setTargetObiectiv({ weightKg: 90 });
    useOnboardingStore.getState().setField('goal', 'slabire');
    renderCard();
    fireEvent.click(screen.getByTestId('obiectiv-row-masa'));
    expect(screen.queryByTestId('probe')).not.toBeInTheDocument();
  });
});

describe('ObiectivGoalCard gating — GAIN target', () => {
  it('disables slabire/mentenanta, keeps auto+masa+forta', () => {
    setCurrentWeight(70);
    useProgresStore.getState().setTargetObiectiv({ weightKg: 80 }); // GAIN
    useOnboardingStore.getState().setField('goal', 'masa');
    renderCard();
    expect(screen.getByTestId('obiectiv-row-masa')).not.toBeDisabled();
    expect(screen.getByTestId('obiectiv-row-forta')).not.toBeDisabled();
    expect(screen.getByTestId('obiectiv-row-slabire')).toBeDisabled();
    expect(screen.getByTestId('obiectiv-row-mentenanta')).toBeDisabled();
  });
});

describe('ObiectivGoalCard gating — no target → all enabled', () => {
  it('every row selectable when no target weight set', () => {
    setCurrentWeight(80);
    useOnboardingStore.getState().setField('goal', 'masa');
    renderCard();
    for (const g of ['auto', 'forta', 'masa', 'slabire', 'mentenanta']) {
      expect(screen.getByTestId(`obiectiv-row-${g}`)).not.toBeDisabled();
    }
  });
});

describe('ObiectivGoalCard gating — auto-switch + prompt on contradiction', () => {
  it('selected masa + LOSE target → auto-switch to AUTO, clears phase-override, shows note', () => {
    setCurrentWeight(110);
    useOnboardingStore.getState().setField('goal', 'masa'); // BULK
    // Seed a stale phase-override (as a prior goal-commit would have).
    localStorage.setItem('phase-override', JSON.stringify('BULK'));
    // Now the user sets a LOSE target → masa becomes contradictory.
    useProgresStore.getState().setTargetObiectiv({ weightKg: 90 });
    renderCard();

    // Auto-switched to AUTO in the store.
    expect(useOnboardingStore.getState().data.goal).toBe('auto');
    // phase-override cleared (badge will read AUTO, never stale BULK).
    expect(JSON.parse(localStorage.getItem('phase-override') ?? 'null')).toBeNull();
    // Prompt note surfaced.
    expect(screen.getByTestId('obiectiv-gating-note')).toBeInTheDocument();
    expect(screen.getByTestId('obiectiv-gating-note').textContent).toMatch(/slabesti/i);
    // Auto row now selected.
    expect(screen.getByTestId('obiectiv-row-auto')).toHaveAttribute('aria-pressed', 'true');
  });

  it('no auto-switch when the selected goal stays compatible', () => {
    setCurrentWeight(110);
    useOnboardingStore.getState().setField('goal', 'slabire'); // compatible with LOSE
    useProgresStore.getState().setTargetObiectiv({ weightKg: 90 });
    renderCard();
    expect(useOnboardingStore.getState().data.goal).toBe('slabire');
    expect(screen.queryByTestId('obiectiv-gating-note')).not.toBeInTheDocument();
  });
});

describe('ObiectivGoalCard gating — no diacritics in prompt copy', () => {
  it('gating note has no diacritics (D-LEGACY-064)', () => {
    setCurrentWeight(110);
    useOnboardingStore.getState().setField('goal', 'masa');
    useProgresStore.getState().setTargetObiectiv({ weightKg: 90 });
    const { container } = renderCard();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
