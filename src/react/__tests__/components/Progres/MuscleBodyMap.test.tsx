// MUSCLE BODY MAP TESTS — anatomical recovery figure (Big-11), drop-in for the
// ring grid. Verifies it consumes the SAME recovery data contract as
// MuscleRecoveryGrid (useMuscleRecoveryGroups → discrete engine state per
// Big-11 group), maps state → color, gates the glow under reduced motion,
// carries accessible per-region labels (color is never the sole cue), and falls
// back to a neutral/dimmed cold state with no fabricated recovery.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MuscleBodyMap } from '../../../components/Progres/MuscleBodyMap';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { BIG11_GROUPS } from '../../../../engine/muscleRecovery.js';

const NOW = Date.now();
const HOUR = 3_600_000;

function setSessions(sessions: unknown): void {
  useWorkoutStore.setState({ sessionsHistory: sessions as never });
}

// A recent heavy chest session — pushes piept out of 'recovered'.
const HEAVY_CHEST = [
  {
    title: 'Piept',
    meta: '',
    ts: NOW,
    exercises: [
      {
        exerciseId: 'incline-db-press',
        exerciseName: 'Incline DB Press',
        totalVolume: 0,
        peakOneRM: 0,
        sets: [
          { kg: 30, reps: 8, rating: 'greu', timestamp: NOW - 2 * HOUR },
          { kg: 30, reps: 8, rating: 'greu', timestamp: NOW - 2 * HOUR },
        ],
      },
      {
        exerciseId: 'flat-db-press',
        exerciseName: 'Flat DB Press',
        totalVolume: 0,
        peakOneRM: 0,
        sets: [{ kg: 32, reps: 8, rating: 'greu', timestamp: NOW - 2 * HOUR }],
      },
    ],
  },
];

function mockMatchMedia(reduced: boolean): void {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: reduced && query.includes('reduce'),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }));
}

beforeEach(() => {
  setSessions([]);
  localStorage.clear();
  mockMatchMedia(false);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('MuscleBodyMap', () => {
  it('renders a front-view body figure (role=img) + silhouette', () => {
    setSessions(HEAVY_CHEST);
    render(<MuscleBodyMap />);
    expect(screen.getByTestId('muscle-body-map')).toBeInTheDocument();
    const fig = screen.getByTestId('body-map-figure');
    expect(fig).toBeInTheDocument();
    expect(fig).toHaveAttribute('role', 'img');
    expect(fig).toHaveAttribute('aria-label');
    expect(screen.getByTestId('body-map-silhouette')).toBeInTheDocument();
  });

  it('surfaces every Big-11 group in the per-group readout (no group hidden)', () => {
    setSessions(HEAVY_CHEST);
    render(<MuscleBodyMap />);
    for (const group of BIG11_GROUPS) {
      expect(screen.getByTestId(`body-readout-${group}`)).toBeInTheDocument();
    }
  });

  it('colors the piept region by recovery state after a heavy chest session', () => {
    setSessions(HEAVY_CHEST);
    render(<MuscleBodyMap />);
    // Front-view chest is drawn as two pectoral slabs → at least one region.
    const regions = screen.getAllByTestId('body-region-piept');
    expect(regions.length).toBeGreaterThan(0);
    const region = regions[0]!;
    const state = region.getAttribute('data-recovery-state');
    expect(['partial', 'fatigued']).toContain(state);
    // Color is applied (volt/gold/ember token), never empty.
    expect(region.getAttribute('fill')).toMatch(/var\(--/);
  });

  it('each drawn region has an accessible label pairing group + state (not color-only)', () => {
    setSessions(HEAVY_CHEST);
    render(<MuscleBodyMap />);
    const pieptRegion = screen.getAllByTestId('body-region-piept')[0]!;
    const label = pieptRegion.getAttribute('aria-label') ?? '';
    // Label carries the localized group name + a state word (default RO locale).
    expect(label.length).toBeGreaterThan(0);
    expect(label).toMatch(/:/);
  });

  it('renders the color→meaning legend (all three states)', () => {
    setSessions(HEAVY_CHEST);
    render(<MuscleBodyMap />);
    const legend = screen.getByTestId('body-map-legend');
    // 3 legend rows: fatigued / partial / recovered.
    expect(within(legend).getAllByRole('listitem')).toHaveLength(3);
  });

  it('disables the glow animation under prefers-reduced-motion', () => {
    mockMatchMedia(true);
    setSessions(HEAVY_CHEST);
    render(<MuscleBodyMap />);
    // No region should carry the animating class when motion is reduced.
    const stressed = document.querySelectorAll('.body-map-region--stressed');
    expect(stressed.length).toBe(0);
  });

  it('attaches the glow class to stressed regions when motion is allowed', () => {
    mockMatchMedia(false);
    setSessions(HEAVY_CHEST);
    render(<MuscleBodyMap />);
    const stressed = document.querySelectorAll('.body-map-region--stressed');
    expect(stressed.length).toBeGreaterThan(0);
  });

  it('cold state (no sessions): neutral/dimmed figure, no fabricated recovery', () => {
    setSessions([]);
    render(<MuscleBodyMap />);
    const card = screen.getByTestId('muscle-body-map');
    expect(card).toHaveAttribute('data-cold', 'true');
    // Figure dimmed.
    expect(screen.getByTestId('body-map-figure')).toHaveStyle({ opacity: '0.55' });
    // Empty note present.
    expect(screen.getByTestId('body-map-empty')).toBeInTheDocument();
    // Regions are neutral — NOT painted as 'recovered' (no green over-claim).
    const region = screen.getAllByTestId('body-region-piept')[0]!;
    expect(region).toHaveAttribute('data-recovery-state', 'neutral');
    // No stressed glow in cold state.
    expect(document.querySelectorAll('.body-map-region--stressed').length).toBe(0);
  });

  it('does NOT print a fabricated per-muscle percentage (data honesty)', () => {
    setSessions(HEAVY_CHEST);
    const { container } = render(<MuscleBodyMap />);
    expect(container.textContent ?? '').not.toMatch(/\d+%/);
  });

  it('no diacritics in UI (D-LEGACY-064)', () => {
    setSessions(HEAVY_CHEST);
    const { container } = render(<MuscleBodyMap />);
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
