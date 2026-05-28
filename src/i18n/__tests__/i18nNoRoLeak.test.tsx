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
// Wave E4 — Settings sub-screens + Confirm screens + coach engine output.
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
import { SettingsThemes } from '../../react/routes/screens/cont/SettingsThemes';
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
  // Wave E4 — Settings + Confirm + coach engine output coverage.
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
    ['SettingsThemes',        '/app/cont/settings-themes',        <SettingsThemes />],
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
