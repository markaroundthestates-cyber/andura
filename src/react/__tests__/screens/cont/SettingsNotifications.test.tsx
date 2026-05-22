// Phase 6 task_10 — SettingsNotifications sub-screen tests.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    expect(screen.getByTestId('notif-freq-zilnic')).toHaveAttribute('aria-pressed', 'true');
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

  it('§LOW-4 time input empty change preserves current value (no force reset 18:00)', () => {
    renderScreen();
    const input = screen.getByTestId('notif-time-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '07:00' } });
    expect(useSettingsStore.getState().notificationTime).toBe('07:00');
    // Simulate mid-edit blank state (Android keyboards can produce empty).
    fireEvent.change(input, { target: { value: '' } });
    expect(useSettingsStore.getState().notificationTime).toBe('07:00');
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

describe('SettingsNotifications — §F-pass2-settings-notif-02 per-event toggles', () => {
  it('renders Antrenament domain section cu 3 per-event toggles', () => {
    renderScreen();
    const section = screen.getByTestId('notif-events-antrenament');
    expect(section).toBeInTheDocument();
    expect(screen.getByTestId('notif-event-session-reminder')).toBeInTheDocument();
    expect(screen.getByTestId('notif-event-rest-timer')).toBeInTheDocument();
    expect(screen.getByTestId('notif-event-session-missed')).toBeInTheDocument();
  });

  it('renders Coaching domain section cu 2 per-event toggles', () => {
    renderScreen();
    expect(screen.getByTestId('notif-events-coaching')).toBeInTheDocument();
    expect(screen.getByTestId('notif-event-daily-coach')).toBeInTheDocument();
    expect(screen.getByTestId('notif-event-weekly-summary')).toBeInTheDocument();
  });

  it('per-event toggles default mockup parity: session-reminder ON, rest-timer ON, session-missed OFF', () => {
    renderScreen();
    expect(screen.getByTestId('notif-event-session-reminder')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByTestId('notif-event-rest-timer')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByTestId('notif-event-session-missed')).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByTestId('notif-event-daily-coach')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByTestId('notif-event-weekly-summary')).toHaveAttribute('aria-checked', 'true');
  });

  it('per-event toggle persists state via localStorage', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('notif-event-session-missed'));
    expect(localStorage.getItem('wv2-notif-event-session-missed')).toBe('1');
    fireEvent.click(screen.getByTestId('notif-event-session-reminder'));
    expect(localStorage.getItem('wv2-notif-event-session-reminder')).toBe('0');
  });

  it('per-event hydrate citeste din localStorage on mount', () => {
    localStorage.setItem('wv2-notif-event-session-reminder', '0');
    localStorage.setItem('wv2-notif-event-weekly-summary', '0');
    renderScreen();
    expect(screen.getByTestId('notif-event-session-reminder')).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByTestId('notif-event-weekly-summary')).toHaveAttribute('aria-checked', 'false');
  });

  it('per-event toggles disabled cand master toggle off', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('notif-master-toggle')); // disable master
    expect(screen.getByTestId('notif-event-session-reminder')).toBeDisabled();
    expect(screen.getByTestId('notif-event-daily-coach')).toBeDisabled();
  });
});

describe('SettingsNotifications — §32-H2 permission ladder', () => {
  const originalNotif = (globalThis as { Notification?: unknown }).Notification;

  afterEach(() => {
    if (originalNotif === undefined) {
      delete (globalThis as { Notification?: unknown }).Notification;
    } else {
      (globalThis as { Notification?: unknown }).Notification = originalNotif;
    }
  });

  function mockNotification(permission: 'default' | 'granted' | 'denied', requestResult?: 'granted' | 'denied'): { request: ReturnType<typeof vi.fn> } {
    const request = vi.fn(() => Promise.resolve(requestResult ?? permission));
    (globalThis as { Notification?: unknown }).Notification = Object.assign(
      function (): void {},
      { permission, requestPermission: request },
    );
    return { request };
  }

  it('toggle-on with default permission triggers requestPermission', async () => {
    useSettingsStore.setState({ notificationsEnabled: false });
    const { request } = mockNotification('default', 'granted');
    renderScreen();
    fireEvent.click(screen.getByTestId('notif-master-toggle'));
    await waitFor(() => expect(request).toHaveBeenCalled());
    await waitFor(() => expect(useSettingsStore.getState().notificationsEnabled).toBe(true));
  });

  it('toggle-on + denied permission does NOT enable store flag', async () => {
    useSettingsStore.setState({ notificationsEnabled: false });
    mockNotification('default', 'denied');
    renderScreen();
    fireEvent.click(screen.getByTestId('notif-master-toggle'));
    await waitFor(() => {
      expect(useSettingsStore.getState().notificationsEnabled).toBe(false);
    });
  });

  it('already-granted: toggle works without re-prompt', () => {
    useSettingsStore.setState({ notificationsEnabled: false });
    const { request } = mockNotification('granted');
    renderScreen();
    fireEvent.click(screen.getByTestId('notif-master-toggle'));
    expect(request).not.toHaveBeenCalled();
    expect(useSettingsStore.getState().notificationsEnabled).toBe(true);
  });

  it('denied permission + enabled store flag shows warning banner', () => {
    useSettingsStore.setState({ notificationsEnabled: true });
    mockNotification('denied');
    renderScreen();
    expect(screen.getByTestId('notif-permission-warning')).toBeInTheDocument();
  });

  it('unsupported (no Notification API) shows italic note when enabled', () => {
    useSettingsStore.setState({ notificationsEnabled: true });
    delete (globalThis as { Notification?: unknown }).Notification;
    renderScreen();
    expect(screen.getByTestId('notif-unsupported-warning')).toBeInTheDocument();
  });
});
