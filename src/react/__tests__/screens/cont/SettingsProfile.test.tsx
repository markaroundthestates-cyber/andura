// Phase 6 task_09 — SettingsProfile sub-screen tests.
// MemoryRouter jsdom paradigm per D020.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SettingsProfile } from '../../../routes/screens/cont/SettingsProfile';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { toast } from '../../../lib/toast';

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
  toast.clear();
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

describe('SettingsProfile — Tinte personale (§F-pass2-settings-profile-04)', () => {
  it('renders Tinte personale section heading', () => {
    renderScreen();
    expect(screen.getByText('Tinte personale')).toBeInTheDocument();
  });

  it('renders greutate tinta + pana in inputs', () => {
    renderScreen();
    expect(screen.getByTestId('profile-target-weight-input')).toBeInTheDocument();
    expect(screen.getByTestId('profile-target-month-input')).toBeInTheDocument();
  });

  it('ETA hidden until luna tinta selected', () => {
    renderScreen();
    expect(screen.queryByTestId('profile-target-eta')).toBeNull();
  });

  it('ETA derivat din luna tinta viitoare', () => {
    renderScreen();
    // Luna tinta 18 luni in viitor — ETA pozitiv, deterministic indiferent de data.
    const now = new Date();
    const future = new Date(now.getFullYear(), now.getMonth() + 18, 1);
    const ym = `${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, '0')}`;
    fireEvent.change(screen.getByTestId('profile-target-month-input'), { target: { value: ym } });
    expect(screen.getByTestId('profile-target-eta').textContent).toMatch(/Estimat in ~18 luni/);
  });

  it('ETA ascuns pentru luna tinta din trecut', () => {
    renderScreen();
    fireEvent.change(screen.getByTestId('profile-target-month-input'), { target: { value: '2000-01' } });
    expect(screen.queryByTestId('profile-target-eta')).toBeNull();
  });
});

describe('SettingsProfile — U-12 Big 6 range gate on save (AUDIT-2 §U-12 HIGH)', () => {
  it('rejects out-of-range age on save — store unchanged + toast + no saved status', () => {
    renderScreen();
    fireEvent.change(screen.getByTestId('profile-age-input'), { target: { value: '8' } });
    fireEvent.click(screen.getByTestId('settings-profile-save'));
    // store keeps prior valid value (31 din beforeEach), NU 8
    expect(useOnboardingStore.getState().data.age).toBe(31);
    expect(screen.queryByTestId('settings-profile-saved')).toBeNull();
    const items = toast.getSnapshot();
    expect(items.some((t) => t.variant === 'warning' && /Varsta intre 16 si 99/.test(String(t.message)))).toBe(true);
  });

  it('rejects out-of-range weight on save — store unchanged + toast', () => {
    renderScreen();
    fireEvent.change(screen.getByTestId('profile-weight-input'), { target: { value: '999' } });
    fireEvent.click(screen.getByTestId('settings-profile-save'));
    expect(useOnboardingStore.getState().data.weight).toBe(81);
    expect(screen.queryByTestId('settings-profile-saved')).toBeNull();
    const items = toast.getSnapshot();
    expect(items.some((t) => t.variant === 'warning' && /Greutate intre 30 si 250/.test(String(t.message)))).toBe(true);
  });

  it('rejects age above max (100) on save — boundary 99 enforced', () => {
    renderScreen();
    fireEvent.change(screen.getByTestId('profile-age-input'), { target: { value: '100' } });
    fireEvent.click(screen.getByTestId('settings-profile-save'));
    expect(useOnboardingStore.getState().data.age).toBe(31);
    expect(screen.queryByTestId('settings-profile-saved')).toBeNull();
  });

  it('accepts in-range edits on save — store updated + saved status + no warning toast', () => {
    renderScreen();
    fireEvent.change(screen.getByTestId('profile-age-input'), { target: { value: '40' } });
    fireEvent.change(screen.getByTestId('profile-weight-input'), { target: { value: '85' } });
    fireEvent.click(screen.getByTestId('settings-profile-save'));
    expect(useOnboardingStore.getState().data.age).toBe(40);
    expect(useOnboardingStore.getState().data.weight).toBe(85);
    expect(screen.getByTestId('settings-profile-saved')).toBeInTheDocument();
    expect(toast.getSnapshot().length).toBe(0);
  });

  it('does not commit ANY field when one field is out-of-range (atomic abort)', () => {
    renderScreen();
    // valid sex change + invalid age → whole save aborts, sex NOT committed
    fireEvent.change(screen.getByTestId('profile-sex-select'), { target: { value: 'f' } });
    fireEvent.change(screen.getByTestId('profile-age-input'), { target: { value: '5' } });
    fireEvent.click(screen.getByTestId('settings-profile-save'));
    expect(useOnboardingStore.getState().data.sex).toBe('m');
    expect(useOnboardingStore.getState().data.age).toBe(31);
  });
});

describe('SettingsProfile — Romanian no-diacritics rule (D-LEGACY-064)', () => {
  it('no diacritics in UI rendered text', () => {
    const { container } = renderScreen();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
