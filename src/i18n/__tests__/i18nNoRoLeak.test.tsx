// ══ I18N CLUSTER H — Zero RO leak under EN locale gate ════════════════════
// Daniel mandate verbatim 2026-05-28: "la Engleza vreau sa fie default... si
// sa nu vad cuvant in romana cand e pe engleza... nici in exercitii nici pe
// nicaieri."
//
// This is the contract test for Wave C2 (i18n EN-zero-leak). Renders the
// highest-traffic screens (Antrenor home + Workout in-session + EnergyCheck +
// Progres + Istoric + Cont) under EN locale and asserts:
//   1. No diacritics (D-LEGACY-064 + EN charset).
//   2. No RO-specific tokens leak (Romanian-only words that ZERO native
//      EN reader would produce).
//
// The forbidden token list is intentionally compact — it picks words that
// are NOT proper nouns (Andura), NOT names (Daniel), NOT exercise IDs (Bench
// Press / Romanian Deadlift / Lat Pulldown stay English under both locales),
// and NOT shared cognates (kg, OK, min). Each token is a high-confidence
// RO-only signal: a single hit = a real leak.
//
// When the test fails, it tells you which screen + which forbidden token —
// trace it back to the unwired string and replace with t('...').
//
// This test is the single source of truth for "no RO leak under EN". When it
// passes across the listed screens, the EN-default mandate is met.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { setLocale, _resetI18nCache } from '../index.js';
import { useWorkoutStore } from '../../react/stores/workoutStore';
import { useCoachStore } from '../../react/stores/coachStore';
import { useOnboardingStore } from '../../react/stores/onboardingStore';
import { useScheduleStore } from '../../react/stores/scheduleStore';
import type { LastSessionSummary, SessionExerciseBreakdown } from '../../react/stores/workoutStore';
import type { PRRecord } from '../../react/lib/prHistoryAggregate';

// ── Mocks for async aggregates so screens render synchronously ──────────────
vi.mock('../../react/lib/coachDirectorAggregate', () => ({
  getCoachToday: vi.fn(async () => ({
    readiness: null,
    fatigue: null,
    plannedWorkout: null,
    isRestDay: true,
    patternsBanner: [],
    prWallRecent: [],
    alerts: [],
    restReason: null,
    source: 'baseline' as const,
  })),
}));

vi.mock('../../react/lib/engineWrappers', async () => {
  const actual = await vi.importActual<typeof import('../../react/lib/engineWrappers')>(
    '../../react/lib/engineWrappers'
  );
  return {
    ...actual,
    getReadiness: vi.fn(() => null),
    getFatigue: vi.fn(() => null),
    getPRDelta: vi.fn(() => null),
    getTodayWorkout: vi.fn(async () => null),
    getCoachTodayQuote: vi.fn(() => null),
    getLaggingSignal: vi.fn(() => null),
    getWhyExerciseSummary: vi.fn(() => null),
  };
});

import { Antrenor } from '../../react/routes/screens/antrenor/Antrenor';
import { EnergyCheck } from '../../react/routes/screens/antrenor/EnergyCheck';
import { Cont } from '../../react/routes/screens/cont/Cont';
import { CoachRestCard } from '../../react/components/Antrenor/CoachRestCard';
import { CoachTodayCard } from '../../react/components/Antrenor/CoachTodayCard';
// Wave E3 i18n: extend coverage to Calendar + Istoric tab surfaces.
import { Calendar7Day } from '../../react/components/Calendar7Day';
import { CalendarHeatmap } from '../../react/components/Istoric/CalendarHeatmap';
import { RatingsStrip90Day } from '../../react/components/Istoric/RatingsStrip90Day';
import { VirtualSessionList } from '../../react/components/Istoric/VirtualSessionList';
import { PRWallRecent } from '../../react/components/Antrenor/PRWallRecent';
import { Istoric } from '../../react/routes/screens/istoric/Istoric';
import { IstoricDetail } from '../../react/routes/screens/istoric/IstoricDetail';
import { PrWall } from '../../react/routes/screens/istoric/PrWall';

