// ══ PAIN BUTTON TESTS — task_06 §B region + intensity + CDL stub state ════
// MemoryRouter jsdom paradigm per D020.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import {
  PainButton,
  persistPainCdl,
  PAIN_CDL_KEY,
  PAIN_CDL_MAX,
  type PainCdlEntry,
} from '../../../routes/screens/antrenor/PainButton';
import { DB } from '../../../../db.js';
import { useWorkoutStore } from '../../../stores/workoutStore';

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  const s = (loc.state ?? null) as Record<string, unknown> | null;
  return (
    <div data-testid="probe" data-pathname={loc.pathname}>
      {s ? JSON.stringify(s) : 'no-state'}
    </div>
  );
}

function renderPainButton(initialState?: { from?: string }) {
  const initialEntry = initialState
    ? { pathname: '/app/antrenor/pain-button', state: initialState }
    : '/app/antrenor/pain-button';
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/app/antrenor/pain-button" element={<PainButton />} />
        <Route path="/app/antrenor/workout-preview" element={<LocationProbe />} />
        <Route path="/app/antrenor/workout" element={<LocationProbe />} />
        <Route path="/app/antrenor" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PainButton — render', () => {
  it('renders SubHeader title "Ma doare ceva" (mockup L1013 verbatim)', () => {
    renderPainButton();
    expect(
      screen.getByRole('heading', { name: /Ma doare ceva/i, level: 1 })
    ).toBeInTheDocument();
  });

  it('renders body sub-heading "Unde te doare?" (h2)', () => {
    renderPainButton();
    expect(
      screen.getByRole('heading', { name: /Unde te doare/i, level: 2 })
    ).toBeInTheDocument();
  });

  it('renders SubHeader back button (PAR-009)', () => {
    renderPainButton();
    expect(screen.getByTestId('pain-button-back')).toBeInTheDocument();
  });

  it('renders helper copy "Coach evita exercitii"', () => {
    renderPainButton();
    expect(screen.getByText(/Coach evita exercitii/i)).toBeInTheDocument();
  });

  it('renders 15 region buttons', () => {
    const { container } = renderPainButton();
    // a11y: container is NOT role="list" (stray list with <button> children
    // reads empty to SR) — count region buttons directly via data-region.
    const regionButtons = container.querySelectorAll('button[data-region]');
    expect(regionButtons.length).toBe(15);
  });

  it('renders 3 intensity buttons (Usor / Mediu / Sever)', () => {
    renderPainButton();
    expect(screen.getByRole('button', { name: /Usor/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Mediu/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sever/i })).toBeInTheDocument();
  });

  it('renders Continue + Exit buttons', () => {
    renderPainButton();
    expect(screen.getByTestId('pain-continue')).toBeInTheDocument();
    expect(screen.getByTestId('pain-exit')).toBeInTheDocument();
  });
});

