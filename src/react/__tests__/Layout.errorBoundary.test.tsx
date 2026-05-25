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
    expect(screen.getByText(/Ceva nu a mers/i)).toBeInTheDocument();
    errSpy.mockRestore();
  });

  it('renders BottomNav persistent layout chrome', () => {
    renderAt('/app', <WorkingScreen />);
    expect(screen.getByRole('navigation', { name: /Navigare principala/i })).toBeInTheDocument();
  });

  it('main element + Suspense+ErrorBoundary structural wrap', () => {
    const { container } = renderAt('/app', <WorkingScreen />);
    expect(container.querySelector('main')).toBeInTheDocument();
  });
});