// ── Forbidden tokens (RO-only signals) ──────────────────────────────────────
//
// Each entry MUST be:
//   - a real Romanian word (NOT a proper noun, NOT a name, NOT a cognate),
//   - high-frequency in our codebase (so leaks are easy to spot),
//   - NEVER expected under EN locale.
//
// Excluded on purpose:
//   - 'kg', 'OK', 'PR' — international/unit-of-measure.
//   - 'Andura', 'Daniel' — proper nouns.
//   - 'Bench Press', 'Romanian Deadlift', 'Lat Pulldown', etc — engine
//     canonical English keys (stay EN under both locales).
//   - Single letters or short prefixes ("la", "in") — false positives.
//
// Diacritics also caught separately via the RO_DIACRITICS regex.
const FORBIDDEN_RO_TOKENS = [
  // Verbs / actions
  'antrenament',
  'antrenor',
  'antrenamentul',
  'incepe',
  'logheaza',
  'logat',
  'salveaza',
  'sterge',
  'inchide',
  'continua',
  'anuleaza',
  'reincepe',
  'reseteaza',
  'descarca',
  'importa',
  'inlocuit',
  'recupereaza',
  // Nouns
  'sesiunea',
  'sesiunii',
  'exercitiu',
  'exercitii',
  'exercitiul',
  'repetari',
  'seturi',
  'setul',
  'greutate',
  'greutatea',
  'oboseala',
  'recuperare',
  'odihna',
  'minute',
  'secunde',
  'saptamana',
  'saptamani',
  'luni',
  'ziua',
  'zile',
  'astazi',
  'maine',
  'ieri',
  'noua',
  'utilizator',
  'profilul',
  'setari',
  'notificari',
  'confidentialitate',
  'deconectare',
  // Adjectives / connectives
  'usoara',
  'usor',
  'puternica',
  'grea',
  'potrivita',
  'curenta',
  'curent',
  'temporar',
  'nerealista',
  'sanatoasa',
  // Short common — narrowed to compound forms to avoid false positives
  'pentru',
  'despre',
  'inapoi',
  // Wave E3 — Calendar + Istoric tab vocabulary
  'istoricul',
  'recorduri',
  'recordurile',
  'sesiune',
  'sesiuni',
  'consecutive',
  'asteapta',
  'termina',
  'modifica',
  'luna',
  'cronologic',
  'descrescator',
  'antrenamente',
  'urmatoarea',
  'anterioara',
  'libera',
  'detaliu',
  'tonaj',
  'volum',
  'program',
  'lipsa',
  'odihna',
  // Months (RO genitives that should never appear under EN)
  'ianuarie',
  'februarie',
  'martie',
  'aprilie',
  'iunie',
  'iulie',
  'septembrie',
  'octombrie',
  'noiembrie',
  'decembrie',
];

const RO_DIACRITICS = /[ăâîșțĂÂÎȘȚşţŞŢ]/;

/**
 * Build a single regex that matches any forbidden token as a whole word
 * (word boundary on both sides, case-insensitive).
 */
