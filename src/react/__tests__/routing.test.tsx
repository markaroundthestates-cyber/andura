// ══ ROUTING TESTS — Phase 2 Skeleton Verify ═══════════════════════════════
// Uses legacy MemoryRouter + Routes/Route pattern (NU createMemoryRouter data
// router) pentru izolare fără Node 25 undici AbortSignal mismatch în data
// router fetch lifecycle. Prod în router.tsx folosește createBrowserRouter.

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../routes/ProtectedRoute';
import { Layout } from '../routes/Layout';
import { Splash } from '../routes/screens/Splash';
import { Auth } from '../routes/screens/Auth';
import { Onboarding } from '../routes/screens/Onboarding';
import { Antrenor } from '../routes/screens/antrenor/Antrenor';
import { Progres } from '../routes/screens/progres/Progres';
import { Istoric } from '../routes/screens/istoric/Istoric';
import { Cont } from '../routes/screens/cont/Cont';
import { useAppStore } from '../stores/appStore';

function renderAt(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/onboarding/:step" element={<Onboarding />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Antrenor />} />
          <Route path="antrenor" element={<Antrenor />} />
          <Route path="progres" element={<Progres />} />
          <Route path="istoric" element={<Istoric />} />
          <Route path="cont" element={<Cont />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('Routing — top-level screens', () => {
  beforeEach(() => {
    useAppStore.getState().setAuthenticated(false);
  });

  it('renders Splash la /', () => {
    renderAt('/');
    expect(screen.getByText(/Andura/i)).toBeInTheDocument();
  });

  it('renders Auth la /auth', () => {
    renderAt('/auth');
    expect(screen.getByText('Autentificare')).toBeInTheDocument();
  });

  it('renders Onboarding step la /onboarding/3', () => {
    renderAt('/onboarding/3');
    expect(screen.getByText(/Onboarding pasul 3\/7/i)).toBeInTheDocument();
  });
});

describe('Routing — ProtectedRoute redirect', () => {
  beforeEach(() => {
    useAppStore.getState().setAuthenticated(false);
  });

  it('redirects la /auth daca !isAuthenticated', () => {
    renderAt('/app/antrenor');
    expect(screen.getByText('Autentificare')).toBeInTheDocument();
  });

  it('renders Antrenor daca isAuthenticated', () => {
    useAppStore.getState().setAuthenticated(true);
    renderAt('/app/antrenor');
    expect(screen.getByRole('heading', { name: 'Antrenor', level: 1 })).toBeInTheDocument();
    useAppStore.getState().setAuthenticated(false);
  });
});

describe('Routing — BottomNav active tab', () => {
  beforeEach(() => {
    useAppStore.getState().setAuthenticated(true);
  });

  it('Antrenor tab activ la /app/antrenor', () => {
    renderAt('/app/antrenor');
    const antrenorButton = screen.getByRole('button', { name: /Antrenor/i });
    expect(antrenorButton).toHaveAttribute('aria-current', 'page');
  });

  it('Progres tab activ la /app/progres', () => {
    renderAt('/app/progres');
    const progresButton = screen.getByRole('button', { name: /Progres/i });
    expect(progresButton).toHaveAttribute('aria-current', 'page');
  });

  it('Istoric tab activ la /app/istoric', () => {
    renderAt('/app/istoric');
    const istoricButton = screen.getByRole('button', { name: /Istoric/i });
    expect(istoricButton).toHaveAttribute('aria-current', 'page');
  });

  it('Cont tab activ la /app/cont', () => {
    renderAt('/app/cont');
    const contButton = screen.getByRole('button', { name: /Cont/i });
    expect(contButton).toHaveAttribute('aria-current', 'page');
  });
});

describe('Routing — Auth flow stub', () => {
  beforeEach(() => {
    useAppStore.getState().setAuthenticated(false);
  });

  it('Mock login button seteaza isAuthenticated true', async () => {
    const user = userEvent.setup();
    renderAt('/auth');
    const loginButton = screen.getByRole('button', { name: /Mock login/i });
    await user.click(loginButton);
    expect(useAppStore.getState().isAuthenticated).toBe(true);
    useAppStore.getState().setAuthenticated(false);
  });
});
