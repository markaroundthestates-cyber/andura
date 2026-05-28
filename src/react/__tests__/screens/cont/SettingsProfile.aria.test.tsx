// §6-M3 + §HIGH-1 audit coverage — SettingsProfile LabelRow + SelectRow.
// LabelRow (inputs): implicit <label> wrap — getByLabelText resolves via
// nesting. SelectRow (selects, §HIGH-1 REVIEW-chat3-fresh-eyes split):
// explicit htmlFor/id binding sibling pattern — getByLabelText still
// resolves but DOM has no LABEL ancestor (avoids Android Chrome double-
// toggle on label click re-dispatch). WCAG 1.3.1 + 4.1.2 preserved both
// ways.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SettingsProfile } from '../../../routes/screens/cont/SettingsProfile';
import { useOnboardingStore } from '../../../stores/onboardingStore';

// Wave E4 i18n locale pin — these specs were written against RO copy;
// force RO locale so existing assertions keep their semantics. EN coverage
// is verified separately by src/i18n/__tests__/i18nNoRoLeak.test.tsx.
import { beforeEach as __i18nBeforeEach } from 'vitest';
import { setLocale as __setLocale, _resetI18nCache as __resetI18n } from '../../../../i18n/index.js';
__i18nBeforeEach(() => { try { localStorage.removeItem('sf.locale'); } catch {} __resetI18n(); __setLocale('ro'); });


function Stub(): JSX.Element {
  return <div data-testid="cont-stub" />;
}

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={['/app/cont/settings-profile']}>
      <Routes>
        <Route path="/app/cont/settings-profile" element={<SettingsProfile />} />
        <Route path="/app/cont" element={<Stub />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  useOnboardingStore.setState({
    data: {
      age: 31,
      sex: 'm',
      goal: 'masa',
      frequency: '4',
      experience: 'intermediar',
      weight: 81,
      height: 175,
    },
    completed: true,
    completedAt: Date.now(),
  });
  localStorage.clear();
  // Wave E4 — restore RO locale (cleared by storage flush above) so existing
  // RO label assertions keep their semantics.
  __resetI18n();
  __setLocale('ro');
});

describe('SettingsProfile — LabelRow/SelectRow label binding (§6-M3 + §HIGH-1)', () => {
  it('Varsta label binds to number input (getByLabelText resolves)', () => {
    renderScreen();
    const input = screen.getByLabelText('Varsta') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe('INPUT');
    expect(input.type).toBe('number');
    expect(input).toHaveValue(31);
  });

  it('Greutate (kg) label binds to number input', () => {
    renderScreen();
    const input = screen.getByLabelText('Greutate (kg)') as HTMLInputElement;
    expect(input.tagName).toBe('INPUT');
    expect(input.type).toBe('number');
    expect(input).toHaveValue(81);
  });

  it('Gen label binds to select element', () => {
    renderScreen();
    const sel = screen.getByLabelText('Gen') as HTMLSelectElement;
    expect(sel.tagName).toBe('SELECT');
    expect(sel.value).toBe('m');
  });

  // §obiectiv-relocate 2026-05-28 — Obiectiv select removed from SettingsProfile
  // (relocated la Progres > ObiectivGoalCard). Frecventa + Experienta raman.
  it('Obiectiv select NOT rendered in SettingsProfile (relocated)', () => {
    renderScreen();
    expect(screen.queryByLabelText('Obiectiv')).toBeNull();
  });

  it('Frecventa label binds to select element', () => {
    renderScreen();
    const sel = screen.getByLabelText('Antrenamente pe saptamana') as HTMLSelectElement;
    expect(sel.tagName).toBe('SELECT');
    expect(sel.value).toBe('4');
  });

  it('Experienta label binds to select element', () => {
    renderScreen();
    const sel = screen.getByLabelText('Experienta') as HTMLSelectElement;
    expect(sel.tagName).toBe('SELECT');
    expect(sel.value).toBe('intermediar');
  });

  it('LabelRow uses real <label> element wrapping input — DOM verification', () => {
    renderScreen();
    const input = screen.getByLabelText('Varsta');
    // Walk up to nearest LABEL ancestor — must exist (implicit wrap pattern).
    let parent: HTMLElement | null = input.parentElement;
    let foundLabel = false;
    while (parent) {
      if (parent.tagName === 'LABEL') {
        foundLabel = true;
        break;
      }
      parent = parent.parentElement;
    }
    expect(foundLabel).toBe(true);
  });

  // §HIGH-1 NEW — SelectRow htmlFor/id sibling binding (no nesting).
  // Android Chrome label click on nested <select> can re-dispatch causing
  // native dropdown to flicker open/close. Sibling pattern avoids that.

  it('SelectRow uses sibling htmlFor/id binding — no LABEL ancestor for selects (§HIGH-1)', () => {
    renderScreen();
    // §obiectiv-relocate 2026-05-28 — profile-goal-select removed (goal moved
    // la Progres > ObiectivGoalCard). 3 selects raman: sex + frequency + experience.
    const selectIds = [
      'profile-sex-select',
      'profile-frequency-select',
      'profile-experience-select',
    ];
    selectIds.forEach((id) => {
      const sel = document.getElementById(id);
      expect(sel).not.toBeNull();
      expect(sel?.tagName).toBe('SELECT');
      // Walk up to verify NO LABEL ancestor wraps the <select>.
      let parent: HTMLElement | null = sel?.parentElement ?? null;
      let foundLabel = false;
      while (parent) {
        if (parent.tagName === 'LABEL') {
          foundLabel = true;
          break;
        }
        parent = parent.parentElement;
      }
      expect(foundLabel).toBe(false);
    });
  });

  it('SelectRow label htmlFor matches select id for all 3 selects (§HIGH-1)', () => {
    renderScreen();
    // §obiectiv-relocate 2026-05-28 — Obiectiv pair removed (goal moved la Progres).
    const pairs: Array<{ label: string; id: string }> = [
      { label: 'Gen', id: 'profile-sex-select' },
      { label: 'Antrenamente pe saptamana', id: 'profile-frequency-select' },
      { label: 'Experienta', id: 'profile-experience-select' },
    ];
    pairs.forEach(({ label, id }) => {
      // Find the <label> element whose textContent matches the row label.
      const labelEls = Array.from(document.querySelectorAll('label')) as HTMLLabelElement[];
      const match = labelEls.find((el) => el.textContent === label);
      expect(match, `<label> with text "${label}" not found`).toBeDefined();
      expect(match?.htmlFor).toBe(id);
      // Sanity: the bound select exists and has the expected id.
      const sel = document.getElementById(id);
      expect(sel?.tagName).toBe('SELECT');
    });
  });
});
