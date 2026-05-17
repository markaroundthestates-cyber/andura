// ══ POST-RPE TESTS — task_09 §A submit RPE pipeline ══════════════════════
// MemoryRouter jsdom paradigm per D020.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
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

  it('submit clears history via finishSession', () => {
    renderPostRpe();
    expect(Object.keys(useWorkoutStore.getState().history).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: /Normala/i }));
    expect(useWorkoutStore.getState().history).toEqual({});
  });

  it('submit increments streak (5 → 6)', () => {
    renderPostRpe();
    fireEvent.click(screen.getByRole('button', { name: /Normala/i }));
    expect(useWorkoutStore.getState().streak).toBe(6);
  });

  it('submit sets lastSession cu title + meta + ts', () => {
    renderPostRpe();
    fireEvent.click(screen.getByRole('button', { name: /Normala/i }));
    const ls = useWorkoutStore.getState().lastSession;
    expect(ls).not.toBeNull();
    expect(ls?.title).toBe('Push (piept si umeri)');
    expect(ls?.meta).toMatch(/5 seturi/);
    expect(ls?.meta).toMatch(/min/);
    expect(ls?.meta).toMatch(/kg/);
    expect(typeof ls?.ts).toBe('number');
  });

  it('summary meta volume computed correctly (3*22.5*10 + 22.5*8 + 17.5*8 + 17.5*8 = 1135)', () => {
    renderPostRpe();
    fireEvent.click(screen.getByRole('button', { name: /Normala/i }));
    const meta = useWorkoutStore.getState().lastSession?.meta ?? '';
    // volume = 22.5*10 + 22.5*10 + 22.5*8 + 17.5*8 + 17.5*8 = 225 + 225 + 180 + 140 + 140 = 910
    expect(meta).toMatch(/910 kg/);
  });

  it('summary meta duration ~30 min', () => {
    renderPostRpe();
    fireEvent.click(screen.getByRole('button', { name: /Normala/i }));
    const meta = useWorkoutStore.getState().lastSession?.meta ?? '';
    expect(meta).toMatch(/30 min/);
  });

  it('finishSession payload populates numeric sets field (task_10 §D)', () => {
    renderPostRpe();
    fireEvent.click(screen.getByRole('button', { name: /Normala/i }));
    expect(useWorkoutStore.getState().lastSession?.sets).toBe(5);
  });

  it('finishSession payload populates numeric durationMin field', () => {
    renderPostRpe();
    fireEvent.click(screen.getByRole('button', { name: /Normala/i }));
    expect(useWorkoutStore.getState().lastSession?.durationMin).toBe(30);
  });

  it('finishSession payload populates numeric volumeKg field', () => {
    renderPostRpe();
    fireEvent.click(screen.getByRole('button', { name: /Normala/i }));
    expect(useWorkoutStore.getState().lastSession?.volumeKg).toBe(910);
  });

  it('task_03: finishSession payload populates exercises breakdown', () => {
    renderPostRpe();
    fireEvent.click(screen.getByRole('button', { name: /Normala/i }));
    const exercises = useWorkoutStore.getState().lastSession?.exercises;
    expect(exercises).toBeDefined();
    expect(exercises?.length).toBe(2); // exIdx 0 + 1 din seeded history
  });

  it('task_03: exercises breakdown computes totalVolume per exercise', () => {
    renderPostRpe();
    fireEvent.click(screen.getByRole('button', { name: /Normala/i }));
    const exercises = useWorkoutStore.getState().lastSession?.exercises;
    // exIdx 0: 22.5*10 + 22.5*10 + 22.5*8 = 450 + 180 = 630
    expect(exercises?.[0].totalVolume).toBe(630);
    // exIdx 1: 17.5*8 + 17.5*8 = 280
    expect(exercises?.[1].totalVolume).toBe(280);
  });

  it('task_03: peakOneRM uses Epley max across sets', () => {
    renderPostRpe();
    fireEvent.click(screen.getByRole('button', { name: /Normala/i }));
    const exercises = useWorkoutStore.getState().lastSession?.exercises;
    // Bench Press peak: 22.5kg × 10 reps = 22.5 * (1+10/30) = 30 kg 1RM
    expect(exercises?.[0].peakOneRM).toBe(30);
  });

  it('navigates la /app/antrenor/post-summary after submit', () => {
    renderPostRpe();
    fireEvent.click(screen.getByRole('button', { name: /Normala/i }));
    expect(screen.getByTestId('probe')).toHaveAttribute(
      'data-pathname',
      '/app/antrenor/post-summary'
    );
  });

  it('phase resets la idle (via finishSession)', () => {
    renderPostRpe();
    fireEvent.click(screen.getByRole('button', { name: /Normala/i }));
    expect(useWorkoutStore.getState().phase).toBe('idle');
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
