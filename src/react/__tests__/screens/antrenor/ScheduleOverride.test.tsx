// ══ SCHEDULE OVERRIDE TESTS — task_07 §C 5-option picker + override stub ══
// MemoryRouter jsdom paradigm per D020.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ScheduleOverride } from '../../../routes/screens/antrenor/ScheduleOverride';
// i18n locale pin — these specs assert RO copy (Schimbi planul de azi /
// Mai usor / Mai greu / etc). Force RO so the i18n indirection resolves
// to the RO assertion targets. EN coverage is locked separately by
// i18nNoRoLeak.test.tsx.
import { setLocale, _resetI18nCache } from '../../../../i18n/index.js';
beforeEach(() => {
  try { localStorage.removeItem('sf.locale'); } catch { /* noop */ }
  _resetI18nCache();
  setLocale('ro');
});

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
  it('Alta grupa → overrideKind=different-muscle (drives the engine alternative)', () => {
    renderOverride();
    fireEvent.click(screen.getByRole('button', { name: /Alta grupa/i }));
    const probe = screen.getByTestId('probe');
    expect(probe.textContent).toContain('"intensityMod":"normal"');
    expect(probe.textContent).toContain('"overrideKind":"different-muscle"');
  });
});

describe('ScheduleOverride — Romanian no-diacritics rule (D-LEGACY-064)', () => {
  it('no diacritics in UI rendered text', () => {
    const { container } = renderOverride();
    const text = container.textContent ?? '';
    expect(/[ăâîșțĂÂÎȘȚ]/.test(text)).toBe(false);
  });
});
