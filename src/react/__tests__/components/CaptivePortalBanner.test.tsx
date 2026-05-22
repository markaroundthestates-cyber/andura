// §36-H4 CaptivePortalBanner — hotel/airport WiFi indicator. Mock
// useNetworkStatus via vi.mock since real probe hits Firebase URL.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CaptivePortalBanner } from '../../components/CaptivePortalBanner';

vi.mock('../../lib/networkStatus', () => ({
  useNetworkStatus: vi.fn(),
}));

import { useNetworkStatus } from '../../lib/networkStatus';
const mockHook = vi.mocked(useNetworkStatus);

describe('CaptivePortalBanner — §36-H4', () => {
  beforeEach(() => {
    mockHook.mockReset();
  });

  it('renders nothing when fully online', () => {
    mockHook.mockReturnValue({ online: true, captive: false });
    render(<CaptivePortalBanner />);
    expect(screen.queryByTestId('captive-portal-banner')).not.toBeInTheDocument();
  });

  it('renders nothing when offline regardless of captive', () => {
    mockHook.mockReturnValue({ online: false, captive: true });
    render(<CaptivePortalBanner />);
    expect(screen.queryByTestId('captive-portal-banner')).not.toBeInTheDocument();
  });

  it('renders banner when online + captive (portal blocked)', () => {
    mockHook.mockReturnValue({ online: true, captive: true });
    render(<CaptivePortalBanner />);
    expect(screen.getByTestId('captive-portal-banner')).toBeInTheDocument();
    expect(screen.getByText(/WiFi limitat/i)).toBeInTheDocument();
  });

  it('aria-live polite for screen readers', () => {
    mockHook.mockReturnValue({ online: true, captive: true });
    render(<CaptivePortalBanner />);
    const banner = screen.getByTestId('captive-portal-banner');
    expect(banner).toHaveAttribute('aria-live', 'polite');
    expect(banner).toHaveAttribute('role', 'status');
  });

  it('no diacritics in UI text', () => {
    mockHook.mockReturnValue({ online: true, captive: true });
    const { container } = render(<CaptivePortalBanner />);
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
