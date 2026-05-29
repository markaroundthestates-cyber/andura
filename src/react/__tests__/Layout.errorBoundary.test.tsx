// Phase 6 task_20 — Layout ErrorBoundary + Suspense integration tests.

import type { JSX } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '../routes/Layout';
import { useAppStore } from '../stores/appStore';
import { useSettingsStore } from '../stores/settingsStore';

// Throw on render
function Bomb(): JSX.Element {
  throw new Error('test render error');
}

function WorkingScreen(): JSX.Element {
  return <p data-testid="working-screen">OK</p>;
}

function renderAt(path: string, screenEl: JSX.Element) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/app" element={<Layout />}>
          <Route index element={screenEl} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  useAppStore.getState().setAuthenticated(true);
  // U-01 — disclaimer gate now mounted in Layout; pre-accept so these
  // chrome/error-boundary tests assert their intended subject (modal would
  // otherwise overlay + steal focus).
  useSettingsStore.setState({ acceptedDisclaimer: true });
});

describe('Layout — ErrorBoundary + Suspense wrap Outlet (Phase 6 task_20)', () => {
  it('renders nested Outlet content normally', () => {
    renderAt('/app', <WorkingScreen />);
    expect(screen.getByTestId('working-screen')).toBeInTheDocument();
  });

  it('ErrorBoundary catches downstream throw + renders fallback UI', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderAt('/app', <Bomb />);
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    errSpy.mockRestore();
  });

  it('renders BottomNav persistent layout chrome', () => {
    renderAt('/app', <WorkingScreen />);
    // §i18n 2026-05-28 — EN default → aria-label "Main navigation".
    expect(screen.getByRole('navigation', { name: /Main navigation/i })).toBeInTheDocument();
  });

  it('main element + Suspense+ErrorBoundary structural wrap', () => {
    const { container } = renderAt('/app', <WorkingScreen />);
    expect(container.querySelector('main')).toBeInTheDocument();
  });

  it('wraps routed content in an .app-scroll surface (desktop nav freeze fix)', () => {
    // 2026-05-29 — the scroll overflow lives on .app-scroll, NOT on #root, so
    // the fixed BottomNav (containing block = #root via translateZ) pins to the
    // device screen on desktop instead of scrolling 1:1 with content. The
    // <main> must sit inside .app-scroll; BottomNav must sit OUTSIDE it so it
    // does not scroll with the content.
    const { container } = renderAt('/app', <WorkingScreen />);
    const scroll = container.querySelector('.app-scroll');
    expect(scroll).toBeInTheDocument();
    expect(scroll?.querySelector('main')).toBeInTheDocument();
    const nav = container.querySelector('nav[aria-label]');
    expect(nav).toBeInTheDocument();
    expect(scroll?.contains(nav as Node)).toBe(false);
  });
});
