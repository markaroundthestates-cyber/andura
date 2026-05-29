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
// ── SPLASH+AUTH+ONB FINISH — entry funnel surfaces (Splash + Auth + Onboarding) ─
import { Splash } from '../../react/routes/screens/Splash';
import { Auth } from '../../react/routes/screens/Auth';
import { Onboarding } from '../../react/routes/screens/Onboarding';
import { useAppStore } from '../../react/stores/appStore';
import { CoachRestCard } from '../../react/components/Antrenor/CoachRestCard';
import { CoachTodayCard } from '../../react/components/Antrenor/CoachTodayCard';
// ── Wave E2 — body comp + Progres deep coverage ─────────────────────────────
import { BMRStrip } from '../../react/components/Progres/BMRStrip';
import { ProjectionStrip } from '../../react/components/Progres/ProjectionStrip';
import { NutritionInline } from '../../react/components/NutritionInline';
import { ObiectivCard } from '../../react/components/Progres/ObiectivCard';
import { LogWeight } from '../../react/routes/screens/progres/LogWeight';
import { WeightTimeline } from '../../react/routes/screens/progres/WeightTimeline';
import { WeightLogList } from '../../react/routes/screens/progres/WeightLogList';
import { useProgresStore } from '../../react/stores/progresStore';
// ── Wave E3 — calendar + Istoric tab surfaces ────────────────────────────────
import { Calendar7Day } from '../../react/components/Calendar7Day';
import { CalendarHeatmap } from '../../react/components/Istoric/CalendarHeatmap';
import { RatingsStrip90Day } from '../../react/components/Istoric/RatingsStrip90Day';
import { VirtualSessionList } from '../../react/components/Istoric/VirtualSessionList';
import { PRWallRecent } from '../../react/components/Antrenor/PRWallRecent';
import { Istoric } from '../../react/routes/screens/istoric/Istoric';
import { IstoricDetail } from '../../react/routes/screens/istoric/IstoricDetail';
import { PrWall } from '../../react/routes/screens/istoric/PrWall';
// ── Wave E1 — workout flow surfaces ─────────────────────────────────────────
import { WorkoutPreview } from '../../react/routes/screens/antrenor/WorkoutPreview';
import { PostRpe } from '../../react/routes/screens/antrenor/PostRpe';
import { PostSummary } from '../../react/routes/screens/antrenor/PostSummary';
import { PainButton } from '../../react/routes/screens/antrenor/PainButton';
import { EnergyCause } from '../../react/routes/screens/antrenor/EnergyCause';
import { CevaNuMerge } from '../../react/routes/screens/antrenor/CevaNuMerge';
import { EquipmentSwap } from '../../react/routes/screens/antrenor/EquipmentSwap';
import { AparateLipsa } from '../../react/routes/screens/antrenor/AparateLipsa';
import { ExitConfirmSheet } from '../../react/components/Workout/ExitConfirmSheet';
import { AaFrictionModal } from '../../react/components/AaFrictionModal';
import { AparatLipsaSheet } from '../../react/components/Workout/AparatLipsaSheet';
import { SetLogInput } from '../../react/components/Workout/SetLogInput';
import { SetRatingButtons } from '../../react/components/Workout/SetRatingButtons';
// ── Wave E4 — Settings sub-screens + Confirm screens + coach engine output ───
import { SettingsAbout } from '../../react/routes/screens/cont/SettingsAbout';
import { SettingsAppearance } from '../../react/routes/screens/cont/SettingsAppearance';
import { SettingsDanger } from '../../react/routes/screens/cont/SettingsDanger';
import { SettingsExport } from '../../react/routes/screens/cont/SettingsExport';
import { SettingsFaq } from '../../react/routes/screens/cont/SettingsFaq';
import { SettingsImport } from '../../react/routes/screens/cont/SettingsImport';
import { SettingsNotifications } from '../../react/routes/screens/cont/SettingsNotifications';
import { SettingsPrefs } from '../../react/routes/screens/cont/SettingsPrefs';
import { SettingsPrivacy } from '../../react/routes/screens/cont/SettingsPrivacy';
import { SettingsProfile } from '../../react/routes/screens/cont/SettingsProfile';
import { SettingsSubscription } from '../../react/routes/screens/cont/SettingsSubscription';
import { SettingsSupport } from '../../react/routes/screens/cont/SettingsSupport';
import { SettingsTerms } from '../../react/routes/screens/cont/SettingsTerms';
import { DeleteAccountConfirm } from '../../react/routes/screens/cont/DeleteAccountConfirm';
import { LogoutConfirm } from '../../react/routes/screens/cont/LogoutConfirm';
import { RedoOnboardingConfirm } from '../../react/routes/screens/cont/RedoOnboardingConfirm';
import { ResetCoachConfirm } from '../../react/routes/screens/cont/ResetCoachConfirm';
import { ResetDataConfirm } from '../../react/routes/screens/cont/ResetDataConfirm';
import { SchimbaFazaConfirm } from '../../react/routes/screens/cont/SchimbaFazaConfirm';
import { FinishEarlyConfirm } from '../../react/routes/screens/antrenor/FinishEarlyConfirm';
import { ProgramChangeConfirm } from '../../react/routes/screens/antrenor/ProgramChangeConfirm';
import { StatsGrid } from '../../react/components/Antrenor/StatsGrid';
import { FatigueStrip } from '../../react/components/Progres/FatigueStrip';
import { ReadinessVerdict } from '../../react/components/Antrenor/ReadinessVerdict';
// ── Wave F1 — Components + lingering screen leaks (chat 5 EN smoke) ──────────
import { ObiectivGoalCard } from '../../react/components/Progres/ObiectivGoalCard';
import { RestOverlay } from '../../react/components/Workout/RestOverlay';
import { SessionTimer } from '../../react/components/Workout/SessionTimer';
import { SubHeader } from '../../react/components/SubHeader';
import { ExerciseMedia } from '../../react/components/ExerciseMedia';
import { ScheduleOverride } from '../../react/routes/screens/antrenor/ScheduleOverride';

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
  'urmatoarea',
  'anterioara',
  'libera',
  'detaliu',
  'tonaj',
  'volum',
  // 'program' removed — valid EN cognate (Program change / training program)
  'lipsa',
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
  // Wave E4 — Settings + Confirm + coach engine output
  'aspect',
  'aspectul',
  'tema',
  'paleta',
  'cremos',
  'luminos',
  'intunecat',
  'abonament',
  'gratuit',
  'suport',
  'cont',
  'parola',
  'confirma',
  'confirmare',
  'iesi',
  'datele',
  'stergere',
  'sterse',
  'permanent',
  'permis',
  'raportare',
  'erori',
  'sub-procesatori',
  'masuratori',
  'masuratorile',
  'compozitie',
  'corporala',
  'frecventa',
  'inaltime',
  'experienta',
  'incepator',
  'intermediar',
  'avansat',
  'masculin',
  'feminin',
  'antrenamente',
  'reseteaza',
  'refa',
  'schimba',
  'schimbi',
  'schimbarea',
  'faza',
  'mentinere',
  'odihna',
  'odihneste-te',
  'recomandat',
  'imediat',
  'imediata',
  'reversibil',
  'ireversibil',
  'ofera',
  'recomandari',
  'pieptul',
  'spatele',
  'umerii',
  'bicepsul',
  'tricepsul',
  'quadricepsul',
  'hamstringii',
  'fesele',
  'gambele',
  'recupereaza',
  // ── SPLASH + AUTH + ONBOARDING entry funnel (FINISH wave) ─────────────
  'facut',
  'raman',
  'pasul',
  'cati',
  'cantaresti',
  'inalt',
  'barbat',
  'femeie',
  'forta',
  'masa',
  'slabire',
  'mentenanta',
  'esti',
  'browser-ul',
  'deschizi',
  'trimite',
  'creeaza',
  'creaza',
  'intra',
  'verifica',
  'emailul',
  'linkul',
  'expira',
  'continuand',
  'accepti',
  'termenii',
  'reclame',
  'pierzi',
  'telefon',
  'resetat',
  'prescriptii',
  'medicale',
  'siguranta',
  'sala',
  // Wave F1 — Components + screen lingering leaks (chat 5 EN smoke)
  'musculara',
  'pastrezi',
  'muschi',
  'grasime',
  'cresti',
  'culturism',
  'incalzire',
  'pauza',
  'sari',
  'optiuni',
  'sesiunea',
  'planul',
  'usor',
  'greu',
  'grupa',
  'mobilitate',
  'ales',
  'activ',
  'obiectiv',
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

