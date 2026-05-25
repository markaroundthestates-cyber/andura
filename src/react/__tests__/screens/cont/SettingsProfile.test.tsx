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

// Minimal JWT fake helper for tests (display-only, NU signature validation).
function fakeJwt(payload: Record<string, unknown>): string {
  const b64 = (s: string): string => btoa(s).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  const head = b64(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = b64(JSON.stringify(payload));
  return `${head}.${body}.sig`;
}

describe('SettingsProfile — render', () => {
  it('renders heading "Profil si tinte"', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: /Profil si tinte/i, level: 1 })).toBeInTheDocument();
  });

  it('§F-cont-01 avatar initial defaults la "A" daca unauthenticated', () => {
    renderScreen();
    expect(screen.getByTestId('settings-profile-initial').textContent).toBe('A');
  });

  it('§F-cont-01 avatar initial wired din id_token JWT', () => {
    localStorage.setItem('firebase-id-token', fakeJwt({ email: 'daniel@andura.app', name: 'Daniel' }));
    renderScreen();
    expect(screen.getByTestId('settings-profile-initial').textContent).toBe('D');
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

describe('SettingsProfile — Compozitie corporala (§F-pass2-settings-profile-03)', () => {
  it('renders Compozitie corporala section heading', () => {
    renderScreen();
    expect(screen.getByText('Compozitie corporala')).toBeInTheDocument();
  });

  it('renders Talie + Gat + Inaltime inputs', () => {
    renderScreen();
    expect(screen.getByTestId('profile-waist-input')).toBeInTheDocument();
    expect(screen.getByTestId('profile-neck-input')).toBeInTheDocument();
    expect(screen.getByTestId('profile-height-input')).toBeInTheDocument();
  });

  it('BF% auto shows placeholder until masuratori complete', () => {
    renderScreen();
    expect(screen.getByTestId('profile-bf-auto').textContent).toBe('—');
  });

  it('BF% auto computes via US Navy engine cand talie+gat+inaltime filled', () => {
    renderScreen();
    fireEvent.change(screen.getByTestId('profile-waist-input'), { target: { value: '85' } });
    fireEvent.change(screen.getByTestId('profile-neck-input'), { target: { value: '38' } });
    fireEvent.change(screen.getByTestId('profile-height-input'), { target: { value: '180' } });
    // sex 'm' din store beforeEach — engine returns a finite %.
    expect(screen.getByTestId('profile-bf-auto').textContent).toMatch(/^\d+(\.\d+)?%$/);
  });

  it('BF% manual override input disabled pana la check', () => {
    renderScreen();
    const override = screen.getByTestId('profile-bf-override') as HTMLInputElement;
    expect(override.disabled).toBe(true);
    fireEvent.click(screen.getByTestId('profile-bf-manual'));
    expect(override.disabled).toBe(false);
  });
});

describe('SettingsProfile — Romanian no-diacritics rule (D-LEGACY-064)', () => {
  it('no diacritics in UI rendered text', () => {
    const { container } = renderScreen();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
