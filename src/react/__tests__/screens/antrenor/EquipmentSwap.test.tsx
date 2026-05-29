// ══ EQUIPMENT SWAP TESTS — task_07 §A toggle list + cascade stub ═════════
// MemoryRouter jsdom paradigm per D020.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { EquipmentSwap } from '../../../routes/screens/antrenor/EquipmentSwap';
// i18n locale pin — these specs assert RO copy (Aparate ocupate / Ocupat /
// Liber / Continui adaptat / etc). Force RO so the i18n indirection resolves
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

function renderSwap() {
  return render(
    <MemoryRouter initialEntries={['/app/antrenor/equipment-swap']}>
      <Routes>
        <Route path="/app/antrenor/equipment-swap" element={<EquipmentSwap />} />
        <Route path="/app/antrenor/workout-preview" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('EquipmentSwap — render', () => {
  it('renders SubHeader title "Schimba echipament" (mockup L1027 verbatim)', () => {
    renderSwap();
    expect(
      screen.getByRole('heading', { name: /Schimba echipament/i, level: 1 })
    ).toBeInTheDocument();
  });

  it('renders body sub-heading "Aparate ocupate?" (h2)', () => {
    renderSwap();
    expect(
      screen.getByRole('heading', { name: /Aparate ocupate/i, level: 2 })
    ).toBeInTheDocument();
  });

  it('renders SubHeader back button (PAR-009)', () => {
    renderSwap();
    expect(screen.getByTestId('equipment-swap-back')).toBeInTheDocument();
  });

  it('renders 5 equipment items toate default Liber', () => {
    renderSwap();
    const items = screen.getAllByRole('button').filter((b) =>
      b.hasAttribute('data-equipment-id')
    );
    expect(items.length).toBe(5);
    items.forEach((b) => {
      expect(b).toHaveAttribute('data-status', 'available');
      expect(b).toHaveAttribute('aria-pressed', 'false');
      expect(b.textContent).toMatch(/Liber/);
    });
  });

  it('renders Continue button', () => {
    renderSwap();
    expect(screen.getByTestId('equipment-continue')).toBeInTheDocument();
  });
});

describe('EquipmentSwap — toggle behavior', () => {
  it('click toggles available → busy', () => {
    renderSwap();
    const bench = screen.getByRole('button', { name: /Bench press/i });
    expect(bench).toHaveAttribute('data-status', 'available');
    fireEvent.click(bench);
    expect(bench).toHaveAttribute('data-status', 'busy');
    expect(bench).toHaveAttribute('aria-pressed', 'true');
    expect(bench.textContent).toMatch(/Ocupat/);
  });

  it('click toggles busy → available (round-trip)', () => {
    renderSwap();
    const smith = screen.getByRole('button', { name: /Smith machine/i });
    fireEvent.click(smith);
    expect(smith).toHaveAttribute('data-status', 'busy');
    fireEvent.click(smith);
    expect(smith).toHaveAttribute('data-status', 'available');
  });

  it('toggling one item nu afecteaza altele', () => {
    renderSwap();
    const lat = screen.getByRole('button', { name: /Lat pulldown/i });
    const cable = screen.getByRole('button', { name: /Cable row/i });
    fireEvent.click(lat);
    expect(lat).toHaveAttribute('data-status', 'busy');
    expect(cable).toHaveAttribute('data-status', 'available');
  });
});

describe('EquipmentSwap — navigation flow', () => {
  it('Continue cu zero busy propagates empty coarse-type array', () => {
    renderSwap();
    fireEvent.click(screen.getByTestId('equipment-continue'));
    const probe = screen.getByTestId('probe');
    expect(probe).toHaveAttribute('data-pathname', '/app/antrenor/workout-preview');
    // WP-5: payload is busy COARSE TYPES (library SoT), not gym-item ids.
    expect(probe.textContent).toContain('"busyCoarseTypes":[]');
  });

  it('Continue cu 2 busy propagates the blocked coarse types', () => {
    renderSwap();
    // Bench press → barbell; Leg press → machine.
    fireEvent.click(screen.getByRole('button', { name: /Bench press/i }));
    fireEvent.click(screen.getByRole('button', { name: /Leg press/i }));
    fireEvent.click(screen.getByTestId('equipment-continue'));
    const probe = screen.getByTestId('probe');
    expect(probe.textContent).toContain('"barbell"');
    expect(probe.textContent).toContain('"machine"');
  });
});

describe('EquipmentSwap — Romanian no-diacritics rule (D-LEGACY-064)', () => {
  it('no diacritics in UI rendered text', () => {
    const { container } = renderSwap();
    const text = container.textContent ?? '';
    expect(/[ăâîșțĂÂÎȘȚ]/.test(text)).toBe(false);
  });
});