// ── Wave E1 cluster 5 — workout flow screens (zero RO leak under EN) ─────────
//
// Cover the workout-side surfaces wired through t() in clusters 1-4:
// WorkoutPreview / AparatLipsaSheet / PostRpe / PostSummary / ExitConfirmSheet
// / AaFrictionModal / PainButton / SetLogInput / SetRatingButtons. Each one
// is rendered under setLocale('en') and the rendered text is asserted to
// carry zero diacritics + zero forbidden RO token (allow-list above).
describe('Wave E1 i18n — no RO leak under EN locale (workout flow)', () => {
  it('WorkoutPreview fallback renders without RO leak under EN', async () => {
    const { container } = render(withRouter('/app/antrenor/workout-preview', <WorkoutPreview />));
    await Promise.resolve();
    await Promise.resolve();
    assertNoRoLeak('WorkoutPreview fallback', container.textContent ?? '');
  });

  it('PostRpe renders without RO leak under EN', () => {
    const { container } = render(withRouter('/app/antrenor/post-rpe', <PostRpe />));
    assertNoRoLeak('PostRpe', container.textContent ?? '');
  });

  it('PostSummary renders without RO leak under EN', () => {
    // Seed a lastSession so the summary surfaces its full chrome (PR banner +
    // streak + muscles inferred from a Push session title). Push title is
    // engine-canonical English so it stays under both locales; the rendered
    // chrome around it must still be EN under the default locale.
    useWorkoutStore.setState({
      lastSession: {
        title: 'Push (chest and shoulders)',
        meta: '5 sets · 52 min · 12 450 kg',
        ts: Date.now(),
        sets: 5,
        durationMin: 52,
        volumeKg: 12450,
      },
      lastRating: 'normala',
      streak: 3,
    });
    const { container } = render(withRouter('/app/antrenor/post-summary', <PostSummary />));
    assertNoRoLeak('PostSummary', container.textContent ?? '');
  });

  it('PainButton renders without RO leak under EN', () => {
    const { container } = render(withRouter('/app/antrenor/pain-button', <PainButton />));
    assertNoRoLeak('PainButton', container.textContent ?? '');
  });

  it('EnergyCause renders without RO leak under EN', () => {
    const { container } = render(withRouter('/app/antrenor/energy-cause', <EnergyCause />));
    const text = container.textContent ?? '';
    assertNoRoLeak('EnergyCause', text);
    expect(text).toContain("What's hardest today?");
    expect(text).toContain('Slept little');
    expect(text).toContain('Skip');
  });

  it('CevaNuMerge renders without RO leak under EN', () => {
    const { container } = render(withRouter('/app/antrenor/ceva-nu-merge', <CevaNuMerge />));
    const text = container.textContent ?? '';
    assertNoRoLeak('CevaNuMerge', text);
    expect(text).toContain("What's wrong?");
    expect(text).toContain('Machines are busy');
    expect(text).toContain('Equipment missing');
  });

  it('EquipmentSwap renders without RO leak under EN (incl. busy status + swap preview)', () => {
    const { container } = render(withRouter('/app/antrenor/equipment-swap', <EquipmentSwap />));
    assertNoRoLeak('EquipmentSwap default', container.textContent ?? '');
    // Mark a station busy → "Busy" status + (when a session exists) swap-preview
    // row chrome surface. Engine session is null in this harness so the preview
    // list may be empty, but the Busy/Free toggle copy must still be EN-clean.
    fireEvent.click(screen.getByTestId('equipment-swap')
      .querySelector('[data-equipment-id="bench"]') as HTMLElement);
    const text = container.textContent ?? '';
    assertNoRoLeak('EquipmentSwap busy', text);
    expect(text).toContain('Busy');
    expect(text).toContain('Continue adapted');
  });

  it('AparateLipsa screen renders without RO leak under EN (incl. equipment item labels)', () => {
    const { container } = render(withRouter('/app/antrenor/aparate-lipsa', <AparateLipsa />));
    const text = container.textContent ?? '';
    assertNoRoLeak('AparateLipsa', text);
    // Equipment item labels are now localized (equipmentList.items.*) — assert
    // a couple surface in EN, not the prior RO ("Banca inclinata" → "Incline bench").
    expect(text).toContain('Incline bench');
    expect(text).toContain('Save the setting');
  });

  it('ExitConfirmSheet renders without RO leak under EN', () => {
    const { container } = render(
      <ExitConfirmSheet open={true} exIdx={2} totalExercises={5} onChoose={() => {}} />,
    );
    assertNoRoLeak('ExitConfirmSheet', container.textContent ?? '');
  });

  it('AaFrictionModal (per-set safety) renders without RO leak under EN', () => {
    const { container } = render(
      <AaFrictionModal
        open={true}
        reason="kg_jump"
        onAcknowledge={() => {}}
        onForceContinue={() => {}}
      />,
    );
    assertNoRoLeak('AaFrictionModal (per-set safety)', container.textContent ?? '');
  });

  it('AparatLipsaSheet renders without RO leak under EN (chrome + item labels)', () => {
    // Item labels are now localized too (equipmentList.items.* shared SoT with
    // AparateLipsa) — assert the FULL sheet text is EN-clean, no longer
    // stripping the label spans.
    const { container } = render(
      <AparatLipsaSheet open={true} onConfirm={() => {}} onClose={() => {}} />,
    );
    const sheet = container.querySelector('[data-testid="aparat-lipsa-sheet"]');
    const text = sheet?.textContent ?? '';
    assertNoRoLeak('AparatLipsaSheet', text);
    expect(text).toContain('Incline bench');
  });

  it('SetLogInput tinta mode renders without RO leak under EN', () => {
    const { container } = render(
      <SetLogInput
        kg={22.5}
        reps={10}
        onKgChange={() => {}}
        onRepsChange={() => {}}
        mode="tinta"
        onLog={() => {}}
      />,
    );
    assertNoRoLeak('SetLogInput tinta', container.textContent ?? '');
  });

  it('SetLogInput post-log mode renders without RO leak under EN', () => {
    const { container } = render(
      <SetLogInput
        kg={22.5}
        reps={10}
        onKgChange={() => {}}
        onRepsChange={() => {}}
        mode="post-log"
        onEdit={() => {}}
      />,
    );
    assertNoRoLeak('SetLogInput post-log', container.textContent ?? '');
  });

  it('SetLogInput editable mode (with errors) renders without RO leak under EN', () => {
    // Force the error branch (kg=0, reps=0) so both inline error messages
    // surface — guards the EN error copy explicitly.
    const { container } = render(
      <SetLogInput
        kg={0}
        reps={0}
        onKgChange={() => {}}
        onRepsChange={() => {}}
        mode="editable"
      />,
    );
    assertNoRoLeak('SetLogInput editable error', container.textContent ?? '');
  });

  it('SetRatingButtons renders without RO leak under EN', () => {
    const { container } = render(<SetRatingButtons onRate={() => {}} />);
    assertNoRoLeak('SetRatingButtons', container.textContent ?? '');
  });
});

