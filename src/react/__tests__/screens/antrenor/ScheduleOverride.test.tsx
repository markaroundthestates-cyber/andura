// ══ SCHEDULE OVERRIDE TESTS — task_07 §C 5-option picker + override stub ══
// MemoryRouter jsdom paradigm per D020.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';

// The group picker (founder 2026-08-28) reads the engine's ranked alternatives.
// Mock the adapter so BOTH paths are deterministic: default [] = no options →
// the legacy "engine decides" navigation; a per-test list → the picker.
vi.mock('../../../lib/engineWrappers', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  getAlternativeClusterOptions: vi.fn(async () => []),
}));

import { ScheduleOverride } from '../../../routes/screens/antrenor/ScheduleOverride';
import { getAlternativeClusterOptions } from '../../../lib/engineWrappers';
// i18n locale pin — these specs assert RO copy (Schimbi planul de azi /
// Mai usor / Mai greu / etc). Force RO so the i18n indirection resolves
// to the RO assertion targets. EN coverage is locked separately by
// i18nNoRoLeak.test.tsx.
import { setLocale, _resetI18nCache } from '../../../../i18n/index.js';
beforeEach(() => {
  try { localStorage.removeItem('sf.locale'); } catch { /* noop */ }
  _resetI18nCache();
  setLocale('ro');
  vi.mocked(getAlternativeClusterOptions).mockResolvedValue([]);
});
afterEach(() => { vi.clearAllMocks(); });

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  const s = (loc.state ?? null) as Record<string, unknown> | null;
  return (
    <div data-testid="probe" data-pathname={loc.pathname}>
      {s ? JSON.stringify(s) : 'no-state'}
    </div>
  );
}

function renderOverride() {
  return render(
    <MemoryRouter initialEntries={['/app/antrenor/schedule-override']}>
      <Routes>
        <Route path="/app/antrenor/schedule-override" element={<ScheduleOverride />} />
        <Route path="/app/antrenor/workout-preview" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ScheduleOverride — render', () => {
  it('renders SubHeader title "Schimbi planul de azi?" (mockup L1107 verbatim)', () => {
    renderOverride();
    expect(
      screen.getByRole('heading', { name: /Schimbi planul de azi/i, level: 1 })
    ).toBeInTheDocument();
  });

  it('renders body sub-heading "Vrei alt antrenament azi?" (h2)', () => {
    renderOverride();
    expect(
      screen.getByRole('heading', { name: /Vrei alt antrenament azi/i, level: 2 })
    ).toBeInTheDocument();
  });

  it('renders SubHeader back button (PAR-009)', () => {
    renderOverride();
    expect(screen.getByTestId('schedule-override-back')).toBeInTheDocument();
  });

  it('renders helper copy "Coach respecta. Doar azi"', () => {
    renderOverride();
    expect(screen.getByText(/Coach respecta/i)).toBeInTheDocument();
    expect(screen.getByText(/Doar azi/i)).toBeInTheDocument();
  });

  it('renders 3 override options cu data-override-kind', () => {
    renderOverride();
    expect(screen.getByRole('button', { name: /Mai usor/i })).toHaveAttribute(
      'data-override-kind',
      'easier'
    );
    expect(screen.getByRole('button', { name: /Mai greu/i })).toHaveAttribute(
      'data-override-kind',
      'harder'
    );
    expect(screen.getByRole('button', { name: /Alta grupa/i })).toHaveAttribute(
      'data-override-kind',
      'different-muscle'
    );
  });

  it('renders description copy per option', () => {
    renderOverride();
    expect(screen.getByText(/-20%/)).toBeInTheDocument();
    expect(screen.getByText(/\+15%/)).toBeInTheDocument();
  });

  // No dead buttons (Bugatti) — mobility + cardio were REMOVED (no real mobility
  // template; aerobic logging is an inline Antrenor-tab card, not a route). The
  // screen must no longer render them.
  it('does NOT render removed mobility / cardio options', () => {
    renderOverride();
    expect(screen.queryByRole('button', { name: /Mobilitate/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Cardio/i })).toBeNull();
    expect(screen.queryByText(/Stretching/i)).toBeNull();
    expect(screen.queryByText(/25-40 min/i)).toBeNull();
  });
});

describe('ScheduleOverride — intensityMod mapping flow', () => {
  it('Mai usor → intensityMod=minus', () => {
    renderOverride();
    fireEvent.click(screen.getByRole('button', { name: /Mai usor/i }));
    const probe = screen.getByTestId('probe');
    expect(probe).toHaveAttribute('data-pathname', '/app/antrenor/workout-preview');
    expect(probe.textContent).toContain('"intensityMod":"minus"');
    expect(probe.textContent).toContain('"overrideKind":"easier"');
  });

  it('Mai greu → intensityMod=plus', () => {
    renderOverride();
    fireEvent.click(screen.getByRole('button', { name: /Mai greu/i }));
    const probe = screen.getByTestId('probe');
    expect(probe.textContent).toContain('"intensityMod":"plus"');
    expect(probe.textContent).toContain('"overrideKind":"harder"');
  });

  // "Alta grupa" carries overrideKind=different-muscle (intensityMod stays normal);
  // WorkoutPreview consumes overrideKind to request a real alternative session from
  // the engine — it is NOT a dead label anymore.
  it('Alta grupa → overrideKind=different-muscle (drives the engine alternative)', async () => {
    renderOverride();
    await waitFor(() => expect(screen.getByRole('button', { name: /Alta grupa/i })).not.toHaveAttribute('aria-expanded'));
    fireEvent.click(screen.getByRole('button', { name: /Alta grupa/i }));
    const probe = screen.getByTestId('probe');
    expect(probe.textContent).toContain('"intensityMod":"normal"');
    expect(probe.textContent).toContain('"overrideKind":"different-muscle"');
  });
});

