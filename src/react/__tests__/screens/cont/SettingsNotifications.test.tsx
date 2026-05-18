// Phase 6 task_10 — SettingsNotifications sub-screen tests.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SettingsNotifications } from '../../../routes/screens/cont/SettingsNotifications';
import { useSettingsStore } from '../../../stores/settingsStore';

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={['/app/cont/settings-notifications']}>
      <Routes>
        <Route path="/app/cont/settings-notifications" element={<SettingsNotifications />} />
        <Route path="/app/cont" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  useSettingsStore.getState().reset();
  localStorage.clear();
});

describe('SettingsNotifications — render + interactions', () => {
  it('renders heading "Notificari"', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: 'Notificari', level: 1 })).toBeInTheDocument();
  });

  it('master toggle reflects store default true', () => {
    renderScreen();
    const toggle = screen.getByTestId('notif-master-toggle');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('master toggle flip → store updated', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('notif-master-toggle'));
    expect(useSettingsStore.getState().notificationsEnabled).toBe(false);
  });

  it('frequency radio 3 options + default zilnic selected', () => {
    renderScreen();
    expect(screen.getByTestId('notif-freq-zilnic')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByTestId('notif-freq-saptamanal')).toBeInTheDocument();
    expect(screen.getByTestId('notif-freq-off')).toBeInTheDocument();
  });

  it('frequency change → store updated', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('notif-freq-saptamanal'));
    expect(useSettingsStore.getState().notificationFrequency).toBe('saptamanal');
  });

  it('day picker 7 chips L-Ma-Mi-J-V-S-D', () => {
    renderScreen();
    for (let i = 0; i < 7; i++) {
      expect(screen.getByTestId(`notif-day-${i}`)).toBeInTheDocument();
    }
  });

  it('day chip toggle persists store', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('notif-day-5')); // S currently false → true
    expect(useSettingsStore.getState().notificationDays[5]).toBe(true);
  });

  it('time input default 18:00 + change persists', () => {
    renderScreen();
    const input = screen.getByTestId('notif-time-input') as HTMLInputElement;
    expect(input.value).toBe('18:00');
    fireEvent.change(input, { target: { value: '19:30' } });
    expect(useSettingsStore.getState().notificationTime).toBe('19:30');
  });

  it('disable master toggle → freq + days + time disabled', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('notif-master-toggle'));
    expect(screen.getByTestId('notif-freq-zilnic')).toBeDisabled();
    expect(screen.getByTestId('notif-day-0')).toBeDisabled();
    expect(screen.getByTestId('notif-time-input')).toBeDisabled();
  });

  it('back button navigates la /app/cont', () => {
    renderScreen();
    fireEvent.click(screen.getByRole('button', { name: /Inapoi/i }));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/cont');
  });

  it('no diacritics in UI text', () => {
    const { container } = renderScreen();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
