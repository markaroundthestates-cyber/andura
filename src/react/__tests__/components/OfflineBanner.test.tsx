import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { OfflineBanner } from '../../components/OfflineBanner';

beforeEach(() => {
  // Reset navigator.onLine to default true between tests
  Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
});

function setOffline(value: boolean): void {
  Object.defineProperty(navigator, 'onLine', { value: !value, configurable: true });
}

describe('OfflineBanner — §13-M3 network status banner', () => {
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

  it('hides banner when online event fires', () => {
    setOffline(true);
    render(<OfflineBanner />);
    expect(screen.getByTestId('offline-banner')).toBeInTheDocument();

    act(() => {
      setOffline(false);
      window.dispatchEvent(new Event('online'));
    });

    expect(screen.queryByTestId('offline-banner')).not.toBeInTheDocument();
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
