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

  it('renders 5 override options cu data-override-kind', () => {
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
    expect(screen.getByRole('button', { name: /Mobilitate/i })).toHaveAttribute(
      'data-override-kind',
      'mobility'
    );
    expect(screen.getByRole('button', { name: /Cardio doar/i })).toHaveAttribute(
      'data-override-kind',
      'cardio'
    );
  });

  it('renders description copy per option', () => {
    renderOverride();
    expect(screen.getByText(/-20%/)).toBeInTheDocument();
    expect(screen.getByText(/\+15%/)).toBeInTheDocument();
    expect(screen.getByText(/Stretching/i)).toBeInTheDocument();
    expect(screen.getByText(/25-40 min/i)).toBeInTheDocument();
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

  it('Alta grupa → intensityMod=normal', () => {
    renderOverride();
    fireEvent.click(screen.getByRole('button', { name: /Alta grupa/i }));
    const probe = screen.getByTestId('probe');
    expect(probe.textContent).toContain('"intensityMod":"normal"');
    expect(probe.textContent).toContain('"overrideKind":"different-muscle"');
  });

  it('Mobilitate → intensityMod=normal + overrideKind=mobility', () => {
    renderOverride();
    fireEvent.click(screen.getByRole('button', { name: /Mobilitate/i }));
    const probe = screen.getByTestId('probe');
    expect(probe.textContent).toContain('"intensityMod":"normal"');
    expect(probe.textContent).toContain('"overrideKind":"mobility"');
  });

  it('Cardio doar → intensityMod=normal + overrideKind=cardio', () => {
    renderOverride();
    fireEvent.click(screen.getByRole('button', { name: /Cardio doar/i }));
    const probe = screen.getByTestId('probe');
    expect(probe.textContent).toContain('"intensityMod":"normal"');
    expect(probe.textContent).toContain('"overrideKind":"cardio"');
  });
});

describe('ScheduleOverride — Romanian no-diacritics rule (D-LEGACY-064)', () => {
  it('no diacritics in UI rendered text', () => {
    const { container } = renderOverride();
    const text = container.textContent ?? '';
    expect(/[ăâîșțĂÂÎȘȚ]/.test(text)).toBe(false);
  });
});