// ── Wave E4 — Settings sub-screens + Confirm screens + coach engine output ─

describe('Wave E4 i18n — Settings sub-screens render EN-clean under EN locale', () => {
  function renderSubscreen(initialPath: string, element: JSX.Element): HTMLElement {
    const { container } = render(withRouter(initialPath, element));
    return container;
  }

  it.each([
    ['SettingsAbout',         '/app/cont/settings-about',         <SettingsAbout />],
    ['SettingsAppearance',    '/app/cont/settings-appearance',    <SettingsAppearance />],
    ['SettingsDanger',        '/app/cont/settings-danger',        <SettingsDanger />],
    ['SettingsExport',        '/app/cont/settings-export',        <SettingsExport />],
    ['SettingsFaq',           '/app/cont/settings-faq',           <SettingsFaq />],
    ['SettingsImport',        '/app/cont/settings-import',        <SettingsImport />],
    ['SettingsNotifications', '/app/cont/settings-notifications', <SettingsNotifications />],
    ['SettingsPrefs',         '/app/cont/settings-prefs',         <SettingsPrefs />],
    ['SettingsPrivacy',       '/app/cont/settings-privacy',       <SettingsPrivacy />],
    ['SettingsProfile',       '/app/cont/settings-profile',       <SettingsProfile />],
    ['SettingsSubscription',  '/app/cont/settings-subscription',  <SettingsSubscription />],
    ['SettingsSupport',       '/app/cont/settings-support',       <SettingsSupport />],
    ['SettingsTerms',         '/app/cont/settings-terms',         <SettingsTerms />],
  ] as const)('%s renders without RO leak under EN locale', (name, path, element) => {
    const container = renderSubscreen(path, element);
    assertNoRoLeak(name, container.textContent ?? '');
  });
});

