// Phase 6 task_17 — SettingsDanger sub-screen tests.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SettingsDanger } from '../../../routes/screens/cont/SettingsDanger';
import { useAppStore } from '../../../stores/appStore';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { useOnboardingStore } from '../../../stores/onboardingStore';

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={['/app/cont/settings-danger']}>
      <Routes>
        <Route path="/app/cont/settings-danger" element={<SettingsDanger />} />
        <Route path="/app/cont" element={<LocationProbe />} />
        <Route path="/auth" element={<LocationProbe />} />
        <Route path="/" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  useAppStore.getState().setAuthenticated(true);
  useWorkoutStore.setState({ streak: 5 });
  useOnboardingStore.setState({
    data: { age: 30, sex: 'm', goal: 'masa', frequency: '4', experience: 'intermediar', weight: 80 },
    completed: true,
    completedAt: Date.now(),
  });
  localStorage.clear();
  localStorage.setItem('wv2-test-key', 'sample');
  // §A016 freshness — set fresh auth pentru default test suite (delete path).
  localStorage.setItem('firebase-last-auth-at', String(Date.now()));
});

describe('SettingsDanger — render + actions', () => {
  it('renders heading "Deconectare & stergere"', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: /Deconectare/i, level: 1 })).toBeInTheDocument();
  });

  it('renders 3 actions (logout/reset/delete)', () => {
    renderScreen();
    expect(screen.getByTestId('danger-logout')).toBeInTheDocument();
    expect(screen.getByTestId('danger-reset')).toBeInTheDocument();
    expect(screen.getByTestId('danger-delete')).toBeInTheDocument();
  });

  it('logout click opens confirm modal (§A007 non-destructive gate)', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('danger-logout'));
    expect(screen.getByTestId('danger-confirm-modal')).toBeInTheDocument();
    // Modal title ends with "?" — distinguishes from button text "Iesi din cont"
    expect(screen.getByRole('heading', { name: /Iesi din cont\?/i })).toBeInTheDocument();
    expect(screen.getByText(/Te poti reconecta oricand/i)).toBeInTheDocument();
  });

  it('logout confirm accept → setAuthenticated false + navigate /auth', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('danger-logout'));
    fireEvent.click(screen.getByTestId('danger-confirm-accept'));
    expect(useAppStore.getState().isAuthenticated).toBe(false);
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/auth');
  });

  it('logout confirm cancel closes modal NU logs out', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('danger-logout'));
    fireEvent.click(screen.getByTestId('danger-confirm-cancel'));
    expect(screen.queryByTestId('danger-confirm-modal')).not.toBeInTheDocument();
    expect(useAppStore.getState().isAuthenticated).toBe(true);
  });

  it('reset click opens confirm modal', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('danger-reset'));
    expect(screen.getByTestId('danger-confirm-modal')).toBeInTheDocument();
    expect(screen.getByText(/Toate datele tale locale vor fi sterse/)).toBeInTheDocument();
  });

  it('reset confirm accept wipes stores + tier 0 keys + navigates /', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('danger-reset'));
    fireEvent.click(screen.getByTestId('danger-confirm-accept'));
    expect(useWorkoutStore.getState().streak).toBe(0);
    expect(useOnboardingStore.getState().completed).toBe(false);
    expect(localStorage.getItem('wv2-test-key')).toBeNull();
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/');
  });

  it('reset confirm cancel closes modal NU wipes', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('danger-reset'));
    fireEvent.click(screen.getByTestId('danger-confirm-cancel'));
    expect(screen.queryByTestId('danger-confirm-modal')).not.toBeInTheDocument();
    expect(useWorkoutStore.getState().streak).toBe(5);
  });

  it('delete click opens confirm modal cu cont message', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('danger-delete'));
    expect(screen.getByTestId('danger-confirm-modal')).toBeInTheDocument();
    expect(screen.getByText(/Datele \+ contul vor fi sterse/)).toBeInTheDocument();
  });

  it('delete confirm accept wipes + logout + navigates /auth', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('danger-delete'));
    fireEvent.click(screen.getByTestId('danger-confirm-accept'));
    expect(useAppStore.getState().isAuthenticated).toBe(false);
    expect(useWorkoutStore.getState().streak).toBe(0);
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/auth');
  });

  it('back navigates la /app/cont', () => {
    renderScreen();
    fireEvent.click(screen.getByRole('button', { name: /Inapoi/i }));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/cont');
  });

  it('no diacritics in UI text', () => {
    const { container } = renderScreen();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });

  it('§A016 stale auth aborts delete + forces re-auth redirect', () => {
    // Simulate stale auth (lastAuthAt > 5min ago).
    localStorage.setItem('firebase-last-auth-at', String(Date.now() - 6 * 60 * 1000));
    renderScreen();
    fireEvent.click(screen.getByTestId('danger-delete'));
    fireEvent.click(screen.getByTestId('danger-confirm-accept'));
    // Data NOT wiped (reauth required before destructive proceed).
    expect(useWorkoutStore.getState().streak).toBe(5);
    // Forced to /auth cu reason param.
    expect(screen.getByTestId('probe')).toHaveAttribute(
      'data-pathname',
      '/auth',
    );
    expect(useAppStore.getState().isAuthenticated).toBe(false);
  });

  it('§A016 missing lastAuthAt (NU set) also aborts delete', () => {
    localStorage.removeItem('firebase-last-auth-at');
    renderScreen();
    fireEvent.click(screen.getByTestId('danger-delete'));
    fireEvent.click(screen.getByTestId('danger-confirm-accept'));
    expect(useWorkoutStore.getState().streak).toBe(5);
    expect(useAppStore.getState().isAuthenticated).toBe(false);
  });
});
