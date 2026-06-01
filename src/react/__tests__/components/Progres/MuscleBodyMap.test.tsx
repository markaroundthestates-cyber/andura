// MUSCLE BODY MAP TESTS — photoreal recovery body (Big-11), drop-in for the ring
// grid. Verifies it consumes the SAME recovery data contract as
// MuscleRecoveryGrid (useMuscleRecoveryGroups → discrete engine state per Big-11
// group), selects the correct photoreal base by sex + view, maps state → glow
// color, gates the glow under reduced motion, carries accessible per-region
// labels (color is never the sole cue), falls back to a neutral/dimmed cold state
// with no fabricated recovery, and degrades to the SVG figure if the image fails.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';

// getFatigue drives the panel-header fatigue line (concern D). Mock it so the
// cold default is the not-enough-data state (the line must be SUPPRESSED), and
// override per-test for the with-data case. Default null = no fatigue tile.
vi.mock('../../../lib/engineWrappers', () => ({
  getFatigue: vi.fn(() => null),
}));

import { MuscleBodyMap } from '../../../components/Progres/MuscleBodyMap';
import { getFatigue } from '../../../lib/engineWrappers';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { BIG11_GROUPS } from '../../../../engine/muscleRecovery.js';

function setSex(sex: 'm' | 'f' | null): void {
  useOnboardingStore.setState((s) => ({ data: { ...s.data, sex } }));
}

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
  setSex('m');
  localStorage.clear();
  mockMatchMedia(false);
  vi.mocked(getFatigue).mockReturnValue(null);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('MuscleBodyMap', () => {
  it('renders a front-view photoreal body (role=img) with a base image', () => {
    setSessions(HEAVY_CHEST);
    render(<MuscleBodyMap />);
    expect(screen.getByTestId('muscle-body-map')).toBeInTheDocument();
    const fig = screen.getByTestId('body-map-figure');
    expect(fig).toBeInTheDocument();
    expect(fig).toHaveAttribute('role', 'img');
    expect(fig).toHaveAttribute('aria-label');
    expect(screen.getByTestId('body-map-image')).toBeInTheDocument();
  });

  it('selects the photoreal base by sex + view (male front by default)', () => {
    setSex('m');
    setSessions(HEAVY_CHEST);
    render(<MuscleBodyMap />);
    expect(screen.getByTestId('body-map-image')).toHaveAttribute('src', '/body/male-front.webp');
  });

  it('selects the female back base after switching sex + view', () => {
    setSex('f');
    setSessions(HEAVY_CHEST);
    render(<MuscleBodyMap />);
    fireEvent.click(screen.getByTestId('body-map-view-back'));
    expect(screen.getByTestId('body-map-image')).toHaveAttribute('src', '/body/female-back.webp');
  });

  it('surfaces every Big-11 group in the per-group readout (no group hidden)', () => {
    setSessions(HEAVY_CHEST);
    render(<MuscleBodyMap />);
    for (const group of BIG11_GROUPS) {
      expect(screen.getByTestId(`body-readout-${group}`)).toBeInTheDocument();
    }
  });

  it('glows the piept region in the recovery state color after a heavy chest session', () => {
    setSessions(HEAVY_CHEST);
    render(<MuscleBodyMap />);
    // Front-view chest is drawn as two pectoral glows → at least one region.
    const regions = screen.getAllByTestId('body-region-piept');
    expect(regions.length).toBeGreaterThan(0);
    const region = regions[0]!;
    const state = region.getAttribute('data-recovery-state');
    expect(['partial', 'fatigued']).toContain(state);
    // The glow carries the state color via the --glow-color custom property.
    const glowColor = region.style.getPropertyValue('--glow-color');
    expect(glowColor).toMatch(/var\(--(ember-red|gold)\)/);
  });

  it('maps each recovery state to its distinct glow color (volt / gold / ember)', () => {
    setSessions(HEAVY_CHEST);
    render(<MuscleBodyMap />);
    // A recovered group (legs untouched by a chest session) glows volt.
    const quad = screen.getAllByTestId('body-region-picioare-quads')[0]!;
    expect(quad.getAttribute('data-recovery-state')).toBe('recovered');
    expect(quad.style.getPropertyValue('--glow-color')).toBe('var(--volt)');
    // The stressed chest glows gold or ember (not volt).
    const piept = screen.getAllByTestId('body-region-piept')[0]!;
    expect(piept.style.getPropertyValue('--glow-color')).not.toBe('var(--volt)');
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

  it('cold state (no sessions): neutral/dimmed body, no fabricated recovery', () => {
    setSessions([]);
    render(<MuscleBodyMap />);
    const card = screen.getByTestId('muscle-body-map');
    expect(card).toHaveAttribute('data-cold', 'true');
    // Body dimmed — the cold-state dim is on the body IMAGE, not the container
    // (the container holds the fixed dark plate, which must stay solid so a
    // light-theme card can't bleed through and wash the map out).
    expect(screen.getByTestId('body-map-image')).toHaveStyle({ opacity: '0.55' });
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

  // ── sex-specific bases ────────────────────────────────────────────────────
  it('renders the male body for a male user', () => {
    setSex('m');
    setSessions(HEAVY_CHEST);
    render(<MuscleBodyMap />);
    expect(screen.getByTestId('muscle-body-map')).toHaveAttribute('data-sex', 'm');
    expect(screen.getByTestId('body-map-image')).toHaveAttribute('src', '/body/male-front.webp');
  });

  it('renders the female body for a female user', () => {
    setSex('f');
    setSessions(HEAVY_CHEST);
    render(<MuscleBodyMap />);
    expect(screen.getByTestId('muscle-body-map')).toHaveAttribute('data-sex', 'f');
    expect(screen.getByTestId('body-map-image')).toHaveAttribute('src', '/body/female-front.webp');
  });

  it('null sex falls back to the male body (neutral default)', () => {
    setSex(null);
    setSessions(HEAVY_CHEST);
    render(<MuscleBodyMap />);
    expect(screen.getByTestId('muscle-body-map')).toHaveAttribute('data-sex', 'm');
    expect(screen.getByTestId('body-map-image')).toHaveAttribute('src', '/body/male-front.webp');
  });

  // ── front + back views ──────────────────────────────────────────────────
  it('defaults to the front view; the front body does NOT paint back-only groups', () => {
    setSessions(HEAVY_CHEST);
    render(<MuscleBodyMap />);
    expect(screen.getByTestId('muscle-body-map')).toHaveAttribute('data-view', 'front');
    // Front view: spate / fese / hamstrings have NO drawn glow on the body.
    expect(screen.queryByTestId('body-region-spate')).not.toBeInTheDocument();
    expect(screen.queryByTestId('body-region-fese')).not.toBeInTheDocument();
    expect(screen.queryByTestId('body-region-picioare-hamstrings')).not.toBeInTheDocument();
    // Front-only groups ARE painted.
    expect(screen.getAllByTestId('body-region-piept').length).toBeGreaterThan(0);
  });

  it('the back view paints spate, fese, and hamstrings on the body', () => {
    setSessions(HEAVY_CHEST);
    render(<MuscleBodyMap />);
    fireEvent.click(screen.getByTestId('body-map-view-back'));
    expect(screen.getByTestId('muscle-body-map')).toHaveAttribute('data-view', 'back');
    expect(screen.getByTestId('body-map-image')).toHaveAttribute('src', '/body/male-back.webp');
    expect(screen.getAllByTestId('body-region-spate').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('body-region-fese').length).toBeGreaterThan(0);
    expect(
      screen.getAllByTestId('body-region-picioare-hamstrings').length,
    ).toBeGreaterThan(0);
  });

  it('the view toggle switches back to front', () => {
    setSessions(HEAVY_CHEST);
    render(<MuscleBodyMap />);
    fireEvent.click(screen.getByTestId('body-map-view-back'));
    expect(screen.getByTestId('muscle-body-map')).toHaveAttribute('data-view', 'back');
    fireEvent.click(screen.getByTestId('body-map-view-front'));
    expect(screen.getByTestId('muscle-body-map')).toHaveAttribute('data-view', 'front');
    expect(screen.queryByTestId('body-region-spate')).not.toBeInTheDocument();
  });

  it('the active toggle segment carries aria-pressed for a11y', () => {
    setSessions(HEAVY_CHEST);
    render(<MuscleBodyMap />);
    expect(screen.getByTestId('body-map-view-front')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('body-map-view-back')).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(screen.getByTestId('body-map-view-back'));
    expect(screen.getByTestId('body-map-view-back')).toHaveAttribute('aria-pressed', 'true');
  });

  it('the back-view body exposes a distinct aria-label (a11y both views)', () => {
    setSessions(HEAVY_CHEST);
    render(<MuscleBodyMap />);
    const frontAlt = screen.getByTestId('body-map-figure').getAttribute('aria-label');
    fireEvent.click(screen.getByTestId('body-map-view-back'));
    const backAlt = screen.getByTestId('body-map-figure').getAttribute('aria-label');
    expect(frontAlt).toBeTruthy();
    expect(backAlt).toBeTruthy();
    expect(frontAlt).not.toEqual(backAlt);
  });

  it('back-view regions also carry accessible group+state labels', () => {
    setSessions(HEAVY_CHEST);
    render(<MuscleBodyMap />);
    fireEvent.click(screen.getByTestId('body-map-view-back'));
    const spate = screen.getAllByTestId('body-region-spate')[0]!;
    const label = spate.getAttribute('aria-label') ?? '';
    expect(label.length).toBeGreaterThan(0);
    expect(label).toMatch(/:/);
  });

  it('cold state stays neutral in the back view too (no fabricated recovery)', () => {
    setSessions([]);
    render(<MuscleBodyMap />);
    fireEvent.click(screen.getByTestId('body-map-view-back'));
    expect(screen.getByTestId('muscle-body-map')).toHaveAttribute('data-cold', 'true');
    const spate = screen.getAllByTestId('body-region-spate')[0]!;
    expect(spate).toHaveAttribute('data-recovery-state', 'neutral');
    expect(document.querySelectorAll('.body-map-region--stressed').length).toBe(0);
  });

  // ── graceful fallback: image fails → SVG figure ───────────────────────────
  it('falls back to the SVG figure when the base image fails to load', () => {
    setSessions(HEAVY_CHEST);
    render(<MuscleBodyMap />);
    // Simulate a decode/network error on the base render.
    fireEvent.error(screen.getByTestId('body-map-image'));
    // Photo image gone; SVG silhouette now present; regions still drawn.
    expect(screen.queryByTestId('body-map-image')).not.toBeInTheDocument();
    expect(screen.getByTestId('body-map-silhouette')).toBeInTheDocument();
    expect(screen.getByTestId('muscle-body-map')).toHaveAttribute('data-render', 'svg');
    expect(screen.getAllByTestId('body-region-piept').length).toBeGreaterThan(0);
    // Figure still carries an accessible label after the fallback.
    expect(screen.getByTestId('body-map-figure')).toHaveAttribute('aria-label');
  });

  it('the SVG fallback keeps accessible group+state region labels', () => {
    setSessions(HEAVY_CHEST);
    render(<MuscleBodyMap />);
    fireEvent.error(screen.getByTestId('body-map-image'));
    const region = screen.getAllByTestId('body-region-piept')[0]!;
    const label = region.getAttribute('aria-label') ?? '';
    expect(label).toMatch(/:/);
  });

  // ── panel-header fatigue score (concern D) ────────────────────────────────
  it('suppresses the fatigue line at cold-start (not-enough-data → no line)', () => {
    // getFatigue() null (mock default) — never show "0/10" or a placeholder.
    setSessions(HEAVY_CHEST);
    render(<MuscleBodyMap />);
    expect(screen.queryByTestId('recovery-fatigue-line')).not.toBeInTheDocument();
  });

  it('suppresses the fatigue line on the INSUFFICIENT_DATA engine state', () => {
    vi.mocked(getFatigue).mockReturnValue({
      score: 0,
      key: 'INSUFFICIENT_DATA',
      label: 'DATE INSUFICIENTE',
      icon: '',
      color: '',
      recommend: 'none',
      detail: '',
    });
    setSessions(HEAVY_CHEST);
    render(<MuscleBodyMap />);
    expect(screen.queryByTestId('recovery-fatigue-line')).not.toBeInTheDocument();
  });

  it('shows the fatigue line beside the legend once there is real data', () => {
    vi.mocked(getFatigue).mockReturnValue({
      score: 75, // → 8/10 → "Loaded"/Solicitat (legend vocabulary)
      key: 'HIGH_FATIGUE',
      label: 'Azi mergem mai bland',
      icon: '',
      color: '',
      recommend: 'deload',
      detail: '',
    });
    setSessions(HEAVY_CHEST);
    render(<MuscleBodyMap />);
    const line = screen.getByTestId('recovery-fatigue-line');
    expect(line).toBeInTheDocument();
    // Score out of 10 + a legend-vocabulary word (default EN locale: Loaded).
    expect(line.textContent).toMatch(/8\/10/);
    expect(line.textContent).toMatch(/Loaded/);
    // Never the raw "0/10" placeholder.
    expect(line.textContent).not.toMatch(/0\/10/);
  });

  it('the fatigue word reuses the recovery legend vocabulary (low score → Fresh)', () => {
    vi.mocked(getFatigue).mockReturnValue({
      score: 10, // → 1/10 → "Fresh" (legend vocabulary, default EN locale)
      key: 'NORMAL',
      label: 'Pe drum bun',
      icon: '',
      color: '',
      recommend: 'normal',
      detail: '',
    });
    setSessions(HEAVY_CHEST);
    render(<MuscleBodyMap />);
    expect(screen.getByTestId('recovery-fatigue-line').textContent).toMatch(/1\/10/);
    expect(screen.getByTestId('recovery-fatigue-line').textContent).toMatch(/Fresh/);
  });
});
