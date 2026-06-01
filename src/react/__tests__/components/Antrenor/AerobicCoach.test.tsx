// ══ AEROBIC COACH + MODE-GATING TESTS — Daniel spec 2026-05-30 ════════════
// Covers:
//   - Antrenor mode-gating renders the right Coach per trainingType
//     (gym → gym home; aerobic → AerobicCoach; both → gym + aerobic card)
//   - AerobicCoach: log CTA opens logger, class kcal math, duration memory,
//     classes-this-week count vs frequency target, subjective readiness

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// TDEEStrip (rendered inside AerobicCoach as the nutrition summary) pulls the
// async engine target — mock the aggregate so the strip resolves cleanly.
vi.mock('../../../lib/bayesianNutritionAggregate', () => ({
  getNutritionTargetTodayReal: vi.fn(async () => ({
    kcalTarget: 2000,
    proteinTarget: 150,
    source: 'engine-bn' as const,
    confidence: 0.5,
  })),
}));

// coachDirectorAggregate drives the GYM home (both-mode path renders it).
vi.mock('../../../lib/coachDirectorAggregate', () => ({
  getCoachToday: vi.fn(async () => ({
    readiness: null,
    fatigue: null,
    plannedWorkout: null,
    isRestDay: true,
    patternsBanner: [],
    prWallRecent: [],
    alerts: [],
    source: 'baseline' as const,
  })),
}));

