import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Cont } from '../../../routes/screens/cont/Cont';
import { useSettingsStore } from '../../../stores/settingsStore';

// Minimal JWT helper for tests — base64url-encoded payload only (signature
// segments are ignored by the display-only decoder in userProfile.ts).
function fakeJwt(payload: Record<string, unknown>): string {
  const b64 = (s: string): string => btoa(s).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  const head = b64(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = b64(JSON.stringify(payload));
  return `${head}.${body}.sig`;
}

function renderCont() {
  return render(
    <MemoryRouter initialEntries={['/app/cont']}>
      <Cont />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
  useSettingsStore.getState().reset();
  document.documentElement.style.removeProperty('--brick');
});

describe('Cont landing — Phase 5 task_13', () => {
  it('renders Cont heading (EN default post 2026-05-28 — "Account")', () => {
    renderCont();
    // Default locale is EN — heading reads "Account".
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Account');
  });

  it('renders account card', () => {
    renderCont();
    expect(screen.getByTestId('cont-account-card')).toBeInTheDocument();
  });

  it('§F-cont-01 avatar initial defaults la "A" daca unauthenticated', () => {
    renderCont();
    expect(screen.getByTestId('cont-account-initial').textContent).toBe('A');
  });

  it('§F-cont-01/02/03 avatar+name+email wired din id_token JWT', () => {
    localStorage.setItem('firebase-id-token', fakeJwt({ email: 'daniel@andura.app', name: 'Daniel' }));
    renderCont();
    expect(screen.getByTestId('cont-account-initial').textContent).toBe('D');
    expect(screen.getByTestId('cont-account-name').textContent).toBe('Daniel');
    expect(screen.getByTestId('cont-account-email').textContent).toBe('daniel@andura.app');
  });

  it('§F-cont-02 name fallback la email prefix daca JWT name absent (Magic Link path)', () => {
    localStorage.setItem('firebase-id-token', fakeJwt({ email: 'maria@example.com' }));
    renderCont();
    expect(screen.getByTestId('cont-account-initial').textContent).toBe('M');
    expect(screen.getByTestId('cont-account-name').textContent).toBe('maria');
    expect(screen.getByTestId('cont-account-email').textContent).toBe('maria@example.com');
  });

  it('§F-cont-05 "Aparate lipsa" row in General section is enabled cu target aparate-lipsa', () => {
    renderCont();
    const row = screen.getByTestId('cont-row-aparate-lipsa');
    expect(row).not.toBeDisabled();
  });

  it('renders 5 sections mockup verbatim (stable English ids post-i18n)', () => {
    renderCont();
    // §i18n 2026-05-28 — section testids now stable English keys (independent
    // of locale). Visible label localizes via t('cont.sections.*').
    expect(screen.getByTestId('cont-section-cont')).toBeInTheDocument();
    expect(screen.getByTestId('cont-section-general')).toBeInTheDocument();
    expect(screen.getByTestId('cont-section-privacy')).toBeInTheDocument();
    expect(screen.getByTestId('cont-section-danger')).toBeInTheDocument();
    expect(screen.getByTestId('cont-section-help')).toBeInTheDocument();
  });

  it('renders all 13 rows total per mockup', () => {
    renderCont();
    const rows = [
      'profile', 'notifications', 'subscription',
      'appearance', 'aparate-lipsa', 'prefs',
      'privacy', 'terms', 'export',
      'danger',
      'support', 'ceva-nu-merge', 'about', 'faq',
    ];
    rows.forEach((id) => {
      expect(screen.getByTestId(`cont-row-${id}`)).toBeInTheDocument();
    });
  });

  it('Deconectare si Stergere section + row marked danger', () => {
    renderCont();
    expect(screen.getByTestId('cont-row-danger').className).toMatch(/text-brick/);
  });

  it('no diacritics in UI text', () => {
    const { container } = renderCont();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });

  it('version footer "Andura v1.0.0" present', () => {
    renderCont();
    expect(screen.getByText(/Andura v1\.0\.0/i)).toBeInTheDocument();
  });
});

// Pulse accent picker (replaces the retired multi-palette "themes" system).
describe('Cont — appearance accent picker (Pulse)', () => {
  it('renders 4 accent swatches Volt/Aqua/Ember/Violet', () => {
    renderCont();
    expect(screen.getByTestId('cont-accent-volt')).toBeInTheDocument();
    expect(screen.getByTestId('cont-accent-aqua')).toBeInTheDocument();
    expect(screen.getByTestId('cont-accent-ember')).toBeInTheDocument();
    expect(screen.getByTestId('cont-accent-violet')).toBeInTheDocument();
  });

  it('default accent = Volt (pressed) when store fresh', () => {
    renderCont();
    expect(screen.getByTestId('cont-accent-volt')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('cont-accent-aqua')).toHaveAttribute('aria-pressed', 'false');
  });

  it('click swatch updates store + applies --brick override on documentElement', () => {
    renderCont();
    fireEvent.click(screen.getByTestId('cont-accent-aqua'));
    expect(useSettingsStore.getState().accent).toBe('aqua');
    expect(screen.getByTestId('cont-accent-aqua')).toHaveAttribute('aria-pressed', 'true');
    expect(document.documentElement.style.getPropertyValue('--brick')).toBe('#4fd6e8');
  });

  it('picking Volt clears the --brick override (theme default owns it)', () => {
    renderCont();
    fireEvent.click(screen.getByTestId('cont-accent-ember'));
    expect(document.documentElement.style.getPropertyValue('--brick')).toBe('#ff7d52');
    fireEvent.click(screen.getByTestId('cont-accent-volt'));
    expect(useSettingsStore.getState().accent).toBe('volt');
    expect(document.documentElement.style.getPropertyValue('--brick')).toBe('');
  });
});
