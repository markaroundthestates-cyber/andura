// ══ BodyFatStrip — weight source-of-truth unification (split-source bug) ════
//
// BUG: BodyFatStrip read `weightLog[weightLog.length - 1]?.kg ?? onboardingWeight`
// — the LAST ARRAY ELEMENT, not the most-recent-by-DATE, and it ignored the
// canonical `getCurrentWeightKg()` selector that the rest of the app
// (TDEE/BMR/protein) already uses. Two failure modes:
//
//   1. A back-dated weigh-in (a missed day logged later) lands at array-end →
//      bf% silently uses an OLD weight even though a newer-dated entry exists.
//   2. Editing weight in the profile (SettingsProfile.handleSave upserts a
//      weightLog entry by date) must move bf% — the whole point of the
//      source-of-truth canonicalization (getCurrentWeightKg).
//
// FIX: BodyFatStrip uses getCurrentWeightKg() (most-recent-by-date weightLog,
// else onboarding) — same canonical source as TDEE/BMR/protein. The bf% math
// (Deurenberg, engine-owned) is untouched; only the WEIGHT SOURCE changed.

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BodyFatStrip } from '../../../components/Progres/BodyFatStrip';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { useProgresStore } from '../../../stores/progresStore';
import { getCurrentWeightKg } from '../../../lib/userTdee';

function bfValue(): number {
  const txt = screen.getByTestId('bodyfat-value').textContent ?? '';
  return Number(txt.replace(/[^\d.]/g, ''));
}

beforeEach(() => {
  localStorage.clear();
  useProgresStore.getState().reset();
  useOnboardingStore.setState({
    data: {
      age: 35,
      sex: 'm',
      goal: 'slabire',
      frequency: '4',
      experience: 'intermediar',
      weight: 80,
      height: 178,
    },
    completed: true,
    completedAt: Date.now(),
  });
});

describe('BodyFatStrip — weight source unification', () => {
  it('bf% reflects the most-recent-by-DATE weigh-in, not the last array element', () => {
    // A current weigh-in (recent date) followed by a BACK-DATED one (older date)
    // appended afterwards — the back-dated entry sits at array-end. The old
    // array-index logic (`weightLog[length-1]`) would pick the back-dated 110kg
    // and inflate bf%; the canonical source picks the recent 70kg.
    useProgresStore.setState({
      weightLog: [
        { kg: 70, date: '2026-05-20', ts: Date.now() },
        { kg: 110, date: '2026-04-01', ts: Date.now() }, // back-dated, last in array
      ],
      bodyData: [],
    });
    // Sanity: canonical source picks the recent date (70), not the array tail (110).
    expect(getCurrentWeightKg()).toBe(70);

    render(<BodyFatStrip />);
    const bfAt70 = bfValue();

    // Recompute the same strip if it had used 110kg → it would be clearly higher.
    useProgresStore.setState({
      weightLog: [{ kg: 110, date: '2026-05-20', ts: Date.now() }],
      bodyData: [],
    });
    render(<BodyFatStrip />);
    const all = screen.getAllByTestId('bodyfat-value');
    const bfAt110 = Number((all[all.length - 1]?.textContent ?? '').replace(/[^\d.]/g, ''));

    // The first render must NOT equal the 110kg-driven value — proving it used
    // the recent 70kg, not the back-dated array-tail 110kg.
    expect(bfAt70).toBeLessThan(bfAt110);
  });

  it('editing the current weight (newer weightLog entry) moves bf%', () => {
    // Seeded onboarding weight 80, no weighted log → bf% from 80kg.
    render(<BodyFatStrip />);
    const bfFromOnboarding = bfValue();

    // Simulate a profile weight edit that upserts a logged weight (as
    // SettingsProfile.handleSave does via addWeightEntry). The canonical
    // current weight is now 95 → bf% must climb (more mass, same height/age).
    useProgresStore.getState().addWeightEntry({ kg: 95, date: '2026-05-25' });
    expect(getCurrentWeightKg()).toBe(95);

    render(<BodyFatStrip />);
    const all = screen.getAllByTestId('bodyfat-value');
    const bfFromEdit = Number((all[all.length - 1]?.textContent ?? '').replace(/[^\d.]/g, ''));

    expect(bfFromEdit).toBeGreaterThan(bfFromOnboarding);
  });
});

describe('BodyFatStrip — manual BF% override wins (08.038)', () => {
  it('shows the bf-override value over the auto estimate', async () => {
    const { DB } = await import('../../../../db.js');
    render(<BodyFatStrip />);
    const auto = bfValue();
    DB.set('bf-override', 12.3); // user-set manual override
    render(<BodyFatStrip />);
    const all = screen.getAllByTestId('bodyfat-value');
    const overridden = Number((all[all.length - 1]?.textContent ?? '').replace(/[^\d.]/g, ''));
    expect(overridden).toBe(12.3);
    expect(overridden).not.toBe(auto);
  });
});
