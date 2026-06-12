// §6-M3 audit gap — SUPPLEMENTAL ARIA coverage settings sub-screen toggle
// buttons.
//
// NOTE 2026-05-22 revert: original chat 2 morning impl used role=radiogroup
// + role=radio + aria-checked. Reverted la aria-pressed pe <button>
// (Karpathy SF — full radiogroup contract necesita arrow-key handling +
// roving tabIndex ~200 LOC zero benefit pre-Beta). Acest file verifica
// pattern aria-pressed corect aplicat pe SettingsPrefs + SchimbaFazaConfirm
// + SettingsNotifications. Day picker pastreaza role="group" (multi-select
// valid).

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SettingsPrefs } from '../../../routes/screens/cont/SettingsPrefs';
import { SchimbaFazaConfirm } from '../../../routes/screens/cont/SchimbaFazaConfirm';
import { SettingsNotifications } from '../../../routes/screens/cont/SettingsNotifications';
import { useSettingsStore } from '../../../stores/settingsStore';

function Stub(): JSX.Element {
  return <div data-testid="stub" />;
}

function renderPrefs() {
  return render(
    <MemoryRouter initialEntries={['/app/cont/settings-prefs']}>
      <Routes>
        <Route path="/app/cont/settings-prefs" element={<SettingsPrefs />} />
        <Route path="/app/cont" element={<Stub />} />
        <Route path="/app/cont/reset-coach-confirm" element={<Stub />} />
        <Route path="/app/cont/redo-onboarding-confirm" element={<Stub />} />
        <Route path="/app/cont/schimba-faza-confirm" element={<Stub />} />
      </Routes>
    </MemoryRouter>
  );
}

function renderSchimba() {
  return render(
    <MemoryRouter initialEntries={['/app/cont/schimba-faza-confirm']}>
      <Routes>
        <Route path="/app/cont/schimba-faza-confirm" element={<SchimbaFazaConfirm />} />
        <Route path="/app/cont/settings-prefs" element={<Stub />} />
      </Routes>
    </MemoryRouter>
  );
}

function renderNotif() {
  return render(
    <MemoryRouter initialEntries={['/app/cont/settings-notifications']}>
      <Routes>
        <Route path="/app/cont/settings-notifications" element={<SettingsNotifications />} />
        <Route path="/app/cont" element={<Stub />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  useSettingsStore.getState().reset();
  localStorage.clear();
});

describe('SettingsPrefs — toggle button aria-pressed §6-M3 revert', () => {
  it('unit kg button has aria-pressed reflecting selection (lb hidden 2026-06-12)', () => {
    const { container } = renderPrefs();
    const unitKg = container.querySelector('[data-testid="unit-kg"]');
    expect(unitKg?.getAttribute('aria-pressed')).toBe('true');
    // Pounds (lb) removed from the option set — founder pick 2026-06-12.
    expect(container.querySelector('[data-testid="unit-lb"]')).toBeNull();
  });

  it('no role=radio applied to toggle buttons (revert validation)', () => {
    const { container } = renderPrefs();
    const radios = container.querySelectorAll('[role="radio"]');
    expect(radios.length).toBe(0);
  });

  it('no role=radiogroup wrapper applied (revert validation)', () => {
    const { container } = renderPrefs();
    const groups = container.querySelectorAll('[role="radiogroup"]');
    expect(groups.length).toBe(0);
  });
});

describe('SchimbaFazaConfirm — phase buttons aria-pressed §6-M3 revert', () => {
  it('all 5 phase buttons have aria-pressed attr', () => {
    const { container } = renderSchimba();
    const phaseButtons = container.querySelectorAll('[data-testid^="phase-"]');
    expect(phaseButtons.length).toBe(5);
    phaseButtons.forEach((btn) => {
      expect(btn.hasAttribute('aria-pressed')).toBe(true);
    });
  });

  it('AUTO phase default has aria-pressed="true"', () => {
    const { container } = renderSchimba();
    const auto = container.querySelector('[data-testid="phase-auto"]');
    expect(auto?.getAttribute('aria-pressed')).toBe('true');
  });

  it('no role=radio or role=radiogroup applied (revert validation)', () => {
    const { container } = renderSchimba();
    expect(container.querySelectorAll('[role="radio"]').length).toBe(0);
    expect(container.querySelectorAll('[role="radiogroup"]').length).toBe(0);
  });
});

describe('SettingsNotifications — frequency aria-pressed + day picker group', () => {
  it('frequency buttons have aria-pressed', () => {
    const { container } = renderNotif();
    const freqZilnic = container.querySelector('[data-testid="notif-freq-zilnic"]');
    expect(freqZilnic?.getAttribute('aria-pressed')).toBe('true');
  });

  it('no role=radiogroup wrappers (revert validation)', () => {
    const { container } = renderNotif();
    expect(container.querySelectorAll('[role="radiogroup"]').length).toBe(0);
  });

  it('day picker preserves role="group" + aria-labelledby (multi-select valid)', () => {
    const { container } = renderNotif();
    const dayPicker = container.querySelector('[data-testid="notif-day-picker"]');
    expect(dayPicker?.getAttribute('role')).toBe('group');
    expect(dayPicker?.getAttribute('aria-labelledby')).toBe('notif-days-label');
  });

  it('day picker buttons have aria-pressed (toggle, not radio)', () => {
    const { container } = renderNotif();
    const day0 = container.querySelector('[data-testid="notif-day-0"]');
    expect(day0?.hasAttribute('aria-pressed')).toBe(true);
  });
});
