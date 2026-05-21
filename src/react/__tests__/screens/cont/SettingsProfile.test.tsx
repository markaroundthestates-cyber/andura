// Phase 6 task_09 — SettingsProfile sub-screen tests.
// MemoryRouter jsdom paradigm per D020.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SettingsProfile } from '../../../routes/screens/cont/SettingsProfile';
import { useOnboardingStore } from '../../../stores/onboardingStore';

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={['/app/cont/settings-profile']}>
      <Routes>
        <Route path="/app/cont/settings-profile" element={<SettingsProfile />} />
        <Route path="/app/cont" element={<LocationProbe />} />
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

describe('SettingsProfile — render', () => {
  it('renders heading "Profil & tinte"', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: /Profil & tinte/i, level: 1 })).toBeInTheDocument();
  });

  it('renders back button cu aria-label "Inapoi"', () => {
    renderScreen();
    expect(screen.getByRole('button', { name: /Inapoi/i })).toBeInTheDocument();
  });

  it('renders age input cu initial value din store', () => {
    renderScreen();
    expect(screen.getByTestId('profile-age-input')).toHaveValue(31);
  });

  it('renders weight input cu initial value din store', () => {
    renderScreen();
    expect(screen.getByTestId('profile-weight-input')).toHaveValue(81);
  });

  it('renders sex select cu initial value din store', () => {
    renderScreen();
    expect(screen.getByTestId('profile-sex-select')).toHaveValue('m');
  });

  it('renders goal select cu initial value din store', () => {
    renderScreen();
    expect(screen.getByTestId('profile-goal-select')).toHaveValue('masa');
  });

  it('renders frequency select cu initial value din store', () => {
    renderScreen();
    expect(screen.getByTestId('profile-frequency-select')).toHaveValue('4');
  });

  it('renders experience select cu initial value din store', () => {
    renderScreen();
    expect(screen.getByTestId('profile-experience-select')).toHaveValue('intermediar');
  });

  it('renders Confirma editare CTA', () => {
    renderScreen();
    expect(screen.getByTestId('settings-profile-save')).toBeInTheDocument();
  });
});

describe('SettingsProfile — interactions', () => {
  it('age input onChange updates draft', () => {
    renderScreen();
    const input = screen.getByTestId('profile-age-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '32' } });
    expect(input.value).toBe('32');
  });

  it('save commits draft to onboardingStore', () => {
    renderScreen();
    fireEvent.change(screen.getByTestId('profile-weight-input'), { target: { value: '80' } });
    fireEvent.click(screen.getByTestId('settings-profile-save'));
    expect(useOnboardingStore.getState().data.weight).toBe(80);
  });

  it('save shows confirmation status', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('settings-profile-save'));
    expect(screen.getByTestId('settings-profile-saved')).toBeInTheDocument();
    expect(screen.getByTestId('settings-profile-saved').textContent).toMatch(/Profil salvat/);
  });

  it('back button navigates la /app/cont', () => {
    renderScreen();
    fireEvent.click(screen.getByRole('button', { name: /Inapoi/i }));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/cont');
  });

  it('changing sex propagates pe save', () => {
    renderScreen();
    fireEvent.change(screen.getByTestId('profile-sex-select'), { target: { value: 'f' } });
    fireEvent.click(screen.getByTestId('settings-profile-save'));
    expect(useOnboardingStore.getState().data.sex).toBe('f');
  });

  it('changing goal propagates pe save', () => {
    // §B003/D-1b — use new 'slabire' value (was 'definire' pre-mockup parity).
    renderScreen();
    fireEvent.change(screen.getByTestId('profile-goal-select'), { target: { value: 'slabire' } });
    fireEvent.click(screen.getByTestId('settings-profile-save'));
    expect(useOnboardingStore.getState().data.goal).toBe('slabire');
  });
});

describe('SettingsProfile — Romanian no-diacritics rule (D-LEGACY-064)', () => {
  it('no diacritics in UI rendered text', () => {
    const { container } = renderScreen();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
