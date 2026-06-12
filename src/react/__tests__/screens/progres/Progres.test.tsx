// PROGRES LANDING TESTS — task_16 CTA + last entries display + F-progres-07.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';

vi.mock('../../../lib/coachDirectorAggregate', () => ({
  getCoachToday: vi.fn(async () => ({
    readiness: null,
    fatigue: null,
    plannedWorkout: null,
    isRestDay: true,
    patternsBanner: [],
    prWallRecent: [],
    alerts: [],
    source: 'baseline',
  })),
}));

import { Progres } from '../../../routes/screens/progres/Progres';
import { useProgresStore } from '../../../stores/progresStore';
import { useNutritionStore } from '../../../stores/nutritionStore';
import { getCoachToday } from '../../../lib/coachDirectorAggregate';

// The recovery zone (heading + body map) gates on the recovery selector
// yielding groups — i.e. the engine throws or the taxonomy is empty hides it.
// Mock the selector to exercise both branches of the 03.048 gate without
// coupling to engine internals. MuscleBodyMap (the post-redesign replacement
// for the old MuscleRecoveryGrid circles) consumes this SAME hook, so the gate
// + the map share one source of truth.
vi.mock('../../../components/Progres/MuscleRecoveryGrid', () => ({
  useMuscleRecoveryGroups: vi.fn(() => []),
  MuscleRecoveryGrid: vi.fn(() => null),
}));
import { useMuscleRecoveryGroups } from '../../../components/Progres/MuscleRecoveryGrid';

type RecoveryGroups = ReturnType<typeof useMuscleRecoveryGroups>;

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderProgres() {
  return render(
    <MemoryRouter initialEntries={['/app/progres']}>
      <Routes>
        <Route path="/app/progres" element={<Progres />} />
        <Route path="/app/progres/log-weight" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  useProgresStore.setState({ weightLog: [], bodyData: [] });
  useNutritionStore.getState().reset();
  vi.mocked(useMuscleRecoveryGroups).mockReturnValue([] as RecoveryGroups);
  localStorage.clear();
});

describe('Progres landing', () => {
  it('renders heading + tagline (EN default post 2026-05-28 paradigm flip)', () => {
    renderProgres();
    // Default locale flipped to EN — heading is "Progress" + tagline localized.
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Progress');
    // Tagline is the <p> right after the h1 (scoped — "Body composition" now
    // also appears as a zone heading after the redesign).
    expect(h1.nextElementSibling?.textContent ?? '').toMatch(/Body composition/i);
  });

  it('renders Log weight CTA', () => {
    renderProgres();
    expect(screen.getByTestId('cta-log-weight')).toBeInTheDocument();
  });

  it('Log weight CTA tap navigates /app/progres/log-weight', () => {
    renderProgres();
    fireEvent.click(screen.getByTestId('cta-log-weight'));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/progres/log-weight');
  });

  // §progress-v2 — body-data CTA + last-body-card eliminate: masuratorile BF
  // (talie/gat/sold) s-au consolidat in Cont > Profil.
  it('no longer renders the body-data CTA (consolidated into Profile)', () => {
    renderProgres();
    expect(screen.queryByTestId('cta-body-data')).not.toBeInTheDocument();
  });

  // Progress redesign (Daniel 2026-05-30): the "Last weigh-in" recap card was
  // struck out of the ACTIUNI zone — only the log-weight CTA remains. It must
  // not render whether or not a weigh-in exists.
  it('no longer renders the last-weight-card recap (struck out 2026-05-30)', () => {
    useProgresStore.setState({ weightLog: [{ kg: 78.5, date: '2026-05-17', ts: Date.now() }] });
    renderProgres();
    expect(screen.queryByTestId('last-weight-card')).not.toBeInTheDocument();
    // The log-weight CTA stays.
    expect(screen.getByTestId('cta-log-weight')).toBeInTheDocument();
  });

  it('no longer renders last-body-card (consolidated into Profile)', () => {
    useProgresStore.setState({ bodyData: [{ date: '2026-05-17', ts: Date.now(), waistCm: 85 }] });
    renderProgres();
    expect(screen.queryByTestId('last-body-card')).not.toBeInTheDocument();
  });
});