describe('Wave E4 i18n — Confirm screens render EN-clean under EN locale', () => {
  function renderConfirm(initialPath: string, element: JSX.Element): HTMLElement {
    const { container } = render(withRouter(initialPath, element));
    return container;
  }

  it.each([
    ['DeleteAccountConfirm',  '/app/cont/delete-account-confirm',  <DeleteAccountConfirm />],
    ['LogoutConfirm',         '/app/cont/logout-confirm',          <LogoutConfirm />],
    ['RedoOnboardingConfirm', '/app/cont/redo-onboarding-confirm', <RedoOnboardingConfirm />],
    ['ResetCoachConfirm',     '/app/cont/reset-coach-confirm',     <ResetCoachConfirm />],
    ['ResetDataConfirm',      '/app/cont/reset-data-confirm',      <ResetDataConfirm />],
    ['SchimbaFazaConfirm',    '/app/cont/schimba-faza-confirm',    <SchimbaFazaConfirm />],
    ['FinishEarlyConfirm',    '/app/antrenor/finish-early-confirm',<FinishEarlyConfirm />],
    ['ProgramChangeConfirm',  '/app/antrenor/program-change-confirm',<ProgramChangeConfirm />],
  ] as const)('%s renders without RO leak under EN locale', (name, path, element) => {
    const container = renderConfirm(path, element);
    assertNoRoLeak(name, container.textContent ?? '');
  });
});

