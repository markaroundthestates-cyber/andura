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
// SPLASH+AUTH+ONB FINISH i18n — these specs were written against RO copy;
// force RO locale so existing assertions keep their semantics. EN coverage
// is verified separately by src/i18n/__tests__/i18nNoRoLeak.test.tsx.
import { setLocale as __setLocale, _resetI18nCache as __resetI18n } from '../../../i18n/index.js';

// Mock auth module — Magic Link send + Google OAuth URL builder.
vi.mock('../../../auth.js', () => ({
  sendMagicLink: vi.fn(() => Promise.resolve({ ok: true })),
  buildGoogleSignInUrl: vi.fn(() => 'https://accounts.google.com/oauth?stub'),
}));

function renderAuth(entry = '/auth'): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={[entry]}>
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
  try { localStorage.removeItem('sf.locale'); } catch { /* noop */ }
  __resetI18n();
  __setLocale('ro');
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

describe('Auth — Pulse button hierarchy (email magic-link primary)', () => {
  // Pulse parity 2026-05-29 — per Daniel mockup interfata-noua AuthScreen, the
  // email magic-link "Send sign-in link" is the PRIMARY CTA (gradient volt->aqua
  // fill), Google is a ghost SECONDARY below. Supersedes the older P-01
  // Google-primary brick hierarchy.
  it('email-send is the gradient primary CTA', () => {
    renderAuth();
    // btn-grad = shared mockup gradient-pill idiom (volt->aqua fill + 999px
    // radius + shine); supersedes the prior pulse-grad-bg + rounded-[14px] combo.
    expect(screen.getByTestId('auth-send').className).toMatch(/btn-grad/);
  });

  it('email input precedes skip button in DOM order', () => {
    renderAuth();
    const email = screen.getByTestId('auth-email-input');
    const skip = screen.getByTestId('auth-skip');
    expect(email.compareDocumentPosition(skip) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

describe('Auth — §F-auth-06 "sau" separator dividers', () => {
  it('renders "sau" divider before Skip-auth path', () => {
    renderAuth();
    const divider = screen.getByTestId('auth-divider-skip');
    expect(divider).toBeInTheDocument();
    expect(divider.textContent).toMatch(/sau/);
  });

  it('Skip divider is aria-hidden (decorative)', () => {
    renderAuth();
    expect(screen.getByTestId('auth-divider-skip')).toHaveAttribute('aria-hidden', 'true');
  });

  it('Google divider absent when Google OAuth env not configured', () => {
    // VITE_GOOGLE_OAUTH_CLIENT_ID unset in test env → showGoogle false →
    // both Google button and its divider hidden (graceful degradation).
    renderAuth();
    expect(screen.queryByTestId('auth-google')).not.toBeInTheDocument();
    expect(screen.queryByTestId('auth-divider-google')).not.toBeInTheDocument();
  });
});

describe('Auth — U-09 legal docs accessible pre-auth (inline modal)', () => {
  it('Termeni + Confidentialitate are buttons (NU Link gated /app/cont)', () => {
    renderAuth();
    expect(screen.getByTestId('auth-terms-link').tagName).toBe('BUTTON');
    expect(screen.getByTestId('auth-privacy-link').tagName).toBe('BUTTON');
  });

  it('modal absent until a footer link is clicked', () => {
    renderAuth();
    expect(screen.queryByTestId('auth-legal-modal')).not.toBeInTheDocument();
  });

  it('Termeni click opens dialog with terms content + live link', () => {
    renderAuth();
    fireEvent.click(screen.getByTestId('auth-terms-link'));
    const modal = screen.getByTestId('auth-legal-modal');
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveAttribute('role', 'dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal.textContent).toMatch(/recomandari, NU prescriptii medicale/i);
    expect(screen.getByTestId('auth-legal-live-link')).toHaveAttribute('href', 'https://andura.app/terms');
  });

  it('Confidentialitate click opens dialog with privacy content', () => {
    renderAuth();
    fireEvent.click(screen.getByTestId('auth-privacy-link'));
    const modal = screen.getByTestId('auth-legal-modal');
    expect(modal.textContent).toMatch(/Datele tale raman pe telefon/i);
    expect(modal.textContent).toMatch(/ZERO publicitate/i);
  });

  it('close button dismisses the modal', () => {
    renderAuth();
    fireEvent.click(screen.getByTestId('auth-terms-link'));
    fireEvent.click(screen.getByTestId('auth-legal-close'));
    expect(screen.queryByTestId('auth-legal-modal')).not.toBeInTheDocument();
  });

  it('Escape key dismisses the modal', () => {
    renderAuth();
    fireEvent.click(screen.getByTestId('auth-terms-link'));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('auth-legal-modal')).not.toBeInTheDocument();
  });

  it('backdrop click dismisses the modal', () => {
    renderAuth();
    fireEvent.click(screen.getByTestId('auth-privacy-link'));
    fireEvent.click(screen.getByTestId('auth-legal-backdrop'));
    expect(screen.queryByTestId('auth-legal-modal')).not.toBeInTheDocument();
  });

  it('SC 2.4.3: Tab is trapped — Shift-Tab from the first element wraps to the last', () => {
    renderAuth();
    fireEvent.click(screen.getByTestId('auth-terms-link'));
    const modal = screen.getByTestId('auth-legal-modal');
    const close = screen.getByTestId('auth-legal-close');
    // On open, focus lands on the close button (first focusable).
    expect(close).toHaveFocus();
    const focusables = modal.querySelectorAll('a[href], button:not([disabled])');
    const last = focusables[focusables.length - 1] as HTMLElement;
    expect(last).not.toBe(close);
    // Shift-Tab at the first element wraps to the last (trap, no page escape).
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(last).toHaveFocus();
    // Tab at the last element wraps back to the first.
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(close).toHaveFocus();
  });
});

describe('Auth — Daniel-directed login/signup modes', () => {
  it('default view is LOGIN: heading "Bine ai revenit" + send CTA "Trimite link de intrare"', () => {
    renderAuth();
    expect(screen.getByRole('heading', { name: /Bine ai revenit/i })).toBeInTheDocument();
    expect(screen.getByTestId('auth-send').textContent).toMatch(/Trimite link de intrare/i);
  });

  it('login shows a "Creeaza unul" switch link below the send CTA', () => {
    renderAuth();
    const toSignup = screen.getByTestId('auth-to-signup');
    expect(toSignup).toBeInTheDocument();
    expect(toSignup.textContent).toMatch(/Creeaza unul/i);
    const send = screen.getByTestId('auth-send');
    expect(send.compareDocumentPosition(toSignup) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('clicking "Creeaza cont" switches to SIGNUP mode (heading + submit "Creeaza cont")', () => {
    renderAuth();
    fireEvent.click(screen.getByTestId('auth-to-signup'));
    expect(screen.getByRole('heading', { name: /Creeaza cont/i })).toBeInTheDocument();
    expect(screen.getByTestId('auth-send').textContent).toMatch(/Creeaza cont/i);
  });

  it('signup shows "Ai deja cont? Intra" back-to-login affordance', () => {
    renderAuth();
    fireEvent.click(screen.getByTestId('auth-to-signup'));
    const toLogin = screen.getByTestId('auth-to-login');
    expect(toLogin).toBeInTheDocument();
    expect(toLogin.textContent).toMatch(/Ai deja cont/i);
    fireEvent.click(toLogin);
    expect(screen.getByRole('heading', { name: /Bine ai revenit/i })).toBeInTheDocument();
  });

  it('signup HIDES skip-auth + implicit-consent footer (login-only paths)', () => {
    renderAuth();
    fireEvent.click(screen.getByTestId('auth-to-signup'));
    expect(screen.queryByTestId('auth-skip')).not.toBeInTheDocument();
    expect(screen.queryByTestId('auth-terms-footer')).not.toBeInTheDocument();
  });

  // BUG #2 — Splash "Creaza Cont" navigates with location.state.mode='signup'
  // so the user lands DIRECTLY on the account-creation path (not the login
  // default). location.state pattern matches existing screens (AparateLipsa,
  // WorkoutPreview, etc.).
  it('opens directly in SIGNUP mode when location.state.mode is "signup"', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/auth', state: { mode: 'signup' } }]}>
        <Routes>
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: /Creeaza cont/i })).toBeInTheDocument();
    expect(screen.getByTestId('auth-consent-checkbox')).toBeInTheDocument();
  });

  it('defaults to LOGIN mode when navigated to /auth without state', () => {
    // Splash "Log In" + direct /auth visit carry no state → login default.
    renderAuth();
    expect(screen.getByRole('heading', { name: /Bine ai revenit/i })).toBeInTheDocument();
  });
});

describe('Auth — signup consent checkbox gating', () => {
  it('consent checkbox absent in login mode', () => {
    renderAuth();
    expect(screen.queryByTestId('auth-consent-checkbox')).not.toBeInTheDocument();
  });

  it('consent checkbox present in signup mode with linked Terms + Privacy', () => {
    renderAuth();
    fireEvent.click(screen.getByTestId('auth-to-signup'));
    expect(screen.getByTestId('auth-consent-checkbox')).toBeInTheDocument();
    const termsLink = screen.getByTestId('auth-consent-terms-link');
    const privacyLink = screen.getByTestId('auth-consent-privacy-link');
    expect(termsLink).toHaveAttribute('href', '/terms');
    expect(privacyLink).toHaveAttribute('href', '/privacy');
  });

  it('submit DISABLED in signup until consent checked (email valid)', () => {
    renderAuth();
    fireEvent.click(screen.getByTestId('auth-to-signup'));
    fireEvent.change(screen.getByTestId('auth-email-input'), {
      target: { value: 'gigel@example.com' },
    });
    const send = screen.getByTestId('auth-send');
    expect(send).toBeDisabled();
    fireEvent.click(screen.getByTestId('auth-consent-checkbox'));
    expect(send).not.toBeDisabled();
  });

  it('signup submit calls sendMagicLink + reaches sent state with first-timer note', async () => {
    renderAuth();
    fireEvent.click(screen.getByTestId('auth-to-signup'));
    fireEvent.change(screen.getByTestId('auth-email-input'), {
      target: { value: 'nou@example.com' },
    });
    fireEvent.click(screen.getByTestId('auth-consent-checkbox'));
    fireEvent.click(screen.getByTestId('auth-send'));
    await waitFor(() => {
      expect(screen.getByTestId('auth-sent')).toBeInTheDocument();
    });
    expect(screen.getByTestId('auth-sent-signup-note').textContent).toMatch(
      /Contul se creeaza cand deschizi linkul/i
    );
  });

  it('label is associated via htmlFor + checkbox aria-required', () => {
    renderAuth();
    fireEvent.click(screen.getByTestId('auth-to-signup'));
    const cb = screen.getByTestId('auth-consent-checkbox');
    expect(cb).toHaveAttribute('id', 'auth-consent');
    expect(cb).toHaveAttribute('aria-required', 'true');
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

describe('Auth — 01.051 surfaces ?error verify-failure', () => {
  it('shows the verify-failed message when ?error is present', () => {
    renderAuth('/auth?error=verify_failed');
    const errMsg = screen.getByTestId('auth-error');
    expect(errMsg).toBeInTheDocument();
    expect(errMsg).toHaveTextContent(/nu a functionat/i);
    const input = screen.getByTestId('auth-email-input');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'auth-email-error');
  });

  it('does NOT show an error when ?error is absent', () => {
    renderAuth('/auth');
    expect(screen.queryByTestId('auth-error')).not.toBeInTheDocument();
  });

  it('clears the verify error once the user edits the email', () => {
    renderAuth('/auth?error=expired');
    expect(screen.getByTestId('auth-error')).toBeInTheDocument();
    fireEvent.change(screen.getByTestId('auth-email-input'), {
      target: { value: 'a@b.co' },
    });
    expect(screen.queryByTestId('auth-error')).not.toBeInTheDocument();
  });
});
