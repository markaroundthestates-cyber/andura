// Phase 6 task_10 — SettingsNotifications sub-screen tests.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SettingsNotifications } from '../../../routes/screens/cont/SettingsNotifications';
import { useSettingsStore } from '../../../stores/settingsStore';
import { enablePushNotifications, disablePushNotifications } from '../../../lib/pushNotifications';
import { syncNotificationPrefs } from '../../../lib/notificationPrefsSync';

// Master toggle deleaga la modulul push real + sincronizeaza prefs la RTDB —
// mock-uim ambele ca testele sa ramana izolate (fara FCM SDK / network).
vi.mock('../../../lib/pushNotifications', () => ({
  enablePushNotifications: vi.fn(() => Promise.resolve('granted')),
  disablePushNotifications: vi.fn(() => Promise.resolve()),
  isPushSupported: vi.fn(() => true),
}));
vi.mock('../../../lib/notificationPrefsSync', () => ({
  syncNotificationPrefs: vi.fn(() => Promise.resolve()),
}));

const mockEnablePush = vi.mocked(enablePushNotifications);
const mockDisablePush = vi.mocked(disablePushNotifications);
const mockSyncPrefs = vi.mocked(syncNotificationPrefs);

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
  mockEnablePush.mockReset();
  mockEnablePush.mockResolvedValue('granted');
  mockDisablePush.mockReset();
  mockDisablePush.mockResolvedValue(undefined);
  mockSyncPrefs.mockReset();
  mockSyncPrefs.mockResolvedValue(undefined);
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

  it('master toggle flip → store updated', async () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('notif-master-toggle'));
    await waitFor(() => expect(useSettingsStore.getState().notificationsEnabled).toBe(false));
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

  it('disable master toggle → freq + days + time disabled', async () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('notif-master-toggle'));
    await waitFor(() => expect(screen.getByTestId('notif-freq-zilnic')).toBeDisabled());
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

  it('per-event toggles disabled cand master toggle off', async () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('notif-master-toggle')); // disable master
    await waitFor(() => expect(screen.getByTestId('notif-event-session-reminder')).toBeDisabled());
    expect(screen.getByTestId('notif-event-daily-coach')).toBeDisabled();
  });
});

describe('SettingsNotifications — §F-pass2-settings-notif-03 quiet hours display', () => {
  it('renders "Ore de liniste" section heading', () => {
    renderScreen();
    expect(screen.getByText(/Ore de liniste/)).toBeInTheDocument();
  });

  it('renders quiet hours info row cu "Nu deranja" label + "22:00 — 07:00" range', () => {
    renderScreen();
    const block = screen.getByTestId('notif-quiet-hours');
    expect(block).toBeInTheDocument();
    expect(block.textContent).toMatch(/Nu deranja/);
    expect(block.textContent).toMatch(/22:00\s*—\s*07:00/);
  });
});

describe('SettingsNotifications — FCM push wiring (handleToggle)', () => {
  it('toggle-on delegheaza la enablePushNotifications (NU dubla request)', async () => {
    useSettingsStore.setState({ notificationsEnabled: false });
    mockEnablePush.mockResolvedValue('granted');
    renderScreen();
    fireEvent.click(screen.getByTestId('notif-master-toggle'));
    await waitFor(() => expect(mockEnablePush).toHaveBeenCalledTimes(1));
  });

  it("'granted' → store flag true + permission granted + sync prefs", async () => {
    useSettingsStore.setState({ notificationsEnabled: false });
    mockEnablePush.mockResolvedValue('granted');
    renderScreen();
    fireEvent.click(screen.getByTestId('notif-master-toggle'));
    await waitFor(() => expect(useSettingsStore.getState().notificationsEnabled).toBe(true));
    expect(mockSyncPrefs).toHaveBeenCalled();
  });

  it("'denied' → store flag stays OFF + warning banner", async () => {
    useSettingsStore.setState({ notificationsEnabled: false });
    mockEnablePush.mockResolvedValue('denied');
    renderScreen();
    fireEvent.click(screen.getByTestId('notif-master-toggle'));
    await waitFor(() => expect(screen.getByTestId('notif-permission-warning')).toBeInTheDocument());
    expect(useSettingsStore.getState().notificationsEnabled).toBe(false);
  });

  it("'no-account' → store flag stays OFF + Gigel hint", async () => {
    useSettingsStore.setState({ notificationsEnabled: false });
    mockEnablePush.mockResolvedValue('no-account');
    renderScreen();
    fireEvent.click(screen.getByTestId('notif-master-toggle'));
    await waitFor(() => expect(screen.getByTestId('notif-no-account-warning')).toBeInTheDocument());
    expect(useSettingsStore.getState().notificationsEnabled).toBe(false);
  });

  it("'unsupported' → store flag stays OFF + unsupported note", async () => {
    useSettingsStore.setState({ notificationsEnabled: false });
    mockEnablePush.mockResolvedValue('unsupported');
    renderScreen();
    fireEvent.click(screen.getByTestId('notif-master-toggle'));
    await waitFor(() => expect(screen.getByTestId('notif-unsupported-warning')).toBeInTheDocument());
    expect(useSettingsStore.getState().notificationsEnabled).toBe(false);
  });

  it("'error' → store flag stays OFF (fara UI greoi)", async () => {
    useSettingsStore.setState({ notificationsEnabled: false });
    mockEnablePush.mockResolvedValue('error');
    renderScreen();
    fireEvent.click(screen.getByTestId('notif-master-toggle'));
    await waitFor(() => expect(mockEnablePush).toHaveBeenCalled());
    expect(useSettingsStore.getState().notificationsEnabled).toBe(false);
  });

  it('toggle-off → disablePushNotifications + store flag false', async () => {
    useSettingsStore.setState({ notificationsEnabled: true });
    renderScreen();
    fireEvent.click(screen.getByTestId('notif-master-toggle'));
    await waitFor(() => expect(mockDisablePush).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(useSettingsStore.getState().notificationsEnabled).toBe(false));
  });

  it('schimbare frecventa declanseaza syncNotificationPrefs', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('notif-freq-saptamanal'));
    expect(mockSyncPrefs).toHaveBeenCalled();
  });

  it('toggle zi activa declanseaza syncNotificationPrefs', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('notif-day-5'));
    expect(mockSyncPrefs).toHaveBeenCalled();
  });

  it('schimbare ora declanseaza syncNotificationPrefs', () => {
    renderScreen();
    fireEvent.change(screen.getByTestId('notif-time-input'), { target: { value: '20:00' } });
    expect(mockSyncPrefs).toHaveBeenCalled();
  });

  it('toggle per-event declanseaza syncNotificationPrefs', () => {
    renderScreen();
    fireEvent.click(screen.getByTestId('notif-event-session-missed'));
    expect(mockSyncPrefs).toHaveBeenCalled();
  });
});