describe('Wave E4 i18n — Coach engine output is locale-aware under EN locale', () => {
  it('StatsGrid with engine fatigue + readiness verdicts renders EN sublabels', () => {
    const { container } = render(
      <StatsGrid
        streak={3}
        fatigue={{
          score: 45,
          key: 'MODERATE_FATIGUE',
          label: 'Pas mai conservator',
          icon: '',
          color: '',
          recommend: 'reduce',
          detail: 'Astazi mentinem greutatile.',
        }}
        readiness={{
          score: 82,
          key: 'NORMAL',
          label: 'Sesiune normala',
          color: '',
          volumeMultiplier: 1.0,
          canPR: false,
        }}
      />
    );
    const text = container.textContent ?? '';
    // EN labels surface; RO engine `label` does NOT leak through.
    expect(text).toContain('A bit more conservative');
    expect(text).toContain('Normal session');
    assertNoRoLeak('StatsGrid coach engine output', text);
  });

  it('ReadinessVerdict resolves PR_DAY key to EN "PR day"', () => {
    const { container } = render(
      <ReadinessVerdict
        readiness={{
          score: 90,
          key: 'PR_DAY',
          label: 'Zi de PR',
          color: '',
          volumeMultiplier: 1.1,
          canPR: true,
        }}
      />
    );
    const text = container.textContent ?? '';
    expect(text).toContain('PR day');
    expect(text).toContain('you can try a PR');
    assertNoRoLeak('ReadinessVerdict PR_DAY', text);
  });

  it('FatigueStrip renders EN-clean empty state under EN locale (engine getFatigue null)', () => {
    // The top-of-file engineWrappers mock returns null for getFatigue, so the
    // strip surfaces the EN empty hint rather than a verdict. Verdict-driven
    // EN coverage is locked separately by FatigueStrip.test.tsx Wave E4 specs.
    const { container } = render(<FatigueStrip />);
    const text = container.textContent ?? '';
    expect(text).toMatch(/Fatigue today/);
    expect(text).toMatch(/Not enough sessions yet/);
    assertNoRoLeak('FatigueStrip empty', text);
  });
});

