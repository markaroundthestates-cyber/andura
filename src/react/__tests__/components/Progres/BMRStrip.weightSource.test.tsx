// ══ BMRStrip — weight source-of-truth unification (split-source bug 03.030) ══
//
// BUG: BMRStrip read `weightLog[weightLog.length - 1]?.kg ?? onboardingWeight`
// — the LAST ARRAY ELEMENT, not the most-recent-by-DATE entry, and it ignored
// the canonical `getCurrentWeightKg()` selector the rest of the app
// (TDEE/BodyFatStrip/protein) already uses. A back-dated weigh-in (a missed day
// logged later) lands at array-end → BMR silently used an OLD weight even
// though a newer-dated entry existed.
//
// FIX: BMRStrip uses getCurrentWeightKg() (most-recent-by-date weightLog, else
// onboarding) — same canonical source as BodyFatStrip. The Mifflin-St Jeor BMR
// math is untouched; only the WEIGHT SOURCE changed.

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BMRStrip } from '../../../components/Progres/BMRStrip';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { useProgresStore } from '../../../stores/progresStore';
import { getCurrentWeightKg } from '../../../lib/userTdee';

function bmrValue(): number {
  const txt = screen.getByTestId('bmr-value').textContent ?? '';
  return Number(txt.replace(/[^\d]/g, ''));
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

describe('BMRStrip — weight source unification (03.030)', () => {
  it('BMR reflects the most-recent-by-DATE weigh-in, not the last array element', () => {
    // A current weigh-in (recent date) followed by a BACK-DATED one (older date)
    // appended afterwards — the back-dated entry sits at array-end. The old
    // array-index logic (`weightLog[length-1]`) would pick the back-dated 110kg
    // and inflate BMR; the canonical source picks the recent 70kg.
    useProgresStore.setState({
      weightLog: [
        { kg: 70, date: '2026-05-20', ts: Date.now() },
        { kg: 110, date: '2026-04-01', ts: Date.now() }, // back-dated, last in array
      ],
    });
    // Sanity: canonical source picks the recent date (70), not the array tail (110).
    expect(getCurrentWeightKg()).toBe(70);

    render(<BMRStrip />);
    const bmrAt70 = bmrValue();

    // Same strip if it had used 110kg → Mifflin adds 10 kcal/kg → clearly higher.
    useProgresStore.setState({
      weightLog: [{ kg: 110, date: '2026-05-20', ts: Date.now() }],
    });
    render(<BMRStrip />);
    const all = screen.getAllByTestId('bmr-value');
    const bmrAt110 = Number((all[all.length - 1]?.textContent ?? '').replace(/[^\d]/g, ''));

    // The first render must be LOWER than the 110kg-driven value — proving it
    // used the recent 70kg, not the back-dated array-tail 110kg.
    expect(bmrAt70).toBeLessThan(bmrAt110);
  });

  it('logging a newer current weight moves BMR', () => {
    // Seeded onboarding weight 80, no logged weight → BMR from 80kg.
    render(<BMRStrip />);
    const bmrFromOnboarding = bmrValue();

    // Log a heavier current weight → canonical current weight is now 95 → BMR
    // must climb (more mass, same height/age/sex).
    useProgresStore.getState().addWeightEntry({ kg: 95, date: '2026-05-25' });
    expect(getCurrentWeightKg()).toBe(95);

    render(<BMRStrip />);
    const all = screen.getAllByTestId('bmr-value');
    const bmrFromLog = Number((all[all.length - 1]?.textContent ?? '').replace(/[^\d]/g, ''));

    expect(bmrFromLog).toBeGreaterThan(bmrFromOnboarding);
  });
});
