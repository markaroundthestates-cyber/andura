// ══ POST-RPE TESTS — task_09 §A submit RPE pipeline ══════════════════════
// MemoryRouter jsdom paradigm per D020.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';

// Phase 6 task_02 Option C — mock async getTodayWorkout returns Phase 5
// fixture (title 'Push (piept si umeri)' + Bench Press exIdx 0 / Overhead
// Press exIdx 1 pentru exercises breakdown name lookup). Per DECISIONS.md
// §D027. Without mock, real pipeline emits 'Antrenament azi' default title.
const PHASE_5_FIXTURE = {
  workoutTitle: 'Push (piept si umeri)',
  exerciseCount: 5,
  estimatedDuration: 50,
  intensityMod: 'normal' as const,
  volumeKg: 12450,
  exercises: [
    { id: 'bench-press', name: 'Bench Press', sets: 4, targetReps: 10, targetKg: 22.5, restSec: 90 },
    { id: 'overhead-press', name: 'Overhead Press', sets: 4, targetReps: 8, targetKg: 17.5, restSec: 120 },
    { id: 'incline-db', name: 'Incline DB', sets: 3, targetReps: 12, targetKg: 14, restSec: 75 },
    { id: 'lateral-raise', name: 'Lateral Raise', sets: 3, targetReps: 15, targetKg: 6, restSec: 60 },
    { id: 'tricep-pushdown', name: 'Tricep Pushdown', sets: 3, targetReps: 12, targetKg: 25, restSec: 60 },
  ],
};

vi.mock('../../../lib/engineWrappers', () => ({
  getTodayWorkout: vi.fn(async () => PHASE_5_FIXTURE),
}));

