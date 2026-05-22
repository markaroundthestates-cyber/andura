// §6-M3 audit gap — SettingsProfile FieldRow IMPLICIT LABEL coverage.
// Existing SettingsProfile.test.tsx (16 tests) verifies inputs render with
// correct values but does NOT test the §6-M3 fix benefit: that wrapping
// <label> binds the visible row text to the input/select implicitly.
//
// Behavioral assertion: getByLabelText('Varsta') should resolve to the
// number input (WCAG 1.3.1 + 4.1.2 — screen reader announces "Varsta" when
// focus lands on input).

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SettingsProfile } from '../../../routes/screens/cont/SettingsProfile';
import { useOnboardingStore } from '../../../stores/onboardingStore';

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
    },
    completed: true,
    completedAt: Date.now(),
  });
  localStorage.clear();
});

describe('SettingsProfile — FieldRow implicit <label> binding (§6-M3 a11y)', () => {
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

  it('Obiectiv label binds to select element', () => {
    renderScreen();
    const sel = screen.getByLabelText('Obiectiv') as HTMLSelectElement;
    expect(sel.tagName).toBe('SELECT');
    expect(sel.value).toBe('masa');
  });

  it('Frecventa label binds to select element', () => {
    renderScreen();
    const sel = screen.getByLabelText('Frecventa') as HTMLSelectElement;
    expect(sel.tagName).toBe('SELECT');
    expect(sel.value).toBe('4');
  });

  it('Experienta label binds to select element', () => {
    renderScreen();
    const sel = screen.getByLabelText('Experienta') as HTMLSelectElement;
    expect(sel.tagName).toBe('SELECT');
    expect(sel.value).toBe('intermediar');
  });

  it('FieldRow uses real <label> element (not <span>) — DOM verification', () => {
    renderScreen();
    const input = screen.getByLabelText('Varsta');
    // Walk up to nearest LABEL ancestor — must exist.
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
});
