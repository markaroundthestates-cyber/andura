// == useNetworkStatus hook tests -- audit-§36-M5/M6 ===========================
// Coverage:
//   - initial state derived from navigator.onLine
//   - offline event -> 'offline'
//   - online event after offline -> 'reconnected' transient -> 'online' steady
//   - online event without prior offline -> 'online' (no flash)
//   - rapid offline flap cancels pending 'online' transition
//   - unmount clears flash timer + removes listeners

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

function setOnline(value: boolean): void {
  Object.defineProperty(navigator, 'onLine', { value, configurable: true });
}

describe('useNetworkStatus — audit §36-M5/M6', () => {
  beforeEach(() => {
    setOnline(true);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initial state = online when navigator.onLine true', () => {
    setOnline(true);
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current).toBe('online');
  });

  it('initial state = offline when navigator.onLine false', () => {
    setOnline(false);
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current).toBe('offline');
  });

  it('flips to offline on window offline event', () => {
    setOnline(true);
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current).toBe('online');

    act(() => {
      setOnline(false);
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current).toBe('offline');
  });

  it('emits reconnected transient on offline -> online edge then settles online', () => {
    setOnline(false);
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current).toBe('offline');

    act(() => {
      setOnline(true);
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current).toBe('reconnected');

    // After 3s flash → settles to 'online'
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current).toBe('online');
  });

  it('online event without prior offline does NOT emit reconnected flash', () => {
    setOnline(true);
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current).toBe('online');

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    // Stays online — no spurious 'reconnected'
    expect(result.current).toBe('online');
  });

  it('re-offline during reconnect flash cancels pending online + sets offline', () => {
    setOnline(false);
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      setOnline(true);
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current).toBe('reconnected');

    // Flap back offline before 3s elapses
    act(() => {
      setOnline(false);
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current).toBe('offline');

    // Even after 3s, should NOT have flipped back to online
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current).toBe('offline');
  });

  it('unmount cleans up listeners + timer (no late state update)', () => {
    setOnline(false);
    const { result, unmount } = renderHook(() => useNetworkStatus());

    act(() => {
      setOnline(true);
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current).toBe('reconnected');

    unmount();
    // Advancing timers post-unmount should not throw or update state
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    // Test passes if no error thrown; result.current frozen at last render.
  });
});