// Founder 2026-08-28 — "daca dau want something else today... tot ce vrea ea imi
// da": the override used to DECIDE the group. With ranked alternatives available
// the row opens a picker; the engine's own auto-pick is merely marked.
describe('ScheduleOverride — group picker (founder 2026-08-28)', () => {
  const OPTS = [
    { cluster: 'pull', label: 'Pull (spate si biceps)', recommended: true },
    { cluster: 'legs', label: 'Picioare', recommended: false },
  ];

  it('Alta grupa opens the ranked picker instead of deciding for the user', async () => {
    vi.mocked(getAlternativeClusterOptions).mockResolvedValue(OPTS);
    renderOverride();
    await waitFor(() => expect(getAlternativeClusterOptions).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: /Alta grupa/i }));
    expect(screen.getByTestId('override-group-picker')).toBeInTheDocument();
    expect(screen.getByTestId('override-group-pull')).toBeInTheDocument();
    expect(screen.getByTestId('override-group-legs')).toBeInTheDocument();
    // Still on the override screen — nothing was chosen FOR the user.
    expect(screen.queryByTestId('probe')).toBeNull();
  });

  it('picking a group navigates carrying that cluster', async () => {
    vi.mocked(getAlternativeClusterOptions).mockResolvedValue(OPTS);
    renderOverride();
    await waitFor(() => expect(getAlternativeClusterOptions).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: /Alta grupa/i }));
    fireEvent.click(screen.getByTestId('override-group-legs'));
    const probe = screen.getByTestId('probe');
    expect(probe.textContent).toContain('"overrideKind":"different-muscle"');
    expect(probe.textContent).toContain('"differentMuscleCluster":"legs"');
  });

  it("the engine's freshest pick is marked, not imposed", async () => {
    vi.mocked(getAlternativeClusterOptions).mockResolvedValue(OPTS);
    renderOverride();
    await waitFor(() => expect(getAlternativeClusterOptions).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: /Alta grupa/i }));
    const recommended = screen.getByTestId('override-group-pull');
    expect(recommended.textContent).toMatch(/cea mai odihnita/i);
    expect(screen.getByTestId('override-group-legs').textContent).not.toMatch(/cea mai odihnita/i);
  });

  it('no alternatives (rest day / engine throw) → legacy navigation, no dead row', async () => {
    renderOverride(); // default mock → []
    await waitFor(() => expect(screen.getByRole('button', { name: /Alta grupa/i })).not.toHaveAttribute('aria-expanded'));
    fireEvent.click(screen.getByRole('button', { name: /Alta grupa/i }));
    expect(screen.getByTestId('probe').textContent).toContain('"overrideKind":"different-muscle"');
  });
});

// Founder 2026-10-10 ("ma duce direct la antrenament sa dau confirm... nu pot selecta
// altceva"): on his phone the ranked list took seconds (it recomposed today's plan), and
// a tap before it arrived went straight to the engine's pick. A tap now waits for it.
describe('ScheduleOverride — group list still loading (founder 2026-10-10)', () => {
  const OPTS = [
    { cluster: 'push', label: 'Push', recommended: true },
    { cluster: 'legs', label: 'Picioare', recommended: false },
  ];

  it('a tap before the list arrives opens the picker, never picks for him', async () => {
    let resolve: (v: typeof OPTS) => void = () => {};
    vi.mocked(getAlternativeClusterOptions).mockReturnValue(new Promise((r) => { resolve = r; }));
    renderOverride();
    fireEvent.click(screen.getByRole('button', { name: /Alta grupa/i }));
    expect(screen.queryByTestId('probe')).toBeNull();
    expect(screen.getByTestId('override-group-loading')).toBeInTheDocument();
    resolve(OPTS);
    expect(await screen.findByTestId('override-group-legs')).toBeInTheDocument();
    expect(screen.queryByTestId('override-group-loading')).toBeNull();
  });

  it("the plan's own session type rides in, so the list skips a recompose", async () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/app/antrenor/schedule-override', state: { scheduledSessionType: 'UPPER' } }]}>
        <Routes>
          <Route path="/app/antrenor/schedule-override" element={<ScheduleOverride />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => expect(getAlternativeClusterOptions).toHaveBeenCalledWith(undefined, 'UPPER'));
  });
});

describe('ScheduleOverride — Romanian no-diacritics rule (D-LEGACY-064)', () => {
  it('no diacritics in UI rendered text', () => {
    const { container } = renderOverride();
    const text = container.textContent ?? '';
    expect(/[ăâîșțĂÂÎȘȚ]/.test(text)).toBe(false);
  });
});
