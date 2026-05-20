// ══ WORKOUT PREVIEW TESTS — task_05 §C banner + duration/volume + start ═══
// MemoryRouter jsdom paradigm per D020.

import type { JSX } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';

// Phase 6 task_02 Option C: async getTodayWorkout returns Promise<null>.
// WorkoutPreview useEffect awaits — initial render shows fallback values
// (workout state initialized null pre-resolve). Per DECISIONS.md §D027.
vi.mock('../../../lib/engineWrappers', () => ({
  getReadiness: vi.fn(() => null),
  getFatigue: vi.fn(() => null),
  getPRDelta: vi.fn(() => null),
  getTodayWorkout: vi.fn(async () => null),
}));

import { WorkoutPreview } from '../../../routes/screens/antrenor/WorkoutPreview';

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderPreview(
  state?: { intensityMod?: 'plus' | 'normal' | 'minus'; cause?: string }
) {
  return render(
    <MemoryRouter
      initialEntries={[
        { pathname: '/app/antrenor/workout-preview', state: state ?? {} },
      ]}
    >
      <Routes>
        <Route path="/app/antrenor/workout-preview" element={<WorkoutPreview />} />
        <Route path="/app/antrenor/workout" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('WorkoutPreview — base render', () => {
  it('renders fallback heading "Push (piept & umeri)" cand engine returns null', () => {
    renderPreview();
    expect(
      screen.getByRole('heading', { name: /Push/i, level: 1 })
    ).toBeInTheDocument();
  });

  it('renders Start antrenament CTA', () => {
    renderPreview();
    expect(screen.getByRole('button', { name: /Incepe antrenament/i })).toBeInTheDocument();
  });

  it('renders intensity banner cu role=status', () => {
    renderPreview();
    expect(screen.getByRole('status', { name: /Intensitate sesiune/i })).toBeInTheDocument();
  });

  it('renders coach quote line', () => {
    renderPreview();
    const quote = screen.getByTestId('preview-coach-line');
    expect(quote).toBeInTheDocument();
    expect(quote.textContent?.length).toBeGreaterThan(0);
  });
});

describe('WorkoutPreview — intensity banner variants', () => {
  it('renders banner +15% cand intensityMod=plus', () => {
    renderPreview({ intensityMod: 'plus' });
    const banner = screen.getByRole('status', { name: /Intensitate sesiune/i });
    expect(banner).toHaveAttribute('data-intensity', 'plus');
    expect(banner.textContent).toMatch(/\+15%/);
  });

  it('renders banner -20% cand intensityMod=minus', () => {
    renderPreview({ intensityMod: 'minus' });
    const banner = screen.getByRole('status', { name: /Intensitate sesiune/i });
    expect(banner).toHaveAttribute('data-intensity', 'minus');
    expect(banner.textContent).toMatch(/-20%/);
  });

  it('renders banner baseline cand intensityMod=normal', () => {
    renderPreview({ intensityMod: 'normal' });
    const banner = screen.getByRole('status', { name: /Intensitate sesiune/i });
    expect(banner).toHaveAttribute('data-intensity', 'normal');
    expect(banner.textContent).toMatch(/baseline/i);
  });

  it('defaults la normal cand state empty', () => {
    renderPreview();
    const banner = screen.getByRole('status', { name: /Intensitate sesiune/i });
    expect(banner).toHaveAttribute('data-intensity', 'normal');
  });
});

describe('WorkoutPreview — duration + volume estimates', () => {
  it('duration ~35 min cand intensityMod=minus', () => {
    renderPreview({ intensityMod: 'minus' });
    expect(screen.getByTestId('preview-duration').textContent).toMatch(/35/);
  });

  it('duration ~50 min cand intensityMod=normal', () => {
    renderPreview({ intensityMod: 'normal' });
    expect(screen.getByTestId('preview-duration').textContent).toMatch(/50/);
  });

  it('duration ~60 min cand intensityMod=plus', () => {
    renderPreview({ intensityMod: 'plus' });
    expect(screen.getByTestId('preview-duration').textContent).toMatch(/60/);
  });

  it('volume scales cu intensityMod (minus < normal < plus)', () => {
    renderPreview({ intensityMod: 'minus' });
    const minusText = screen.getByTestId('preview-volume').textContent ?? '';
    const minusKg = parseInt(minusText.replace(/\D/g, ''), 10);

    renderPreview({ intensityMod: 'plus' });
    const plusTexts = screen.getAllByTestId('preview-volume');
    const plusKg = parseInt(plusTexts[plusTexts.length - 1]!.textContent?.replace(/\D/g, '') ?? '0', 10);

    expect(plusKg).toBeGreaterThan(minusKg);
  });

  it('volume formatted cu space separator (ro-RO)', () => {
    renderPreview({ intensityMod: 'normal' });
    const volumeText = screen.getByTestId('preview-volume').textContent ?? '';
    expect(volumeText).toMatch(/12 ?\.?\s*450\s*kg/);
  });
});

describe('WorkoutPreview — navigation', () => {
  it('Start antrenament navigates la /app/antrenor/workout', () => {
    renderPreview({ intensityMod: 'normal' });
    fireEvent.click(screen.getByRole('button', { name: /Incepe antrenament/i }));
    expect(screen.getByTestId('probe')).toHaveAttribute(
      'data-pathname',
      '/app/antrenor/workout'
    );
  });
});

describe('WorkoutPreview — Romanian no-diacritics rule (D-LEGACY-064)', () => {
  it('no diacritics in UI rendered text', () => {
    const { container } = renderPreview({ intensityMod: 'minus' });
    const text = container.textContent ?? '';
    expect(/[ăâîșțĂÂÎȘȚ]/.test(text)).toBe(false);
  });
});