describe('PainButton — selection state', () => {
  it('Continue disabled cand no region selected', () => {
    renderPainButton();
    expect(screen.getByTestId('pain-continue')).toBeDisabled();
  });

  it('Continue enabled cand region selected', () => {
    renderPainButton();
    fireEvent.click(screen.getByRole('button', { name: /^Umar stang$/i }));
    expect(screen.getByTestId('pain-continue')).not.toBeDisabled();
  });

  it('region button aria-pressed reflects selection', () => {
    renderPainButton();
    const lombar = screen.getByRole('button', { name: /^Lombar$/i });
    expect(lombar).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(lombar);
    expect(lombar).toHaveAttribute('aria-pressed', 'true');
  });

  it('intensity defaults la 1 (Usor)', () => {
    renderPainButton();
    expect(screen.getByRole('button', { name: /Usor/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('intensity selection toggles aria-pressed', () => {
    renderPainButton();
    fireEvent.click(screen.getByRole('button', { name: /Sever/i }));
    expect(screen.getByRole('button', { name: /Sever/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: /Usor/i })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });
});

describe('PainButton — navigation flow', () => {
  it('Continue propagates painContext + intensityMod=minus la workout-preview (pre-session)', () => {
    // Pre-session: no live workout (sessionStart=null, no from='workout') →
    // historical preview route preserved so the user sees the adapted session
    // before starting fresh.
    renderPainButton();
    fireEvent.click(screen.getByRole('button', { name: /^Genunchi drept$/i }));
    fireEvent.click(screen.getByRole('button', { name: /Mediu/i }));
    fireEvent.click(screen.getByTestId('pain-continue'));
    const probe = screen.getByTestId('probe');
    expect(probe).toHaveAttribute('data-pathname', '/app/antrenor/workout-preview');
    expect(probe.textContent).toContain('"region":"genunchi-drept"');
    expect(probe.textContent).toContain('"intensity":2');
    expect(probe.textContent).toContain('"intensityMod":"minus"');
  });

  it('Continue in-session: navigates back la workout + persists painContext on store (#18)', () => {
    // Daniel smoke 2026-05-28 #18 verbatim "trebuie sa se adapteze in timp
    // real... nu sa ma puna sa il deschid iar". Mid-session pain must NOT
    // bounce through workout-preview — it stamps sessionContext on the store
    // and returns to the live workout. The remaining-sets minus override
    // lives in Workout.tsx (sessionContext.painContext != null → minus).
    useWorkoutStore.getState().reset();
    useWorkoutStore.setState({ sessionStart: 1000 });
    renderPainButton({ from: 'workout' });
    fireEvent.click(screen.getByRole('button', { name: /^Lombar$/i }));
    fireEvent.click(screen.getByRole('button', { name: /Usor/i }));
    fireEvent.click(screen.getByTestId('pain-continue'));
    const probe = screen.getByTestId('probe');
    expect(probe).toHaveAttribute('data-pathname', '/app/antrenor/workout');
    const ctx = useWorkoutStore.getState().sessionContext;
    expect(ctx?.intensityMod).toBe('minus');
    expect(ctx?.painContext?.region).toBe('lombar');
    expect(ctx?.painContext?.intensity).toBe(1);
    useWorkoutStore.getState().reset();
  });

  it('Exit navigates la /app/antrenor', () => {
    renderPainButton();
    fireEvent.click(screen.getByTestId('pain-exit'));
    expect(screen.getByTestId('probe')).toHaveAttribute(
      'data-pathname',
      '/app/antrenor'
    );
  });

  it('Continue no-op cand region nu selectata', () => {
    renderPainButton();
    fireEvent.click(screen.getByTestId('pain-continue'));
    // Should NOT navigate; probe should not render (still on pain-button).
    expect(screen.queryByTestId('probe')).not.toBeInTheDocument();
  });
});

describe('PainButton — Romanian no-diacritics rule (D-LEGACY-064)', () => {
  it('no diacritics in UI rendered text', () => {
    const { container } = renderPainButton();
    const text = container.textContent ?? '';
    expect(/[ăâîșțĂÂÎȘȚ]/.test(text)).toBe(false);
  });
});

// §43-H2 — pain persisted to append-only CDL so Recovery Engine reads it next
// session (was ephemeral location.state only). Recovery path reads via
// DB.get(PAIN_CDL_KEY).
describe('PainButton — pain CDL persistence (§43-H2)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('Continue persists a {type:pain, region, intensity, ts} entry to DB(pain-cdl)', () => {
    renderPainButton();
    fireEvent.click(screen.getByRole('button', { name: /^Lombar$/i }));
    fireEvent.click(screen.getByRole('button', { name: /Sever/i }));
    fireEvent.click(screen.getByTestId('pain-continue'));

    // Read back via the same DB key the recovery path reads.
    const log = DB.get<PainCdlEntry[]>(PAIN_CDL_KEY);
    expect(Array.isArray(log)).toBe(true);
    expect(log!.length).toBe(1);
    const entry = log![0]!;
    expect(entry.type).toBe('pain');
    expect(entry.region).toBe('lombar');
    expect(entry.intensity).toBe(3);
    expect(typeof entry.ts).toBe('number');
    expect(entry.ts).toBeGreaterThan(0);
  });

  it('does NOT persist when no region selected (Continue no-op)', () => {
    renderPainButton();
    fireEvent.click(screen.getByTestId('pain-continue'));
    expect(DB.get(PAIN_CDL_KEY)).toBeNull();
  });

  it('appends newest-first (recovery reads most recent at index 0)', () => {
    persistPainCdl('umar-stang', 1);
    persistPainCdl('genunchi-drept', 2);
    const log = DB.get<PainCdlEntry[]>(PAIN_CDL_KEY)!;
    expect(log.length).toBe(2);
    expect(log[0]!.region).toBe('genunchi-drept'); // latest first
    expect(log[1]!.region).toBe('umar-stang');
  });

  it('caps the rolling window at PAIN_CDL_MAX entries', () => {
    const seeded: PainCdlEntry[] = Array.from({ length: PAIN_CDL_MAX }, (_, i) => ({
      type: 'pain',
      region: 'spate',
      intensity: 1,
      ts: i,
    }));
    DB.set(PAIN_CDL_KEY, seeded);
    persistPainCdl('lombar', 3);
    const log = DB.get<PainCdlEntry[]>(PAIN_CDL_KEY)!;
    expect(log.length).toBe(PAIN_CDL_MAX);
    expect(log[0]!.region).toBe('lombar'); // newest kept
  });

  it('soft-fails without throwing when DB write is unavailable', () => {
    const original = DB.set;
    DB.set = () => {
      throw new Error('quota');
    };
    expect(() => persistPainCdl('piept', 2)).not.toThrow();
    DB.set = original;
  });
});
