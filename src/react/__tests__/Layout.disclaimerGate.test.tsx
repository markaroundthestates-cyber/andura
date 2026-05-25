// U-01 audit fix (AUDIT-2 §U-01 CRIT) — Medical Disclaimer LOCK 4 gate mount
// integration. Modal was built + tested in isolation but NEVER mounted; the
// gate is mounted in Layout so it covers the authenticated app before any
// training flow. Verifies: mount when not accepted + acknowledge persists +
// gate does not reappear after remount.

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '../routes/Layout';
import { useAppStore } from '../stores/appStore';
import { useSettingsStore } from '../stores/settingsStore';

function WorkingScreen(): JSX.Element {
  return <p data-testid="working-screen">OK</p>;
}

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={['/app']}>
      <Routes>
        <Route path="/app" element={<Layout />}>
          <Route index element={<WorkingScreen />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
  useAppStore.getState().setAuthenticated(true);
  useSettingsStore.getState().reset(); // acceptedDisclaimer = false default
});

describe('Layout — Medical Disclaimer gate (U-01)', () => {
  it('mounts disclaimer modal when acceptedDisclaimer is false', () => {
    renderLayout();
    expect(screen.getByTestId('disclaimer-modal')).toBeInTheDocument();
    expect(screen.getByTestId('disclaimer-acknowledge')).toBeInTheDocument();
  });

  it('does NOT mount disclaimer modal when already accepted', () => {
    useSettingsStore.setState({ acceptedDisclaimer: true });
    renderLayout();
    expect(screen.queryByTestId('disclaimer-modal')).not.toBeInTheDocument();
  });

  it('acknowledge sets acceptedDisclaimer + acceptedDisclaimerAt + hides modal', () => {
    renderLayout();
    expect(useSettingsStore.getState().acceptedDisclaimer).toBe(false);
    fireEvent.click(screen.getByTestId('disclaimer-acknowledge'));
    expect(useSettingsStore.getState().acceptedDisclaimer).toBe(true);
    expect(useSettingsStore.getState().acceptedDisclaimerAt).toBeTypeOf('number');
    expect(screen.queryByTestId('disclaimer-modal')).not.toBeInTheDocument();
  });

  it('mandatory gate — no cancel button (acknowledge is the only path)', () => {
    renderLayout();
    expect(screen.queryByTestId('disclaimer-cancel')).not.toBeInTheDocument();
  });

  it('gate does not reappear after acknowledge + remount (persisted)', () => {
    const first = renderLayout();
    fireEvent.click(screen.getByTestId('disclaimer-acknowledge'));
    first.unmount();
    renderLayout();
    expect(screen.queryByTestId('disclaimer-modal')).not.toBeInTheDocument();
    expect(screen.getByTestId('working-screen')).toBeInTheDocument();
  });
});