import { PostRpe } from '../../../routes/screens/antrenor/PostRpe';
import { useWorkoutStore } from '../../../stores/workoutStore';

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderPostRpe() {
  return render(
    <MemoryRouter initialEntries={['/app/antrenor/post-rpe']}>
      <Routes>
        <Route path="/app/antrenor/post-rpe" element={<PostRpe />} />
        <Route path="/app/antrenor/post-summary" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

function seedSession(): void {
  useWorkoutStore.setState({
    exIdx: 0,
    setIdx: 0,
    phase: 'logging',
    prHit: false,
    history: {
      0: [
        { kg: 22.5, reps: 10, rating: 'potrivit' },
        { kg: 22.5, reps: 10, rating: 'potrivit' },
        { kg: 22.5, reps: 8, rating: 'greu' },
      ],
      1: [
        { kg: 17.5, reps: 8, rating: 'potrivit' },
        { kg: 17.5, reps: 8, rating: 'greu' },
      ],
    },
    sessionStart: Date.now() - 30 * 60000, // 30 min ago
    lastRating: null,
    pausedSnapshot: null,
    lastSession: null,
    streak: 5,
  });
  localStorage.clear();
}

describe('PostRpe — render', () => {
  beforeEach(() => {
    seedSession();
  });

  it('renders heading "Cum a fost sesiunea?"', () => {
    renderPostRpe();
    expect(
      screen.getByRole('heading', { name: /Cum a fost sesiunea/i, level: 1 })
    ).toBeInTheDocument();
  });

  it('renders helper copy "Coach calibreaza"', () => {
    renderPostRpe();
    expect(screen.getByText(/Coach calibreaza/i)).toBeInTheDocument();
  });

  it('renders 3 rating options cu data-rating', () => {
    renderPostRpe();
    expect(screen.getByRole('button', { name: /Usoara/i })).toHaveAttribute(
      'data-rating',
      'usoara'
    );
    expect(screen.getByRole('button', { name: /Normala/i })).toHaveAttribute(
      'data-rating',
      'normala'
    );
    expect(screen.getByRole('button', { name: /Grea/i })).toHaveAttribute(
      'data-rating',
      'grea'
    );
  });

  it('renders descriptor copy per rating', () => {
    renderPostRpe();
    expect(screen.getByText(/Aveam mai mult in rezerva/i)).toBeInTheDocument();
    expect(screen.getByText(/Solid, echilibrat/i)).toBeInTheDocument();
    expect(screen.getByText(/M-am dus la limita/i)).toBeInTheDocument();
  });
});

describe('PostRpe — submit pipeline', () => {
  beforeEach(() => {
    seedSession();
  });

  // Phase 6 task_02 Option C: handleSubmit async (awaits getTodayWorkout).
  // setLastRating runs sync pre-await; other state updates (finishSession +
  // incrementStreak + navigate) post-await. Use waitFor pentru post-await
  // assertions. Per DECISIONS.md §D027.

  it('Usoara click → setLastRating="usoara"', () => {
    renderPostRpe();
    fireEvent.click(screen.getByRole('button', { name: /Usoara/i }));
    expect(useWorkoutStore.getState().lastRating).toBe('usoara');
  });

  it('Normala click → setLastRating="normala"', () => {
    renderPostRpe();
    fireEvent.click(screen.getByRole('button', { name: /Normala/i }));
    expect(useWorkoutStore.getState().lastRating).toBe('normala');
  });

  it('Grea click → setLastRating="grea"', () => {
    renderPostRpe();
    fireEvent.click(screen.getByRole('button', { name: /Grea/i }));
    expect(useWorkoutStore.getState().lastRating).toBe('grea');
  });

  it('submit clears history via finishSession', async () => {
    renderPostRpe();
    expect(Object.keys(useWorkoutStore.getState().history).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: /Normala/i }));
    await waitFor(() => {
      expect(useWorkoutStore.getState().history).toEqual({});
    });
  });

  it('submit increments streak (5 → 6)', async () => {
    renderPostRpe();
    fireEvent.click(screen.getByRole('button', { name: /Normala/i }));
    await waitFor(() => {
      expect(useWorkoutStore.getState().streak).toBe(6);
    });
  });

  it('submit sets lastSession cu title + meta + ts', async () => {
    renderPostRpe();
    fireEvent.click(screen.getByRole('button', { name: /Normala/i }));
    await waitFor(() => {
      expect(useWorkoutStore.getState().lastSession).not.toBeNull();
    });
    const ls = useWorkoutStore.getState().lastSession;
    expect(ls?.title).toBe('Push (piept si umeri)');
    expect(ls?.meta).toMatch(/5 seturi/);
    expect(ls?.meta).toMatch(/min/);
    expect(ls?.meta).toMatch(/kg/);
    expect(typeof ls?.ts).toBe('number');
  });

  it('summary meta volume computed correctly (3*22.5*10 + 22.5*8 + 17.5*8 + 17.5*8 = 1135)', async () => {
    renderPostRpe();
    fireEvent.click(screen.getByRole('button', { name: /Normala/i }));
    await waitFor(() => {
      const meta = useWorkoutStore.getState().lastSession?.meta ?? '';
      expect(meta).toMatch(/910 kg/);
    });
  });

  it('summary meta duration ~30 min', async () => {
    renderPostRpe();
    fireEvent.click(screen.getByRole('button', { name: /Normala/i }));
    await waitFor(() => {
      const meta = useWorkoutStore.getState().lastSession?.meta ?? '';
      expect(meta).toMatch(/30 min/);
    });
  });

  it('finishSession payload populates numeric sets field (task_10 §D)', async () => {
    renderPostRpe();
    fireEvent.click(screen.getByRole('button', { name: /Normala/i }));
    await waitFor(() => {
      expect(useWorkoutStore.getState().lastSession?.sets).toBe(5);
    });
  });

  it('finishSession payload populates numeric durationMin field', async () => {
    renderPostRpe();
    fireEvent.click(screen.getByRole('button', { name: /Normala/i }));
    await waitFor(() => {
      expect(useWorkoutStore.getState().lastSession?.durationMin).toBe(30);
    });
  });

  it('finishSession payload populates numeric volumeKg field', async () => {
    renderPostRpe();
    fireEvent.click(screen.getByRole('button', { name: /Normala/i }));
    await waitFor(() => {
      expect(useWorkoutStore.getState().lastSession?.volumeKg).toBe(910);
    });
  });

  it('task_03: finishSession payload populates exercises breakdown', async () => {
    renderPostRpe();
    fireEvent.click(screen.getByRole('button', { name: /Normala/i }));
    await waitFor(() => {
      expect(useWorkoutStore.getState().lastSession?.exercises?.length).toBe(2);
    });
  });

  it('task_03: exercises breakdown computes totalVolume per exercise', async () => {
    renderPostRpe();
    fireEvent.click(screen.getByRole('button', { name: /Normala/i }));
    await waitFor(() => {
      const exercises = useWorkoutStore.getState().lastSession?.exercises;
      // exIdx 0: 22.5*10 + 22.5*10 + 22.5*8 = 450 + 180 = 630
      expect(exercises?.[0].totalVolume).toBe(630);
      // exIdx 1: 17.5*8 + 17.5*8 = 280
      expect(exercises?.[1].totalVolume).toBe(280);
    });
  });

  it('task_03: peakOneRM uses Epley max across sets', async () => {
    renderPostRpe();
    fireEvent.click(screen.getByRole('button', { name: /Normala/i }));
    await waitFor(() => {
      const exercises = useWorkoutStore.getState().lastSession?.exercises;
      // Bench Press peak: 22.5kg × 10 reps = 22.5 * (1+10/30) = 30 kg 1RM
      expect(exercises?.[0].peakOneRM).toBe(30);
    });
  });

  it('navigates la /app/antrenor/post-summary after submit', async () => {
    renderPostRpe();
    fireEvent.click(screen.getByRole('button', { name: /Normala/i }));
    await waitFor(() => {
      expect(screen.getByTestId('probe')).toHaveAttribute(
        'data-pathname',
        '/app/antrenor/post-summary'
      );
    });
  });

  it('phase resets la idle (via finishSession)', async () => {
    renderPostRpe();
    fireEvent.click(screen.getByRole('button', { name: /Normala/i }));
    await waitFor(() => {
      expect(useWorkoutStore.getState().phase).toBe('idle');
    });
    expect(useWorkoutStore.getState().sessionStart).toBeNull();
  });
});

describe('PostRpe — Romanian no-diacritics rule (D-LEGACY-064)', () => {
  beforeEach(() => {
    seedSession();
  });

  it('no diacritics in UI rendered text', () => {
    const { container } = renderPostRpe();
    const text = container.textContent ?? '';
    expect(/[ăâîșțĂÂÎȘȚ]/.test(text)).toBe(false);
  });
});