describe('Progres — RECUPERARE zone gating (03.048)', () => {
  it('hides the recovery zone heading when the recovery selector yields no groups', () => {
    vi.mocked(useMuscleRecoveryGroups).mockReturnValue([] as RecoveryGroups);
    renderProgres();
    // No lone eyebrow over empty space: heading + zone both absent.
    expect(screen.queryByTestId('progres-zone-recovery-heading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('progres-zone-recovery')).not.toBeInTheDocument();
  });

  it('shows the recovery zone + renders MuscleBodyMap (not the old grid) when groups exist', () => {
    vi.mocked(useMuscleRecoveryGroups).mockReturnValue([
      { group: 'piept', label: 'Piept', state: 'recovered' },
    ] as RecoveryGroups);
    renderProgres();
    expect(screen.getByTestId('progres-zone-recovery-heading')).toBeInTheDocument();
    expect(screen.getByTestId('progres-zone-recovery')).toBeInTheDocument();
    // The anatomical body map replaces the old recovery circles.
    expect(screen.getByTestId('muscle-body-map')).toBeInTheDocument();
    expect(screen.queryByTestId('muscle-recovery-grid')).not.toBeInTheDocument();
  });
});

describe('Progres — redesign layout (2026-05-30 locked)', () => {
  it('renders a SINGLE merged Target-Today nutrition panel (no separate NutritionInline)', () => {
    renderProgres();
    // The combined hero owns the editable kcal/protein chips now.
    expect(screen.getByTestId('tdee-strip')).toBeInTheDocument();
    expect(screen.getByTestId('nutri-kcal-edit')).toBeInTheDocument();
    expect(screen.getByTestId('nutri-protein-edit')).toBeInTheDocument();
    // The old standalone manual-log panel is gone.
    expect(screen.queryByTestId('nutrition-inline')).not.toBeInTheDocument();
    expect(screen.queryByTestId('progres-zone-log')).not.toBeInTheDocument();
  });

  it('removes Fatigue from the Target-Today panel (stable hero) and drops the standalone Base Calories (BMR) panel', () => {
    renderProgres();
    const hero = screen.getByTestId('tdee-strip');
    // STABLE hero (CEO lock 2026-06-01): the Fatigue strip no longer lives in the
    // Target-Today card — the kcal hero is full-width and fatigue relocates to the
    // Muscle Recovery panel. So it must NOT render inside the hero card.
    expect(hero.querySelector('[data-testid="fatigue-strip"]')).toBeNull();
    // Progress redesign (Daniel 2026-05-30): the standalone Base Calories (BMR)
    // panel was struck out as redundant (the hero already says "Adaptive
    // estimate"), so it is no longer rendered anywhere on the Progress screen.
    expect(screen.queryByTestId('bmr-strip')).not.toBeInTheDocument();
    expect(screen.queryByTestId('tdee-base-calories')).not.toBeInTheDocument();
    // No separate top-level fatigue/BMR 2-col grid anymore.
    expect(screen.queryByTestId('fatigue-bmr-grid')).not.toBeInTheDocument();
  });

  it('places Target Weight (objective) near the top, after Target Today', () => {
    renderProgres();
    const azi = screen.getByTestId('progres-zone-azi');
    const obiectiv = screen.getByTestId('progres-zone-obiectiv');
    expect(azi.compareDocumentPosition(obiectiv) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // ObiectivCard (target weight + ETA) is present in that zone.
    expect(obiectiv.querySelector('[data-testid="obiectiv-card"]')).toBeTruthy();
  });

  // Daniel 2026-05-30 arrow UP: the muscle-recovery body-model zone is moved HIGH
  // — right under Target Today and ABOVE the objective + composition zones.
  it('moves the Muscle Recovery (body-model) zone UP — above Objective and Composition', () => {
    vi.mocked(useMuscleRecoveryGroups).mockReturnValue([
      { group: 'piept', label: 'Piept', state: 'recovered' },
    ] as RecoveryGroups);
    renderProgres();
    const azi = screen.getByTestId('progres-zone-azi');
    const recovery = screen.getByTestId('progres-zone-recovery');
    const obiectiv = screen.getByTestId('progres-zone-obiectiv');
    const compozitie = screen.getByTestId('progres-zone-compozitie');
    // Recovery sits right after AZI...
    expect(azi.compareDocumentPosition(recovery) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // ...and BEFORE both Objective and Composition.
    expect(recovery.compareDocumentPosition(obiectiv) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(recovery.compareDocumentPosition(compozitie) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  // Reorder 2026-06-12 (Daniel live): the weight CHART (trend) now sits ABOVE the
  // actions zone (which holds the "Log weight today" CTA) — Daniel wanted to see
  // the trend before the log button.
  it('places the Weight & BF trend ABOVE the actions zone (chart over Log weight today)', () => {
    useProgresStore.setState({
      weightLog: [
        { kg: 80, date: '2026-05-10', ts: 1 },
        { kg: 79, date: '2026-05-17', ts: 2 },
      ],
    });
    renderProgres();
    const tendinta = screen.getByTestId('progres-zone-tendinta');
    const actiuni = screen.getByTestId('progres-zone-actiuni');
    // tendinta now precedes actiuni in the DOM.
    expect(tendinta.compareDocumentPosition(actiuni) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // And specifically the trend sits above the log-weight CTA.
    const trend = screen.getByTestId('progres-trend-sparkline');
    const cta = screen.getByTestId('cta-log-weight');
    expect(trend.compareDocumentPosition(cta) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('shows the honest "sharpens as you log" microcopy after logging today', async () => {
    renderProgres();
    fireEvent.click(screen.getByTestId('nutri-kcal-edit'));
    fireEvent.change(screen.getByTestId('nutri-kcal-input'), { target: { value: '2100' } });
    fireEvent.click(screen.getByTestId('nutri-save'));
    expect(await screen.findByTestId('tdee-logged-note')).toBeInTheDocument();
    expect(screen.getByTestId('tdee-logged-note').textContent ?? '').toMatch(/sharpens/i);
  });
});

describe('Progres — D-LEGACY-064 no-diacritics', () => {
  it('no diacritics in text', () => {
    const { container } = renderProgres();
    expect(/[\u0103\u00e2\u00ee\u0219\u021b\u0102\u00c2\u00ce\u0218\u021a]/.test(container.textContent ?? '')).toBe(false);
  });
});

describe('Progres — F-progres-07 Alerte azi banner mockup parity', () => {
  beforeEach(() => {
    vi.mocked(getCoachToday).mockResolvedValue({
      readiness: null,
      fatigue: null,
      plannedWorkout: null,
      isRestDay: true,
      patternsBanner: [],
      prWallRecent: [],
      alerts: [],
      restReason: null,
      source: 'baseline',
    });
  });

  it('hides Alerte azi label + banner cand alerts empty', async () => {
    renderProgres();
    await Promise.resolve();
    expect(screen.queryByTestId('alerte-azi-label')).not.toBeInTheDocument();
    expect(screen.queryByTestId('alerts-banner')).not.toBeInTheDocument();
  });

  it('renders Alerte azi label + 3-row banner when alerts present', async () => {
    vi.mocked(getCoachToday).mockResolvedValueOnce({
      readiness: null,
      fatigue: null,
      plannedWorkout: null,
      isRestDay: true,
      patternsBanner: [],
      prWallRecent: [],
      alerts: [
        { id: 'adherence_0', text: 'Saptamana asta ai sarit 2 antrenamente', severity: 'warn' },
        { id: 'stagnation_1', text: 'Greutatile stau pe loc de 3 saptamani', severity: 'info' },
        { id: 'weakness_2', text: 'Umerii ramasi in urma', severity: 'info' },
      ],
      restReason: null,
      source: 'engine',
    });
    renderProgres();
    expect(await screen.findByTestId('alerts-banner')).toBeInTheDocument();
    // Wave C2 i18n: EN default → "Alerts today" (was RO "Alerte azi").
    expect(screen.getByTestId('alerte-azi-label')).toHaveTextContent(/Alerts today/i);
    expect(screen.getByText(/sarit 2 antrenamente/i)).toBeInTheDocument();
    expect(screen.getByText(/stau pe loc de 3 saptamani/i)).toBeInTheDocument();
    expect(screen.getByText(/Umerii ramasi in urma/i)).toBeInTheDocument();
  });

  it('Alerte azi banner placed above log-weight CTA', async () => {
    vi.mocked(getCoachToday).mockResolvedValueOnce({
      readiness: null,
      fatigue: null,
      plannedWorkout: null,
      isRestDay: true,
      patternsBanner: [],
      prWallRecent: [],
      alerts: [{ id: 'a_0', text: 'alpha', severity: 'warn' }],
      restReason: null,
      source: 'engine',
    });
    renderProgres();
    const banner = await screen.findByTestId('alerts-banner');
    const cta = screen.getByTestId('cta-log-weight');
    expect(banner.compareDocumentPosition(cta) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