// ── SPLASH + AUTH + ONBOARDING entry funnel (FINISH wave) ─────────────────
// Manager smoke 2026-05-28 caught these surfaces still 100% hardcoded RO
// despite "Wave E+F i18n DEEP zero RO leak" claim. Lock them down here.
describe('SPLASH+AUTH+ONB FINISH i18n — no RO leak under EN locale', () => {
  it('Splash anonymous mode (Log In + Creaza Cont CTAs + footer) renders EN-clean', () => {
    useAppStore.getState().setAuthenticated(false);
    const { container } = render(withRouter('/', <Splash />));
    assertNoRoLeak('Splash anon', container.textContent ?? '');
  });

  it('Splash authenticated mode (Continua CTA + footer) renders EN-clean', () => {
    useAppStore.getState().setAuthenticated(true);
    const { container } = render(withRouter('/', <Splash />));
    assertNoRoLeak('Splash authenticated', container.textContent ?? '');
    useAppStore.getState().setAuthenticated(false);
  });

  it('Auth login mode (default) renders EN-clean — heading + send CTA + footer', () => {
    const { container } = render(withRouter('/auth', <Auth />));
    assertNoRoLeak('Auth login default', container.textContent ?? '');
  });

  it('Auth signup mode renders EN-clean — heading + send CTA + consent label', () => {
    const { container } = render(
      <MemoryRouter initialEntries={[{ pathname: '/auth', state: { mode: 'signup' } }]}>
        <Routes>
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </MemoryRouter>
    );
    assertNoRoLeak('Auth signup', container.textContent ?? '');
  });

  it('Auth WebView banner copy is EN-clean (Facebook IAB example)', () => {
    const orig = navigator.userAgent;
    try {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 [FB_IAB/FB4A;FBAV/443.0.0.30.111;]',
        configurable: true,
        writable: true,
      });
      const { container } = render(withRouter('/auth', <Auth />));
      assertNoRoLeak('Auth WebView banner', container.textContent ?? '');
    } finally {
      Object.defineProperty(navigator, 'userAgent', { value: orig, configurable: true, writable: true });
    }
  });

  it('Auth sent state (after Magic Link sent) renders EN-clean', async () => {
    const { container } = render(withRouter('/auth', <Auth />));
    fireEvent.change(screen.getByTestId('auth-email-input'), {
      target: { value: 'gigel@example.com' },
    });
    fireEvent.click(screen.getByTestId('auth-send'));
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    assertNoRoLeak('Auth sent', container.textContent ?? '');
  });

  it('Auth legal modal — Terms doc renders EN-clean (intro + bullets + footer)', () => {
    const { container } = render(withRouter('/auth', <Auth />));
    fireEvent.click(screen.getByTestId('auth-terms-link'));
    assertNoRoLeak('Auth legal terms modal', container.textContent ?? '');
  });

  it('Auth legal modal — Privacy doc renders EN-clean (intro + bullets + GDPR contact)', () => {
    const { container } = render(withRouter('/auth', <Auth />));
    fireEvent.click(screen.getByTestId('auth-privacy-link'));
    assertNoRoLeak('Auth legal privacy modal', container.textContent ?? '');
  });

  // Onboarding uses useParams<{ step: string }>(); we need a router pattern
  // with the `:step` param wildcard so all 8 steps actually surface step-N
  // copy (NOT the step 1 fallback when the param is undefined).
  function renderOnboardingStep(step: number): ReturnType<typeof render> {
    return render(
      <MemoryRouter initialEntries={[`/onboarding/${step}`]}>
        <Routes>
          <Route path="/onboarding/:step" element={<Onboarding />} />
          <Route path="*" element={<div data-testid="probe" />} />
        </Routes>
      </MemoryRouter>
    );
  }

  it.each([1, 2, 3, 4, 5, 6, 7, 8] as const)('Onboarding step %i renders EN-clean (title + helper + options)', (step) => {
    // Seed full data for Step 8 (summary) so option values surface.
    useOnboardingStore.setState({
      data: { age: 32, sex: 'm', goal: 'masa', frequency: '4', experience: 'intermediar', weight: 78, height: 175 },
      completed: false,
      completedAt: null,
    });
    const { container } = renderOnboardingStep(step);
    assertNoRoLeak(`Onboarding step ${step}`, container.textContent ?? '');
  });

  it('Onboarding step 1 with out-of-range value surfaces EN error helper', () => {
    const { container } = renderOnboardingStep(1);
    fireEvent.change(screen.getByTestId('onb-age-input'), { target: { value: '10' } });
    assertNoRoLeak('Onboarding step 1 range error', container.textContent ?? '');
  });

  it('Onboarding step 6 with out-of-range weight surfaces EN error helper', () => {
    const { container } = renderOnboardingStep(6);
    fireEvent.change(screen.getByTestId('onb-weight-input'), { target: { value: '20' } });
    assertNoRoLeak('Onboarding step 6 range error', container.textContent ?? '');
  });

  it('Onboarding step 7 with out-of-range height surfaces EN error helper', () => {
    const { container } = renderOnboardingStep(7);
    fireEvent.change(screen.getByTestId('onb-height-input'), { target: { value: '300' } });
    assertNoRoLeak('Onboarding step 7 range error', container.textContent ?? '');
  });
});