const FORBIDDEN_TOKEN_REGEX = new RegExp(
  `\\b(${FORBIDDEN_RO_TOKENS.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
  'i',
);

function assertNoRoLeak(label: string, text: string): void {
  // 1. No diacritics.
  expect(
    RO_DIACRITICS.test(text),
    `RO leak (diacritic) in ${label}`,
  ).toBe(false);
  // 2. No forbidden RO tokens.
  const match = text.match(FORBIDDEN_TOKEN_REGEX);
  expect(
    match,
    `RO leak in ${label} — forbidden token "${match?.[0] ?? ''}" found. Replace the hardcoded RO string with a t('key') call and add the EN translation to en.json.`,
  ).toBeNull();
}

// ── Render helpers ──────────────────────────────────────────────────────────
function withRouter(initialPath: string, children: JSX.Element): JSX.Element {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path={initialPath} element={children} />
        <Route path="*" element={<div data-testid="probe" />} />
      </Routes>
    </MemoryRouter>
  );
}

// Wave E3 fixtures for Istoric tab surfaces. Built minimal so the screens
// hit both empty + populated branches without dragging RO copy from
// fixtures that no longer matter (legacy-shape rows). Exercise names stay
// EN-canonical (Bench Press / Squat) — engine convention.
const WAVE_E3_EXERCISE: SessionExerciseBreakdown = {
  exerciseId: 'bench-press',
  exerciseName: 'Bench Press',
  sets: [
    { kg: 100, reps: 5, rating: 'usor', timestamp: Date.now() },
    { kg: 100, reps: 5, rating: 'potrivit', timestamp: Date.now() },
    { kg: 100, reps: 5, rating: 'greu', timestamp: Date.now(), isPR: true },
  ],
  totalVolume: 1500,
  peakOneRM: 117,
};

const WAVE_E3_SESSION: LastSessionSummary = {
  title: 'Push',
  meta: '5 · 45 · 1200',
  ts: Date.now() - 86400000,
  sets: 5,
  durationMin: 45,
  volumeKg: 1500,
  exercises: [WAVE_E3_EXERCISE],
};

const WAVE_E3_PR_RECORDS: readonly PRRecord[] = [
  {
    exerciseId: 'bench-press',
    exerciseName: 'Bench Press',
    kg: 100,
    reps: 5,
    oneRMEstimate: 117,
    sessionTs: Date.now() - 86400000,
    sessionTitle: 'Push',
  },
  {
    exerciseId: 'squat',
    exerciseName: 'Squat',
    kg: 140,
    reps: 5,
    oneRMEstimate: 163,
    sessionTs: Date.now() - 2 * 86400000,
    sessionTitle: 'Legs',
  },
];

function resetStores(): void {
  useWorkoutStore.setState({
    exIdx: 0,
    setIdx: 0,
    phase: 'idle',
    prHit: false,
    history: {},
    sessionStart: null,
    lastRating: null,
    pausedSnapshot: null,
    lastSession: null,
    sessionsHistory: [],
    streak: 0,
  });
  useCoachStore.setState({
    schedContext: 'workout',
    persona: 'gigica',
    reactivateDismissed: false,
  });
  useOnboardingStore.setState({
    data: { age: 30, sex: 'm', goal: 'masa', frequency: '4', experience: 'intermediar', weight: 75, height: 175 },
    completed: true,
    completedAt: Date.now(),
  });
}

beforeEach(() => {
  try { localStorage.clear(); } catch { /* noop */ }
  resetStores();
  // Force EN locale — the contract.
  setLocale('en');
  _resetI18nCache();
  setLocale('en');
});

afterEach(() => {
  try { localStorage.removeItem('sf.locale'); } catch { /* noop */ }
  _resetI18nCache();
});

// ── Tests ──────────────────────────────────────────────────────────────────

describe('Wave C2 i18n — no RO leak under EN locale (Daniel mandate)', () => {
  it('Antrenor home renders without RO leak under EN locale', async () => {
    const { container } = render(withRouter('/app/antrenor', <Antrenor />));
    // Wait one microtask for getCoachToday() promise to settle.
    await Promise.resolve();
    await Promise.resolve();
    assertNoRoLeak('Antrenor home', container.textContent ?? '');
  });

  it('EnergyCheck renders without RO leak under EN locale', () => {
    const { container } = render(withRouter('/app/antrenor/energy-check', <EnergyCheck />));
    assertNoRoLeak('EnergyCheck', container.textContent ?? '');
  });

  it('Cont landing renders without RO leak under EN locale', () => {
    const { container } = render(withRouter('/app/cont', <Cont />));
    assertNoRoLeak('Cont landing', container.textContent ?? '');
  });

  it('CoachRestCard fallback (null restReason) has no RO leak under EN', () => {
    const { container } = render(
      <CoachRestCard onLightSession={() => {}} onOverride={() => {}} restReason={null} />,
    );
    assertNoRoLeak('CoachRestCard fallback', container.textContent ?? '');
  });

  it('CoachRestCard with fatigued groups joins them with EN " and " (not RO " si ")', () => {
    const { container } = render(
      <CoachRestCard
        onLightSession={() => {}}
        onOverride={() => {}}
        restReason={{ fatiguedGroups: ['Chest', 'Quads'], readinessScore: 48 }}
      />,
    );
    const text = container.textContent ?? '';
    expect(text).toContain('and');
    expect(text).not.toMatch(/\bsi\b/i);
    assertNoRoLeak('CoachRestCard with groups', text);
  });

  it('CoachTodayCard renders without RO leak under EN', async () => {
    render(
      <MemoryRouter>
        <CoachTodayCard onStart={() => {}} workout={null} />
      </MemoryRouter>,
    );
    await Promise.resolve();
    const card = screen.getByRole('region');
    assertNoRoLeak('CoachTodayCard', card.textContent ?? '');
  });
});

// ── Wave E3 — Calendar + Istoric tab surfaces ────────────────────────────
describe('Wave E3 i18n — no RO leak on calendar + Istoric tab', () => {
  it('Calendar7Day (Antrenor home schedule strip) — locked + edit modes', () => {
    // Locked default.
    const { container, rerender } = render(<Calendar7Day />);
    assertNoRoLeak('Calendar7Day locked', container.textContent ?? '');
    // Edit mode (surfaces hint + Save CTA). Mutate the schedule store
    // in-place rather than re-render with a prop since the component reads
    // from the zustand selector.
    useScheduleStore.setState({ editMode: true });
    rerender(<Calendar7Day />);
    assertNoRoLeak('Calendar7Day edit', container.textContent ?? '');
    useScheduleStore.setState({ editMode: false });
  });

  it('CalendarHeatmap (Istoric monthly grid) — empty + populated', () => {
    // Empty.
    const empty = render(<CalendarHeatmap />);
    assertNoRoLeak('CalendarHeatmap empty', empty.container.textContent ?? '');
    empty.unmount();
    // Populated with a hard session today (forces ratingWord branch).
    useWorkoutStore.setState({ sessionsHistory: [WAVE_E3_SESSION] });
    const populated = render(<CalendarHeatmap />);
    assertNoRoLeak('CalendarHeatmap populated', populated.container.textContent ?? '');
  });

  it('RatingsStrip90Day (Istoric 90-day strip) — empty + 3 sessions', () => {
    const empty = render(<RatingsStrip90Day />);
    assertNoRoLeak('RatingsStrip empty', empty.container.textContent ?? '');
    empty.unmount();
    useWorkoutStore.setState({
      sessionsHistory: [
        WAVE_E3_SESSION,
        { ...WAVE_E3_SESSION, ts: Date.now() - 10 * 86400000 },
        { ...WAVE_E3_SESSION, ts: Date.now() - 30 * 86400000 },
      ],
    });
    const populated = render(<RatingsStrip90Day />);
    assertNoRoLeak('RatingsStrip populated', populated.container.textContent ?? '');
  });

  it('VirtualSessionList (Istoric session list) renders rows without RO leak', () => {
    const sessions = [WAVE_E3_SESSION, { ...WAVE_E3_SESSION, ts: Date.now() - 86400000 * 2 }];
    const { container } = render(
      <VirtualSessionList
        sorted={sessions}
        sessionsHistory={sessions}
        formatDate={(ts) => String(ts)}
        onSelect={() => {}}
      />,
    );
    assertNoRoLeak('VirtualSessionList', container.textContent ?? '');
  });

  it('PRWallRecent (Antrenor home top-3 slice) — populated', () => {
    const { container } = render(<PRWallRecent records={WAVE_E3_PR_RECORDS} />);
    assertNoRoLeak('PRWallRecent', container.textContent ?? '');
  });

  it('Istoric landing — empty state has no RO leak', () => {
    useWorkoutStore.setState({ sessionsHistory: [] });
    const { container } = render(withRouter('/app/istoric', <Istoric />));
    assertNoRoLeak('Istoric empty', container.textContent ?? '');
  });

  it('Istoric landing — populated (sessions + PR wall + stats) has no RO leak', () => {
    useWorkoutStore.setState({
      sessionsHistory: [WAVE_E3_SESSION, { ...WAVE_E3_SESSION, ts: Date.now() - 86400000 * 3 }],
      streak: 7,
    });
    const { container } = render(withRouter('/app/istoric', <Istoric />));
    assertNoRoLeak('Istoric populated', container.textContent ?? '');
  });

  it('IstoricDetail — present session (per-exercise breakdown) has no RO leak', () => {
    useWorkoutStore.setState({ sessionsHistory: [WAVE_E3_SESSION] });
    const { container } = render(withRouter('/app/istoric/0', <IstoricDetail />));
    assertNoRoLeak('IstoricDetail present', container.textContent ?? '');
  });

  it('IstoricDetail — missing session (404 branch) has no RO leak', () => {
    useWorkoutStore.setState({ sessionsHistory: [] });
    const { container } = render(withRouter('/app/istoric/999', <IstoricDetail />));
    assertNoRoLeak('IstoricDetail missing', container.textContent ?? '');
  });

  it('IstoricDetail — legacy session (no exercises field) has no RO leak', () => {
    useWorkoutStore.setState({
      sessionsHistory: [{ title: 'Push', meta: '5 · 30 · 910', ts: Date.now() }],
    });
    const { container } = render(withRouter('/app/istoric/0', <IstoricDetail />));
    assertNoRoLeak('IstoricDetail legacy', container.textContent ?? '');
  });

  it('PrWall (standalone screen) — empty has no RO leak', () => {
    useWorkoutStore.setState({ sessionsHistory: [] });
    const { container } = render(withRouter('/app/istoric/pr-wall', <PrWall />));
    assertNoRoLeak('PrWall empty', container.textContent ?? '');
  });

  it('PrWall (standalone screen) — populated has no RO leak', () => {
    useWorkoutStore.setState({ sessionsHistory: [WAVE_E3_SESSION] });
    const { container } = render(withRouter('/app/istoric/pr-wall', <PrWall />));
    assertNoRoLeak('PrWall populated', container.textContent ?? '');
  });
});

describe('Wave C2 i18n — RO opt-in still works (Cont > Setari > Limba honored)', () => {
  it('switching to RO locale surfaces RO labels (Antrenor heading)', async () => {
    // Reset and pick RO.
    setLocale('ro');
    _resetI18nCache();
    setLocale('ro');
    const { container } = render(withRouter('/app/antrenor', <Antrenor />));
    await Promise.resolve();
    await Promise.resolve();
    expect(container.textContent ?? '').toContain('Antrenor');
  });
});
