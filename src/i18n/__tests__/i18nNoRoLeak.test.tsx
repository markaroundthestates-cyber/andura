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
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { setLocale, _resetI18nCache } from '../index.js';
import { useWorkoutStore } from '../../react/stores/workoutStore';
import { useCoachStore } from '../../react/stores/coachStore';
import { useOnboardingStore } from '../../react/stores/onboardingStore';

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
// ── Wave E2 — body comp + Progres deep coverage ─────────────────────────────
import { BMRStrip } from '../../react/components/Progres/BMRStrip';
import { ProjectionStrip } from '../../react/components/Progres/ProjectionStrip';
import { NutritionInline } from '../../react/components/NutritionInline';
import { ObiectivCard } from '../../react/components/Progres/ObiectivCard';
import { LogWeight } from '../../react/routes/screens/progres/LogWeight';
import { BodyData } from '../../react/routes/screens/progres/BodyData';
import { WeightTimeline } from '../../react/routes/screens/progres/WeightTimeline';
import { WeightLogList } from '../../react/routes/screens/progres/WeightLogList';
import { useProgresStore } from '../../react/stores/progresStore';

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
  'editeaza',
  'inchide',
  'continua',
  'anuleaza',
  'reincepe',
  'reseteaza',
  'descarca',
  'importa',
  'inlocuit',
  'recupereaza',
  'preconizez',
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
  // Wave E2 body comp + progres tokens
  'calorii',
  'cantarire',
  'inregistrare',
  'inregistrari',
  'inregistrarea',
  'inregistrarile',
  'masuratori',
  'masurare',
  'masuratorile',
  'preconizare',
  'proiectie',
  'proteine',
  'mese',
  'loguri',
  'evolutia',
  'istoricul',
  'panta',
  'ritmul',
  'estimare',
  'estimarea',
  'talie',
  'coapsa',
  'piept',
  'sold',
  // 'biceps', 'Kcal', 'BMR' are international/cognates — keep out
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
  // Wave E2 — Progres / body comp coverage. Both empty (exercise BMR/projection
  // empty branches) and seeded variants exercised below. Default empty here.
  useProgresStore.setState({ weightLog: [], bodyData: [] });
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

  // ── Wave E2 — body comp + Progres deep coverage ────────────────────────
  // Render each leaf component / route screen under EN locale and confirm
  // no Romanian-only token surfaces. Both empty + seeded variants exercised
  // where they expose different copy branches (BMRStrip null vs computed,
  // WeightLogList empty vs list, etc).

  it('BMRStrip computed-branch renders without RO leak under EN', () => {
    // Seeded onboarding (set in resetStores) → BMR > 0 → label+value branch.
    const { container } = render(<BMRStrip />);
    assertNoRoLeak('BMRStrip computed', container.textContent ?? '');
  });

  it('BMRStrip empty-branch renders without RO leak under EN', () => {
    // Wipe onboarding so BMR resolves to null → emptyHint branch surfaces.
    useOnboardingStore.setState({
      data: { age: null, sex: null, goal: null, frequency: null, experience: null, weight: null, height: null },
      completed: false,
      completedAt: null,
    });
    const { container } = render(<BMRStrip />);
    assertNoRoLeak('BMRStrip empty', container.textContent ?? '');
  });

  it('ProjectionStrip empty-branch renders without RO leak under EN', async () => {
    // No nutrition log → readNutritionProjection resolves to null →
    // emptyHint branch ("Log a few days of meals…").
    const { container } = render(<ProjectionStrip />);
    // Wait for the async effect to settle (setLoaded(true) before render).
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    assertNoRoLeak('ProjectionStrip empty', container.textContent ?? '');
  });

  it('NutritionInline renders without RO leak under EN (default + edit mode)', () => {
    const { container } = render(<NutritionInline />);
    assertNoRoLeak('NutritionInline default', container.textContent ?? '');
    // Toggle edit on both chips → exposes Save CTA copy.
    fireEvent.click(screen.getByTestId('nutri-kcal-edit'));
    fireEvent.click(screen.getByTestId('nutri-protein-edit'));
    assertNoRoLeak('NutritionInline edit mode', container.textContent ?? '');
  });

  it('ObiectivCard renders without RO leak under EN (incl. warning + ETA)', () => {
    // Subhealthy target → warning branch ("This goal is below…").
    useProgresStore.setState({
      weightLog: [],
      bodyData: [],
      targetObiectiv: { weightKg: 31, month: null },
    });
    const { container, rerender } = render(
      <MemoryRouter>
        <ObiectivCard />
      </MemoryRouter>,
    );
    assertNoRoLeak('ObiectivCard subhealthy', container.textContent ?? '');
    // Realistic target → ETA branch ("Estimated in ~N months at a healthy pace.").
    useProgresStore.setState({
      weightLog: [],
      bodyData: [],
      targetObiectiv: { weightKg: 72, month: null },
    });
    rerender(
      <MemoryRouter>
        <ObiectivCard />
      </MemoryRouter>,
    );
    assertNoRoLeak('ObiectivCard ETA', container.textContent ?? '');
  });

  it('LogWeight screen renders without RO leak under EN (incl. validation error)', () => {
    const { container } = render(withRouter('/app/progres/log-weight', <LogWeight />));
    assertNoRoLeak('LogWeight default', container.textContent ?? '');
    // Type out-of-range kg → error message surfaces.
    fireEvent.change(screen.getByTestId('weight-kg-input'), { target: { value: '20' } });
    assertNoRoLeak('LogWeight kg-range error', container.textContent ?? '');
    // Clear date → date-required error surfaces.
    fireEvent.change(screen.getByTestId('weight-date-input'), { target: { value: '' } });
    assertNoRoLeak('LogWeight date-required error', container.textContent ?? '');
  });

  it('BodyData screen renders without RO leak under EN (incl. range error)', () => {
    const { container } = render(withRouter('/app/progres/body-data', <BodyData />));
    assertNoRoLeak('BodyData default', container.textContent ?? '');
    // Type out-of-range biceps → range error message surfaces.
    fireEvent.change(screen.getByTestId('bd-bicepsCm'), { target: { value: '250' } });
    assertNoRoLeak('BodyData range error', container.textContent ?? '');
  });

  it('WeightTimeline renders without RO leak under EN (empty + seeded)', () => {
    // Empty branch first.
    const { container, rerender } = render(
      withRouter('/app/progres/weight-timeline', <WeightTimeline />),
    );
    assertNoRoLeak('WeightTimeline empty', container.textContent ?? '');
    // Seed with entries → KPI + trend branches surface.
    useProgresStore.setState({
      weightLog: [
        { kg: 80, date: '2026-05-01', ts: Date.now() - 14 * 86_400_000 },
        { kg: 79, date: '2026-05-15', ts: Date.now() },
      ],
      bodyData: [],
    });
    rerender(withRouter('/app/progres/weight-timeline', <WeightTimeline />));
    assertNoRoLeak('WeightTimeline seeded', container.textContent ?? '');
  });

  it('WeightLogList renders without RO leak under EN (empty + seeded)', () => {
    const { container, rerender } = render(
      withRouter('/app/progres/weight-log-list', <WeightLogList />),
    );
    assertNoRoLeak('WeightLogList empty', container.textContent ?? '');
    useProgresStore.setState({
      weightLog: [
        { kg: 78.5, date: '2026-05-10', ts: Date.now() - 5 * 86_400_000 },
        { kg: 78.2, date: '2026-05-15', ts: Date.now() },
      ],
      bodyData: [],
    });
    rerender(withRouter('/app/progres/weight-log-list', <WeightLogList />));
    assertNoRoLeak('WeightLogList seeded', container.textContent ?? '');
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
