// §6-M3 audit revert — Energy/Problem screens: role="list" + aria-labelledby
// REMOVED per Co-CTO decision 2026-05-22. Buttons sunt actiuni navigate-on-click,
// NU items intr-o lista semantica. Screen readers anuntau "list, N items" apoi
// "(empty)" fiindca <button> copii NU sunt role="listitem" valid (ARIA spec).
//
// Fix: drop role="list" + aria-labelledby. <h1> heading singur anunta sectiunea
// natural; fiecare buton pe focus = perfect semantic pentru menu de actiuni.
//
// Karpathy SF: minimum semantic care rezolva = h1 + grouped <button> children.
// ZERO ARIA noise, ZERO false promises catre screen readers.

import type { JSX } from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { EnergyCheck } from '../../../routes/screens/antrenor/EnergyCheck';
import { EnergyCause } from '../../../routes/screens/antrenor/EnergyCause';
import { CevaNuMerge } from '../../../routes/screens/antrenor/CevaNuMerge';
import { ScheduleOverride } from '../../../routes/screens/antrenor/ScheduleOverride';

function Stub(): JSX.Element {
  return <div data-testid="probe" />;
}

function renderEnergyCheck() {
  return render(
    <MemoryRouter initialEntries={['/app/antrenor/energy-check']}>
      <Routes>
        <Route path="/app/antrenor/energy-check" element={<EnergyCheck />} />
        <Route path="/app/antrenor/energy-cause" element={<Stub />} />
        <Route path="/app/antrenor/workout-preview" element={<Stub />} />
      </Routes>
    </MemoryRouter>
  );
}

function renderEnergyCause() {
  return render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: '/app/antrenor/energy-cause',
          state: { energyLevel: 'slabit', intensityMod: 'minus' },
        },
      ]}
    >
      <Routes>
        <Route path="/app/antrenor/energy-cause" element={<EnergyCause />} />
        <Route path="/app/antrenor/workout-preview" element={<Stub />} />
      </Routes>
    </MemoryRouter>
  );
}

function renderCevaNuMerge() {
  return render(
    <MemoryRouter initialEntries={['/app/antrenor/ceva-nu-merge']}>
      <Routes>
        <Route path="/app/antrenor/ceva-nu-merge" element={<CevaNuMerge />} />
        <Route path="/app/antrenor/pain-button" element={<Stub />} />
        <Route path="/app/antrenor/equipment-swap" element={<Stub />} />
        <Route path="/app/antrenor/aparate-lipsa" element={<Stub />} />
        <Route path="/app/antrenor/schedule-override" element={<Stub />} />
        <Route path="/app/antrenor" element={<Stub />} />
      </Routes>
    </MemoryRouter>
  );
}

function renderScheduleOverride() {
  return render(
    <MemoryRouter initialEntries={['/app/antrenor/schedule-override']}>
      <Routes>
        <Route path="/app/antrenor/schedule-override" element={<ScheduleOverride />} />
        <Route path="/app/antrenor/workout-preview" element={<Stub />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('EnergyCheck — no role="list" + heading sufficient', () => {
  it('container has NO role="list" (reverted §6-M3)', () => {
    const { container } = renderEnergyCheck();
    expect(container.querySelector('[role="list"]')).toBeNull();
  });

  it('container has NO aria-labelledby (reverted §6-M3)', () => {
    const { container } = renderEnergyCheck();
    expect(container.querySelector('[aria-labelledby]')).toBeNull();
  });

  it('h1 heading present + announces section (SubHeader title PAR-009)', () => {
    const { container } = renderEnergyCheck();
    const h1 = container.querySelector('h1');
    expect(h1).not.toBeNull();
    // Single h1 = SubHeader title verbatim mockup L879.
    // Wave C2 i18n: EN default → "How do you feel?" (was RO "Cum te simti?").
    expect(h1?.textContent).toMatch(/^How do you feel\?$/);
  });
});

describe('EnergyCause — no role="list" + heading sufficient', () => {
  it('container has NO role="list" (reverted §6-M3)', () => {
    const { container } = renderEnergyCause();
    expect(container.querySelector('[role="list"]')).toBeNull();
  });

  it('container has NO aria-labelledby (reverted §6-M3)', () => {
    const { container } = renderEnergyCause();
    expect(container.querySelector('[aria-labelledby]')).toBeNull();
  });

  it('h1 heading present + announces section', () => {
    const { container } = renderEnergyCause();
    const h1 = container.querySelector('h1');
    expect(h1).not.toBeNull();
    expect(h1?.textContent).toMatch(/Ce e mai greu azi/);
  });
});

describe('CevaNuMerge — no role="list" + heading sufficient', () => {
  it('container has NO role="list" (reverted §6-M3)', () => {
    const { container } = renderCevaNuMerge();
    expect(container.querySelector('[role="list"]')).toBeNull();
  });

  it('container has NO aria-labelledby (reverted §6-M3)', () => {
    const { container } = renderCevaNuMerge();
    expect(container.querySelector('[aria-labelledby]')).toBeNull();
  });

  it('h1 heading present + announces section', () => {
    // §F-ceva-nu-merge-02 (MED chat5 Wave 12) — title mockup verbatim L1001.
    const { container } = renderCevaNuMerge();
    const h1 = container.querySelector('h1');
    expect(h1).not.toBeNull();
    expect(h1?.textContent).toMatch(/Ce nu merge/);
  });
});

describe('ScheduleOverride — no role="list" + heading sufficient', () => {
  it('container has NO role="list" (reverted §6-M3)', () => {
    const { container } = renderScheduleOverride();
    expect(container.querySelector('[role="list"]')).toBeNull();
  });

  it('container has NO aria-labelledby (reverted §6-M3)', () => {
    const { container } = renderScheduleOverride();
    expect(container.querySelector('[aria-labelledby]')).toBeNull();
  });

  it('h1 heading present + announces section (SubHeader title PAR-009)', () => {
    const { container } = renderScheduleOverride();
    const h1 = container.querySelector('h1');
    expect(h1).not.toBeNull();
    // Locale-aware — RO bundle: "Schimbi planul de azi?" / EN default: "Change today's plan?".
    expect(h1?.textContent).toMatch(/Schimbi planul de azi|Change today's plan/);
  });
});
