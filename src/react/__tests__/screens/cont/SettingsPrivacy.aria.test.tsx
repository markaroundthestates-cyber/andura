// §28-H6 + §28 audit gap — Privacy Policy SUPPLEMENTAL coverage.
// Existing SettingsPrivacy.test.tsx covers 5 GDPR headings; this file
// plugs the gap for:
//   1. §28-H6 medical-data Art. 9 boundary section RENDERS (heading + body)
//   2. Sub-procesatori section RENDERS with Firebase + Sentry named
//   3. ANSPDCP authority mention present
//   4. EU data-residency disclosure (europe-west1) present
//   5. mailto privacy@andura.app contact link present

import type { JSX } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SettingsPrivacy } from '../../../routes/screens/cont/SettingsPrivacy';
import { useSettingsStore } from '../../../stores/settingsStore';

// Wave E4 i18n locale pin — these specs were written against RO copy;
// force RO locale so existing assertions keep their semantics. EN coverage
// is verified separately by src/i18n/__tests__/i18nNoRoLeak.test.tsx.
import { beforeEach as __i18nBeforeEach } from 'vitest';
import { setLocale as __setLocale, _resetI18nCache as __resetI18n } from '../../../../i18n/index.js';
__i18nBeforeEach(() => { try { localStorage.removeItem('sf.locale'); } catch {} __resetI18n(); __setLocale('ro'); });


function Stub(): JSX.Element {
  return <div data-testid="cont-stub" />;
}

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={['/app/cont/settings-privacy']}>
      <Routes>
        <Route path="/app/cont/settings-privacy" element={<SettingsPrivacy />} />
        <Route path="/app/cont" element={<Stub />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  useSettingsStore.getState().reset();
  localStorage.clear(); __resetI18n(); __setLocale("ro"); // Wave E4 RO pin
});

describe('SettingsPrivacy — §28-H6 Art. 9 medical-data boundary section', () => {
  it('renders heading "Date sensibile (GDPR Art. 9)"', () => {
    renderScreen();
    expect(
      screen.getByRole('heading', { name: /Date sensibile.*Art\.?\s*9/i })
    ).toBeInTheDocument();
  });

  it('body asserts Andura is NOT a medical device', () => {
    renderScreen();
    const article = screen.getByTestId('privacy-policy-content');
    expect(article.textContent).toMatch(/fitness/i);
    expect(article.textContent).toMatch(/NU.*dispozitiv medical/i);
  });

  it('body declares pain/measurements as sportive (not medical)', () => {
    renderScreen();
    const article = screen.getByTestId('privacy-policy-content');
    expect(article.textContent).toMatch(/sportiv/i);
    expect(article.textContent).toMatch(/NU medical/i);
  });

  it('body references medical disclaimer reference (T&C link mention)', () => {
    renderScreen();
    const article = screen.getByTestId('privacy-policy-content');
    expect(article.textContent).toMatch(/Disclaimer medical/i);
  });
});

describe('SettingsPrivacy — sub-processor disclosure (Art. 28)', () => {
  it('renders heading "Sub-procesatori"', () => {
    renderScreen();
    expect(
      screen.getByRole('heading', { name: /Sub-procesatori/i })
    ).toBeInTheDocument();
  });

  it('names Firebase as sub-processor with purpose', () => {
    renderScreen();
    const article = screen.getByTestId('privacy-policy-content');
    expect(article.textContent).toMatch(/Google Firebase/i);
    expect(article.textContent).toMatch(/europe-west1/i);
  });

  it('names Sentry as sub-processor for error monitoring', () => {
    renderScreen();
    const article = screen.getByTestId('privacy-policy-content');
    expect(article.textContent).toMatch(/Sentry/i);
  });

  it('explicitly denies third-party analytics + advertising + data brokers', () => {
    renderScreen();
    const article = screen.getByTestId('privacy-policy-content');
    expect(article.textContent).toMatch(/ZERO terti analytics/i);
    expect(article.textContent).toMatch(/ZERO advertising/i);
    expect(article.textContent).toMatch(/ZERO data brokers/i);
  });
});

describe('SettingsPrivacy — Romanian DPA + contact', () => {
  it('mentions ANSPDCP authority for complaints', () => {
    renderScreen();
    const article = screen.getByTestId('privacy-policy-content');
    expect(article.textContent).toMatch(/ANSPDCP/i);
  });

  it('exposes mailto privacy@andura.app contact', () => {
    renderScreen();
    const links = screen.getAllByRole('link', { name: /privacy@andura\.app/i });
    expect(links.length).toBeGreaterThanOrEqual(1);
    // At least one link must have proper mailto: scheme.
    expect(links.some((a) => (a.getAttribute('href') ?? '').startsWith('mailto:'))).toBe(true);
  });
});
