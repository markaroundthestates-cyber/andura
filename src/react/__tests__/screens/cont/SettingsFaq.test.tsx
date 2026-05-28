import type { JSX } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SettingsFaq } from '../../../routes/screens/cont/SettingsFaq';

// Wave E4 i18n locale pin — these specs were written against RO copy;
// force RO locale so existing assertions keep their semantics. EN coverage
// is verified separately by src/i18n/__tests__/i18nNoRoLeak.test.tsx.
import { beforeEach as __i18nBeforeEach } from 'vitest';
import { setLocale as __setLocale, _resetI18nCache as __resetI18n } from '../../../../i18n/index.js';
__i18nBeforeEach(() => { try { localStorage.removeItem('sf.locale'); } catch {} __resetI18n(); __setLocale('ro'); });


function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="probe" data-pathname={loc.pathname} />;
}

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={['/app/cont/settings-faq']}>
      <Routes>
        <Route path="/app/cont/settings-faq" element={<SettingsFaq />} />
        <Route path="/app/cont" element={<LocationProbe />} />
        <Route path="/app/cont/settings-support" element={<div data-testid="support-probe" />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('SettingsFaq — FAQ screen', () => {
  it('renders heading "FAQ"', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: /FAQ/i, level: 1 })).toBeInTheDocument();
  });

  it('renders 3 section headings + 7 questions', () => {
    renderScreen();
    expect(screen.getByText('Antrenament')).toBeInTheDocument();
    expect(screen.getByText('Cont si date')).toBeInTheDocument();
    expect(screen.getByText('Notificari')).toBeInTheDocument();
    expect(screen.getByText(/Cum schimb programul/i)).toBeInTheDocument();
    expect(screen.getByText(/Pot sa sar peste/i)).toBeInTheDocument();
    expect(screen.getByText(/Cum se calculeaza progresul/i)).toBeInTheDocument();
    expect(screen.getByText(/Cum recuperez parola/i)).toBeInTheDocument();
    expect(screen.getByText(/Pot folosi pe mai multe telefoane/i)).toBeInTheDocument();
    expect(screen.getByText(/Unde sunt salvate datele/i)).toBeInTheDocument();
    expect(screen.getByText(/De ce nu primesc notificari/i)).toBeInTheDocument();
  });

  it('clicking question expands answer (accordion)', () => {
    renderScreen();
    const q = screen.getByTestId('faq-q-training-0');
    expect(q).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(q);
    expect(q).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/Mergi la Antrenor.*tap pe pencil/i)).toBeInTheDocument();
  });

  it('clicking expanded question collapses it (toggle)', () => {
    renderScreen();
    const q = screen.getByTestId('faq-q-training-0');
    fireEvent.click(q);
    expect(q).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(q);
    expect(q).toHaveAttribute('aria-expanded', 'false');
  });

  it('only one question expanded at a time', () => {
    renderScreen();
    const q1 = screen.getByTestId('faq-q-training-0');
    const q2 = screen.getByTestId('faq-q-training-1');
    fireEvent.click(q1);
    expect(q1).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(q2);
    expect(q1).toHaveAttribute('aria-expanded', 'false');
    expect(q2).toHaveAttribute('aria-expanded', 'true');
  });

  it('Suport link navigates to /app/cont/settings-support', () => {
    renderScreen();
    fireEvent.click(screen.getByRole('button', { name: /Suport/i }));
    expect(screen.getByTestId('support-probe')).toBeInTheDocument();
  });

  it('back navigates la /app/cont', () => {
    renderScreen();
    fireEvent.click(screen.getByRole('button', { name: /Inapoi/i }));
    expect(screen.getByTestId('probe')).toHaveAttribute('data-pathname', '/app/cont');
  });

  it('no diacritics in UI text', () => {
    const { container } = renderScreen();
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