// ── Wave F1 — Components + lingering screen leaks (chat 5 EN smoke) ─────────
describe('Wave F1 i18n — components surface EN-clean under EN locale', () => {
  it('ObiectivGoalCard renders without RO leak under EN', () => {
    const { container } = render(
      <MemoryRouter>
        <ObiectivGoalCard />
      </MemoryRouter>,
    );
    assertNoRoLeak('ObiectivGoalCard', container.textContent ?? '');
    // Sanity — picked badge, aria suffix, all 5 EN titles must be present.
    const text = container.textContent ?? '';
    expect(text).toMatch(/Auto/);
    expect(text).toMatch(/Strength/);
    expect(text).toMatch(/Muscle mass/);
    expect(text).toMatch(/Lose fat/);
    expect(text).toMatch(/Maintain/);
    expect(text).toMatch(/Picked/);
  });

  it('RestOverlay renders Pauza/Sari pauza/recovering EN-clean under EN', () => {
    const { container } = render(
      <RestOverlay
        countdownSec={60}
        initialRestSec={90}
        onSkip={() => {}}
        currentExerciseName="Bench Press"
      />,
    );
    const text = container.textContent ?? '';
    assertNoRoLeak('RestOverlay', text);
    expect(text).toContain('Rest');
    expect(text).toContain('Skip rest');
    expect(text).toContain('Bench Press is recovering');
  });

  it('SessionTimer progress bar + menu sheet EN-clean under EN', () => {
    const { container, getByTestId } = render(
      <SessionTimer
        exerciseName="Bench Press"
        exIdx={0}
        totalExercises={5}
        sessionStart={null}
        onExit={() => {}}
        onPain={() => {}}
        onSkipExercise={() => {}}
        onFinishEarly={() => {}}
        onCancelSession={() => {}}
        setsDone={1}
        setsTotal={17}
        exerciseCount={1}
        exerciseTotal={5}
      />,
    );
    assertNoRoLeak('SessionTimer header + progress', container.textContent ?? '');
    // Open the menu sheet so the action rows are part of the render.
    fireEvent.click(getByTestId('workout-menu-trigger'));
    assertNoRoLeak('SessionTimer menu sheet', container.textContent ?? '');
    const text = container.textContent ?? '';
    expect(text).toContain('1/17 sets');
    expect(text).toContain('1/5 exercises');
    expect(text).toContain('Skip current exercise');
    expect(text).toContain('Finish early');
  });

  it('SubHeader back button localizes aria-label to EN under EN', () => {
    const { container, getByRole } = render(
      <SubHeader title="Profile" onBack={() => {}} testIdBack="x-back" />,
    );
    assertNoRoLeak('SubHeader', container.textContent ?? '');
    const btn = getByRole('button', { name: /Back/i });
    expect(btn).toBeInTheDocument();
  });

  it('ExerciseMedia card placeholder EN-clean under EN', () => {
    const { container } = render(
      <ExerciseMedia engineName="lateral-raise" variant="card" />,
    );
    const text = container.textContent ?? '';
    assertNoRoLeak('ExerciseMedia card', text);
    expect(text).toContain('Image coming soon');
  });

  it('ScheduleOverride renders without RO leak under EN', () => {
    const { container } = render(
      withRouter('/app/antrenor/schedule-override', <ScheduleOverride />),
    );
    const text = container.textContent ?? '';
    assertNoRoLeak('ScheduleOverride', text);
    expect(text).toContain("Change today's plan?");
    expect(text).toContain('Easier');
    expect(text).toContain('Mobility');
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
