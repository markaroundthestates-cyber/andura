// ══ EQUIPMENT SWAP INLINE PREVIEW TESTS — WP-5 moat ══════════════════════════
// Marking a station busy must surface, INLINE under it, the NAMED alternative the
// user will do instead — the aspirational "Coach gaseste alternative" copy made
// real (P3-MOAT-DESIGN.md §5.3). Uses a real-engineName fixture.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import type { JSX } from 'react';

const FIXTURE = {
  workoutTitle: 'Push',
  exerciseCount: 1,
  estimatedDuration: 50,
  intensityMod: 'normal' as const,
  volumeKg: 3000,
  exercises: [
    {
      id: 'incline-barbell-bench-0',
      name: 'inclinat cu bara',
      engineName: 'Incline Barbell Bench', // barbell — Bench press item busy blocks it
      sets: 3,
      targetReps: 8,
      targetKg: 60,
      restSec: 90,
    },
  ],
};

vi.mock('../../../lib/engineWrappers', async () => {
  const actual = await vi.importActual<typeof import('../../../lib/engineWrappers')>(
    '../../../lib/engineWrappers'
  );
  return { ...actual, getTodayWorkout: vi.fn(async () => FIXTURE) };
});

import { EquipmentSwap } from '../../../routes/screens/antrenor/EquipmentSwap';

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  const s = (loc.state ?? null) as Record<string, unknown> | null;
  return <div data-testid="probe">{s ? JSON.stringify(s) : 'no-state'}</div>;
}

function renderSwap() {
  return render(
    <MemoryRouter initialEntries={['/app/antrenor/equipment-swap']}>
      <Routes>
        <Route path="/app/antrenor/equipment-swap" element={<EquipmentSwap />} />
        <Route path="/app/antrenor/workout-preview" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('EquipmentSwap inline named preview', () => {
  it('marking Bench press busy shows a NAMED alternative inline under it', async () => {
    renderSwap();
    fireEvent.click(screen.getByRole('button', { name: /Bench press/i }));
    await waitFor(() => {
      expect(screen.getByTestId('swap-preview-bench')).toBeInTheDocument();
    });
    const row = screen.getAllByTestId('swap-preview-row')[0]!;
    expect(row.textContent).toContain('vei face');
    expect(row.textContent).toContain('in loc de inclinat cu bara');
  });

  it('Continue forwards busy coarse types so the preview recomposes', async () => {
    renderSwap();
    fireEvent.click(screen.getByRole('button', { name: /Bench press/i }));
    fireEvent.click(screen.getByTestId('equipment-continue'));
    expect(screen.getByTestId('probe').textContent).toContain('busyCoarseTypes');
    expect(screen.getByTestId('probe').textContent).toContain('barbell');
  });
});
