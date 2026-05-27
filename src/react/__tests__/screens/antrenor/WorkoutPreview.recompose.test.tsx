// ══ WORKOUT PREVIEW RECOMPOSE TESTS — WP-5 moat ══════════════════════════════
// When EquipmentSwap forwards busy coarse types, the preview must recompose the
// session with them unavailable and surface "Inlocuit · {motiv}" on the swapped
// row's sub slot (P3-MOAT-DESIGN.md §5.2/§5.5).

import type { JSX } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

const FIXTURE = {
  workoutTitle: 'Push',
  exerciseCount: 2,
  estimatedDuration: 50,
  intensityMod: 'normal' as const,
  volumeKg: 5000,
  exercises: [
    {
      id: 'incline-barbell-bench-0',
      name: 'inclinat cu bara',
      engineName: 'Incline Barbell Bench', // barbell — will swap when barbell busy
      sub: 'Cu bara',
      sets: 3,
      targetReps: 8,
      targetKg: 60,
      restSec: 90,
    },
    {
      id: 'incline-db-press-1',
      name: 'Impins inclinat',
      engineName: 'Incline DB Press', // dumbbell — stays put
      sub: 'Cu gantere · banc 30°',
      sets: 3,
      targetReps: 10,
      targetKg: 22,
      restSec: 90,
    },
  ],
};

vi.mock('../../../lib/engineWrappers', async () => {
  const actual = await vi.importActual<typeof import('../../../lib/engineWrappers')>(
    '../../../lib/engineWrappers'
  );
  return { ...actual, getTodayWorkout: vi.fn(async () => FIXTURE), getPRDelta: vi.fn(() => null) };
});

import { WorkoutPreview } from '../../../routes/screens/antrenor/WorkoutPreview';

function LocationProbe(): JSX.Element {
  return <div data-testid="probe" />;
}

function renderPreview(state: Record<string, unknown>) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/app/antrenor/workout-preview', state }]}>
      <Routes>
        <Route path="/app/antrenor/workout-preview" element={<WorkoutPreview />} />
        <Route path="/app/antrenor/workout" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('WorkoutPreview recompose with busy coarse types', () => {
  it('barbell busy → barbell row shows a renamed alternative + "Inlocuit ·" sub', async () => {
    renderPreview({ equipmentContext: { busyCoarseTypes: ['barbell'] } });
    await waitFor(() => {
      expect(screen.getByTestId('preview-exercise-list')).toBeInTheDocument();
    });
    // First row recomposed: the TITLE is now the alternative (Smith), not the
    // barbell movement. (The "Inlocuit · ..." sub legitimately echoes the
    // original name, so assert against the title div, not the whole row.)
    const titles = screen.getAllByText((_c, el) =>
      el?.classList.contains('truncate') === true && el.tagName === 'DIV'
    );
    const firstTitle = titles[0]!.textContent ?? '';
    expect(firstTitle).not.toBe('inclinat cu bara');
    expect(firstTitle).toContain('Smith');
    // The swap reason is surfaced.
    const subs = screen.getAllByTestId('preview-exercise-sub');
    expect(subs.some((s) => (s.textContent ?? '').includes('Inlocuit'))).toBe(true);
  });

  it('no busy types → original list, no "Inlocuit" markers', async () => {
    renderPreview({});
    await waitFor(() => {
      expect(screen.getByTestId('preview-exercise-list')).toBeInTheDocument();
    });
    const rows = screen.getAllByTestId('preview-exercise-row');
    expect(rows[0]!.textContent).toContain('inclinat cu bara');
    const subs = screen.queryAllByTestId('preview-exercise-sub');
    expect(subs.every((s) => !(s.textContent ?? '').includes('Inlocuit'))).toBe(true);
  });
});
