// §36-H4 useNetworkStatus — hook smoke + probe behavior. Mocks global fetch
// to simulate captive portal (HTML content-type) vs healthy (JSON).

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useNetworkStatus } from '../../lib/networkStatus';

const ORIG_FETCH = global.fetch;
const ORIG_ON_LINE = navigator.onLine;

function setOnline(value: boolean): void {
  Object.defineProperty(navigator, 'onLine', { value, configurable: true });
}

function jsonResponse(body: unknown = null): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

function htmlResponse(): Response {
  return new Response('<html><body>Accept ToS</body></html>', {
    status: 200,
    headers: { 'content-type': 'text/html' },
  });
}

beforeEach(() => {
  setOnline(true);
});

afterEach(() => {
  global.fetch = ORIG_FETCH;
  Object.defineProperty(navigator, 'onLine', { value: ORIG_ON_LINE, configurable: true });
});

describe('useNetworkStatus — §36-H4', () => {
  it('returns online=true when navigator.onLine + JSON probe', async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse());
    const { result } = renderHook(() => useNetworkStatus());
    await waitFor(() => {
      expect(result.current.online).toBe(true);
      expect(result.current.captive).toBe(false);
    });
  });

  it('returns captive=true when probe returns HTML (portal)', async () => {
    global.fetch = vi.fn().mockResolvedValue(htmlResponse());
    const { result } = renderHook(() => useNetworkStatus());
    await waitFor(() => {
      expect(result.current.captive).toBe(true);
    });
  });

  it('returns captive=true when probe rejects (timeout / network)', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('timeout'));
    const { result } = renderHook(() => useNetworkStatus());
    await waitFor(() => {
      expect(result.current.captive).toBe(true);
    });
  });

  it('captive=false when offline (no false positives radio off)', async () => {
    setOnline(false);
    global.fetch = vi.fn().mockResolvedValue(jsonResponse());
    const { result } = renderHook(() => useNetworkStatus());
    // online=false from initial state; no probe runs
    await waitFor(() => {
      expect(result.current.online).toBe(false);
      expect(result.current.captive).toBe(false);
    });
  });

  it('treats non-2xx probe as captive', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response('', { status: 503, headers: { 'content-type': 'application/json' } })
    );
    const { result } = renderHook(() => useNetworkStatus());
    await waitFor(() => {
      expect(result.current.captive).toBe(true);
    });
  });
});
