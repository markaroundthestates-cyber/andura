import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { OfflineBanner } from '../../components/OfflineBanner';

beforeEach(() => {
  // Reset navigator.onLine to default true between tests
  Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
});

function setOffline(value: boolean): void {
  Object.defineProperty(navigator, 'onLine', { value: !value, configurable: true });
}

describe('OfflineBanner — §13-M3 + §36-M5/M6 network status banner', () => {
  it('renders nothing when online', () => {
    setOffline(false);
    render(<OfflineBanner />);
    expect(screen.queryByTestId('offline-banner')).not.toBeInTheDocument();
  });

  it('renders banner on initial mount when offline', () => {
    setOffline(true);
    render(<OfflineBanner />);
    expect(screen.getByTestId('offline-banner')).toBeInTheDocument();
    expect(screen.getByText(/Esti offline/i)).toBeInTheDocument();
  });

  it('shows banner when offline event fires', () => {
    setOffline(false);
    render(<OfflineBanner />);
    expect(screen.queryByTestId('offline-banner')).not.toBeInTheDocument();

    act(() => {
      setOffline(true);
      window.dispatchEvent(new Event('offline'));
    });

    expect(screen.getByTestId('offline-banner')).toBeInTheDocument();
  });

  it('offline banner has data-state="offline"', () => {
    setOffline(true);
    render(<OfflineBanner />);
    expect(screen.getByTestId('offline-banner')).toHaveAttribute('data-state', 'offline');
  });

  it('aria-live polite for screen readers', () => {
    setOffline(true);
    render(<OfflineBanner />);
    const banner = screen.getByTestId('offline-banner');
    expect(banner).toHaveAttribute('aria-live', 'polite');
    expect(banner).toHaveAttribute('role', 'status');
  });

  it('no diacritics in UI text', () => {
    setOffline(true);
    const { container } = render(<OfflineBanner />);
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});

describe('OfflineBanner — §36-M6 reconnect transient feedback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows reconnected banner on offline -> online edge then hides after 3s', () => {
    setOffline(true);
    render(<OfflineBanner />);
    expect(screen.getByTestId('offline-banner')).toHaveAttribute('data-state', 'offline');

    act(() => {
      setOffline(false);
      window.dispatchEvent(new Event('online'));
    });
    const banner = screen.getByTestId('offline-banner');
    expect(banner).toHaveAttribute('data-state', 'reconnected');
    expect(banner.textContent).toMatch(/Reconectat/i);

    // After 3s flash → banner hidden
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.queryByTestId('offline-banner')).not.toBeInTheDocument();
  });

  it('reconnected banner has no diacritics', () => {
    setOffline(true);
    const { container } = render(<OfflineBanner />);

    act(() => {
      setOffline(false);
      window.dispatchEvent(new Event('online'));
    });
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });

  it('initial mount online (no prior offline) does NOT show reconnected banner', () => {
    setOffline(false);
    render(<OfflineBanner />);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    // Pure 'online' → null
    expect(screen.queryByTestId('offline-banner')).not.toBeInTheDocument();
  });
});
