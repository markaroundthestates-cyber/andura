// B002/D047 Stage 3 — RedoOnboardingConfirm drill-down tests.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { RedoOnboardingConfirm } from '../../../routes/screens/cont/RedoOnboardingConfirm';
import { useOnboardingStore } from '../../../stores/onboardingStore';

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={['/app/cont/redo-onboarding-confirm']}>
      <Routes>
        <Route path="/app/cont/redo-onboarding-confirm" element={<RedoOnboardingConfirm />} />
        <Route path="/app/cont/settings-prefs" element={<LocationProbe />} />
        <Route path="/onboarding/1" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  useOnboardingStore.setState({
    data: { age: 30, sex: 'm', goal: 'masa', frequency: '4', experience: 'intermediar', weight: 80 },
    completed: true,
    completedAt: Date.now(),
  });
  localStorage.clear();
});

describe('RedoOnboardingConfirm — B002 drill-down', () => {
  it('renders heading "Refa onboarding"', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: /Refa onboarding/i, level: 1 })).toBeInTheDocument();
  });

  it('confirm resets onboardingStore + navigates /onboarding/1', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('redo-onboarding-confirm-accept'));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/onboarding/1');
    const state = useOnboardingStore.getState();
    expect(state.completed).toBe(false);
    expect(state.completedAt).toBeNull();
    expect(state.data.goal).toBeNull();
    expect(state.data.age).toBeNull();
  });

  it('cancel navigates back la /app/cont/settings-prefs', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('redo-onboarding-confirm-cancel'));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/cont/settings-prefs');
  });

  it('back arrow navigates settings-prefs', () => {
    renderScreen();
    fireEvent.click(screen.getByRole('button', { name: /Inapoi/i }));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/cont/settings-prefs');
  });

  it('no diacritics in UI text', () => {
    const { container } = renderScreen();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
