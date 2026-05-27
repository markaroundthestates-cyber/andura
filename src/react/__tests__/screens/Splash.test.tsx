// ══ SPLASH — entry CTA label + nav tests ═══════════════════════════════════
// BUG #2 (CEO directive 2026-05-27) — the anon entry button must read an
// obvious "Log In" (NOT vague "Incepe") and the secondary affordance must read
// "Creaza Cont", routing to the account-creation path. Authenticated users keep
// "Continua" → /app. MemoryRouter jsdom paradigm per D020.
//
// Coverage focus: NO prior Splash.test.tsx existed. Locks the entry labels +
// nav targets so a future drift back to the vague "Incepe" wording fails CI.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Splash } from '../../routes/screens/Splash';
import { useAppStore } from '../../stores/appStore';

// Probe component renders the path + serialized location.state of wherever a
// nav lands, so a test can assert both the route and the passed state.mode.
function NavProbe(): JSX.Element {
  const location = useLocation();
  return (
    <div
      data-testid="nav-probe"
      data-path={location.pathname}
      data-state={JSON.stringify(location.state ?? null)}
    />
  );
}

function renderSplash(): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/auth" element={<NavProbe />} />
        <Route path="/app/*" element={<NavProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  // appStore is a singleton across a test file — pin the auth flag per test so
  // the anon vs authenticated branch is deterministic.
  useAppStore.getState().setAuthenticated(false);
});

describe('Splash — anonymous entry labels (BUG #2)', () => {
  it('primary CTA reads "Log In" (NOT vague "Incepe") for an anon user', () => {
    renderSplash();
    const cta = screen.getByTestId('splash-cta');
    expect(cta.textContent).toBe('Log In');
    expect(cta.textContent).not.toMatch(/Incepe/);
  });

  it('secondary affordance reads "Creaza Cont"', () => {
    renderSplash();
    const secondary = screen.getByTestId('splash-secondary');
    expect(secondary.textContent).toBe('Creaza Cont');
    expect(secondary.textContent).not.toMatch(/Am deja cont/);
  });

  it('primary "Log In" routes to /auth (login default, no signup state)', () => {
    renderSplash();
    fireEvent.click(screen.getByTestId('splash-cta'));
    const probe = screen.getByTestId('nav-probe');
    expect(probe).toHaveAttribute('data-path', '/auth');
    expect(probe).toHaveAttribute('data-state', 'null');
  });

  it('secondary "Creaza Cont" routes to /auth with state.mode "signup"', () => {
    renderSplash();
    fireEvent.click(screen.getByTestId('splash-secondary'));
    const probe = screen.getByTestId('nav-probe');
    expect(probe).toHaveAttribute('data-path', '/auth');
    expect(probe).toHaveAttribute('data-state', JSON.stringify({ mode: 'signup' }));
  });

  it('no diacritics in the entry CTA labels', () => {
    const { container } = renderSplash();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});

describe('Splash — authenticated entry (unchanged)', () => {
  it('CTA reads "Continua" + routes to /app/antrenor when authenticated', () => {
    useAppStore.getState().setAuthenticated(true);
    renderSplash();
    const cta = screen.getByTestId('splash-cta');
    expect(cta.textContent).toBe('Continua');
    // Secondary "Creaza Cont" affordance is anon-only.
    expect(screen.queryByTestId('splash-secondary')).not.toBeInTheDocument();
    fireEvent.click(cta);
    expect(screen.getByTestId('nav-probe')).toHaveAttribute('data-path', '/app/antrenor');
  });
});
