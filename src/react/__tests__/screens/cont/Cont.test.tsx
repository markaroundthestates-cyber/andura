import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Cont } from '../../../routes/screens/cont/Cont';
import { useSettingsStore } from '../../../stores/settingsStore';
import { AVATAR_PRESETS } from '../../../components/Avatar/registry';

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

  it('§F-cont-02 Magic Link path (no JWT name) shows email ONCE, no duplicate subtitle', () => {
    // Live-smoke fix 2026-05-29: without a real name claim the header used to
    // show the email local-part as the name AND the full email as the subtitle
    // (same email twice). Now the email renders once as the primary line and
    // the redundant subtitle is suppressed.
    localStorage.setItem('firebase-id-token', fakeJwt({ email: 'maria@example.com' }));
    renderCont();
    expect(screen.getByTestId('cont-account-initial').textContent).toBe('M');
    expect(screen.getByTestId('cont-account-name').textContent).toBe('maria@example.com');
    expect(screen.queryByTestId('cont-account-email')).toBeNull();
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

  it('renders all 12 rows total per mockup', () => {
    renderCont();
    const rows = [
      'profile', 'notifications', 'subscription',
      'appearance', 'aparate-lipsa', 'prefs',
      'privacy', 'terms', 'export',
      'danger',
      'support', 'about', 'faq',
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

  // ADDENDUM 4 (2026-06-01) — the expanded accent + Dark/Light block was
  // removed from the Account home (it duplicated the "Appearance" row). The
  // Account home now keeps ONLY the tappable row; the controls live one tap
  // deeper in SettingsAppearance. Coverage for the moved controls is in
  // SettingsAppearance.test.tsx.
  it('does NOT render the inline appearance block (moved to SettingsAppearance)', () => {
    renderCont();
    expect(screen.queryByTestId('cont-appearance-card')).toBeNull();
    expect(screen.queryByTestId('cont-appearance-accent')).toBeNull();
    expect(screen.queryByTestId('cont-accent-volt')).toBeNull();
    expect(screen.queryByTestId('cont-theme-dark')).toBeNull();
    // The tappable Appearance row remains (opens the sub-screen).
    expect(screen.getByTestId('cont-row-appearance')).toBeInTheDocument();
  });
});

// §avatar-tap-pick (founder 2026-06-12 "user sa poata apasa pe avatar, sa isi
// aleaga avatarul si sa apese confirm") — the avatar IS the entry point (the
// old "Schimba avatarul" toggle row is gone), selection is a draft, and an
// explicit Confirm commits it.
describe('Cont — avatar tap-to-pick + confirm', () => {
  it('the old "Schimba avatarul" toggle row is removed', () => {
    renderCont();
    expect(screen.queryByTestId('cont-avatar-toggle')).toBeNull();
  });

  it('the picker is closed until the avatar is tapped', () => {
    renderCont();
    expect(screen.queryByTestId('cont-avatar-picker')).toBeNull();
    fireEvent.click(screen.getByTestId('cont-account-avatar'));
    expect(screen.getByTestId('cont-avatar-picker')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-picker')).toBeInTheDocument();
  });

  it('tapping the avatar toggles aria-expanded', () => {
    renderCont();
    const avatarBtn = screen.getByTestId('cont-account-avatar');
    expect(avatarBtn).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(avatarBtn);
    expect(avatarBtn).toHaveAttribute('aria-expanded', 'true');
  });

  it('selecting a preset does NOT apply until Confirm is pressed (draft)', () => {
    renderCont();
    fireEvent.click(screen.getByTestId('cont-account-avatar'));
    const pick = AVATAR_PRESETS[4]!;
    fireEvent.click(screen.getByTestId(`avatar-option-${pick.id}`));
    // Staged only — store still null.
    expect(useSettingsStore.getState().avatarId).toBeNull();
    // The draft cell is marked selected in the grid.
    expect(screen.getByTestId(`avatar-option-${pick.id}`)).toHaveAttribute('aria-checked', 'true');
  });

  it('Confirm commits the staged pick to the store + closes the picker', () => {
    renderCont();
    fireEvent.click(screen.getByTestId('cont-account-avatar'));
    const pick = AVATAR_PRESETS[6]!;
    fireEvent.click(screen.getByTestId(`avatar-option-${pick.id}`));
    fireEvent.click(screen.getByTestId('cont-avatar-confirm'));
    expect(useSettingsStore.getState().avatarId).toBe(pick.id);
    expect(screen.queryByTestId('cont-avatar-picker')).toBeNull();
  });

  it('re-opening the picker re-seeds the draft from the committed id (discard works)', () => {
    useSettingsStore.getState().setAvatar(AVATAR_PRESETS[2]!.id);
    renderCont();
    // open → stage a different pick → close WITHOUT confirm (tap avatar again)
    fireEvent.click(screen.getByTestId('cont-account-avatar'));
    fireEvent.click(screen.getByTestId(`avatar-option-${AVATAR_PRESETS[9]!.id}`));
    fireEvent.click(screen.getByTestId('cont-account-avatar')); // toggle closed
    // committed id unchanged (draft discarded)
    expect(useSettingsStore.getState().avatarId).toBe(AVATAR_PRESETS[2]!.id);
    // re-open: the grid reflects the committed id, not the abandoned draft
    fireEvent.click(screen.getByTestId('cont-account-avatar'));
    expect(screen.getByTestId(`avatar-option-${AVATAR_PRESETS[2]!.id}`)).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByTestId(`avatar-option-${AVATAR_PRESETS[9]!.id}`)).toHaveAttribute('aria-checked', 'false');
  });
});
