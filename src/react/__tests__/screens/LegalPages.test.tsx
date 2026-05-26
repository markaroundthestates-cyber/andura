// Daniel-directed redesign 2026-05-26 — pagini legale publice /terms + /privacy
// (fix /terms 404). Render tests + back affordance + no-diacritics + ruta
// publica resolves prin router (NU sub ProtectedRoute).

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Terms } from '../../routes/screens/Terms';
import { Privacy } from '../../routes/screens/Privacy';

function renderAt(path: string): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/auth" element={<div data-testid="auth-route" />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Terms page /terms', () => {
  it('renders with heading + key terms content', () => {
    renderAt('/terms');
    expect(screen.getByTestId('terms-page')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/Termeni si conditii/i);
    expect(screen.getByText(/NU prescriptii medicale/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Beta gratuita/i).length).toBeGreaterThan(0);
  });

  it('has a back affordance', () => {
    renderAt('/terms');
    expect(screen.getByTestId('terms-back')).toBeInTheDocument();
  });

  it('no diacritics in page copy', () => {
    const { container } = renderAt('/terms');
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});

describe('Privacy page /privacy', () => {
  it('renders with heading + key privacy content', () => {
    renderAt('/privacy');
    expect(screen.getByTestId('privacy-page')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/confidentialitate/i);
    expect(screen.getByText(/Datele tale raman pe telefon/i)).toBeInTheDocument();
    expect(screen.getByText(/ZERO publicitate/i)).toBeInTheDocument();
    expect(screen.getByText(/GDPR/i)).toBeInTheDocument();
  });

  it('has a back affordance', () => {
    renderAt('/privacy');
    expect(screen.getByTestId('privacy-back')).toBeInTheDocument();
  });

  it('no diacritics in page copy', () => {
    const { container } = renderAt('/privacy');
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