import { Antrenor } from '../../../routes/screens/antrenor/Antrenor';
import { AerobicCoach } from '../../../components/Antrenor/AerobicCoach';
import { useAerobicStore } from '../../../stores/aerobicStore';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { useProgresStore } from '../../../stores/progresStore';
import { setLocale as __setLocale, _resetI18nCache as __resetI18n } from '../../../../i18n/index.js';

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function renderAntrenor() {
  return render(
    <MemoryRouter initialEntries={['/app/antrenor']}>
      <Routes>
        <Route path="/app/antrenor" element={<Antrenor />} />
        <Route path="/app/antrenor/energy-check" element={<div>EnergyStub</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

function renderAerobicCoach() {
  return render(<AerobicCoach />);
}

beforeEach(() => {
  useAerobicStore.setState({ sessions: [], lastDuration: 50, subjectiveByDate: {}, deletedTs: [] });
  useOnboardingStore.setState({
    data: {
      age: 30, sex: 'f', goal: 'slabire', frequency: '3',
      experience: 'incepator', weight: 60, height: 165, trainingType: 'gym',
    },
    completed: true,
    completedAt: Date.now(),
  });
  useProgresStore.setState({ weightLog: [], bodyData: [] });
  localStorage.clear();
  __resetI18n();
  __setLocale('en');
});

describe('Antrenor — mode-gating per trainingType', () => {
  it('gym mode renders the gym Coach home (NOT the aerobic dashboard)', () => {
    useOnboardingStore.setState((s) => ({ data: { ...s.data, trainingType: 'gym' } }));
    renderAntrenor();
    expect(screen.getByTestId('antrenor-home')).toBeInTheDocument();
    expect(screen.queryByTestId('aerobic-coach')).not.toBeInTheDocument();
  });

  it('aerobic mode renders the AerobicCoach dashboard (NOT the gym home)', () => {
    useOnboardingStore.setState((s) => ({ data: { ...s.data, trainingType: 'aerobic' } }));
    renderAntrenor();
    expect(screen.getByTestId('aerobic-coach')).toBeInTheDocument();
    expect(screen.queryByTestId('antrenor-home')).not.toBeInTheDocument();
    // Gym surfaces hidden: no readiness orb hero, no coach today card.
    expect(screen.queryByTestId('readiness-hero')).not.toBeInTheDocument();
  });

  it('both mode renders the gym home PLUS the aerobic log card', () => {
    useOnboardingStore.setState((s) => ({ data: { ...s.data, trainingType: 'both' } }));
    renderAntrenor();
    expect(screen.getByTestId('antrenor-home')).toBeInTheDocument();
    expect(screen.getByTestId('both-aerobic-card')).toBeInTheDocument();
  });

  it('legacy store (no trainingType) defaults to gym', () => {
    useOnboardingStore.setState((s) => {
      const next = { ...s.data };
      delete (next as { trainingType?: unknown }).trainingType;
      return { data: next };
    });
    renderAntrenor();
    expect(screen.getByTestId('antrenor-home')).toBeInTheDocument();
  });
});

describe('AerobicCoach — class logging', () => {
  it('log CTA opens the logger', () => {
    renderAerobicCoach();
    expect(screen.queryByTestId('aerobic-logger')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('aerobic-log-cta'));
    expect(screen.getByTestId('aerobic-logger')).toBeInTheDocument();
  });

  it('SC 2.4.3: focus moves into the logger on open + returns to the CTA on close', () => {
    renderAerobicCoach();
    fireEvent.click(screen.getByTestId('aerobic-log-cta'));
    // Focus-in: the logger heading region receives focus (not deep in the form).
    const logger = screen.getByTestId('aerobic-logger');
    expect(logger.querySelector('[tabindex="-1"]')).toHaveFocus();
    // Close via Cancel → focus restored to the trigger CTA (remounted).
    fireEvent.click(screen.getByTestId('aerobic-logger-cancel'));
    expect(screen.getByTestId('aerobic-log-cta')).toHaveFocus();
  });

  it('logs a class: kcal computed (MET x weight x hrs) + persisted', () => {
    renderAerobicCoach();
    fireEvent.click(screen.getByTestId('aerobic-log-cta'));
    // Spinning (8.5 MET), weight 60kg, 50 min → round(8.5*60*50/60) = 425.
    fireEvent.click(screen.getByTestId('aerobic-type-spinning'));
    fireEvent.click(screen.getByTestId('aerobic-logger-save'));
    const { sessions } = useAerobicStore.getState();
    expect(sessions).toHaveLength(1);
    expect(sessions[0]).toMatchObject({ type: 'spinning', minutes: 50, kcal: 425 });
  });

  it('duration memory: last-used duration pre-fills next time', () => {
    renderAerobicCoach();
    fireEvent.click(screen.getByTestId('aerobic-log-cta'));
    fireEvent.change(screen.getByTestId('aerobic-minutes-input'), { target: { value: '35' } });
    fireEvent.click(screen.getByTestId('aerobic-logger-save'));
    expect(useAerobicStore.getState().lastDuration).toBe(35);
    // Re-open the logger — the input pre-fills from the remembered 35.
    fireEvent.click(screen.getByTestId('aerobic-log-cta'));
    expect(screen.getByTestId('aerobic-minutes-input')).toHaveValue(35);
  });
});

describe('AerobicCoach — classes this week vs frequency target', () => {
  it('shows count / target (target = onboarding frequency)', () => {
    // frequency '3' from beforeEach → target 3.
    useAerobicStore.setState({
      sessions: [{ date: todayIso(), type: 'aerobic', minutes: 50, kcal: 300, ts: Date.now() }],
      lastDuration: 50,
      subjectiveByDate: {},
    });
    renderAerobicCoach();
    // Copy clarified 2026-06-01 (Bug 3): "1 of 3 target" — explicit weekly
    // target, not "1/3" which a user read as "out of 7 days".
    expect(screen.getByTestId('aerobic-week-val').textContent).toMatch(/1 of 3/);
  });
});

describe('AerobicCoach — delete a mislogged class', () => {
  it("lists today's classes and deletes one (two-tap confirm)", () => {
    const ts = Date.now();
    useAerobicStore.setState({
      sessions: [{ date: todayIso(), type: 'spinning', minutes: 50, kcal: 300, ts }],
      lastDuration: 50,
      subjectiveByDate: {},
      deletedTs: [],
    });
    renderAerobicCoach();
    expect(screen.getByTestId('aerobic-today-list')).toBeInTheDocument();
    // First tap reveals confirm; class still present.
    fireEvent.click(screen.getByTestId(`aerobic-delete-${ts}`));
    expect(useAerobicStore.getState().sessions).toHaveLength(1);
    // Confirm tap deletes + records the tombstone.
    fireEvent.click(screen.getByTestId(`aerobic-delete-accept-${ts}`));
    expect(useAerobicStore.getState().sessions).toHaveLength(0);
    expect(useAerobicStore.getState().deletedTs).toContain(ts);
  });

  it('cancel keeps the class', () => {
    const ts = Date.now();
    useAerobicStore.setState({
      sessions: [{ date: todayIso(), type: 'zumba', minutes: 50, kcal: 300, ts }],
      lastDuration: 50,
      subjectiveByDate: {},
      deletedTs: [],
    });
    renderAerobicCoach();
    fireEvent.click(screen.getByTestId(`aerobic-delete-${ts}`));
    fireEvent.click(screen.getByTestId(`aerobic-delete-cancel-${ts}`));
    expect(useAerobicStore.getState().sessions).toHaveLength(1);
  });
});

describe('AerobicCoach — double-log-per-day confirm', () => {
  it('asks before logging a second class the same day, then logs on confirm', () => {
    const ts = Date.now() - 1000;
    useAerobicStore.setState({
      sessions: [{ date: todayIso(), type: 'aerobic', minutes: 50, kcal: 300, ts }],
      lastDuration: 50,
      subjectiveByDate: {},
      deletedTs: [],
    });
    renderAerobicCoach();
    fireEvent.click(screen.getByTestId('aerobic-log-cta'));
    // Save once → confirm panel appears, NO second session yet.
    fireEvent.click(screen.getByTestId('aerobic-logger-save'));
    expect(screen.getByTestId('aerobic-already-logged')).toBeInTheDocument();
    expect(useAerobicStore.getState().sessions).toHaveLength(1);
    // Confirm "log another" → second session committed.
    fireEvent.click(screen.getByTestId('aerobic-already-logged-yes'));
    expect(useAerobicStore.getState().sessions).toHaveLength(2);
  });

  it('first class of the day logs without a confirm', () => {
    renderAerobicCoach();
    fireEvent.click(screen.getByTestId('aerobic-log-cta'));
    fireEvent.click(screen.getByTestId('aerobic-logger-save'));
    expect(screen.queryByTestId('aerobic-already-logged')).not.toBeInTheDocument();
    expect(useAerobicStore.getState().sessions).toHaveLength(1);
  });
});

describe('AerobicCoach — simplified subjective readiness (self-report, no engine)', () => {
  it('records the self-reported readiness for today', () => {
    renderAerobicCoach();
    fireEvent.click(screen.getByTestId('aerobic-readiness-tired'));
    expect(useAerobicStore.getState().subjectiveByDate[todayIso()]).toBe('tired');
    expect(screen.getByTestId('aerobic-readiness-tired')).toHaveAttribute('aria-pressed', 'true');
  });

  it('tired surfaces a minimal nutrition-gentle note', () => {
    renderAerobicCoach();
    expect(screen.queryByTestId('aerobic-readiness-tired-note')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('aerobic-readiness-tired'));
    expect(screen.getByTestId('aerobic-readiness-tired-note')).toBeInTheDocument();
  });

  it('renders the nutrition summary (TDEEStrip)', async () => {
    renderAerobicCoach();
    await waitFor(() => {
      expect(screen.getByTestId('tdee-strip')).toBeInTheDocument();
    });
  });
});
