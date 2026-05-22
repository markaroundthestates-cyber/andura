// §15-H3 audit gap — Auth screen integration test for WebView banner.
// MemoryRouter jsdom paradigm per D020.
//
// Coverage focus: NO existing Auth.test.tsx. This file plugs the gap for:
//   1. WebView banner appears when navigator.userAgent matches FB/IG/etc.
//   2. WebView banner ABSENT for standard Chrome.
//   3. Banner has role="status" + visible platform name.
//   4. Banner does NOT block Magic Link form rendering.
//
// A11Y HIGH chat5 extension — email input aria-required + aria-invalid +
// aria-describedby coverage (WCAG SC 3.3.1 + 3.3.3).

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Auth } from '../../routes/screens/Auth';

// Mock auth module — Magic Link send + Google OAuth URL builder.
vi.mock('../../../auth.js', () => ({
  sendMagicLink: vi.fn(() => Promise.resolve({ ok: true })),
  buildGoogleSignInUrl: vi.fn(() => 'https://accounts.google.com/oauth?stub'),
}));

function renderAuth(): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={['/auth']}>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/onboarding/:step" element={<div data-testid="onb-route" />} />
      </Routes>
    </MemoryRouter>
  );
}

const ORIGINAL_UA = navigator.userAgent;

function setUserAgent(ua: string): void {
  Object.defineProperty(navigator, 'userAgent', {
    value: ua,
    configurable: true,
    writable: true,
  });
}

beforeEach(() => {
  // jsdom default UA contains 'jsdom' — not matched by any WebView regex.
  // Tests that need banner-absent state rely on the standard UA.
});

afterEach(() => {
  setUserAgent(ORIGINAL_UA);
});

describe('Auth — WebView banner §15-H3', () => {
  it('shows banner with role="status" for Facebook in-app WebView', () => {
    setUserAgent(
      'Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 [FB_IAB/FB4A;FBAV/443.0.0.30.111;]'
    );
    renderAuth();
    const banner = screen.getByTestId('auth-webview-warning');
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveAttribute('role', 'status');
    expect(banner.textContent).toMatch(/Facebook/i);
    expect(banner.textContent).toMatch(/Chrome/i);
  });

  it('shows banner with platform label "Instagram" for IG userAgent', () => {
    setUserAgent(
      'Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 Instagram 311.0.0.34.118'
    );
    renderAuth();
    const banner = screen.getByTestId('auth-webview-warning');
    expect(banner.textContent).toMatch(/Instagram/i);
  });

  it('shows banner for TikTok WebView via musical_ly marker', () => {
    setUserAgent('Mozilla/5.0 (Linux; Android) AppleWebKit/537.36 musical_ly_30.0.0');
    renderAuth();
    expect(screen.getByTestId('auth-webview-warning').textContent).toMatch(/TikTok/i);
  });

  it('shows banner for Snapchat WebView', () => {
    setUserAgent('Mozilla/5.0 (Linux; Android) AppleWebKit/537.36 Snapchat/12.0.0');
    renderAuth();
    expect(screen.getByTestId('auth-webview-warning').textContent).toMatch(/Snapchat/i);
  });

  it('does NOT show banner for standard Chrome Android', () => {
    setUserAgent(
      'Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
    );
    renderAuth();
    expect(screen.queryByTestId('auth-webview-warning')).not.toBeInTheDocument();
  });

  it('does NOT show banner for standard Firefox', () => {
    setUserAgent('Mozilla/5.0 (Android 13; Mobile; rv:121.0) Gecko/121.0 Firefox/121.0');
    renderAuth();
    expect(screen.queryByTestId('auth-webview-warning')).not.toBeInTheDocument();
  });

  it('banner does NOT block Magic Link form (input + send button still rendered)', () => {
    setUserAgent(
      'Mozilla/5.0 (Linux; Android) AppleWebKit/537.36 Instagram 311.0.0.34.118'
    );
    renderAuth();
    expect(screen.getByTestId('auth-webview-warning')).toBeInTheDocument();
    expect(screen.getByTestId('auth-email-input')).toBeInTheDocument();
    expect(screen.getByTestId('auth-send')).toBeInTheDocument();
  });
});

describe('Auth — no diacritics in WebView banner copy', () => {
  it('Facebook banner text contains no diacritics', () => {
    setUserAgent(
      'Mozilla/5.0 (Linux; Android) AppleWebKit/537.36 [FB_IAB/FB4A;FBAV/443.0.0.30.111;]'
    );
    const { container } = renderAuth();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});

describe('Auth — A11Y HIGH chat5 form aria attributes', () => {
  it('email input has aria-required="true"', () => {
    renderAuth();
    const input = screen.getByTestId('auth-email-input');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAttribute('required');
  });

  it('email input NO aria-invalid pe initial render (no error state)', () => {
    renderAuth();
    const input = screen.getByTestId('auth-email-input');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('email input aria-invalid + aria-describedby cand sendMagicLink fail', async () => {
    const authModule = await import('../../../auth.js');
    const sendMagicLink = vi.mocked(authModule.sendMagicLink);
    sendMagicLink.mockResolvedValueOnce({ ok: false, error: 'network_error' });
    renderAuth();
    const input = screen.getByTestId('auth-email-input');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByTestId('auth-send'));
    await waitFor(() => {
      expect(screen.getByTestId('auth-error')).toBeInTheDocument();
    });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'auth-email-error');
    const errMsg = screen.getByTestId('auth-error');
    expect(errMsg).toHaveAttribute('id', 'auth-email-error');
    expect(errMsg).toHaveAttribute('role', 'alert');
    // restore default behavior pentru next tests
    sendMagicLink.mockResolvedValue({ ok: true });
  });
});
